# 🚀 IO — Backend API (ASP.NET Core 8)

API REST moderna de Gestão Acadêmica desenvolvida em **C# / .NET 8**, com integração ao **PostgreSQL (Supabase)**, autenticação via **JWT**, e **Bot do Telegram com IA do Google Gemini**.

---

## 🛠️ Tecnologias

- **Framework**: .NET 8 (ASP.NET Core Web API)
- **ORM**: Entity Framework Core 8 com `Npgsql.EntityFrameworkCore.PostgreSQL`
- **Autenticação**: Supabase Auth (JWT Bearer Token validation)
- **Bot**: `Telegram.Bot` SDK
- **IA**: Google Gemini REST API (1.5 Flash)
- **Documentação**: Swagger / OpenAPI integrado

---

## 📦 Estrutura do Backend

```
backend/
├── BackgroundServices/
│   └── ReminderSchedulerService.cs     # Envio de lembretes automáticos proativos
├── Controllers/
│   ├── BaseApiController.cs            # Extração de claims de usuário (sub/id)
│   ├── ProfileController.cs            # GET/PUT perfil do estudante
│   ├── SubjectsController.cs           # CRUD de matérias/disciplinas
│   ├── ActivitiesController.cs         # CRUD de atividades/provas/trabalhos
│   ├── DashboardController.cs          # Cálculo de CR, semáforo e métricas
│   └── TelegramController.cs           # Vinculação de conta e Webhook do Telegram
├── Data/
│   └── AppDbContext.cs                 # Mapeamentos e DbContext do EF Core
├── DTOs/                               # Data Transfer Objects
├── Models/                             # Entidades de banco (PostgreSQL)
├── Services/                           # Regras de negócio e integrações
├── Dockerfile                          # Build multi-stage para Railway
└── Program.cs                          # Configurações de DI, CORS, Auth e Swagger
```

---

## ⚙️ Variáveis de Ambiente (Railway / Produção)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` ou `ConnectionStrings__DefaultConnection` | Connection string PostgreSQL do Supabase | `Host=aws-0-sa-east-1.pooler.supabase.com;Port=6543;...` |
| `SUPABASE_JWT_SECRET` | Chave secreta JWT do Supabase (Project Settings > API > JWT Secret) | `sua-jwt-secret-aqui` |
| `SUPABASE_URL` | URL do projeto Supabase | `https://xyz.supabase.co` |
| `TELEGRAM_BOT_TOKEN` | Token do bot gerado no @BotFather | `123456789:ABCdefGHI...` |
| `TELEGRAM_BOT_USERNAME` | Username do bot no Telegram | `LoAcademicoBot` |
| `GEMINI_API_KEY` | Chave da API do Google AI Studio | `AIzaSy...` |

---

## 💻 Como Rodar Localmente

1. Tenha o [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) instalado.
2. Navegue até a pasta `backend`:
   ```bash
   cd backend
   ```
3. Restaure os pacotes e execute:
   ```bash
   dotnet run
   ```
4. Acesse a documentação interativa Swagger em:
   `http://localhost:5000` ou `https://localhost:7000`
