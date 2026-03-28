import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_telegram_to_user(user, message):
    """
    Envoyer un message Telegram à un utilisateur
    Utilise le chat_id stocké dans le modèle utilisateur
    """
    if not user.telegram_chat_id:
        print(f"❌ Pas de chat_id pour {user.username}")
        return False
    
    print(f"📱 Envoi Telegram à {user.telegram_username} (chat_id: {user.telegram_chat_id})")
    return send_telegram_message(user.telegram_chat_id, message)


def send_telegram_message(chat_id, message):
    """
    Envoyer un message via le bot Telegram
    """
    bot_token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
    
    print(f"🔑 Token Telegram: {bot_token[:10]}..." if bot_token else "❌ Pas de token")
    
    if not bot_token:
        print("❌ TELEGRAM_BOT_TOKEN non configuré dans settings.py")
        return False
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    payload = {
        'chat_id': chat_id,
        'text': message,
        'parse_mode': 'Markdown'
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"📡 Réponse Telegram: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✅ Message Telegram envoyé à {chat_id}")
            return True
        else:
            print(f"❌ Erreur Telegram: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception Telegram: {e}")
        return False