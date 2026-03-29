## Context: Sherlook Testing Readiness



- FastAPI app in app/main.py with /health; routes in app/api/routes.py expose /ingest and /ask.
- Pipeline: loader (scan files) -> chunker (overlapping char chunks) -> embedder (SentenceTransformers all-MiniLM-L6-v2) -> vectorstore (ChromaDB, persistent) -> retriever (top-k cosine) -> generator (mock LLM by default; OpenAI-compatible if keys set).
- Config in app/core/config.py via .env; defaults: chunk_size 800, overlap 100, top_k 5, chroma path ./chroma_db, openai model gpt-4o-mini but mock used when key blank.
- Models in app/models/schemas.py define ingest/ask request/response; utils/text.py has truncation/token estimate helpers.
- Gaps: no tests yet; /ask lacks error handling if retrieval/generation fails; logging is minimal.
