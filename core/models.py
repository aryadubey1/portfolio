from django.db import models


class Project(models.Model):
    title        = models.CharField(max_length=120)
    category     = models.CharField(max_length=80, help_text="e.g. Business Tool, Website, Web App")
    description  = models.TextField(help_text="2–4 sentences shown when the project is expanded.")
    tags         = models.CharField(max_length=255, help_text="Comma-separated: invoice management, client accounts")
    live_url     = models.URLField(blank=True, help_text="Leave blank if not yet deployed publicly.")
    order        = models.PositiveSmallIntegerField(default=0, help_text="Lower = appears first.")
    is_active    = models.BooleanField(default=True, help_text="Uncheck to hide without deleting.")

    class Meta:
        ordering = ['order', 'title']

    def __str__(self):
        return self.title

    def tag_list(self):
        return [t.strip() for t in self.tags.split(',') if t.strip()]


class ContactMessage(models.Model):
    name       = models.CharField(max_length=120)
    email      = models.EmailField()
    message    = models.TextField()
    sent_at    = models.DateTimeField(auto_now_add=True)
    notified   = models.BooleanField(default=False, help_text="True if Telegram delivery succeeded")

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"{self.name} — {self.sent_at:%d %b %Y %H:%M}"