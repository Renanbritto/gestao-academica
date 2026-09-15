using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lo.Backend.Models;

[Table("profiles", Schema = "public")]
public class Profile
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [MaxLength(200)]
    public string Name { get; set; } = "Estudante IO";

    [Column("course")]
    [MaxLength(200)]
    public string? Course { get; set; } = string.Empty;

    [Column("period")]
    [MaxLength(100)]
    public string? Period { get; set; } = string.Empty;

    [Column("target_gpa", TypeName = "numeric(5,2)")]
    public decimal TargetGpa { get; set; } = 80.0m;

    [Column("motivation_note")]
    public string? MotivationNote { get; set; } = "Bora conquistar esse semestre! 🚀";

    [Column("theme")]
    [MaxLength(20)]
    public string Theme { get; set; } = "dark";

    [Column("accent_color")]
    [MaxLength(30)]
    public string AccentColor { get; set; } = "#6366f1";

    [Column("avatar_data_url")]
    public string? AvatarDataUrl { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    public TelegramLink? TelegramLink { get; set; }
}
