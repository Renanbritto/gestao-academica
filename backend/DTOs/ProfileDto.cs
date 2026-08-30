namespace Lo.Backend.DTOs;

public record ProfileResponseDto(
    Guid Id,
    string Name,
    string? Course,
    string? Period,
    decimal TargetGpa,
    string? MotivationNote,
    string Theme,
    string AccentColor,
    string? AvatarDataUrl,
    DateTime UpdatedAt
);

public record UpdateProfileRequestDto(
    string Name,
    string? Course,
    string? Period,
    decimal TargetGpa,
    string? MotivationNote,
    string Theme,
    string AccentColor,
    string? AvatarDataUrl
);
