namespace Lo.Backend.DTOs;

public record GeminiChatRequest(
    string Prompt,
    string? ContextType,
    Guid? UserId
);

public record GeminiChatResponse(
    string Answer,
    bool Success,
    string? ErrorMessage
);
