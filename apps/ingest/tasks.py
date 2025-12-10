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
        # Determine extraction strategy
        text_content = ""
        is_vision = False

        if source.file:
            # Handle File Source (Images/PDFs)
            is_vision = True
            source.extracted_text = "[File Content Processed via Vision API]"
        elif source.url:
            # Handle URL Source
            text = fetch_url_content(source.url)
            source.extracted_text = text
            text_content = text
        else:
            raise ValueError("Source has no URL and no Image.")
            
        source.status = Source.Status.COMPLETED
        source.save()
        
        # Trigger Card Generation
        from apps.cards.tasks import generate_cards_from_source
        generate_cards_from_source.delay(source.id, is_vision=is_vision)
        
    except Exception as e:
        source = Source.objects.get(id=source_id)
        source.status = Source.Status.FAILED
        source.error_log = str(e)
        source.save()
        raise e
