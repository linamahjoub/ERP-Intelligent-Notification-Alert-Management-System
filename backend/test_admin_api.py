import requests

login_url = 'http://127.0.0.1:8000/api/auth/login/'
users_url = 'http://127.0.0.1:8000/api/admin/users/'
cred = {'email':'admin@example.com','password':'AdminPass123'}

try:
    r = requests.post(login_url, json=cred, timeout=5)
    print('login status', r.status_code)
    print('login resp', r.text)
    data = r.json()
    access = data.get('access')
    if access:
        h = {'Authorization': f'Bearer {access}'}
        u = requests.get(users_url, headers=h, timeout=5)
        print('users status', u.status_code)
        print(u.text[:2000])
except Exception as e:
    print('error', e)
