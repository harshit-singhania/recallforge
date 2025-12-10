from django.db import models
from django.utils import timezone
from apps.decks.models import Deck
from apps.ingest.models import Source

class Card(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='cards')
    source = models.ForeignKey(Source, on_delete=models.SET_NULL, null=True, blank=True, related_name='cards')
    front = models.TextField()
    back = models.TextField()
    visual_payload = models.TextField(blank=True, null=True, help_text="SVG code or JSON for generative UI")
    vector_id = models.CharField(max_length=255, blank=True, null=True)
    
    # SM-2 Fields
    sm2_ease = models.FloatField(default=2.5)
    sm2_interval = models.IntegerField(default=0)  # Days
    sm2_repetitions = models.IntegerField(default=0)
    next_review_at = models.DateTimeField(default=timezone.now)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Card {self.id} in {self.deck.name}"

class ReviewLog(models.Model):
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='logs')
    rating = models.IntegerField()  # 0-5
    reviewed_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Review {self.card.id} - {self.rating}"
