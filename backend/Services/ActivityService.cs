using Microsoft.EntityFrameworkCore;
using Lo.Backend.Data;
using Lo.Backend.DTOs;
using Lo.Backend.Models;

namespace Lo.Backend.Services;

public class ActivityService : IActivityService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ActivityService> _logger;

    public ActivityService(AppDbContext context, ILogger<ActivityService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<ActivityResponseDto>> GetActivitiesAsync(Guid userId, long? subjectId = null, string? status = null)
    {
        var query = _context.Activities
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .Include(a => a.Subject)
            .AsQueryable();

        if (subjectId.HasValue)
        {
            query = query.Where(a => a.SubjectId == subjectId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(a => a.Status.ToLower() == status.ToLower());
        }

        var activities = await query
            .OrderBy(a => a.DueDate)
            .ToListAsync();

        return activities.Select(MapToDto).ToList();
    }

    public async Task<ActivityResponseDto?> GetActivityByIdAsync(Guid userId, long activityId)
    {
        var activity = await _context.Activities
            .AsNoTracking()
            .Where(a => a.UserId == userId && a.Id == activityId)
            .Include(a => a.Subject)
            .FirstOrDefaultAsync();

        return activity == null ? null : MapToDto(activity);
    }

    public async Task<ActivityResponseDto> CreateActivityAsync(Guid userId, CreateActivityRequestDto request)
    {
        var activity = new Activity
        {
            UserId = userId,
            SubjectId = request.SubjectId,
            Title = request.Title.Trim(),
            Type = !string.IsNullOrWhiteSpace(request.Type) ? request.Type.Trim() : "Prova",
            DueDate = request.DueDate,
            Weight = request.Weight > 0 ? request.Weight : 25.0m,
            MaxGrade = request.MaxGrade > 0 ? request.MaxGrade : 100.0m,
            ObtainedGrade = request.ObtainedGrade,
            Status = !string.IsNullOrWhiteSpace(request.Status) ? request.Status : (request.ObtainedGrade.HasValue ? "Concluído" : "Pendente"),
            Notes = request.Notes?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Activities.Add(activity);
        await _context.SaveChangesAsync();

        if (activity.SubjectId.HasValue)
        {
            await _context.Entry(activity).Reference(a => a.Subject).LoadAsync();
        }

        return MapToDto(activity);
    }

    public async Task<ActivityResponseDto?> UpdateActivityAsync(Guid userId, long activityId, UpdateActivityRequestDto request)
    {
        var activity = await _context.Activities
            .Include(a => a.Subject)
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Id == activityId);

        if (activity == null) return null;

        activity.SubjectId = request.SubjectId;
        activity.Title = request.Title.Trim();
        activity.Type = request.Type.Trim();
        activity.DueDate = request.DueDate;
        activity.Weight = request.Weight;
        activity.MaxGrade = request.MaxGrade;
        activity.ObtainedGrade = request.ObtainedGrade;
        activity.Status = request.Status;
        activity.Notes = request.Notes?.Trim();

        // Se lançou nota e o status era Pendente, marca como Concluído
        if (activity.ObtainedGrade.HasValue && activity.Status == "Pendente")
        {
            activity.Status = "Concluído";
        }

        await _context.SaveChangesAsync();

        if (activity.SubjectId.HasValue)
        {
            await _context.Entry(activity).Reference(a => a.Subject).LoadAsync();
        }

        return MapToDto(activity);
    }

    public async Task<ActivityResponseDto?> UpdateGradeAsync(Guid userId, long activityId, decimal obtainedGrade)
    {
        var activity = await _context.Activities
            .Include(a => a.Subject)
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Id == activityId);

        if (activity == null) return null;

        activity.ObtainedGrade = obtainedGrade;
        activity.Status = "Concluído";

        await _context.SaveChangesAsync();
        return MapToDto(activity);
    }

    public async Task<bool> DeleteActivityAsync(Guid userId, long activityId)
    {
        var activity = await _context.Activities
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Id == activityId);

        if (activity == null) return false;

        _context.Activities.Remove(activity);
        await _context.SaveChangesAsync();
        return true;
    }

    private static ActivityResponseDto MapToDto(Activity a)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var daysUntilDue = a.DueDate.DayNumber - today.DayNumber;

        return new ActivityResponseDto(
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
            daysUntilDue
        );
    }
}
