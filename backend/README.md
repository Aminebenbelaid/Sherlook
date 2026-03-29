# RepoRAG

A clean, modular RAG backend that ingests a local codebase or documentation folder,
stores text chunks in ChromaDB, and answers questions about the code using retrieved context.

---

## Quick Start

### 1. Clone & set up environment

```bash
git clone <your-repo-url>
cd reporag

python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env` if you want real LLM answers:

```env
OPENAI_API_KEY=sk-...
```

Leave `OPENAI_API_KEY` blank to use the built-in **mock LLM** for local testing
(no API key required — works 100% offline).

### 3. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

---

## API Endpoints

### `GET /health`

```bash
curl http://localhost:8000/health
```

```json
{"status": "healthy", "version": "0.1.0"}
```

---

### `POST /ingest`

Recursively scan a folder, chunk files, embed them, and store in ChromaDB.

```bash
curl -X POST http://localhost:8000/ingest \
  -H "Content-Type: application/json" \
  -d '{"path": "./data/my-project"}'
```

```json
{
  "files_processed": 42,
  "chunks_stored": 318,
  "message": "Successfully ingested 42 files into 318 chunks."
}
```

**Supported file extensions:** `.py`, `.ts`, `.tsx`, `.js`, `.jsx`, `.md`, `.txt`, `.json`, `.yaml`, `.yml`

**Ignored folders:** `node_modules`, `.git`, `dist`, `build`, `.next`, `venv`, `__pycache__`

---

### `POST /ask`

Ask a natural-language question about the ingested codebase.

```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Where is authentication handled?"}'
```

```json
{
  "answer": "Authentication is handled in app/auth/middleware.py ...",
  "sources": [
    {"file_path": "app/auth/middleware.py", "chunk_index": 2, "score": 0.91},
    {"file_path": "app/auth/jwt.py",        "chunk_index": 0, "score": 0.87}
  ]
}
```

---

## Project Structure

```
reporag/
├── app/
│   ├── main.py                 # FastAPI app + /health endpoint
│   ├── api/
│   │   └── routes.py           # /ingest and /ask route handlers
│   ├── core/
│   │   └── config.py           # Pydantic-settings configuration
│   ├── models/
│   │   └── schemas.py          # Request / response Pydantic models
│   ├── services/
│   │   ├── loader.py           # Recursive file scanner
│   │   ├── chunker.py          # Character-based text chunker
│   │   ├── embedder.py         # SentenceTransformers wrapper
│   │   ├── vectorstore.py      # ChromaDB wrapper
│   │   ├── retriever.py        # Top-k retrieval
│   │   └── generator.py        # Prompt builder + LLM abstraction
│   └── utils/
│       └── text.py             # Shared text helpers
├── requirements.txt
├── .env.example
└── README.md
```

---

## Configuration Reference

| Variable           | Default                         | Description                        |
|--------------------|---------------------------------|------------------------------------|
| `EMBEDDING_MODEL`  | `all-MiniLM-L6-v2`             | SentenceTransformers model name    |
| `CHROMA_PATH`      | `./chroma_db`                  | Directory for persistent ChromaDB  |
| `CHROMA_COLLECTION`| `reporag`                      | ChromaDB collection name           |
| `TOP_K`            | `5`                             | Number of chunks retrieved per query|
| `CHUNK_SIZE`       | `800`                           | Characters per chunk               |
| `CHUNK_OVERLAP`    | `100`                           | Overlap between consecutive chunks |
| `OPENAI_API_KEY`   | *(blank → mock LLM)*           | OpenAI (or compatible) API key     |
| `OPENAI_BASE_URL`  | `https://api.openai.com/v1`    | Base URL (swap for local models)   |
| `OPENAI_MODEL`     | `gpt-4o-mini`                  | Model to use for answer generation |
| `USE_MOCK_LLM`     | `false`                         | Force mock LLM even if key is set  |

---

## Using a Local LLM (e.g. Ollama)

Point `OPENAI_BASE_URL` at any OpenAI-compatible server:

```env
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=ollama
OPENAI_MODEL=llama3
```

---

## Extending RepoRAG

- **Better chunking**: swap `chunker.py` for a sentence- or AST-aware chunker.
- **Re-ranking**: add a cross-encoder step in `retriever.py`.
- **Auth**: add FastAPI middleware in `app/core/`.
- **Streaming**: switch the `/ask` endpoint to a `StreamingResponse`.
