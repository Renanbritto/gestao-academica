using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Lo.Backend.DTOs;
using Lo.Backend.Services;

namespace Lo.Backend.Controllers;

[Authorize]
public class SubjectsController : BaseApiController
{
    private readonly ISubjectService _subjectService;

    public SubjectsController(ISubjectService subjectService)
    {
        _subjectService = subjectService;
    }

    [HttpGet]
    public async Task<ActionResult<List<SubjectResponseDto>>> GetSubjects()
    {
        var userId = GetUserId();
        var subjects = await _subjectService.GetSubjectsAsync(userId);
        return Ok(subjects);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<SubjectResponseDto>> GetSubjectById(long id)
    {
        var userId = GetUserId();
        var subject = await _subjectService.GetSubjectByIdAsync(userId, id);
        if (subject == null) return NotFound(new { message = "Matéria não encontrada." });
        return Ok(subject);
    }

    [HttpPost]
    public async Task<ActionResult<SubjectResponseDto>> CreateSubject([FromBody] CreateSubjectRequestDto request)
    {
        var userId = GetUserId();
        var created = await _subjectService.CreateSubjectAsync(userId, request);
        return CreatedAtAction(nameof(GetSubjectById), new { id = created.Id }, created);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<SubjectResponseDto>> UpdateSubject(long id, [FromBody] UpdateSubjectRequestDto request)
    {
        var userId = GetUserId();
        var updated = await _subjectService.UpdateSubjectAsync(userId, id, request);
        if (updated == null) return NotFound(new { message = "Matéria não encontrada." });
        return Ok(updated);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteSubject(long id)
    {
        var userId = GetUserId();
        var deleted = await _subjectService.DeleteSubjectAsync(userId, id);
        if (!deleted) return NotFound(new { message = "Matéria não encontrada." });
        return NoContent();
    }
}
