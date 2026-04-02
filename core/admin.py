from django.contrib import admin
from .models import Project, ContactMessage


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display       = ('order', 'title', 'category', 'is_active')
    list_display_links = ('title',)   # title is the clickable link
    list_editable      = ('order', 'is_active')
    list_filter        = ('is_active',)
    search_fields      = ('title', 'category', 'tags')
    ordering           = ('order',)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display  = ('name', 'email', 'sent_at', 'notified')
    readonly_fields = ('name', 'email', 'message', 'sent_at', 'notified')
    ordering      = ('-sent_at',)