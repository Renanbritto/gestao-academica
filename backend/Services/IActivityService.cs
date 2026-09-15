using Lo.Backend.DTOs;

namespace Lo.Backend.Services;

public interface IActivityService
{
    Task<List<ActivityResponseDto>> GetActivitiesAsync(Guid userId, long? subjectId = null, string? status = null);
    Task<ActivityResponseDto?> GetActivityByIdAsync(Guid userId, long activityId);
    Task<ActivityResponseDto> CreateActivityAsync(Guid userId, CreateActivityRequestDto request);
    Task<ActivityResponseDto?> UpdateActivityAsync(Guid userId, long activityId, UpdateActivityRequestDto request);
    Task<ActivityResponseDto?> UpdateGradeAsync(Guid userId, long activityId, decimal obtainedGrade);
    Task<bool> DeleteActivityAsync(Guid userId, long activityId);
}
