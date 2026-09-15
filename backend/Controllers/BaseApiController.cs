using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Lo.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected Guid GetUserId()
    {
        // O Supabase usa a claim 'sub' como o user UUID
        var subClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue("sub")
                    ?? User.FindFirstValue("user_id");

        if (Guid.TryParse(subClaim, out var userId))
        {
            return userId;
        }

        throw new UnauthorizedAccessException("Identificador de usuário inválido ou ausente no token.");
    }

    protected string? GetUserEmail()
    {
        return User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email");
    }
}
