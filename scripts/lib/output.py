"""Output helpers for the Python data scripts.

Paths are resolved from the repository root, so the scripts behave the same
from any working directory.
"""
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def repo_path(relative_path):
    """Absolute path of a repo-relative path such as "data/csdrop.json"."""
    return REPO_ROOT / relative_path


def write_json(relative_path, payload, **dump_kwargs):
    """Serialises `payload` to a repo-relative file (UTF-8, no trailing newline).

    `dump_kwargs` are passed to json.dump, so each caller keeps its existing
    on-disk format.
    """
    path = repo_path(relative_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, **dump_kwargs)
