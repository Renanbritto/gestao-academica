using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lo.Backend.Models;

[Table("telegram_link_codes", Schema = "public")]
public class TelegramLinkCode
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("code")]
    [MaxLength(10)]
    public string Code { get; set; } = string.Empty;

    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public Profile? Profile { get; set; }
}
