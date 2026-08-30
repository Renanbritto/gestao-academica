using Microsoft.EntityFrameworkCore;
using Lo.Backend.Data;
using Lo.Backend.DTOs;
using Lo.Backend.Models;

namespace Lo.Backend.Services;

public class DashboardService : IDashboardService
{
    private const decimal PassingGradeThreshold = 70.0m;
    private readonly AppDbContext _context;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(AppDbContext context, ILogger<DashboardService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<DashboardResponseDto> GetDashboardMetricsAsync(Guid userId)
    {
        var profile = await _context.Profiles.AsNoTracking().FirstOrDefaultAsync(p => p.Id == userId);
        var targetGpa = profile?.TargetGpa ?? 80.0m;

        var subjects = await _context.Subjects
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .Include(s => s.Activities)
            .ToListAsync();

        var allActivities = await _context.Activities
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .Include(a => a.Subject)
            .OrderBy(a => a.DueDate)
            .ToListAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Contadores
        var pendingActivities = allActivities.Where(a => a.Status != "Concluído" && a.Status != "Entregue").ToList();
        var completedActivities = allActivities.Where(a => a.Status == "Concluído" || a.Status == "Entregue").ToList();

        // Próximo compromisso futuro
        var upcoming = allActivities
            .Where(a => a.DueDate >= today && a.Status != "Concluído")
            .OrderBy(a => a.DueDate)
            .FirstOrDefault();

        NextExamDto? nextExam = null;
        if (upcoming != null)
        {
            var daysRemaining = upcoming.DueDate.DayNumber - today.DayNumber;
            nextExam = new NextExamDto(
                upcoming.Id,
                upcoming.Title,
                upcoming.Subject?.Name ?? "Geral",
                upcoming.Subject?.Color ?? "#6366f1",
                upcoming.DueDate,
                daysRemaining,
                upcoming.Weight,
                upcoming.Notes
            );
        }

        // Semáforo por matéria e cálculo de CR
        var semaphoreList = new List<SubjectSemaphoreDto>();
        var subjectAverages = new List<decimal>();

        foreach (var sub in subjects)
        {
            var gradedActs = sub.Activities.Where(a => a.ObtainedGrade.HasValue && a.Weight > 0).ToList();
            decimal currentScore = 0;

            if (gradedActs.Any())
            {
                // Soma ponderada das notas obtidas: (nota * peso / 100)
                currentScore = gradedActs.Sum(a => a.ObtainedGrade!.Value * (a.Weight / 100m));
                currentScore = Math.Round(currentScore, 2);
                subjectAverages.Add(currentScore);
            }

            var subTarget = sub.TargetGrade > 0 ? sub.TargetGrade : targetGpa;
            var missingForPassing = Math.Max(0, PassingGradeThreshold - currentScore);
            var missingForTarget = Math.Max(0, subTarget - currentScore);

            string status;
            string message;

            if (currentScore >= subTarget)
            {
                status = "success";
                message = "Meta atingida! Parabéns! 🌟";
            }
            else if (currentScore >= PassingGradeThreshold)
            {
                status = "ok";
                message = $"Aprovado! Faltam {missingForTarget:0.0} pts para a meta.";
            }
            else if (currentScore >= 40.0m)
            {
                status = "warning";
                message = $"Faltam {missingForPassing:0.0} pts para aprovação (70 pts).";
            }
            else
            {
                status = "danger";
                message = $"Atenção: faltam {missingForPassing:0.0} pts para passar.";
            }

            semaphoreList.Add(new SubjectSemaphoreDto(
                sub.Id,
                sub.Name,
                sub.Color,
                currentScore,
                subTarget,
                missingForPassing,
                missingForTarget,
                status,
                message
            ));
        }

        // CR Geral = média dos scores atuais das matérias que possuem notas
        decimal generalAverage = 0;
        if (subjectAverages.Any())
        {
            generalAverage = Math.Round(subjectAverages.Average(), 2);
        }

        var recentActsDto = allActivities
            .Take(10)
            .Select(a => new ActivityResponseDto(
                a.Id,
                a.UserId,
                a.SubjectId,
                a.Subject?.Name,
                a.Subject?.Color ?? "#6366f1",
                a.Title,
                a.Type,
                a.DueDate,
                a.Weight,
                a.MaxGrade,
                a.ObtainedGrade,
                a.Status,
                a.Notes,
                a.CreatedAt,
                a.DueDate.DayNumber - today.DayNumber
            ))
            .ToList();

        return new DashboardResponseDto(
            generalAverage,
            targetGpa,
            PassingGradeThreshold,
            subjects.Count,
            pendingActivities.Count,
            completedActivities.Count,
            nextExam,
            semaphoreList,
            recentActsDto
        );
    }
}
