import re
from difflib import SequenceMatcher
from typing import Dict, List, TypedDict


class DiffPart(TypedDict):
    value: str
    added: bool
    removed: bool


def _tokenize_words(text: str) -> List[str]:
    # Keeps whitespace runs and non-whitespace runs as separate tokens,
    # equivalent in spirit to jsdiff's diffWordsWithSpace.
    return re.findall(r"\s+|\S+", text)


def _tokenize_lines(text: str) -> List[str]:
    return text.splitlines(keepends=True) or [text]


def _diff_tokens(a_tokens: List[str], b_tokens: List[str]) -> List[DiffPart]:
    matcher = SequenceMatcher(None, a_tokens, b_tokens, autojunk=False)
    parts: List[DiffPart] = []
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            parts.append({"value": "".join(a_tokens[i1:i2]), "added": False, "removed": False})
        elif tag == "delete":
            parts.append({"value": "".join(a_tokens[i1:i2]), "added": False, "removed": True})
        elif tag == "insert":
            parts.append({"value": "".join(b_tokens[j1:j2]), "added": True, "removed": False})
        elif tag == "replace":
            parts.append({"value": "".join(a_tokens[i1:i2]), "added": False, "removed": True})
            parts.append({"value": "".join(b_tokens[j1:j2]), "added": True, "removed": False})
    return parts


def diff_text(old_text: str, new_text: str, mode: str = "words") -> List[DiffPart]:
    old_text = old_text or ""
    new_text = new_text or ""
    if mode == "lines":
        return _diff_tokens(_tokenize_lines(old_text), _tokenize_lines(new_text))
    return _diff_tokens(_tokenize_words(old_text), _tokenize_words(new_text))


def summarize(parts: List[DiffPart]) -> Dict[str, int]:
    added = 0
    removed = 0
    for p in parts:
        if p["added"]:
            added += len(p["value"])
        elif p["removed"]:
            removed += len(p["value"])
    return {"added": added, "removed": removed}
