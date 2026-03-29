from typing import List
from sentence_transformers import SentenceTransformer
from app.core.config import get_settings

# Module-level singleton so the model is loaded once per process
_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        settings = get_settings()
        _model = SentenceTransformer(settings.embedding_model)
    return _model


def embed_documents(texts: List[str]) -> List[List[float]]:
    """
    Embed a batch of document texts.
    Returns a list of float vectors (one per text).
    """
    model = _get_model()
    embeddings = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
    return embeddings.tolist()


def embed_query(text: str) -> List[float]:
    """
    Embed a single query string.
    Returns a single float vector.
    """
    model = _get_model()
    embedding = model.encode([text], show_progress_bar=False, convert_to_numpy=True)
    return embedding[0].tolist()
