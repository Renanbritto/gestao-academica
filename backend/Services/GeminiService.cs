using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Lo.Backend.Data;
using Lo.Backend.DTOs;

namespace Lo.Backend.Services;

public class GeminiService : IGeminiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;
    private readonly ILogger<GeminiService> _logger;

    public GeminiService(
        HttpClient httpClient,
        IConfiguration configuration,
        AppDbContext context,
        ILogger<GeminiService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _context = context;
        _logger = logger;
    }

    public async Task<GeminiChatResponse> AskAcademicAssistantAsync(Guid userId, string prompt, string? contextType = null)
    {
        var apiKey = _configuration["Gemini:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return new GeminiChatResponse(
                "A chave da API do Gemini não está configurada no servidor. Por favor, adicione a variável GEMINI_API_KEY no painel do Railway ou appsettings.json.",
                false,
                "API key missing"
            );
        }

        try
        {
            // Carrega contexto acadêmico do estudante para o System Prompt
            var profile = await _context.Profiles.AsNoTracking().FirstOrDefaultAsync(p => p.Id == userId);
            var subjects = await _context.Subjects.AsNoTracking().Where(s => s.UserId == userId).ToListAsync();
            var upcomingActivities = await _context.Activities
                .AsNoTracking()
                .Where(a => a.UserId == userId && a.DueDate >= DateOnly.FromDateTime(DateTime.UtcNow))
                .OrderBy(a => a.DueDate)
                .Take(5)
                .ToListAsync();

            var studentContext = new StringBuilder();
            studentContext.AppendLine("Você é o **IO**, o assistente acadêmico inteligente, didático e motivador da plataforma IO.");
            studentContext.AppendLine($"Estudante: {profile?.Name ?? "Aluno"} | Curso: {profile?.Course ?? "Geral"} ({profile?.Period ?? ""})");
            studentContext.AppendLine("Matérias matriculadas:");
            foreach (var sub in subjects)
            {
                studentContext.AppendLine($"- {sub.Name} (Prof: {sub.Professor ?? "Não informado"}, Ementa: {sub.Description ?? "Geral"})");
            }
            if (upcomingActivities.Any())
            {
                studentContext.AppendLine("Próximos compromissos/provas do aluno:");
                foreach (var act in upcomingActivities)
                {
                    studentContext.AppendLine($"- {act.Title} em {act.DueDate:dd/MM/yyyy} (Peso {act.Weight}%, Tipo: {act.Type})");
                }
            }

            studentContext.AppendLine(@"
Instruções:
1. Responda em português brasileiro com tom prestativo, didático, conciso e motivador.
2. Formate com markdown limpo (negrito, tópicos curtos, emojis moderados).
3. Se o aluno pedir explicação de um conceito da matéria, forneça explicação clara com exemplos práticos.
4. Se o aluno perguntar sobre suas provas ou prazos, consulte a lista fornecida.
5. Seja direto, evitando rodeios desnecessários.");

            var requestBody = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = studentContext.ToString() } }
                },
                contents = new[]
                {
                    new
                    {
                        parts = new[] { new { text = prompt } }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.7,
                    maxOutputTokens = 800
                }
            };

            var model = _configuration["Gemini:Model"] ?? "gemini-1.5-flash";
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

            var response = await _httpClient.PostAsJsonAsync(url, requestBody);
            if (!response.IsSuccessStatusCode)
            {
                var errorDetails = await response.Content.ReadAsStringAsync();
                _logger.LogError("Erro ao chamar API Gemini: {StatusCode} - {Details}", response.StatusCode, errorDetails);
                return new GeminiChatResponse(
                    "Desculpe, tive uma instabilidade temporária para me conectar ao cérebro do Gemini. Tente novamente em instantes.",
                    false,
                    errorDetails
                );
            }

            var jsonResult = await response.Content.ReadFromJsonAsync<JsonElement>();
            var answerText = jsonResult
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return new GeminiChatResponse(answerText ?? "Sem resposta gerada.", true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exceção ao processar pergunta com Gemini");
            return new GeminiChatResponse("Ocorreu um erro ao processar sua dúvida. Verifique sua conexão.", false, ex.Message);
        }
    }

    public async Task<string> GenerateStudyHelpAsync(string subjectName, string topic, string? syllabus)
    {
        var apiKey = _configuration["Gemini:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey)) return "Gemini API Key não configurada.";

        var prompt = $"Como tutor da disciplina {subjectName}, explique o conceito de '{topic}' de forma resumida, com 3 tópicos principais e 1 exemplo prático. Ementa da matéria: {syllabus ?? "Padrão universitário"}.";

        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            }
        };

        var model = _configuration["Gemini:Model"] ?? "gemini-1.5-flash";
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

        var response = await _httpClient.PostAsJsonAsync(url, requestBody);
        if (!response.IsSuccessStatusCode) return "Não foi possível gerar o resumo.";

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("candidates")[0]
                   .GetProperty("content")
                   .GetProperty("parts")[0]
                   .GetProperty("text")
                   .GetString() ?? "";
    }
}
