using Lo.Backend.DTOs;

namespace Lo.Backend.Services;

public interface IProfileService
{
    Task<ProfileResponseDto?> GetProfileAsync(Guid userId);
    Task<ProfileResponseDto> UpdateProfileAsync(Guid userId, UpdateProfileRequestDto request);
    Task<ProfileResponseDto> EnsureProfileExistsAsync(Guid userId, string? email = null, string? fullName = null);
}
