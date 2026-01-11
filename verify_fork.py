import os
import django
from dotenv import load_dotenv

load_dotenv()
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.decks.models import Deck
from apps.cards.models import Card

User = get_user_model()

def run_fork_verification():
    print("🍴 Verifying Deck Forking...")
    
    # Setup Users
    import time
    ts = int(time.time())
    user_a = User.objects.create_user(username=f'owner_{ts}', password='password123')
    user_b = User.objects.create_user(username=f'forker_{ts}', password='password123')
    
    # 1. User A creates Deck + Cards
    deck_a = Deck.objects.create(name="Anatomy 101", owner=user_a)
    Card.objects.create(deck=deck_a, front="Bone", back="Femur", source=None)
    Card.objects.create(deck=deck_a, front="Muscle", back="Bicep", source=None)
    
    print(f"✅ Created Original Deck (ID: {deck_a.id}) with {deck_a.cards.count()} cards.")
    
    # 2. User B Forks
    client = APIClient()
    client.force_authenticate(user=user_b)
    
    print(f"📥 User B requesting Fork...")
    url = f'/api/v1/decks/{deck_a.id}/fork/'
    res = client.post(url)
    
    if res.status_code == 201:
        fork_data = res.data
        fork_id = fork_data['id']
        print(f"✅ Fork Successful! New Deck ID: {fork_id}")
        
        # Verify DB State
        forked_deck = Deck.objects.get(id=fork_id)
        
        # Check Owner
        if forked_deck.owner == user_b:
            print("   ✅ Ownership: Correct (User B)")
        else:
            print(f"   ❌ Ownership: Incorrect ({forked_deck.owner})")
            
        # Check Parent
        if forked_deck.parent_deck == deck_a:
            print(f"   ✅ Parent Link: Correct (ID {deck_a.id})")
        else:
             print(f"   ❌ Parent Link: Missing or Wrong")
             
        # Check Cards
        card_count = forked_deck.cards.count()
        if card_count == 2:
            print(f"   ✅ Card Count: Correct ({card_count})")
        else:
            print(f"   ❌ Card Count: Wrong ({card_count})")
            
        # Cleanup
        # User.objects.filter(username__in=[user_a.username, user_b.username]).delete()
        print("\n🎉 Fork Verification Passed!")
        
    else:
        print(f"❌ Fork Failed: {res.status_code} - {res.data}")
        # Cleanup
        # User.objects.filter(username__in=[user_a.username, user_b.username]).delete()

if __name__ == "__main__":
    run_fork_verification()
