using Microsoft.EntityFrameworkCore;
using Lo.Backend.Models;

namespace Lo.Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<TelegramLink> TelegramLinks => Set<TelegramLink>();
    public DbSet<TelegramLinkCode> TelegramLinkCodes => Set<TelegramLinkCode>();
    public DbSet<BotConversation> BotConversations => Set<BotConversation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Profiles
        modelBuilder.Entity<Profile>(entity =>
        {
            entity.ToTable("profiles", "public");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TargetGpa).HasPrecision(5, 2);
        });

        // Subjects
        modelBuilder.Entity<Subject>(entity =>
        {
            entity.ToTable("subjects", "public");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TargetGrade).HasPrecision(5, 2);

            entity.HasOne(s => s.Profile)
                  .WithMany(p => p.Subjects)
                  .HasForeignKey(s => s.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Activities
        modelBuilder.Entity<Activity>(entity =>
        {
            entity.ToTable("activities", "public");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Weight).HasPrecision(5, 2);
            entity.Property(e => e.MaxGrade).HasPrecision(5, 2);
            entity.Property(e => e.ObtainedGrade).HasPrecision(5, 2);

            entity.HasOne(a => a.Profile)
                  .WithMany(p => p.Activities)
                  .HasForeignKey(a => a.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.Subject)
                  .WithMany(s => s.Activities)
                  .HasForeignKey(a => a.SubjectId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // TelegramLinks
        modelBuilder.Entity<TelegramLink>(entity =>
        {
            entity.ToTable("telegram_links", "public");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.HasIndex(e => e.ChatId);

            entity.HasOne(t => t.Profile)
                  .WithOne(p => p.TelegramLink)
                  .HasForeignKey<TelegramLink>(t => t.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // TelegramLinkCodes
        modelBuilder.Entity<TelegramLinkCode>(entity =>
        {
            entity.ToTable("telegram_link_codes", "public");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code);
        });

        // BotConversations
        modelBuilder.Entity<BotConversation>(entity =>
        {
            entity.ToTable("bot_conversations", "public");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.ChatId);
        });
    }
}
