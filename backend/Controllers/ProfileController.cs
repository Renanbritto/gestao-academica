using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Lo.Backend.DTOs;
using Lo.Backend.Services;

namespace Lo.Backend.Controllers;

[Authorize]
public class ProfileController : BaseApiController
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet]
    public async Task<ActionResult<ProfileResponseDto>> GetProfile()
    {
        var userId = GetUserId();
        var email = GetUserEmail();
        var profile = await _profileService.GetProfileAsync(userId);

        if (profile == null)
        {
            profile = await _profileService.EnsureProfileExistsAsync(userId, email);
        }

        return Ok(profile);
    }

    [HttpPut]
    public async Task<ActionResult<ProfileResponseDto>> UpdateProfile([FromBody] UpdateProfileRequestDto request)
    {
        var userId = GetUserId();
        var updated = await _profileService.UpdateProfileAsync(userId, request);
        return Ok(updated);
    }
}
