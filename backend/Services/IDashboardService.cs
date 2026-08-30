using Lo.Backend.DTOs;

namespace Lo.Backend.Services;

public interface IDashboardService
{
    Task<DashboardResponseDto> GetDashboardMetricsAsync(Guid userId);
}
