using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lo.Backend.Models;

[Table("telegram_links", Schema = "public")]
public class TelegramLink
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("chat_id")]
    public long ChatId { get; set; }

    [Column("username")]
    [MaxLength(100)]
    public string? Username { get; set; }

    [Column("notifications_enabled")]
    public bool NotificationsEnabled { get; set; } = true;

    [Column("reminder_hours")]
    [MaxLength(100)]
    public string ReminderHours { get; set; } = "08:00,20:00";

    [Column("linked_at")]
    public DateTime LinkedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey(nameof(UserId))]
    public Profile? Profile { get; set; }
}
