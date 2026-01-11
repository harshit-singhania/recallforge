from django.db import models
from django.conf import settings

class Deck(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='decks')
    created_at = models.DateTimeField(auto_now_add=True)
    parent_deck = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='forks', help_text="Original deck if this is a fork")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
