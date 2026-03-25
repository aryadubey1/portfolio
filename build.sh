#!/usr/bin/env bash
set -e  # exit immediately if any command fails

echo "==> Installing dependencies"
pip install -r requirements.txt

echo "==> Collecting static files"
python manage.py collectstatic --noinput

echo "==> Running migrations"
python manage.py migrate

echo "==> Creating superuser if not exists"
python manage.py shell << 'EOF'
import os
from django.contrib.auth import get_user_model

User = get_user_model()

username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "")
email    = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")

if not password:
    print("WARNING: DJANGO_SUPERUSER_PASSWORD not set — skipping superuser creation")
elif User.objects.filter(username=username).exists():
    print(f"Superuser '{username}' already exists — skipping")
else:
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Superuser '{username}' created successfully")
EOF

echo "==> Build complete"
