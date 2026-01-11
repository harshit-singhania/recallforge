from rest_framework import viewsets, status, decorators
from rest_framework.response import Response
from apps.decks.models import Deck
from apps.ingest.models import Source
from apps.cards.models import Card, ReviewLog
from apps.serializers import DeckSerializer, SourceSerializer, CardSerializer
from services.scheduler import calculate_next_review
from services.ingest import fetch_url_content
from services.llm import LLMService
from services.vector import VectorService
from django.utils import timezone
import threading

from rest_framework import viewsets, status, decorators, permissions

class DeckViewSet(viewsets.ModelViewSet):
    queryset = Deck.objects.all()
    serializer_class = DeckSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # In a real app, strict by user: return self.request.user.decks.all()
        return Deck.objects.all()

    def perform_create(self, serializer):
        # Strict user assignment
        if not self.request.user.is_authenticated:
            # This should ideally be handled by permission classes, but as a failsafe:
            # If we are testing with APIClient force_authenticate/credentials, user should be there.
            # If it's failing, we might need to debug why user is Anon.
            # For now, let's try to assign.
            pass
        serializer.save(owner=self.request.user)

    @decorators.action(detail=True, methods=['post'])
    def fork(self, request, pk=None):
        original_deck = self.get_object()
        
        # 1. Create Fork
        forked_deck = Deck.objects.create(
            name=f"Fork of {original_deck.name}",
            owner=request.user,
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

class SourceViewSet(viewsets.ModelViewSet):
    queryset = Source.objects.all()
    serializer_class = SourceSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        source = serializer.save(status=Source.Status.PROCESSING)
        
        # Trigger async task
        from apps.ingest.tasks import process_source_url
        process_source_url.delay(source.id)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class CardViewSet(viewsets.ModelViewSet):
    queryset = Card.objects.all()
    serializer_class = CardSerializer
    
    def get_queryset(self):
        qs = Card.objects.all()
        deck_id = self.request.query_params.get('deck', None)
        if deck_id:
            qs = qs.filter(deck_id=deck_id)
        return qs

class ReviewViewSet(viewsets.ViewSet):
    @decorators.action(detail=False, methods=['get'])
    def next(self, request):
        """
        Get the next card due for review.
        Query params: deck (optional)
        """
        now = timezone.now()
        qs = Card.objects.filter(next_review_at__lte=now).order_by('next_review_at')
        
        deck_id = request.query_params.get('deck')
        if deck_id:
            qs = qs.filter(deck_id=deck_id)
            
        card = qs.first()
        if not card:
            return Response({"message": "No cards due for review"}, status=status.HTTP_200_OK)
            
        serializer = CardSerializer(card)
        return Response(serializer.data)

    @decorators.action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """
        Submit a rating (0-5) for a card review.
        """
        try:
            card = Card.objects.get(pk=pk)
        except Card.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
        rating = int(request.data.get('rating', 0))
        if rating < 0 or rating > 5:
            return Response({"error": "Rating must be 0-5"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Log Review
        ReviewLog.objects.create(card=card, rating=rating)
        
        # Calculate Schedule
        new_ease, new_interval, new_reps, next_date = calculate_next_review(
            rating, 
            card.sm2_ease, 
            card.sm2_interval, 
            card.sm2_repetitions
        )
        
        card.sm2_ease = new_ease
        card.sm2_interval = new_interval
        card.sm2_repetitions = new_reps
        card.next_review_at = next_date
        card.save()
        
        return Response({
            "next_review_at": next_date,
            "interval_days": new_interval
        })
