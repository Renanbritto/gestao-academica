namespace Lo.Backend.DTOs;

public record SubjectResponseDto(
    long Id,
    Guid UserId,
    string Name,
    string? Professor,
    decimal TargetGrade,
    string Color,
    string? Description,
    DateTime CreatedAt,
    int TotalActivities,
    decimal CurrentAverage
);

public record CreateSubjectRequestDto(
    string Name,
    string? Professor,
    decimal TargetGrade,
    string Color,
    string? Description
);

public record UpdateSubjectRequestDto(
    string Name,
    string? Professor,
    decimal TargetGrade,
    string Color,
    string? Description
);
