from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.views import DeckViewSet, SourceViewSet, CardViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'decks', DeckViewSet, basename='deck')
router.register(r'ingest', SourceViewSet, basename='source')
router.register(r'cards', CardViewSet, basename='card')
router.register(r'review', ReviewViewSet, basename='review')

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
