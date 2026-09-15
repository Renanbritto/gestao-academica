using Lo.Backend.DTOs;

namespace Lo.Backend.Services;

public interface ISubjectService
{
    Task<List<SubjectResponseDto>> GetSubjectsAsync(Guid userId);
    Task<SubjectResponseDto?> GetSubjectByIdAsync(Guid userId, long subjectId);
    Task<SubjectResponseDto> CreateSubjectAsync(Guid userId, CreateSubjectRequestDto request);
    Task<SubjectResponseDto?> UpdateSubjectAsync(Guid userId, long subjectId, UpdateSubjectRequestDto request);
    Task<bool> DeleteSubjectAsync(Guid userId, long subjectId);
}
