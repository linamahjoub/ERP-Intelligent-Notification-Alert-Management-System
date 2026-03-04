# Configuration Google OAuth 2.0 - SmartAlerte

## 📋 Architecture

L'application utilise **Google OAuth 2.0** avec le flux **Authorization Code Flow**:

```
┌─────────────────────────────────────────────────────────┐
│ 1. Click "Continuer avec Google" (Frontend)             │
├─────────────────────────────────────────────────────────┤
│ 2. Opens popup → https://accounts.google.com/oauth2     │
│    Paramètres: client_id, scope, redirect_uri, state    │
├─────────────────────────────────────────────────────────┤
│ 3. User grants permission                               │
├─────────────────────────────────────────────────────────┤
│ 4. Google redirects to:                                 │
│    http://localhost:3000/auth/google/callback?          │
│    code=AUTH_CODE&state=RANDOM_STATE                    │
├─────────────────────────────────────────────────────────┤
│ 5. Frontend exchanges code with backend                 │
│    POST /api/accounts/google-oauth-callback/            │
├─────────────────────────────────────────────────────────┤
│ 6. Backend exchanges code for Google tokens             │
│    POST https://oauth2.googleapis.com/token             │
├─────────────────────────────────────────────────────────┤
│ 7. Backend verifies token and creates user              │
│    Generates JWT tokens and returns to frontend         │
├─────────────────────────────────────────────────────────┤
│ 8. Frontend stores JWT and redirects to dashboard       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Étape 1: Créer un projet Google Cloud

### 1.1 Accéder à Google Cloud Console

1. Allez à [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google
3. Cliquez sur le sélecteur de projet en haut
4. Cliquez sur **"NEW PROJECT"**
5. Nommez le projet (ex: `SmartAlerte`)
6. Cliquez sur **"CREATE"**

### 1.2 Activer Google+ API

1. Dans la console, allez à **"APIs & Services"** (Services et API)
2. Cliquez sur **"Enable APIs and Services"**
3. Cherchez **"Google+ API"** (ou "People API")
4. Cliquez sur le résultat
5. Cliquez sur **"ENABLE"**

---

## 🔐 Étape 2: Créer les identifiants OAuth 2.0

### 2.1 Créer l'ID OAuth 2.0

1. Allez à **"Credentials"** (Identifiants) dans le menu gauche
2. Cliquez sur **"+ CREATE CREDENTIALS"**
3. Sélectionnez **"OAuth 2.0 Client ID"**
4. Si demandé, configurez l'écran de consentement OAuth d'abord:
   - Type d'utilisateur: **External**
   - Cliquez sur **"CREATE"**
   - Remplissez: App name, email support, données de contact
   - Cliquez sur **"SAVE AND CONTINUE"**
   - Ajoutez les s

### 2.1 Créer l'ID OAuth 2.0

1. Allez à **"Credentials"** (Identifiants) dans le menu gauche
2. Cliquez sur **"+ CREATE CREDENTIALS"**
3. Sélectionnez **"OAuth 2.0 Client ID"**
4. Si demandé, configurez l'écran de consentement OAuth d'abord:
   - Type d'utilisateur: **External**
   - Cliquez sur **"CREATE"**
   - Remplissez: App name, email support, données de contact
   - Cliquez sur **"SAVE AND CONTINUE"**
   - Ajoutez les scopes requis (email, profile)
   - Cliquez sur **"SAVE AND CONTINUE"**
   - Cliquez sur **"BACK TO DASHBOARD"**

### 2.2 Créer l'ID client Web

1. Allez à **Credentials** → **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**
2. Sélectionnez **"Web application"**
3. Donnez un nom (ex: `SmartAlerte Web`)
4. Cliquez sur **"ADD URI"** sous **"Authorized redirect URIs"**
5. Ajoutez:
   ```
   http://localhost:3000/auth/google/callback
   ```
6. Pour production, ajoutez aussi:
   ```
   https://yourdomain.com/auth/google/callback
   ```
7. Cliquez sur **"CREATE"**
8. Vous recevrez votre **Client ID** et **Client Secret**
9. Téléchargez le fichier JSON ou notez les valeurs

**IMPORTANT ⚠️:**
- Gardez le **Client Secret** secret - ne jamais le mettre en frontend!
- Le **Client ID** est public et peut être dans le frontend `.env`

---

## 📝 Configuration Frontend

### Mettre à jour `frontend/.env.local`

Créez ou éditez le fichier `frontend/.env.local`:

```bash
# Google OAuth 2.0
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Backend API
REACT_APP_API_URL=http://localhost:8000
```

**Remplacez:**
- `YOUR_CLIENT_ID` → Le Client ID de Google Cloud Console

---

## 📝 Configuration Backend

### Mettre à jour `backend/.env`

Créez ou éditez le fichier `backend/.env`:

```bash
# Google OAuth 2.0
GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Database
DB_NAME=smartalerte_db
DB_USER=postgres
DB_PASSWORD=postgresql
DB_HOST=localhost
DB_PORT=5432

# Email
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

**Remplacez:**
- `YOUR_CLIENT_ID` → Client ID de Google Cloud
- `YOUR_CLIENT_SECRET` → Client Secret de Google Cloud

---

## 📦 Installation des dépendances

### Backend

Les packages ont été ajoutés automatiquement:

```bash
cd backend
pip install -r requirements.txt
```

Packages ajoutés:
- `requests` - Pour les appels HTTP vers Google
- `google-auth` - Pour la vérification des tokens (optionnel)

### Frontend

Aucun package supplémentaire n'est needed - l'utilisation de Fetch API native.

---

## ✅ Étape 3: Tester l'application

### 3.1 Démarrer le Backend

```bash
cd backend

# Appliquer les migrations (si non fait)
python manage.py migrate

# Démarrer le serveur
python manage.py runserver
```

Le backend devrait tourner sur `http://localhost:8000`

### 3.2 Démarrer le Frontend

```bash
cd frontend
npm start
```

L'application devrait ouvrir sur `http://localhost:3000`

### 3.3 Tester le flux OAuth

1. Allez sur [http://localhost:3000/login](http://localhost:3000/login)
2. Cliquez sur le bouton **"Continuer avec Google"**
3. Une popup devrait s'ouvrir vers Google
4. Connectez-vous avec votre compte Google
5. Acceptez les permissions
6. Vous devriez être redirigé vers le dashboard

---

## 🏗️ Architecture du code

### Frontend Components

**Files:**
- `frontend/src/pages/auth/Login.jsx` - Bouton Google Sign-In
- `frontend/src/pages/auth/GoogleCallback.jsx` - Traitement du callback
- `frontend/src/services/googleOAuthConfig.jsx` - Configuration OAuth
- `frontend/src/App.jsx` - Route `/auth/google/callback`

**Flow:**
```
Login.jsx → handleGoogleSignIn()
    ↓
googleOAuthConfig.openGoogleLoginPopup()
    ↓ (user approves in Google popup)
    ↓
GoogleCallback.jsx (receives code from URL)
    ↓
exchangeCodeForToken(code)
    ↓
Backend: POST /api/accounts/google-oauth-callback/
    ↓
Frontend stores JWT in localStorage
    ↓
Redirects to /dashboard
```

### Backend Endpoint

**Endpoint:** `POST /api/accounts/google-oauth-callback/`

**Request body:**
```json
{
  "code": "4/0A...",
  "redirect_uri": "http://localhost:3000/auth/google/callback"
}
```

**Response:**
```json
{
  "message": "Authentification réussie",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_superuser": false,
    "is_staff": false,
    "is_active": true
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Function:** `backend/accounts/views.py::google_oauth_callback_view()`

---

## 🐛 Dépannage

### Erreur: "Client ID invalide"
**Cause:** Client ID mal configuré dans `.env`

**Solution:**
- Vérifiez le Client ID dans Google Cloud Console
- Mettez à jour `REACT_APP_GOOGLE_CLIENT_ID` dans `frontend/.env.local`
- Mettez à jour `GOOGLE_OAUTH_CLIENT_ID` dans `backend/.env`

### Erreur: "Redirect URI mismatch"
**Cause:** L'URI dans Google Cloud console ne correspond pas à l'URI frontend

**Solution:**
- Google Cloud → Credentials → sélectionnez votre OAuth ID
- Éditer: Authorized redirect URIs
- Assurez-vous que `http://localhost:3000/auth/google/callback` est listé

### La popup ne s'ouvre pas
**Cause:** Le navigateur bloque les popups

**Solution:**
- Débloquez les popups pour `localhost`
- Vérifiez la console navigateur pour les erreurs

### "État de sécurité invalide" / "CSRF attack"
**Cause:** Le state parameter ne correspond pas  

**Solution:**
- Videz `localStorage` et `sessionStorage`
- Fermez et réouvrez la page de login
- Réessayez

### Backend reçoit un code invalide
**Cause:** Le code a expiré (valide ~10 minutes)

**Solution:**
- Réessayez la connexion complète

### "Impossible de recevoir l'email"
**Cause:** Le scope OAuth ne demande pas l'email

**Solution:**
- Vérifiez que `scope=openid email profile` dans `googleOAuthConfig.jsx`

---

## 🔒 Sécurité

### Points clés à respecter

1. **Client Secret (🔴 JAMAIS en frontend)**
   - Stocké uniquement dans `/backend/.env`
   - Jamais visible dans le code browser
   - Utilisé seulement pour l'échange code ↔ token au backend

2. **Client ID (🟢 OK en frontend)**
   - Stocké dans `frontend/.env.local`
   - C'est sa destinée publique

3. **CSRF Protection**
   - Utilise le paramètre `state`
   - Généré aléatoirement et stocké en sessionStorage
   - Validé avant d'accepter le callback

4. **JWT Tokens (⚠️ localStorage)**
   - Actuellement stockés en localStorage
   - À améliorer: utiliser httpOnly cookies
   - OK pour développement/prototype

5. **HTTPS en production**
   - Obligatoire pour les OAuth URI en production
   - Configurez SSL/TLS
   - Mettez à jour Google Cloud Console avec HTTPS URI

---

## 🚀 Déploiement Production

### Backend `.env`

```bash
GOOGLE_OAUTH_CLIENT_ID=YOUR_PROD_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET=YOUR_PROD_CLIENT_SECRET  
GOOGLE_OAUTH_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

### Frontend `.env.local` (production)

```bash
REACT_APP_GOOGLE_CLIENT_ID=YOUR_PROD_CLIENT_ID
REACT_APP_GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
REACT_APP_API_URL=https://api.yourdomain.com
```

### Google Cloud Console

1. Allez à **Credentials**
2. Sélectionnez votre OAuth 2.0 Client ID
3. Cliquez sur **EDIT**
4. Ajoutez sous **Authorized redirect URIs**:
   ```
   https://yourdomain.com/auth/google/callback
   ```
5. Cliquez sur **SAVE**

### HTTPS/SSL

- Configurez un certificat SSL sur votre domaine
- Mettez à jour tous les liens http:// → https://

---

## 📚 Fichiers clés

| Fichier | Description |
|---------|-------------|
| `frontend/.env.local` | Config Google OAuth (Client ID, Redirect URI) |
| `frontend/src/pages/auth/Login.jsx` | Bouton "Continuer avec Google" |
| `frontend/src/pages/auth/GoogleCallback.jsx` | Traitement du callback OAuth |
| `frontend/src/services/googleOAuthConfig.jsx` | Config et utilitaires OAuth |
| `backend/.env` | Config Google OAuth (Client ID, Secret, etc) |
| `backend/accounts/views.py` | Endpoint `google_oauth_callback_view()` |
| `backend/accounts/urls.py` | Route `google-oauth-callback/` |
| `backend/requirements.txt` | Packages Python (requests, google-auth) |

---

## 📞 Support

Pour des problèmes:

1. Consultez [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
2. Vérifiez les logs du navigateur (F12 → Console)
3. Vérifiez les logs du serveur Django
4. Vérifiez la configuration Google Cloud Console

---

**Version:** 2.0 (Google OAuth 2.0)  
**Dernière mise à jour:** 2024
