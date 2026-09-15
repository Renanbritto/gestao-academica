namespace Lo.Backend.DTOs;

public record GenerateLinkCodeResponseDto(
    string Code,
    DateTime ExpiresAt,
    string BotUsername,
    string Instructions
);

public record TelegramStatusResponseDto(
    bool IsLinked,
    long? ChatId,
    string? Username,
    bool NotificationsEnabled,
    string ReminderHours,
    DateTime? LinkedAt
);

public record UpdateTelegramSettingsRequestDto(
    bool NotificationsEnabled,
    string ReminderHours
);
