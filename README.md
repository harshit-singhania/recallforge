# RecallForge 🧠
### AI-Native Personal Knowledge OS
**Convert any URL, PDF, or YouTube video into spaced-repetition flashcards using RAG and GenAI.**

[![Django](https://img.shields.io/badge/Backend-Django_5-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Qdrant](https://img.shields.io/badge/Vector_DB-Qdrant-D22D70?style=for-the-badge&logo=qdrant&logoColor=white)](https://qdrant.tech/)
[![Celery](https://img.shields.io/badge/Async-Celery-37814A?style=for-the-badge&logo=celery&logoColor=white)](https://docs.celeryq.dev/)
[![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 🚀 The Elevator Pitch
**RecallForge** addresses information overload by transforming passive content consumption into active knowledge retention. It serves as an intelligent ingestion engine that parses technical documentation, YouTube lectures, and PDFs, converting them into atomic concepts using the **SM-2 Spaced Repetition Algorithm**.

Unlike standard flashcard apps, RecallForge uses **Retrieval-Augmented Generation (RAG)** to ground every AI-generated card in the source material, ensuring high accuracy and context.

---

## ✨ Features

- **AI-Powered Card Generation**: Drop in any content and let AI extract key concepts and generate flashcards
- **Spaced Repetition (SM-2)**: Scientifically-proven algorithm schedules reviews at optimal intervals
- **Multi-Source Ingestion**: YouTube videos, PDFs, web articles, documentation
- **Beautiful Dark UI**: Modern glassmorphism design with responsive layouts
- **Interactive Dashboard**: Track progress, manage decks, and review cards

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              NEXT.JS FRONTEND                                 │
│   Auth Pages  │  Dashboard  │  Review Interface  │  Feature Carousel         │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │ REST API (JSON) / JWT Auth
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          DJANGO REST FRAMEWORK                                │
│   API Gateway  │  Apps: Accounts, Decks, Cards, Ingest, Scheduler            │
└────────┬───────────────────────────────┬─────────────────────────────────────┘
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐      ┌─────────────────┐
│   POSTGRESQL    │            │   REDIS/CELERY  │      │     QDRANT      │
│   (Main DB)     │            │   (Async Tasks) │      │   (Vector DB)   │
└─────────────────┘            └─────────────────┘      └─────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: TailwindCSS v4, Framer Motion
- **Auth**: JWT with Axios interceptors

### Backend
- **Framework**: Django 5, Django REST Framework
- **AI**: Google Gemini 2.0 Flash
- **Search**: Qdrant (Vector DB)
- **Async**: Celery + Redis
- **Database**: PostgreSQL
- **Auth**: Djoser (JWT)

### DevOps
- Docker Compose for local infrastructure
- Shell scripts for easy setup

---

## ⚡ Quick Start

### Prerequisites
- Docker Desktop (or Colima)
- Python 3.10+
- Node.js 18+

### 1. Clone & Install

```bash
git clone https://github.com/harshit-singhania/recallforge.git
cd recallforge

# Backend dependencies
pip install -r requirements.txt

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Start Infrastructure

```bash
chmod +x start_infra.sh
./start_infra.sh
# Usage: ./start_infra.sh [stop|restart|status]
```

### 3. Run the Application

**Terminal 1 (API Server):**
```bash
python manage.py runserver
```

**Terminal 2 (Celery Worker):**
```bash
celery -A config worker -l info
```

**Terminal 3 (Frontend):**
```bash
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 API Reference

**Base URL:** `http://localhost:8000/api/v1/`

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/ingest/` | **Ingest Content.** Supports YouTube URLs, Web links, or File Uploads. |
| `GET` | `/review/next/` | **Smart Review.** Fetches the next card due based on SM-2 algorithm. |
| `POST` | `/review/{id}/rate/` | **Submit Rating.** Rate recall (0-5) to update the card's next interval. |
| `GET` | `/cards/` | **List Cards.** Filter by `?deck=ID` or `?tag=Topic`. |
| `POST` | `/auth/users/` | **Register.** Create a new user account (JWT). |

---

## 🗺 Roadmap

**v0.1 (MVP) - ✅ Completed**
- [x] URL ingest & Text Extraction
- [x] Auto card generation (Mock LLM)
- [x] Qdrant integration & SM-2 Scheduler

**v0.2 (AI Sprint) - ✅ Completed**
- [x] Integrate Gemini 2.0 Flash
- [x] YouTube Ingestion Pipeline
- [x] Vision Pipeline (Image Uploads)
- [x] PDF/Document Support

**v0.3 (Frontend) - ✅ Completed**
- [x] Next.js 16 Frontend with App Router
- [x] Dark glassmorphism UI design
- [x] Interactive dashboard & review interface
- [x] Responsive navbar & footer
- [x] Feature carousel on landing page

**v0.4 (Next Steps)**
- [ ] Deck Versioning (Git-style)
- [ ] Mobile App (React Native)
- [ ] Collaborative Decks

---

## 👤 Author

**Harshit Singhania**

- GitHub: [@harshit-singhania](https://github.com/harshit-singhania)
- LinkedIn: [h-singhania](https://linkedin.com/in/h-singhania)
- Email: harshitsinghaniawork@gmail.com

---

## 📄 License

MIT License.
