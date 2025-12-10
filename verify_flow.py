import requests
import time
import sys

BASE_URL = "http://localhost:8000/api/v1"
AUTH_URL = "http://localhost:8000/auth"

def step(msg):
    print(f"\n[STEP] {msg}")

def check(condition, error_msg):
    if not condition:
        print(f"[FAIL] {error_msg}")
        sys.exit(1)
    print("[OK]")

def verify():
    session = requests.Session()

    # 0. User Setup
    step("Creating User & Getting Token...")
    username = f"user_{int(time.time())}"
    password = "RecallForgeStrongPass123!"
    email = f"{username}@example.com"
    
    # Register
    resp = requests.post(f"{AUTH_URL}/users/", json={
        "username": username,
        "password": password, 
        "email": email
    })
    # If 201 or 400 (if exists logic, but unique timestamp prevents it)
    check(resp.status_code == 201, f"Register failed: {resp.text}")
    
    # Login
    resp = requests.post(f"{AUTH_URL}/jwt/create/", json={
        "username": username,
        "password": password
    })
    check(resp.status_code == 200, f"Login failed: {resp.text}")
    token = resp.json()['access']
    session.headers.update({"Authorization": f"Bearer {token}"})
    print(f"Authenticated as {username}")

    # 1. Create Deck
    step("Creating Deck 'Test Deck'...")
    resp = session.post(f"{BASE_URL}/decks/", json={"name": "Test Deck"})
    check(resp.status_code == 201, f"Failed to create deck: {resp.text}")
    deck_id = resp.json()['id']
    print(f"Deck ID: {deck_id}")

    # 2. Ingest URL
    step("Ingesting URL (http://example.com)...")
    # Need to verify if the URL fetcher actually works. example.com is safe.
    resp = session.post(f"{BASE_URL}/ingest/", json={
        "url": "http://example.com",
        "deck": deck_id
    })
    check(resp.status_code == 201, f"Failed to ingest: {resp.text}")
    source_id = resp.json()['id']
    print(f"Source ID: {source_id}")

    # 3. Poll for Completion
    step("Waiting for Celery processing...")
    for i in range(20): # Verify timeout
        resp = session.get(f"{BASE_URL}/ingest/{source_id}/")
        status = resp.json()['status']
        print(f"Status: {status}")
        if status == 'COMPLETED':
            break
        if status == 'FAILED':
            check(False, f"Processing Failed: {resp.json().get('error_log')}")
        time.sleep(2)
    else:
        check(False, "Timed out waiting for processing")
        
    # 4. Check Cards
    step("Checking Generated Cards...")
    resp = session.get(f"{BASE_URL}/cards/?deck={deck_id}")
    cards = resp.json()
    check(len(cards) > 0, "No cards generated")
    print(f"Generated {len(cards)} cards.")
    first_card = cards[0]
    print(f"Sample Card: {first_card['front']} / {first_card['back']}")
    card_id = first_card['id']

    # 5. Check Review Endpoint
    step("Checking Review Endpoint...")
    resp = session.get(f"{BASE_URL}/review/next/?deck={deck_id}")
    check(resp.status_code == 200, f"Review fetch failed: {resp.text}")
    review_card = resp.json()
    check(review_card['id'] == card_id, "Next card does not match")

    # 6. Submit Review
    step("Submitting Rating 5...")
    resp = session.post(f"{BASE_URL}/review/{card_id}/rate/", json={"rating": 5})
    check(resp.status_code == 200, f"Rating failed: {resp.text}")
    result = resp.json()
    print(f"New Interval: {result['interval_days']} days")
    check(result['interval_days'] == 1, "Interval should be 1 day for first review rating 5")

    print("\n[SUCCESS] All verification steps passed!")

if __name__ == "__main__":
    try:
        verify()
    except requests.exceptions.ConnectionError:
        print("[FAIL] Could not connect to localhost:8000. Is the server running?")
