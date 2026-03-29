from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Embedding model (local, no API key needed)
    embedding_model: str = "all-MiniLM-L6-v2"

    # ChromaDB storage path
    chroma_path: str = "./chroma_db"
    chroma_collection: str = "reporag"

    # Retrieval
    top_k: int = 5

    # Chunking
    chunk_size: int = 800       # characters per chunk
    chunk_overlap: int = 100    # overlap between consecutive chunks

    # LLM (OpenAI-compatible)
    openai_api_key: str = ""  # supply via .env (e.g., OpenRouter key)
    openai_base_url: str = "https://openrouter.ai/api/v1"
    openai_model: str = "openrouter/free"

    # If True, always use the mock LLM even when a key is present
    use_mock_llm: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
