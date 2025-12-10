# RecallForge

**One-line pitch:**  
AI-native personal knowledge OS that converts any URL/PDF/image into spaced-repetition flashcards with Git-style versioning and concept linking.

---

## 1. What RecallForge Is
RecallForge is a system that turns unstructured information (articles, PDFs, screenshots, handwritten notes) into structured learning units: flashcards, concept nodes, and spaced-repetition schedules.  

It automates the entire process of:
- Extracting content  
- Chunking and interpreting it  
- Generating high-quality cards  
- Building a knowledge graph  
- Scheduling reviews using an SRS algorithm  

All backed by a clean web UI and version control similar to GitHub.

---

## 2. Why This Matters
Current tools (Anki, Quizlet, Notion, Roam) solve only pieces of the long-term retention problem.  
RecallForge targets the **professional learning market** where:
- Better memory = better performance  
- Time is scarce  
- Manual card creation is too slow  

AI + vector search + SRS unlock a 10× better workflow.

---

## 3. Core MVP Features
- One-tap URL → flashcard deck  
- LLM-generated cards with difficulty metadata  
- Deck versioning (commits, diffs, forks)  
- Qdrant-powered semantic linking between cards  
- SM-2 based review scheduling  
- Django REST API + Celery worker pipeline  
- Basic Next.js UI for studying and editing

---

## 4. Architecture (MVP)
- **Backend:** Django + DRF  
- **Workers:** Celery (ingest + LLM calls + embeddings)  
- **DB:** Postgres  
- **Vector DB:** Qdrant  
- **Cache/Broker:** Redis  
- **Frontend:** Next.js  
- **Cloud:** GCP / Cloud Run / Cloud SQL / MemoryStore  

---

## 5. Roadmap
### v0.1 (MVP)
- URL ingest  
- Auto card generation  
- Review queue  
- Basic deck UI  

### v0.2
- Versioning, diffs, commits  
- Embedding search  
- PDF & OCR ingest  

### v1.0
- Teams, collaboration  
- Knowledge graph visualization  
- AI tutor mode  

---

## 6. Resume-ready description
End-to-end LLM-powered knowledge retention system. Designed and implemented ingestion → LLM generation → vector indexing → spaced-repetition scheduling pipeline. Built scalable backend using Django, Celery, Postgres, Qdrant, Redis, and deployed on GCP. Implements Git-style deck versioning, semantic search, and automated learning workflows.

