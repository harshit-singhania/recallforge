from rest_framework import serializers
from apps.decks.models import Deck
from apps.ingest.models import Source
from apps.cards.models import Card

class DeckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deck
        fields = '__all__'
        read_only_fields = ('owner',)

class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = '__all__'
        read_only_fields = ('status', 'extracted_text', 'error_log')

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = '__all__'
        read_only_fields = ('vector_id', 'sm2_ease', 'sm2_interval', 'sm2_repetitions', 'next_review_at')
