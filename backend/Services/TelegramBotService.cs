using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Lo.Backend.Data;
using Lo.Backend.DTOs;
using Lo.Backend.Models;

namespace Lo.Backend.Services;

public class TelegramBotService : ITelegramBotService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IDashboardService _dashboardService;
    private readonly IGeminiService _geminiService;
    private readonly ILogger<TelegramBotService> _logger;
    private TelegramBotClient? _botClient;

    public TelegramBotService(
        AppDbContext context,
        IConfiguration configuration,
        IDashboardService dashboardService,
        IGeminiService geminiService,
        ILogger<TelegramBotService> logger)
    {
        _context = context;
        _configuration = configuration;
        _dashboardService = dashboardService;
        _geminiService = geminiService;
        _logger = logger;

        var token = _configuration["Telegram:BotToken"] ?? Environment.GetEnvironmentVariable("TELEGRAM_BOT_TOKEN");
        if (!string.IsNullOrWhiteSpace(token))
        {
            _botClient = new TelegramBotClient(token);
        }
    }

    private TelegramBotClient? GetClient()
    {
        if (_botClient != null) return _botClient;
        var token = _configuration["Telegram:BotToken"] ?? Environment.GetEnvironmentVariable("TELEGRAM_BOT_TOKEN");
        if (!string.IsNullOrWhiteSpace(token))
        {
            _botClient = new TelegramBotClient(token);
        }
        return _botClient;
    }

    public async Task<GenerateLinkCodeResponseDto> GenerateLinkCodeAsync(Guid userId)
    {
        // Remove códigos antigos expirados ou do usuário
        var oldCodes = await _context.TelegramLinkCodes
            .Where(c => c.UserId == userId || c.ExpiresAt < DateTime.UtcNow)
            .ToListAsync();
        _context.TelegramLinkCodes.RemoveRange(oldCodes);

        // Gera código de 6 caracteres alfanuméricos em maiúsculas
        var code = GenerateRandomCode(6);
        var expiresAt = DateTime.UtcNow.AddMinutes(15);

        var linkCode = new TelegramLinkCode
        {
            UserId = userId,
            Code = code,
            ExpiresAt = expiresAt,
            CreatedAt = DateTime.UtcNow
        };

        _context.TelegramLinkCodes.Add(linkCode);
        await _context.SaveChangesAsync();

        var botUsername = _configuration["Telegram:BotUsername"] ?? "LoAcademicoBot";

        return new GenerateLinkCodeResponseDto(
            code,
            expiresAt,
            botUsername,
            $"Abra o Telegram, procure pelo bot @{botUsername} e envie o comando: /vincular {code}"
        );
    }

    public async Task<TelegramStatusResponseDto> GetLinkStatusAsync(Guid userId)
    {
        var link = await _context.TelegramLinks.AsNoTracking().FirstOrDefaultAsync(l => l.UserId == userId);
        if (link == null)
        {
            return new TelegramStatusResponseDto(false, null, null, false, "08:00,20:00", null);
        }

        return new TelegramStatusResponseDto(
            true,
            link.ChatId,
            link.Username,
            link.NotificationsEnabled,
            link.ReminderHours,
            link.LinkedAt
        );
    }

    public async Task<bool> UnlinkTelegramAsync(Guid userId)
    {
        var link = await _context.TelegramLinks.FirstOrDefaultAsync(l => l.UserId == userId);
        if (link == null) return false;

        _context.TelegramLinks.Remove(link);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateSettingsAsync(Guid userId, UpdateTelegramSettingsRequestDto request)
    {
        var link = await _context.TelegramLinks.FirstOrDefaultAsync(l => l.UserId == userId);
        if (link == null) return false;

        link.NotificationsEnabled = request.NotificationsEnabled;
        if (!string.IsNullOrWhiteSpace(request.ReminderHours))
        {
            link.ReminderHours = request.ReminderHours;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task ProcessTelegramUpdateAsync(Update update)
    {
        var client = GetClient();
        if (client == null || update.Message == null || string.IsNullOrWhiteSpace(update.Message.Text)) return;

        var message = update.Message;
        var chatId = message.Chat.Id;
        var text = message.Text.Trim();
        var username = message.From?.Username ?? message.From?.FirstName ?? "Estudante";

        _logger.LogInformation("Mensagem recebida do Telegram (ChatId: {ChatId}): {Text}", chatId, text);

        try
        {
            // Trata comandos
            if (text.StartsWith("/start"))
            {
                await HandleStartCommandAsync(client, chatId, text);
                return;
            }

            if (text.StartsWith("/vincular", StringComparison.OrdinalIgnoreCase))
            {
                await HandleLinkCommandAsync(client, chatId, username, text);
                return;
            }

            // Verifica se o chat_id já está vinculado a um usuário
            var link = await _context.TelegramLinks
                .Include(l => l.Profile)
                .FirstOrDefaultAsync(l => l.ChatId == chatId);

            if (link == null)
            {
                await client.SendTextMessageAsync(
                    chatId,
                    "👋 Olá! Eu sou o **Ió**, seu assistente acadêmico com inteligência artificial.\n\n" +
                    "Para eu acessar suas matérias, notas e provas, você precisa vincular sua conta.\n\n" +
                    "👉 Acesse a plataforma web do **Ió**, vá em **Perfil > Telegram**, gere seu código de vinculação e digite aqui:\n" +
                    "`/vincular CODIGO`\n\n" +
                    "Exemplo: `/vincular AB12CD`",
                    parseMode: ParseMode.Markdown
                );
                return;
            }

            var userId = link.UserId;

            if (text.StartsWith("/provas", StringComparison.OrdinalIgnoreCase))
            {
                await HandleProvasCommandAsync(client, chatId, userId);
            }
            else if (text.StartsWith("/notas", StringComparison.OrdinalIgnoreCase))
            {
                await HandleNotasCommandAsync(client, chatId, userId);
            }
            else if (text.StartsWith("/avisos", StringComparison.OrdinalIgnoreCase))
            {
                await HandleAvisosCommandAsync(client, chatId, userId);
            }
            else if (text.StartsWith("/meta", StringComparison.OrdinalIgnoreCase))
            {
                await HandleMetaCommandAsync(client, chatId, userId);
            }
            else if (text.StartsWith("/ajuda", StringComparison.OrdinalIgnoreCase) || text == "/help")
            {
                await HandleHelpCommandAsync(client, chatId);
            }
            else if (text.StartsWith("/desvincular", StringComparison.OrdinalIgnoreCase))
            {
                _context.TelegramLinks.Remove(link);
                await _context.SaveChangesAsync();
                await client.SendTextMessageAsync(chatId, "✅ Sua conta do Ió foi desvinculada deste Telegram. Até mais!");
            }
            else
            {
                // Pergunta livre / Dúvida acadêmica via Gemini
                await client.SendChatActionAsync(chatId, ChatAction.Typing);

                var aiResponse = await _geminiService.AskAcademicAssistantAsync(userId, text);

                await client.SendTextMessageAsync(
                    chatId,
                    aiResponse.Answer,
                    parseMode: ParseMode.Markdown
                );

                // Salva histórico
                _context.BotConversations.Add(new BotConversation
                {
                    UserId = userId,
                    ChatId = chatId,
                    UserMessage = text,
                    BotResponse = aiResponse.Answer,
                    ContextType = "duvida",
                    CreatedAt = DateTime.UtcNow
                });
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao processar mensagem do Telegram para o ChatId: {ChatId}", chatId);
            await client.SendTextMessageAsync(chatId, "⚠️ Ops, ocorreu um erro ao processar sua solicitação. Tente novamente em instantes.");
        }
    }

    public async Task SendProactiveNotificationAsync(Guid userId, string message)
    {
        var client = GetClient();
        if (client == null) return;

        var link = await _context.TelegramLinks.FirstOrDefaultAsync(l => l.UserId == userId && l.NotificationsEnabled);
        if (link != null)
        {
            try
            {
                await client.SendTextMessageAsync(link.ChatId, message, parseMode: ParseMode.Markdown);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Falha ao enviar notificação proativa para ChatId {ChatId}", link.ChatId);
            }
        }
    }

    #region Handlers de Comandos

    private async Task HandleStartCommandAsync(TelegramBotClient client, long chatId, string text)
    {
        var parts = text.Split(' ');
        if (parts.Length > 1)
        {
            var code = parts[1].Trim();
            await HandleLinkWithCodeAsync(client, chatId, null, code);
            return;
        }

        await client.SendTextMessageAsync(
            chatId,
            "🚀 *Bem-vindo ao Ió Acadêmico!*\n\n" +
            "Eu sou seu parceiro de estudos inteligente. Posso te lembrar de prazos, calcular notas e tirar dúvidas de matérias usando IA.\n\n" +
            "Para conectar sua conta, envie:\n" +
            "`/vincular SEU_CODIGO`\n\n" +
            "Se já estiver vinculado, use `/ajuda` para ver os comandos!",
            parseMode: ParseMode.Markdown
        );
    }

    private async Task HandleLinkCommandAsync(TelegramBotClient client, long chatId, string? username, string text)
    {
        var parts = text.Split(' ');
        if (parts.Length < 2)
        {
            await client.SendTextMessageAsync(chatId, "⚠️ Por favor, informe o código de 6 dígitos.\nExemplo: `/vincular AB12CD`", parseMode: ParseMode.Markdown);
            return;
        }

        var code = parts[1].Trim().ToUpperInvariant();
        await HandleLinkWithCodeAsync(client, chatId, username, code);
    }

    private async Task HandleLinkWithCodeAsync(TelegramBotClient client, long chatId, string? username, string code)
    {
        var linkCode = await _context.TelegramLinkCodes
            .Include(c => c.Profile)
            .FirstOrDefaultAsync(c => c.Code == code && c.ExpiresAt > DateTime.UtcNow);

        if (linkCode == null)
        {
            await client.SendTextMessageAsync(
                chatId,
                "❌ Código inválido ou expirado. Gere um novo código no painel web em **Perfil > Telegram** e tente novamente."
            );
            return;
        }

        // Verifica se já existe vínculo e atualiza ou cria
        var existingLink = await _context.TelegramLinks.FirstOrDefaultAsync(l => l.UserId == linkCode.UserId);
        if (existingLink != null)
        {
            existingLink.ChatId = chatId;
            existingLink.Username = username;
            existingLink.LinkedAt = DateTime.UtcNow;
        }
        else
        {
            _context.TelegramLinks.Add(new TelegramLink
            {
                UserId = linkCode.UserId,
                ChatId = chatId,
                Username = username,
                NotificationsEnabled = true,
                ReminderHours = "08:00,20:00",
                LinkedAt = DateTime.UtcNow
            });
        }

        _context.TelegramLinkCodes.Remove(linkCode);
        await _context.SaveChangesAsync();

        var studentName = linkCode.Profile?.Name ?? "Estudante";

        await client.SendTextMessageAsync(
            chatId,
            $"🎉 *Conta vinculada com sucesso, {studentName}!*\n\n" +
            "Agora você pode usar os comandos:\n" +
            "📝 `/provas` — Ver próximas provas e prazos\n" +
            "📊 `/notas` — Consultar seu rendimento e CR\n" +
            "🔔 `/avisos` — Ver atividades pendentes urgentes\n" +
            "🎯 `/meta` — Calculadora de notas necessárias\n\n" +
            "💡 Ou simplesmente me mande qualquer dúvida sobre suas matérias!",
            parseMode: ParseMode.Markdown
        );
    }

    private async Task HandleProvasCommandAsync(TelegramBotClient client, long chatId, Guid userId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var upcoming = await _context.Activities
            .AsNoTracking()
            .Where(a => a.UserId == userId && a.DueDate >= today && a.Status != "Concluído")
            .Include(a => a.Subject)
            .OrderBy(a => a.DueDate)
            .Take(8)
            .ToListAsync();

        if (!upcoming.Any())
        {
            await client.SendTextMessageAsync(chatId, "🌴 Nenhuma prova ou atividade pendente para os próximos dias. Tudo em dia!");
            return;
        }

        var sb = new StringBuilder();
        sb.AppendLine("📅 *Próximas Provas & Atividades:*\n");

        foreach (var act in upcoming)
        {
            var diff = act.DueDate.DayNumber - today.DayNumber;
            var daysLabel = diff == 0 ? "🔴 *HOJE!*" : (diff == 1 ? "⚠️ *AMANHÃ!*" : $"em {diff} dias ({act.DueDate:dd/MM})");
            var icon = act.Type == "Prova" ? "📝" : "📚";

            sb.AppendLine($"{icon} *{act.Title}*");
            sb.AppendLine($"   Disciplina: {act.Subject?.Name ?? "Geral"}");
            sb.AppendLine($"   Prazo: {daysLabel} • Peso: {act.Weight}%");
            if (!string.IsNullOrWhiteSpace(act.Notes))
            {
                sb.AppendLine($"   _Obs: {act.Notes}_");
            }
            sb.AppendLine();
        }

        await client.SendTextMessageAsync(chatId, sb.ToString(), parseMode: ParseMode.Markdown);
    }

    private async Task HandleNotasCommandAsync(TelegramBotClient client, long chatId, Guid userId)
    {
        var dash = await _dashboardService.GetDashboardMetricsAsync(userId);

        var sb = new StringBuilder();
        sb.AppendLine("📊 *Seu Rendimento Acadêmico no Ió:*\n");
        sb.AppendLine($"🏆 **Média Geral (CR):** `{dash.GeneralAverage:0.0} / 100 pts`");
        sb.AppendLine($"🎯 **Sua Meta Pessoal:** `{dash.TargetGpa:0.0} pts`");
        sb.AppendLine($"⚖️ **Mínimo de Aprovação:** `{dash.PassingGradeThreshold:0.0} pts`\n");

        sb.AppendLine("🚦 *Desempenho por Matéria:*");
        foreach (var sem in dash.SemaphoreList)
        {
            var badge = sem.Status == "success" ? "🟢" : (sem.Status == "ok" ? "🔵" : (sem.Status == "warning" ? "🟡" : "🔴"));
            sb.AppendLine($"{badge} *{sem.SubjectName}*: `{sem.CurrentScore:0.0} pts`");
            sb.AppendLine($"   _{sem.StatusMessage}_");
        }

        await client.SendTextMessageAsync(chatId, sb.ToString(), parseMode: ParseMode.Markdown);
    }

    private async Task HandleAvisosCommandAsync(TelegramBotClient client, long chatId, Guid userId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var pending = await _context.Activities
            .AsNoTracking()
            .Where(a => a.UserId == userId && a.Status != "Concluído")
            .Include(a => a.Subject)
            .OrderBy(a => a.DueDate)
            .Take(6)
            .ToListAsync();

        if (!pending.Any())
        {
            await client.SendTextMessageAsync(chatId, "✅ Sem avisos urgentes! Todas as atividades estão entregues.");
            return;
        }

        var sb = new StringBuilder();
        sb.AppendLine("🔔 *Central de Avisos Ió:*\n");

        foreach (var act in pending)
        {
            var diff = act.DueDate.DayNumber - today.DayNumber;
            string urgency = diff <= 2 ? "🔴 URGENTE" : (diff <= 7 ? "🟡 ATENÇÃO" : "🟢 NO PRAZO");
            sb.AppendLine($"{urgency} — *{act.Title}* ({act.Subject?.Name})");
            sb.AppendLine($"Entrega: {act.DueDate:dd/MM/yyyy} (faltam {diff} dias)");
            sb.AppendLine();
        }

        await client.SendTextMessageAsync(chatId, sb.ToString(), parseMode: ParseMode.Markdown);
    }

    private async Task HandleMetaCommandAsync(TelegramBotClient client, long chatId, Guid userId)
    {
        var subjects = await _context.Subjects
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .Include(s => s.Activities)
            .ToListAsync();

        if (!subjects.Any())
        {
            await client.SendTextMessageAsync(chatId, "Cadastre matérias no site para usar a calculadora de meta.");
            return;
        }

        var sb = new StringBuilder();
        sb.AppendLine("🎯 *Calculadora de Meta por Matéria (Mínimo: 70 pts):*\n");

        foreach (var sub in subjects)
        {
            var graded = sub.Activities.Where(a => a.ObtainedGrade.HasValue && a.Weight > 0).ToList();
            var currentScore = graded.Sum(a => a.ObtainedGrade!.Value * (a.Weight / 100m));
            var remainingWeight = 100m - graded.Sum(a => a.Weight);

            sb.AppendLine($"📚 *{sub.Name}*");
            sb.AppendLine($"Pontuação atual: `{currentScore:0.0} / 100 pts`");

            if (currentScore >= 70.0m)
            {
                sb.AppendLine("✅ Já aprovado! Mantenha o ritmo para atingir sua meta.\n");
            }
            else if (remainingWeight > 0)
            {
                var neededOnRest = ((70.0m - currentScore) / (remainingWeight / 100m));
                var neededTarget = ((sub.TargetGrade - currentScore) / (remainingWeight / 100m));
                sb.AppendLine($"Faltam `{70.0m - currentScore:0.0} pts` para aprovação.");
                sb.AppendLine($"Nota necessária nas próximas avaliações (peso {remainingWeight}%): `{Math.Min(100, Math.Max(0, neededOnRest)):0.0} / 100`\n");
            }
            else
            {
                sb.AppendLine($"Sem avaliações restantes cadastradas.\n");
            }
        }

        await client.SendTextMessageAsync(chatId, sb.ToString(), parseMode: ParseMode.Markdown);
    }

    private async Task HandleHelpCommandAsync(TelegramBotClient client, long chatId)
    {
        await client.SendTextMessageAsync(
            chatId,
            "💡 *Comandos do Ió Acadêmico:*\n\n" +
            "📝 `/provas` — Lista próximas provas e datas\n" +
            "📊 `/notas` — Exibe sua média geral (CR) e notas\n" +
            "🔔 `/avisos` — Alertas de atividades pendentes com semáforo\n" +
            "🎯 `/meta` — Quanto você precisa tirar para passar\n" +
            "⚙️ `/desvincular` — Desconectar este Telegram da sua conta\n\n" +
            "🤖 *Perguntas com IA:*\n" +
            "Você pode me mandar qualquer mensagem com dúvidas sobre matérias, pedidos de resumo ou explicações didáticas!",
            parseMode: ParseMode.Markdown
        );
    }

    #endregion

    private static string GenerateRandomCode(int length)
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var bytes = new byte[length];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);

        var sb = new StringBuilder(length);
        foreach (var b in bytes)
        {
            sb.Append(chars[b % chars.Length]);
        }
        return sb.ToString();
    }
}
