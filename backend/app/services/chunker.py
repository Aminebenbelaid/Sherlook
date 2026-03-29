from typing import List, Dict
from app.core.config import get_settings


def chunk_document(file_path: str, content: str) -> List[Dict]:
    """
    Split *content* into overlapping character-based chunks.

    Each chunk dict contains:
        {
            "file_path": str,
            "chunk_index": int,
            "text": str,
        }

    Chunk size and overlap are read from settings so they can be tuned
    via environment variables without touching code.
    """
    settings = get_settings()
    size = settings.chunk_size
    overlap = settings.chunk_overlap

    if not content.strip():
        return []

    chunks: List[Dict] = []
    start = 0
    index = 0

    while start < len(content):
        end = start + size
        chunk_text = content[start:end].strip()

        if chunk_text:
            chunks.append({
                "file_path": file_path,
                "chunk_index": index,
                "text": chunk_text,
            })
            index += 1

        # Advance by (size - overlap) to create the sliding window
        start += size - overlap

    return chunks


def chunk_documents(files: List[Dict[str, str]]) -> List[Dict]:
    """
    Chunk a list of loaded file dicts (as returned by loader.load_files).
    Returns a flat list of chunk dicts.
    """
    all_chunks: List[Dict] = []
    for file in files:
        chunks = chunk_document(file["file_path"], file["content"])
        all_chunks.extend(chunks)
    return all_chunks
