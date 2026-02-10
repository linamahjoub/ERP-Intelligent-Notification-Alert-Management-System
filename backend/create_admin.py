import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartalerte_project.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
username = 'admin'
email = 'admin@example.com'
first = 'Admin'
last = 'User'
pw = 'AdminPass123'

if User.objects.filter(username=username).exists():
    print('admin exists')
else:
    User.objects.create_superuser(username=username, email=email, password=pw, first_name=first, last_name=last)
    print('admin created')
