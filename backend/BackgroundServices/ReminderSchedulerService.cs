using Microsoft.EntityFrameworkCore;
using Lo.Backend.Data;
using Lo.Backend.Services;

namespace Lo.Backend.BackgroundServices;

public class ReminderSchedulerService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ReminderSchedulerService> _logger;

    public ReminderSchedulerService(
        IServiceProvider serviceProvider,
        ILogger<ReminderSchedulerService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ReminderSchedulerService iniciado.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndSendRemindersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro no ciclo de verificação do ReminderSchedulerService");
            }

            // Executa a cada 1 hora
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }

    private async Task CheckAndSendRemindersAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var botService = scope.ServiceProvider.GetRequiredService<ITelegramBotService>();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var targetDates = new[]
        {
            today,                         // Hoje
            today.AddDays(1),              // Amanhã
            today.AddDays(3),              // Em 3 dias
            today.AddDays(7)               // Em 7 dias
        };

        var links = await context.TelegramLinks
            .AsNoTracking()
            .Where(l => l.NotificationsEnabled)
            .ToListAsync();

        foreach (var link in links)
        {
            var activities = await context.Activities
                .AsNoTracking()
                .Where(a => a.UserId == link.UserId
                         && targetDates.Contains(a.DueDate)
                         && a.Status != "Concluído"
                         && a.Status != "Entregue")
                .Include(a => a.Subject)
                .ToListAsync();

            foreach (var act in activities)
            {
                var diff = act.DueDate.DayNumber - today.DayNumber;
                string alertText = diff switch
                {
                    0 => $"🚨 *HOJE é o dia da sua atividade!*",
                    1 => $"⚠️ *Lembrete: Sua prova/trabalho é AMANHÃ!*",
                    3 => $"📅 *Faltam 3 dias para:*",
                    7 => $"💡 *Falta 1 semana para:*",
                    _ => "🔔 *Aviso acadêmico:*"
                };

                var msg = $"{alertText}\n" +
                          $"📝 *{act.Title}*\n" +
                          $"📚 Disciplina: *{act.Subject?.Name ?? "Geral"}*\n" +
                          $"⚖️ Peso: {act.Weight}% • Prazo: {act.DueDate:dd/MM/yyyy}";

                if (!string.IsNullOrWhiteSpace(act.Notes))
                {
                    msg += $"\n_Obs: {act.Notes}_";
                }

                await botService.SendProactiveNotificationAsync(link.UserId, msg);
            }
        }
    }
}
