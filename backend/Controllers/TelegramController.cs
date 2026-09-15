using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Telegram.Bot.Types;
using Lo.Backend.DTOs;
using Lo.Backend.Services;

namespace Lo.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TelegramController : BaseApiController
{
    private readonly ITelegramBotService _telegramBotService;
    private readonly ILogger<TelegramController> _logger;

    public TelegramController(ITelegramBotService telegramBotService, ILogger<TelegramController> logger)
    {
        _telegramBotService = telegramBotService;
        _logger = logger;
    }

    [Authorize]
    [HttpPost("generate-code")]
    public async Task<ActionResult<GenerateLinkCodeResponseDto>> GenerateLinkCode()
    {
        var userId = GetUserId();
        var response = await _telegramBotService.GenerateLinkCodeAsync(userId);
        return Ok(response);
    }

    [Authorize]
    [HttpGet("status")]
    public async Task<ActionResult<TelegramStatusResponseDto>> GetStatus()
    {
        var userId = GetUserId();
        var status = await _telegramBotService.GetLinkStatusAsync(userId);
        return Ok(status);
    }

    [Authorize]
    [HttpDelete("unlink")]
    public async Task<IActionResult> Unlink()
    {
        var userId = GetUserId();
        var success = await _telegramBotService.UnlinkTelegramAsync(userId);
        if (!success) return NotFound(new { message = "Vínculo com Telegram não encontrado." });
        return NoContent();
    }

    [Authorize]
    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateTelegramSettingsRequestDto request)
    {
        var userId = GetUserId();
        var success = await _telegramBotService.UpdateSettingsAsync(userId, request);
        if (!success) return NotFound(new { message = "Vínculo com Telegram não encontrado." });
        return NoContent();
    }

    // Endpoint público para Webhook do Telegram
    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<IActionResult> TelegramWebhook([FromBody] Update update)
    {
        try
        {
            await _telegramBotService.ProcessTelegramUpdateAsync(update);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao processar webhook do Telegram");
            return Ok(); // Sempre retorna 200 OK para o Telegram não reenviar em loop
        }
    }
}
