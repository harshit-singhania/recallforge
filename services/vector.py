from qdrant_client import QdrantClient
from qdrant_client.http import models
from django.conf import settings
import uuid

class VectorService:
    def __init__(self):
        self.client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        self.collection_name = "cards"
        self._ensure_collection()

    def _ensure_collection(self):
        try:
            self.client.get_collection(self.collection_name)
        except Exception:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
            )

    def upsert_card(self, card_id, vector: list, payload: dict):
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=str(uuid.uuid4()), # Qdrant prefers UUIDs or ints
                    vector=vector,
                    payload={"card_id": card_id, **payload}
                )
            ]
        )
