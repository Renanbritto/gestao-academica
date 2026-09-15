using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lo.Backend.Models;

[Table("bot_conversations", Schema = "public")]
public class BotConversation
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("chat_id")]
    public long ChatId { get; set; }

    [Column("user_message")]
    public string UserMessage { get; set; } = string.Empty;

    [Column("bot_response")]
    public string BotResponse { get; set; } = string.Empty;

    [Column("context_type")]
    [MaxLength(50)]
    public string ContextType { get; set; } = "geral";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public Profile? Profile { get; set; }
}
