using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Lo.Backend.DTOs;
using Lo.Backend.Services;

namespace Lo.Backend.Controllers;

[Authorize]
public class DashboardController : BaseApiController
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardResponseDto>> GetDashboard()
    {
        var userId = GetUserId();
        var dashboard = await _dashboardService.GetDashboardMetricsAsync(userId);
        return Ok(dashboard);
    }
}
