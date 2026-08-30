using Telegram.Bot.Types;
using Lo.Backend.DTOs;

namespace Lo.Backend.Services;

public interface ITelegramBotService
{
    Task<GenerateLinkCodeResponseDto> GenerateLinkCodeAsync(Guid userId);
    Task<TelegramStatusResponseDto> GetLinkStatusAsync(Guid userId);
    Task<bool> UnlinkTelegramAsync(Guid userId);
    Task<bool> UpdateSettingsAsync(Guid userId, UpdateTelegramSettingsRequestDto request);
    Task ProcessTelegramUpdateAsync(Update update);
    Task SendProactiveNotificationAsync(Guid userId, string message);
}
