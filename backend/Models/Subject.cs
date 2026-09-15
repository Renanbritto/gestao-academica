using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lo.Backend.Models;

[Table("subjects", Schema = "public")]
public class Subject
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("name")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Column("professor")]
    [MaxLength(200)]
    public string? Professor { get; set; }

    [Column("target_grade", TypeName = "numeric(5,2)")]
    public decimal TargetGrade { get; set; } = 80.0m;

    [Column("color")]
    [MaxLength(30)]
    public string Color { get; set; } = "#6366f1";

    [Column("description")]
    public string? Description { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(UserId))]
    public Profile? Profile { get; set; }

    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}
