namespace Lo.Backend.DTOs;

public record ActivityResponseDto(
    long Id,
    Guid UserId,
    long? SubjectId,
    string? SubjectName,
    string? SubjectColor,
    string Title,
    string Type,
    DateOnly DueDate,
    decimal Weight,
    decimal MaxGrade,
    decimal? ObtainedGrade,
    string Status,
    string? Notes,
    DateTime CreatedAt,
    int DaysUntilDue
);

public record CreateActivityRequestDto(
    long? SubjectId,
    string Title,
    string Type,
    DateOnly DueDate,
    decimal Weight,
    decimal MaxGrade,
    decimal? ObtainedGrade,
    string Status,
    string? Notes
);

public record UpdateActivityRequestDto(
    long? SubjectId,
    string Title,
    string Type,
    DateOnly DueDate,
    decimal Weight,
    decimal MaxGrade,
    decimal? ObtainedGrade,
    string Status,
    string? Notes
);

public record UpdateGradeRequestDto(
    decimal ObtainedGrade
);
