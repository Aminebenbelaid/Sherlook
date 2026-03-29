## Plan: Sherlook Testing Readiness

Gain a clear map of the RAG pipeline, set up a runnable environment, run smoke tests, and outline automated tests so ingest/ask can be validated confidently.

**Steps**
1. Review architecture and data flow: app/main.py boots FastAPI and health; app/api/routes.py wires /ingest and /ask into services; services/{loader,chunker,embedder,vectorstore,retriever,generator}.py implement pipeline; app/core/config.py holds env-driven settings; app/models/schemas.py defines request/response shapes.
2. Environment setup: create venv, install requirements, copy .env.example to .env, choose mock LLM (leave OPENAI_API_KEY blank) vs real key; ensure chroma_db directory is writable.
3. Test data prep: create a small sample folder (e.g., data/sample with a couple of .py/.md files) to exercise loader/chunker paths.
4. Run server locally: start uvicorn app.main:app --reload --port 8000 (or python run.py) from repo root; confirm /health returns healthy payload.
5. Manual smoke tests: POST /ingest with sample path and confirm files_processed and chunks_stored > 0; POST /ask with a simple question and verify answer plus sources echo retrieved files; observe fallback to mock LLM if no API key.
6. Persistence checks: verify chroma_db folder is created and collection populated; re-run /ask after restart to ensure persistence.
7. Automated test plan (pytest):
   - Unit: loader handles ignores/decodes; chunker overlap boundaries; embedder with mock model; vectorstore upsert/search in temp dir; retriever scoring; generator mock output determinism.
   - API: FastAPI TestClient for /health, /ingest happy-path and invalid path errors, /ask with seeded vectorstore.
   - Fixtures: temp data dir, temp chroma path, env overrides for chunk sizes/top_k, mock OpenAI client.

**Relevant files**
- README.md — setup commands and endpoint examples
- requirements.txt — dependencies
- app/main.py — FastAPI app and /health
- app/api/routes.py — /ingest and /ask wiring, limited error handling
- app/core/config.py — env settings and defaults
- app/models/schemas.py — request/response models
- app/services/loader.py — recursive file scan with ignore rules
- app/services/chunker.py — char-based chunking with overlap
- app/services/embedder.py — SentenceTransformers wrapper
- app/services/vectorstore.py — ChromaDB client and collection
- app/services/retriever.py — query embed + similarity search
- app/services/generator.py — mock LLM and OpenAI-backed generator
- app/utils/text.py — token estimation and truncation helpers

**Verification**
1. pip install -r requirements.txt inside venv.
2. cp .env.example .env; optionally set OPENAI_API_KEY/OPENAI_BASE_URL/OPENAI_MODEL.
3. Start server: uvicorn app.main:app --reload --port 8000 (or python run.py) and hit http://localhost:8000/health.
4. POST /ingest with a small data path; check response for nonzero files_processed/chunks_stored and chroma_db contents.
5. POST /ask with a question related to ingested files; confirm answer plus non-empty sources; retry after server restart to confirm persistence.

**Decisions**
- Assume local mock LLM by default unless a real key is provided.
- Use a small sample dataset for initial validation to keep tests fast.

**Further Considerations**
1. Add structured logging during ingest/ask for easier debugging?
2. Should /ask add error handling and a graceful message when no vectors exist?
3. Do we need Windows-specific path-handling tests for loader/retriever?
