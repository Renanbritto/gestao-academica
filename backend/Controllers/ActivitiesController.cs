using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Lo.Backend.DTOs;
using Lo.Backend.Services;

namespace Lo.Backend.Controllers;

[Authorize]
public class ActivitiesController : BaseApiController
{
    private readonly IActivityService _activityService;

    public ActivitiesController(IActivityService activityService)
    {
        _activityService = activityService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ActivityResponseDto>>> GetActivities([FromQuery] long? subjectId, [FromQuery] string? status)
    {
        var userId = GetUserId();
        var activities = await _activityService.GetActivitiesAsync(userId, subjectId, status);
        return Ok(activities);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ActivityResponseDto>> GetActivityById(long id)
    {
        var userId = GetUserId();
        var activity = await _activityService.GetActivityByIdAsync(userId, id);
        if (activity == null) return NotFound(new { message = "Atividade não encontrada." });
        return Ok(activity);
    }

    [HttpPost]
    public async Task<ActionResult<ActivityResponseDto>> CreateActivity([FromBody] CreateActivityRequestDto request)
    {
        var userId = GetUserId();
        var created = await _activityService.CreateActivityAsync(userId, request);
        return CreatedAtAction(nameof(GetActivityById), new { id = created.Id }, created);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ActivityResponseDto>> UpdateActivity(long id, [FromBody] UpdateActivityRequestDto request)
    {
        var userId = GetUserId();
        var updated = await _activityService.UpdateActivityAsync(userId, id, request);
        if (updated == null) return NotFound(new { message = "Atividade não encontrada." });
        return Ok(updated);
    }

    [HttpPatch("{id:long}/grade")]
    public async Task<ActionResult<ActivityResponseDto>> UpdateGrade(long id, [FromBody] UpdateGradeRequestDto request)
    {
        var userId = GetUserId();
        var updated = await _activityService.UpdateGradeAsync(userId, id, request.ObtainedGrade);
        if (updated == null) return NotFound(new { message = "Atividade não encontrada." });
        return Ok(updated);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteActivity(long id)
    {
        var userId = GetUserId();
        var deleted = await _activityService.DeleteActivityAsync(userId, id);
        if (!deleted) return NotFound(new { message = "Atividade não encontrada." });
        return NoContent();
    }
}
