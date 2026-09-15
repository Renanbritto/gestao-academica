using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Lo.Backend.BackgroundServices;
using Lo.Backend.Data;
using Lo.Backend.Services;

// Força resolução DNS via IPv4 (evita timeout IPv6 em redes brasileiras)
AppContext.SetSwitch("System.Net.DisableIPv6", true);

var builder = WebApplication.CreateBuilder(args);

// Suporte a arquivo de credenciais locais (ignorado no Git) e variáveis de ambiente
var localJsonPath = Path.Combine(builder.Environment.ContentRootPath, "appsettings.local.json");
builder.Configuration
    .AddJsonFile(localJsonPath, optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// 1. Configuração do Banco de Dados PostgreSQL (Supabase / Railway)
var rawConnectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? Environment.GetEnvironmentVariable("DATABASE_URL")
                       ?? string.Empty;

var connectionString = ParsePostgreSqlConnectionString(rawConnectionString);

// Informa no console qual host está sendo utilizado
var hostInfo = connectionString.Split(';')
    .FirstOrDefault(s => s.StartsWith("Host=", StringComparison.OrdinalIgnoreCase)) ?? "Configurado";
Console.WriteLine($"[IO Database] {hostInfo}");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// 2. Configuração de Autenticação JWT (Supabase Auth)
var supabaseUrl = builder.Configuration["Supabase:Url"] ?? Environment.GetEnvironmentVariable("SUPABASE_URL") ?? "https://flwsadskdldlsbnkqqsf.supabase.co";
var jwtSecret = builder.Configuration["Supabase:JwtSecret"] ?? Environment.GetEnvironmentVariable("SUPABASE_JWT_SECRET") ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsd3NhZHNrZGxkbHNibmtxcXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNzI1NDMsImV4cCI6MjEwMjg0ODU0M30.JapRETGh4aN6-N80m7fibyoG4D9o99-9E2GiXmxLt6o";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = false, // Aceita emissão do Supabase
        ValidateAudience = true,
        ValidAudience = "authenticated",
        ClockSkew = TimeSpan.FromMinutes(5)
    };
});

builder.Services.AddAuthorization();

// 3. Injeção de Dependências (Serviços e Clientes HTTP)
builder.Services.AddHttpClient<IGeminiService, GeminiService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ITelegramBotService, TelegramBotService>();

// Background Service para Lembretes Proativos no Telegram
builder.Services.AddHostedService<ReminderSchedulerService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 4. Configuração Swagger com suporte a Bearer Token JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "IO Acadêmico API",
        Version = "v1",
        Description = "Backend em C# ASP.NET Core 8 para Gestão Acadêmica, Telegram Bot e Gemini IA."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Insira o token JWT do Supabase: Bearer {seu_token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 5. Configuração de CORS (Next.js Frontend & Vercel)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                      ?? new[] { "http://localhost:3000", "http://localhost:5173" };

        policy.SetIsOriginAllowed(origin => true) // Flexível para desenvolvimento e Vercel previews
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configuração do Pipeline HTTP
if (app.Environment.IsDevelopment() || true) // Habilita Swagger no Railway para documentação
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "IO Acadêmico API v1");
        c.RoutePrefix = string.Empty; // Swagger na raiz da API
    });
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check simples para o Railway
app.MapGet("/health", () => Results.Ok(new { status = "healthy", app = "Lo.Backend", timestamp = DateTime.UtcNow }));

app.Run();

// Parser robusto para qualquer formato de Connection String (URI postgresql:// ou Chave-Valor)
static string ParsePostgreSqlConnectionString(string raw)
{
    if (string.IsNullOrWhiteSpace(raw)) return raw;

    string trimmed = raw.Trim().Trim('"', '\'');

    // Se já estiver no formato chave-valor (ex: Host=...;Database=...), retorna direto
    if (trimmed.Contains("Host=", StringComparison.OrdinalIgnoreCase) ||
        trimmed.Contains("Server=", StringComparison.OrdinalIgnoreCase))
    {
        return trimmed;
    }

    // Se estiver no formato URI (postgresql:// ou postgres://)
    if (trimmed.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
        trimmed.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
    {
        try
        {
            // Remove o prefixo
            int prefixLen = trimmed.IndexOf("://", StringComparison.OrdinalIgnoreCase) + 3;
            string withoutPrefix = trimmed.Substring(prefixLen);

            // Localiza o último '@' que separa [user:password] de [host:port/database]
            int atIndex = withoutPrefix.LastIndexOf('@');
            if (atIndex == -1) return trimmed;

            string authPart = withoutPrefix.Substring(0, atIndex);
            string hostDbPart = withoutPrefix.Substring(atIndex + 1);

            // Separa usuário e senha no authPart
            string username = "postgres";
            string password = "";
            int colonIndex = authPart.IndexOf(':');
            if (colonIndex != -1)
            {
                username = Uri.UnescapeDataString(authPart.Substring(0, colonIndex));
                password = Uri.UnescapeDataString(authPart.Substring(colonIndex + 1));
            }
            else
            {
                username = Uri.UnescapeDataString(authPart);
            }

            // Separa host[:port] e database
            string host = hostDbPart;
            string port = "5432";
            string database = "postgres";

            int slashIndex = hostDbPart.IndexOf('/');
            if (slashIndex != -1)
            {
                host = hostDbPart.Substring(0, slashIndex);
                database = hostDbPart.Substring(slashIndex + 1);
                // Remove query strings se houver
                int qIndex = database.IndexOf('?');
                if (qIndex != -1) database = database.Substring(0, qIndex);
                if (string.IsNullOrWhiteSpace(database)) database = "postgres";
            }

            int portColon = host.IndexOf(':');
            if (portColon != -1)
            {
                port = host.Substring(portColon + 1);
                host = host.Substring(0, portColon);
            }

            // Remove quaisquer caracteres estranhos do host (ex: !, @, espaços)
            host = host.Trim('!', '@', '/', ' ', '\\', ':', ';');

            return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
        }
        catch
        {
            return trimmed;
        }
    }

    return trimmed;
}

public partial class Program { }
