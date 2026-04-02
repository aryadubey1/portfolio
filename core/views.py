import os
import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from .models import Project, ContactMessage


def home(request):
    projects = Project.objects.filter(is_active=True)
    return render(request, 'core/index.html', {'projects': projects})


@require_POST
def contact(request):
    name    = request.POST.get('name', '').strip()
    email   = request.POST.get('email', '').strip()
    message = request.POST.get('message', '').strip()

    if not all([name, email, message]):
        return JsonResponse({'ok': False, 'error': 'All fields are required.'}, status=400)

    msg = ContactMessage.objects.create(name=name, email=email, message=message)

    notified = _send_telegram(name, email, message)
    msg.notified = notified
    msg.save(update_fields=['notified'])

    return JsonResponse({'ok': True})


def _send_telegram(name, email, message):
    token   = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        return False
    text = (
        f"📬 *New message — Portfolio*\n\n"
        f"*Name:* {name}\n"
        f"*Email:* {email}\n\n"
        f"*Message:*\n{message}"
    )
    try:
        resp = requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            data={'chat_id': chat_id, 'text': text, 'parse_mode': 'Markdown'},
            timeout=5,
        )
        return resp.status_code == 200
    except Exception:
        return False