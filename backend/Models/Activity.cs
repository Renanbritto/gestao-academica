using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lo.Backend.Models;

[Table("activities", Schema = "public")]
public class Activity
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("subject_id")]
    public long? SubjectId { get; set; }

    [Column("title")]
    [MaxLength(250)]
    public string Title { get; set; } = string.Empty;

    [Column("type")]
    [MaxLength(50)]
    public string Type { get; set; } = "Prova";

    [Column("due_date")]
    public DateOnly DueDate { get; set; }

    [Column("weight", TypeName = "numeric(5,2)")]
    public decimal Weight { get; set; } = 25.0m;

    [Column("max_grade", TypeName = "numeric(5,2)")]
    public decimal MaxGrade { get; set; } = 100.0m;

    [Column("obtained_grade", TypeName = "numeric(5,2)")]
    public decimal? ObtainedGrade { get; set; }

    [Column("status")]
    [MaxLength(30)]
    public string Status { get; set; } = "Pendente";

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(UserId))]
    public Profile? Profile { get; set; }

    [ForeignKey(nameof(SubjectId))]
    public Subject? Subject { get; set; }
}
