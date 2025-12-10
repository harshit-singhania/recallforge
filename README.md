# RecallForge

**One-line pitch:**  
AI-native personal knowledge OS that converts any URL/PDF/image into spaced-repetition flashcards with Git-style versioning and concept linking.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Docker Desktop or Colima (for Redis, Qdrant, Postgres)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harshit-singhania/recallforge.git
   cd recallforge
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start Infrastructure**
   We provide a helper script to manage Docker containers (Redis, Qdrant, Postgres) and run migrations.
   ```bash
   chmod +x start_infra.sh
   ./start_infra.sh
   ```
   *Commands: `./start_infra.sh [stop|restart|status]`*

4. **Run the Backend**
   Open two terminals:

   **Terminal 1 (Django Server):**
   ```bash
   python manage.py runserver
   ```

   **Terminal 2 (Celery Worker):**
   ```bash
   celery -A config worker -l info
   ```

---

## 🏗 Architecture

- **Backend Framework**: Django 5 + Django REST Framework
- **Asynchronous Tasks**: Celery + Redis
- **Database**: PostgreSQL
- **Vector Search**: Qdrant (for semantic similarity)
- **Authentication**: JWT (Djoser)

### Key Services
- **Ingest**: Fetches content from URLs/PDFs.
- **LLM Service**: Generates flashcards (currently Mocked, ready for OpenAI/Gemini).
- **Vector Service**: Embeds cards and indexes them in Qdrant.
- **Scheduler**: Implements SM-2 Spaced Repetition Algorithm.

---

## 🔌 API Endpoints

Base URL: `http://localhost:8000/api/v1/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ingest/` | Ingest URL and trigger async generation |
| GET | `/api/v1/decks/` | List all decks |
| POST | `/api/v1/decks/` | Create a new deck |
| GET | `/api/v1/cards/` | List cards (filter by `?deck=ID`) |
| GET | `/api/v1/review/next/` | Get next card due for review |
| POST | `/api/v1/review/{id}/rate/` | Submit review rating (0-5) |

**Authentication**:
- Register: `POST /auth/users/`
- Login: `POST /auth/jwt/create/`

---

## ✅ Verification

Run the end-to-end verification script to test the entire pipeline:
```bash
python verify_flow.py
```
This script creates a user, generating a token, ingests a URL, waits for the Celery worker, and performs a review.

---

## 🗺 Roadmap

### v0.1 (MVP) - ✅ Completed
- URL ingest & Text Extraction
- Auto card generation (Mock LLM)
- Qdrant integration
- SM-2 Scheduler

### v0.2 - Next Steps
- [ ] Connect Real LLM (OpenAI/Gemini)
- [ ] Next.js Frontend
- [ ] Deck Versioning (Git-style)
