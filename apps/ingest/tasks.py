from celery import shared_task
from apps.ingest.models import Source
from services.ingest import fetch_url_content
# from apps.cards.tasks import generate_cards_from_source # Circular import risk, use signature or string

@shared_task
def process_source_url(source_id):
    try:
        source = Source.objects.get(id=source_id)
        source.status = Source.Status.PROCESSING
        source.save()
        
        text = fetch_url_content(source.url)
        source.extracted_text = text
        source.status = Source.Status.COMPLETED # Partial complete, moving to next step
        source.save()
        
        # Chain via signature to avoid circular imports if possible, or just import inside
        from apps.cards.tasks import generate_cards_from_source
        generate_cards_from_source.delay(source_id)
        
    except Exception as e:
        source = Source.objects.get(id=source_id)
        source.status = Source.Status.FAILED
        source.error_log = str(e)
        source.save()
        raise e
