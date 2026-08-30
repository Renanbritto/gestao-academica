using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Lo.Backend.BackgroundServices;
using Lo.Backend.Data;
using Lo.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuração do Banco de Dados PostgreSQL (Supabase / Railway)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                    ?? Environment.GetEnvironmentVariable("DATABASE_URL");

// Trata formato postgres:// (comum no Railway) se necessário
if (!string.IsNullOrWhiteSpace(connectionString) && connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
{
    connectionString = ConvertPostgreSqlUriToNpgsql(connectionString);
}

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

// 3. Configuração de CORS (Permite Vercel e Localhost)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            var uri = new Uri(origin);
            return uri.Host == "localhost"
                || uri.Host.EndsWith("vercel.app", StringComparison.OrdinalIgnoreCase)
                || uri.Host == "127.0.0.1";
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// 4. Injeção de Dependências dos Serviços
builder.Services.AddHttpClient();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IGeminiService, GeminiService>();
builder.Services.AddScoped<ITelegramBotService, TelegramBotService>();

// 5. Background Services
builder.Services.AddHostedService<ReminderSchedulerService>();

// 6. Controllers e Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Ló Acadêmico API",
        Version = "v1",
        Description = "API REST de Gestão Acadêmica & Bot Telegram com Gemini AI para a plataforma Ló"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Insira o token JWT do Supabase no formato: Bearer {token}",
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

var app = builder.Build();

// Pipeline de Middleware HTTP
if (app.Environment.IsDevelopment() || true) // Ativa Swagger para teste no Railway
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Ló Acadêmico API v1");
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

// Helper para converter connection string no formato URI para Npgsql
static string ConvertPostgreSqlUriToNpgsql(string uriString)
{
    var uri = new Uri(uriString);
    var userInfo = uri.UserInfo.Split(':');
    var username = userInfo.Length > 0 ? userInfo[0] : "";
    var password = userInfo.Length > 1 ? userInfo[1] : "";
    var port = uri.Port > 0 ? uri.Port : 5432;
    var database = uri.AbsolutePath.TrimStart('/');

    return $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
}
