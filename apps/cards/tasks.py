from celery import shared_task
from apps.ingest.models import Source
from apps.cards.models import Card
from services.llm import LLMService
from services.vector import VectorService

@shared_task
def generate_cards_from_source(source_id, is_vision=False):
    """
    Generate flashcards from a source using Gemini AI.
    """
    try:
        source = Source.objects.get(id=source_id)
        llm = LLMService()
        
        print(f"[AI] Generating cards for source {source_id}, is_vision={is_vision}")
        
        if is_vision and source.file:
            # Use vision API for files (images/PDFs)
            file_path = source.file.path
            cards_data = llm.generate_cards_from_file(file_path)
        else:
            # Use text-based generation
            cards_data = llm.generate_cards(source.extracted_text)
        
        print(f"[AI] Generated {len(cards_data)} cards")
        
        created_card_ids = []
        for card_data in cards_data:
            card = Card.objects.create(
                deck=source.deck,
                source=source,
                front=card_data['front'],
                back=card_data['back'],
                hint=card_data.get('hint'),
                difficulty=card_data.get('difficulty', 'basic'),
                tags=card_data.get('tags', []),
                visual_payload=card_data.get('visual_payload')
            )
            created_card_ids.append(card.id)
            
        # Trigger embedding generation
        embed_cards.delay(created_card_ids)
        
        print(f"[AI] Created {len(created_card_ids)} cards, embedding triggered")
        
    except Exception as e:
        print(f"[AI] Error generating cards: {e}")
        source.error_log = (source.error_log or "") + f"\nGeneration Error: {str(e)}"
        source.save()
        raise e

@shared_task
def embed_cards(card_ids):
    """
    Generate real embeddings for cards using Gemini and store in Qdrant.
    """
    print(f"[Vector] Embedding {len(card_ids)} cards")
    
    try:
        vector_service = VectorService()
        llm = LLMService()
        
        for card_id in card_ids:
            card = Card.objects.get(id=card_id)
            
            # Create text for embedding (front + back combined)
            embed_text = f"{card.front}\n{card.back}"
            
            # Get real embedding from Gemini
            embedding = llm.get_embedding(embed_text)
            
            # Store in Qdrant
            vector_service.upsert_card(
                card_id=card.id,
                vector=embedding,
                payload={
                    "front": card.front, 
                    "back": card.back, 
                    "deck_id": card.deck.id
                }
            )
            
            card.vector_id = str(card.id)
            card.save()
            
        print(f"[Vector] Successfully embedded {len(card_ids)} cards")
        
    except Exception as e:
        print(f"[Vector] Error embedding cards: {e}")
        raise e
