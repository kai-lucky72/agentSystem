import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'team_management.settings')
django.setup()

from api.models import User

# Check if superuser already exists
if not User.objects.filter(email='admin@example.com').exists():
    User.objects.create_superuser(
        email='admin@example.com',
        work_id='ADMIN001',
        password='admin123'
    )
    print('Superuser created successfully!')
else:
    print('Superuser already exists!')