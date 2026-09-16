using Microsoft.EntityFrameworkCore;
using Lo.Backend.Data;
using Lo.Backend.DTOs;
using Lo.Backend.Models;

namespace Lo.Backend.Services;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ProfileService> _logger;

    public ProfileService(AppDbContext context, ILogger<ProfileService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ProfileResponseDto?> GetProfileAsync(Guid userId)
    {
        var profile = await _context.Profiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == userId);

        if (profile == null) return null;

        return MapToDto(profile);
    }

    public async Task<ProfileResponseDto> UpdateProfileAsync(Guid userId, UpdateProfileRequestDto request)
    {
        var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.Id == userId);

        if (profile == null)
        {
            profile = new Profile
            {
                Id = userId,
                Name = string.IsNullOrWhiteSpace(request.Name) ? "Estudante Ió" : request.Name,
                Course = request.Course,
                Period = request.Period,
                TargetGpa = request.TargetGpa,
                MotivationNote = request.MotivationNote,
                Theme = request.Theme ?? "dark",
                AccentColor = request.AccentColor ?? "#6366f1",
                AvatarDataUrl = request.AvatarDataUrl,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Profiles.Add(profile);
        }
        else
        {
            profile.Name = request.Name;
            profile.Course = request.Course;
            profile.Period = request.Period;
            profile.TargetGpa = request.TargetGpa;
            profile.MotivationNote = request.MotivationNote;
            profile.Theme = request.Theme;
            profile.AccentColor = request.AccentColor;
            if (request.AvatarDataUrl != null)
            {
                profile.AvatarDataUrl = request.AvatarDataUrl;
            }
            profile.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return MapToDto(profile);
    }

    public async Task<ProfileResponseDto> EnsureProfileExistsAsync(Guid userId, string? email = null, string? fullName = null)
    {
        var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.Id == userId);
        if (profile != null) return MapToDto(profile);

        var displayName = !string.IsNullOrWhiteSpace(fullName)
            ? fullName
            : (!string.IsNullOrWhiteSpace(email) ? email.Split('@')[0] : "Estudante Ió");

        profile = new Profile
        {
            Id = userId,
            Name = displayName,
            Course = "",
            Period = "",
            TargetGpa = 80.0m,
            MotivationNote = "Bora conquistar esse semestre! 🚀",
            Theme = "dark",
            AccentColor = "#6366f1",
            UpdatedAt = DateTime.UtcNow
        };

        _context.Profiles.Add(profile);
        await _context.SaveChangesAsync();
        return MapToDto(profile);
    }

    private static ProfileResponseDto MapToDto(Profile p) => new(
        p.Id,
        p.Name,
        p.Course,
        p.Period,
        p.TargetGpa,
        p.MotivationNote,
        p.Theme,
        p.AccentColor,
        p.AvatarDataUrl,
        p.UpdatedAt
    );
}
