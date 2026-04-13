from django.db import models
from cloudinary.models import CloudinaryField


# ─────────────────────────────────────────────
#  Tech-stack icon catalogue
#  Add / remove entries here; they appear as
#  selectable choices in the admin.
# ─────────────────────────────────────────────
TECH_CHOICES = [
    # ── Languages ──
    ("python",     "Python"),
    ("javascript", "JavaScript"),
    ("typescript", "TypeScript"),
    ("html5",      "HTML5"),
    ("css3",       "CSS3"),
    # ── Frameworks / Libraries ──
    ("django",     "Django"),
    ("react",      "React"),
    ("nextjs",     "Next.js"),
    ("tailwind",   "Tailwind CSS"),
    ("fastapi",    "FastAPI"),
    # ── Databases ──
    ("postgresql", "PostgreSQL"),
    ("sqlite",     "SQLite"),
    ("redis",      "Redis"),
    # ── Infra / Tools ──
    ("docker",     "Docker"),
    ("git",        "Git"),
    ("nginx",      "Nginx"),
    ("render",     "Render"),
    ("cloudinary", "Cloudinary"),
    ("stripe",     "Stripe"),
    ("telegram",   "Telegram"),
]

# Map slug → devicon CSS class
# Devicons docs: https://devicon.dev/
# Pattern: devicon-{slug}-{variant}  (plain / original / colored)
DEVICON_CLASS = {
    "python":     "devicon-python-plain colored",
    "javascript": "devicon-javascript-plain colored",
    "typescript": "devicon-typescript-plain colored",
    "html5":      "devicon-html5-plain colored",
    "css3":       "devicon-css3-plain colored",
    "django":     "devicon-django-plain colored",
    "react":      "devicon-react-original colored",
    "nextjs":     "devicon-nextjs-plain",
    "tailwind":   "devicon-tailwindcss-plain colored",
    "fastapi":    "devicon-fastapi-plain colored",
    "postgresql": "devicon-postgresql-plain colored",
    "sqlite":     "devicon-sqlite-plain colored",
    "redis":      "devicon-redis-plain colored",
    "docker":     "devicon-docker-plain colored",
    "git":        "devicon-git-plain colored",
    "nginx":      "devicon-nginx-plain colored",
    # Render, Cloudinary, Stripe, Telegram have no devicon —
    # we fall back to a small text badge rendered by the template.
    "render":     "",
    "cloudinary": "",
    "stripe":     "",
    "telegram":   "",
}


class TechStack(models.Model):
    """
    A single technology icon attached to a project.
    Admins pick from TECH_CHOICES; the template renders
    the matching Devicon glyph (or a text badge as fallback).
    """
    project      = models.ForeignKey(
        "Project",
        on_delete=models.CASCADE,
        related_name="tech_stacks",
    )
    tech         = models.CharField(max_length=40, choices=TECH_CHOICES)
    order        = models.PositiveSmallIntegerField(
        default=0,
        help_text="Lower = appears first in the row of icons.",
    )

    class Meta:
        ordering          = ["order", "tech"]
        verbose_name      = "Tech Stack Icon"
        verbose_name_plural = "Tech Stack Icons"

    def __str__(self):
        return f"{self.get_tech_display()} — {self.project.title}"

    # ── helpers used in templates ──────────────────────────────────────

    @property
    def devicon_class(self):
        """Return the Devicon CSS class string, or '' if none."""
        return DEVICON_CLASS.get(self.tech, "")

    @property
    def label(self):
        """Human-readable name, e.g. 'Django'."""
        return dict(TECH_CHOICES).get(self.tech, self.tech.title())

    @property
    def has_devicon(self):
        return bool(DEVICON_CLASS.get(self.tech))


class Project(models.Model):
    title        = models.CharField(max_length=120)
    category     = models.CharField(
        max_length=80,
        help_text="e.g. Business Tool, Website, Web App",
    )
    description  = models.TextField(
        help_text="2–4 sentences shown on the project card.",
    )
    tags         = models.CharField(
        max_length=255,
        help_text="Comma-separated labels shown as small chips: invoice management, client accounts",
    )
    image        = CloudinaryField(
        "image",
        blank=True,
        null=True,
        help_text=(
            "Upload a cover image. "
            "Recommended ratio 16:9, min 1 200 px wide. "
            "Leave blank to show the placeholder gradient."
        ),
        folder="portfolio/projects",   # Cloudinary folder
        transformation={               # auto-optimise on delivery
            "quality": "auto",
            "fetch_format": "auto",
        },
    )
    live_url     = models.URLField(
        blank=True,
        help_text="Leave blank if not yet deployed publicly.",
    )
    order        = models.PositiveSmallIntegerField(
        default=0,
        help_text="Lower = appears first in the grid.",
    )
    is_active    = models.BooleanField(
        default=True,
        help_text="Uncheck to hide without deleting.",
    )

    class Meta:
        ordering = ["order", "title"]

    def __str__(self):
        return self.title

    def tag_list(self):
        """Return tags as a Python list, stripping whitespace."""
        return [t.strip() for t in self.tags.split(",") if t.strip()]


class ContactMessage(models.Model):
    name       = models.CharField(max_length=120)
    email      = models.EmailField()
    message    = models.TextField()
    sent_at    = models.DateTimeField(auto_now_add=True)
    notified   = models.BooleanField(
        default=False,
        help_text="True if Telegram delivery succeeded.",
    )

    class Meta:
        ordering = ["-sent_at"]

    def __str__(self):
        return f"{self.name} — {self.sent_at:%d %b %Y %H:%M}"