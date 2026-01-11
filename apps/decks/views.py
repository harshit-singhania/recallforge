from django.shortcuts import render

# Create your views here.

@action(detail=True, methods=['post'])
def fork(self, request, pk=None):
    original_deck = self.get_object()
    
    # 1. Create Fork
    forked_deck = Deck.objects.create(
        name=f"Fork of {original_deck.name}",
        owner=request.user,
        description=original_deck.description,
        parent_deck=original_deck
    )
    
    # 2. Copy Cards (Bulk Create)
    original_cards = original_deck.cards.all()
    new_cards = []
    for card in original_cards:
        new_cards.append(Card(
            deck=forked_deck,
            front=card.front,
            back=card.back,
            visual_payload=card.visual_payload,
            # Clear vector_id as new cards might need fresh indexing if content changes, 
            # but for exact copy we could copy it. Let's clear to be safe/independent.
            vector_id=card.vector_id 
        ))
    
    Card.objects.bulk_create(new_cards)
    
    serializer = self.get_serializer(forked_deck)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
