import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','smartalerte_project.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
q = User.objects.filter(email='admin@example.com')
print('count', q.count())
if q.exists():
    u = q.first()
    print('email', u.email)
    print('is_superuser', u.is_superuser)
    print('is_staff', u.is_staff)
    print('username', u.username)
    print('check pw AdminPass123 ->', u.check_password('AdminPass123'))
