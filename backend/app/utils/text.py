def truncate(text: str, max_chars: int = 200) -> str:
    """Return *text* truncated to *max_chars* with an ellipsis if needed."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rstrip() + "…"


def count_tokens_approx(text: str) -> int:
    """
    Very rough token estimate (1 token ≈ 4 chars).
    Useful for logging / sanity checks without importing a tokeniser.
    """
    return max(1, len(text) // 4)
