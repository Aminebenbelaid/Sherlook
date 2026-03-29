import os
from pathlib import Path
from typing import List, Dict

SUPPORTED_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".jsx",
    ".md", ".txt", ".json", ".yaml", ".yml",
}

IGNORED_DIRS = {
    "node_modules", ".git", "dist", "build",
    ".next", "venv", "__pycache__", ".venv",
    ".mypy_cache", ".pytest_cache", "coverage",
}


def load_files(folder_path: str) -> List[Dict[str, str]]:
    """
    Recursively scan *folder_path* and return a list of dicts:
        {"file_path": <str>, "content": <str>}

    Only files with SUPPORTED_EXTENSIONS are included.
    Directories in IGNORED_DIRS (at any depth) are skipped entirely.
    Files that cannot be decoded as UTF-8 are silently skipped.
    """
    root = Path(folder_path).resolve()

    if not root.exists():
        raise FileNotFoundError(f"Folder not found: {folder_path}")
    if not root.is_dir():
        raise NotADirectoryError(f"Path is not a directory: {folder_path}")

    results: List[Dict[str, str]] = []

    for dirpath, dirnames, filenames in os.walk(root):
        # Prune ignored directories in-place so os.walk won't descend into them
        dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS]

        for filename in filenames:
            file_path = Path(dirpath) / filename
            if file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
                continue

            content = _read_file(file_path)
            if content is not None:
                results.append({
                    "file_path": str(file_path),
                    "content": content,
                })

    return results


def _read_file(path: Path) -> str | None:
    """Read a file as UTF-8 text; return None on any decode / IO error."""
    try:
        return path.read_text(encoding="utf-8", errors="strict")
    except (UnicodeDecodeError, OSError):
        return None
