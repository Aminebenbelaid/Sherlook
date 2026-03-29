from typing import List, Dict
from app.services import embedder, vectorstore
from app.core.config import get_settings


def retrieve(question: str) -> List[Dict]:
    """
    Embed *question* and fetch the top-k most relevant chunks.

    Returns a list of dicts:
        {
            "text": str,
            "file_path": str,
            "chunk_index": int,
            "score": float,   # cosine similarity in [0, 1]
        }
    """
    settings = get_settings()
    query_vec = embedder.embed_query(question)
    results = vectorstore.similarity_search(query_vec, top_k=settings.top_k)

    chunks: List[Dict] = []

    ids_list = results.get("ids", [[]])[0]
    docs_list = results.get("documents", [[]])[0]
    metas_list = results.get("metadatas", [[]])[0]
    dists_list = results.get("distances", [[]])[0]

    for doc, meta, distance in zip(docs_list, metas_list, dists_list):
        # Chroma returns cosine distance [0, 2]; convert to similarity [0, 1]
        similarity = max(0.0, 1.0 - distance / 2.0)
        chunks.append({
            "text": doc,
            "file_path": meta.get("file_path", "unknown"),
            "chunk_index": meta.get("chunk_index", -1),
            "score": round(similarity, 4),
        })

    return chunks
