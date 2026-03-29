from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import get_settings

# Module-level Chroma client + collection singleton
_client: Optional[chromadb.Client] = None
_collection: Optional[Any] = None


def _get_collection():
    global _client, _collection
    if _collection is None:
        settings = get_settings()
        _client = chromadb.PersistentClient(
            path=settings.chroma_path,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        _collection = _client.get_or_create_collection(
            name=settings.chroma_collection,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def add_chunks(chunks: List[Dict], embeddings: List[List[float]]) -> None:
    """
    Store chunks and their embeddings in ChromaDB.

    *chunks* are dicts with keys: file_path, chunk_index, text.
    *embeddings* must be in the same order as *chunks*.
    """
    collection = _get_collection()

    ids = [f"{c['file_path']}::{c['chunk_index']}" for c in chunks]
    documents = [c["text"] for c in chunks]
    metadatas: List[Dict[str, Any]] = [
        {"file_path": c["file_path"], "chunk_index": c["chunk_index"]}
        for c in chunks
    ]

    # Chroma requires unique IDs; upsert handles re-ingestion gracefully
    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas,
    )


def similarity_search(
    query_embedding: List[float],
    top_k: int,
) -> Dict[str, Any]:
    """
    Return the top-k most similar chunks for *query_embedding*.

    Returns the raw Chroma query result dict with keys:
        ids, documents, metadatas, distances
    """
    collection = _get_collection()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )
    return results


def clear_collection() -> None:
    """Delete and recreate the collection (used for fresh ingestion if needed)."""
    global _collection
    settings = get_settings()
    _get_collection()  # ensure _client is initialised
    _client.delete_collection(settings.chroma_collection)
    _collection = None
    _get_collection()  # recreate fresh collection
