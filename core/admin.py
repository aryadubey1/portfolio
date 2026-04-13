from django.contrib import admin
from django.utils.html import format_html

from .models import ContactMessage, Project, TechStack


# ── TechStack inline (appears inside the Project form) ────────────────

class TechStackInline(admin.TabularInline):
    model  = TechStack
    extra  = 3           # start with 3 blank rows
    fields = ("tech", "order")


# ── Project admin ──────────────────────────────────────────────────────

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display  = ("order", "title", "category", "image_preview", "is_active")
    list_display_links = ['title']
    list_editable = ("order", "is_active")
    list_filter   = ("is_active", "category")
    search_fields = ("title", "description", "tags")
    inlines       = [TechStackInline]

    fieldsets = (
        (None, {
            "fields": ("title", "category", "description", "tags"),
        }),
        ("Media", {
            "fields": ("image", "image_preview_readonly"),
            "description": "Upload a 16:9 cover image (min 1 200 px wide). "
                           "Cloudinary will auto-optimise quality and format.",
        }),
        ("Visibility & ordering", {
            "fields": ("live_url", "order", "is_active"),
        }),
    )

    readonly_fields = ("image_preview_readonly",)

    # ── helpers ───────────────────────────────────────────────────────

    @admin.display(description="Cover")
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height:40px;border-radius:3px;object-fit:cover;" />',
                obj.image.url,
            )
        return "—"

    @admin.display(description="Current image")
    def image_preview_readonly(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height:160px;border-radius:4px;object-fit:cover;" />',
                obj.image.url,
            )
        return "No image uploaded yet."


# ── ContactMessage admin ───────────────────────────────────────────────

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display  = ("name", "email", "sent_at", "notified")
    list_filter   = ("notified",)
    search_fields = ("name", "email", "message")
    readonly_fields = ("name", "email", "message", "sent_at", "notified")

    def has_add_permission(self, request):
        return False   # messages come in via the contact form only