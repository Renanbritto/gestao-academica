namespace Lo.Backend.DTOs;

public record NextExamDto(
    long ActivityId,
    string Title,
    string SubjectName,
    string SubjectColor,
    DateOnly DueDate,
    int DaysRemaining,
    decimal Weight,
    string? Notes
);

public record SubjectSemaphoreDto(
    long SubjectId,
    string SubjectName,
    string Color,
    decimal CurrentScore,
    decimal TargetScore,
    decimal MissingForPassing,
    decimal MissingForTarget,
    string Status, // "success", "warning", "danger"
    string StatusMessage
);

public record DashboardResponseDto(
    decimal GeneralAverage,
    decimal TargetGpa,
    decimal PassingGradeThreshold,
    int TotalSubjects,
    int PendingActivitiesCount,
    int CompletedActivitiesCount,
    NextExamDto? NextExam,
    List<SubjectSemaphoreDto> SemaphoreList,
    List<ActivityResponseDto> RecentActivities
);
