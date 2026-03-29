from typing import List, Dict, Tuple
import httpx
from app.core.config import get_settings

# ── Prompt building ──────────────────────────────────────────────────────────

SYSTEM_PROMPT = """\
You are a precise code-analysis assistant called RepoRAG.
Answer questions strictly based on the context snippets provided below.
Rules:
- If the answer is present in the context, explain it clearly and cite the relevant file paths.
- If the context does not contain enough information to answer, say exactly:
  "I could not find a relevant answer in the retrieved context."
- Never invent file names, function names, or code that do not appear in the context.
- Keep answers concise and developer-friendly.
"""


def _build_context_block(chunks: List[Dict]) -> str:
    parts = []
    for i, chunk in enumerate(chunks, 1):
        parts.append(
            f"--- Chunk {i} | File: {chunk['file_path']} ---\n{chunk['text']}"
        )
    return "\n\n".join(parts)


def build_prompt(question: str, chunks: List[Dict]) -> Tuple[str, str]:
    """
    Returns (system_prompt, user_message) ready to pass to the LLM.
    """
    context = _build_context_block(chunks)
    user_message = f"Context:\n{context}\n\nQuestion: {question}"
    return SYSTEM_PROMPT, user_message


# ── LLM abstraction ──────────────────────────────────────────────────────────

def _call_llm(system: str, user: str) -> str:
    """Call an OpenAI-compatible chat endpoint (e.g., OpenRouter)."""
    settings = get_settings()
    url = f"{settings.openai_base_url.rstrip('/')}/chat/completions"
    payload = {
        "model": settings.openai_model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": 0.2,
    }
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }

    with httpx.Client(timeout=30.0) as client:
        response = client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

    choices = data.get("choices", [])
    if not choices:
        raise ValueError("LLM response missing choices")

    content = choices[0].get("message", {}).get("content", "")
    return content or ""


def _call_mock(chunks: List[Dict]) -> str:
    """
    Deterministic mock response for local testing when no LLM key is set.
    Summarises which files were retrieved so the pipeline can be verified.
    """
    if not chunks:
        return "I could not find a relevant answer in the retrieved context."

    file_list = "\n".join(
        f"  - {c['file_path']} (chunk {c['chunk_index']}, score {c['score']})"
        for c in chunks
    )
    return (
        "[MOCK LLM — no API key configured]\n\n"
        "Based on the retrieved context, the following source files appear relevant:\n"
        f"{file_list}\n\n"
        "To get a real answer, set OPENAI_API_KEY in your .env file."
    )


# ── Public interface ─────────────────────────────────────────────────────────

def generate_answer(question: str, chunks: List[Dict]) -> str:
    """
    Generate an answer for *question* using *chunks* as context.
    Falls back to the mock LLM if no API key is configured.
    """
    settings = get_settings()

    use_mock = settings.use_mock_llm or not settings.openai_api_key.strip()

    if use_mock:
        return _call_mock(chunks)

    system, user = build_prompt(question, chunks)
    try:
        return _call_llm(system, user)
    except Exception as exc:
        # Graceful fallback to mock when the remote LLM errors out
        return (
            f"[Mock fallback due to LLM error: {exc}]\n\n"
            + _call_mock(chunks)
        )
