from django.db import models
from apps.decks.models import Deck
from django.utils.translation import gettext_lazy as _

class Source(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        PROCESSING = 'PROCESSING', _('Processing')
        COMPLETED = 'COMPLETED', _('Completed')
        FAILED = 'FAILED', _('Failed')

    url = models.URLField()
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='sources')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    extracted_text = models.TextField(blank=True)
    error_log = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.url} ({self.status})"
