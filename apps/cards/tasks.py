from celery import shared_task
from apps.ingest.models import Source
from apps.cards.models import Card
from services.llm import LLMService
from services.vector import VectorService

@shared_task
def generate_cards_from_source(source_id):
    source = Source.objects.get(id=source_id)
    llm = LLMService()
    
    try:
        cards_data = llm.generate_cards(source.extracted_text)
        
        created_cards_ids = []
        for card_data in cards_data:
            card = Card.objects.create(
                deck=source.deck,
                source=source,
                front=card_data['front'],
                back=card_data['back']
            )
            created_cards_ids.append(card.id)
            
        # Trigger embedding
        embed_cards.delay(created_cards_ids)
        
    except Exception as e:
        source.error_log += f"\nGeneration Error: {str(e)}"
        source.save()
        raise e

@shared_task
def embed_cards(card_ids):
    vector_service = VectorService() # This might fail if Qdrant is not up
    
    for card_id in card_ids:
        card = Card.objects.get(id=card_id)
        # Mock embedding vector for now (extract this to a service later if using OpenAI embeddings)
        # For now, just random or simple hash to prove pipeline
        # REALITY: We need an Embedding Provider. I'll mock it here or use a dummy vector.
        # Qdrant expects strict dimension. In vector.py I set size=384 (common for small models)
        import random
        fake_vector = [random.random() for _ in range(384)]
        
        vector_service.upsert_card(
            card_id=card.id,
            vector=fake_vector,
            payload={"front": card.front, "back": card.back, "deck_id": card.deck.id}
        )
        
        card.vector_id = str(card.id) 
        card.save()
