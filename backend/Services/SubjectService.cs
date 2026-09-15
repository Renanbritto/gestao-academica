using Microsoft.EntityFrameworkCore;
using Lo.Backend.Data;
using Lo.Backend.DTOs;
using Lo.Backend.Models;

namespace Lo.Backend.Services;

public class SubjectService : ISubjectService
{
    private readonly AppDbContext _context;
    private readonly ILogger<SubjectService> _logger;

    public SubjectService(AppDbContext context, ILogger<SubjectService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<SubjectResponseDto>> GetSubjectsAsync(Guid userId)
    {
        var subjects = await _context.Subjects
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .Include(s => s.Activities)
            .OrderBy(s => s.Name)
            .ToListAsync();

        return subjects.Select(MapToDto).ToList();
    }

    public async Task<SubjectResponseDto?> GetSubjectByIdAsync(Guid userId, long subjectId)
    {
        var subject = await _context.Subjects
            .AsNoTracking()
            .Where(s => s.UserId == userId && s.Id == subjectId)
            .Include(s => s.Activities)
            .FirstOrDefaultAsync();

        return subject == null ? null : MapToDto(subject);
    }

    public async Task<SubjectResponseDto> CreateSubjectAsync(Guid userId, CreateSubjectRequestDto request)
    {
        var subject = new Subject
        {
            UserId = userId,
            Name = request.Name.Trim(),
            Professor = request.Professor?.Trim(),
            TargetGrade = request.TargetGrade > 0 ? request.TargetGrade : 80.0m,
            Color = !string.IsNullOrWhiteSpace(request.Color) ? request.Color : "#6366f1",
            Description = request.Description?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();

        return MapToDto(subject);
    }

    public async Task<SubjectResponseDto?> UpdateSubjectAsync(Guid userId, long subjectId, UpdateSubjectRequestDto request)
    {
        var subject = await _context.Subjects
            .Include(s => s.Activities)
            .FirstOrDefaultAsync(s => s.UserId == userId && s.Id == subjectId);

        if (subject == null) return null;

        subject.Name = request.Name.Trim();
        subject.Professor = request.Professor?.Trim();
        subject.TargetGrade = request.TargetGrade;
        subject.Color = request.Color;
        subject.Description = request.Description?.Trim();

        await _context.SaveChangesAsync();
        return MapToDto(subject);
    }

    public async Task<bool> DeleteSubjectAsync(Guid userId, long subjectId)
    {
        var subject = await _context.Subjects
            .FirstOrDefaultAsync(s => s.UserId == userId && s.Id == subjectId);

        if (subject == null) return false;

        _context.Subjects.Remove(subject);
        await _context.SaveChangesAsync();
        return true;
    }

    private static SubjectResponseDto MapToDto(Subject s)
    {
        var acts = s.Activities ?? new List<Activity>();
        var totalActs = acts.Count;

        // Calcula a média ponderada das atividades concluídas com nota
        var gradedActivities = acts.Where(a => a.ObtainedGrade.HasValue && a.Weight > 0).ToList();
        decimal currentAverage = 0;
        if (gradedActivities.Any())
        {
            var totalWeight = gradedActivities.Sum(a => a.Weight);
            if (totalWeight > 0)
            {
                var weightedSum = gradedActivities.Sum(a => a.ObtainedGrade!.Value * (a.Weight / 100m));
                currentAverage = Math.Round(weightedSum, 2);
            }
        }

        return new SubjectResponseDto(
            s.Id,
            s.UserId,
            s.Name,
            s.Professor,
            s.TargetGrade,
            s.Color,
            s.Description,
            s.CreatedAt,
            totalActs,
            currentAverage
        );
    }
}
