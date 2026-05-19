#!/usr/bin/env bash
set -e

# Activate virtualenv 
source /var/www/aryadubey/.venv/bin/activate   

echo "==> Installing dependencies"
pip install -r requirements.txt

echo "==> Collecting static files"
python manage.py collectstatic --noinput

echo "==> Running migrations"
python manage.py migrate

echo "==> Creating or updating superuser"
python manage.py shell << 'EOF'
import os
from django.contrib.auth import get_user_model

User = get_user_model()

username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "")
email    = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")

if not password:
    print("WARNING: DJANGO_SUPERUSER_PASSWORD not set — skipping")
else:
    user, created = User.objects.get_or_create(username=username)
    user.email = email
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.set_password(password)
    user.save()
    print(f"Superuser '{username}' {'created' if created else 'updated'} successfully")
EOF


echo "==> Restarting gunicorn"
sudo systemctl restart gunicorn   

echo "==> Deploy complete"