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

class DeckViewSet(viewsets.ModelViewSet):
    queryset = Deck.objects.all()
    serializer_class = DeckSerializer
    
    def get_queryset(self):
        # In a real app, strict by user: return self.request.user.decks.all()
        return Deck.objects.all()

    def perform_create(self, serializer):
        # serializer.save(owner=self.request.user)
        # Mocking user for MVP since auth headers might be optional in early testing
        user = self.request.user if self.request.user.is_authenticated else None
        # Require a user in real life, but for now allow null or handle validation
        serializer.save(owner=user)

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
