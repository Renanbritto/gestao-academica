using Lo.Backend.DTOs;

namespace Lo.Backend.Services;

public interface IGeminiService
{
    Task<GeminiChatResponse> AskAcademicAssistantAsync(Guid userId, string prompt, string? contextType = null);
    Task<string> GenerateStudyHelpAsync(string subjectName, string topic, string? syllabus);
}
