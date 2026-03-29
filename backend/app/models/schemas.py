from pydantic import BaseModel, Field
from typing import List


# ── Request models ──────────────────────────────────────────────────────────

class IngestRequest(BaseModel):
    path: str = Field(..., description="Absolute or relative path to the folder to ingest")


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Natural-language question about the codebase")


# ── Response models ─────────────────────────────────────────────────────────

class IngestResponse(BaseModel):
    files_processed: int
    chunks_stored: int
    message: str


class SourceChunk(BaseModel):
    file_path: str
    chunk_index: int
    score: float


class AskResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]


class HealthResponse(BaseModel):
    status: str
    version: str = "0.1.0"
