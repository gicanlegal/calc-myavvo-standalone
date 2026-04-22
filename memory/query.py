#!/usr/bin/env python3
"""Query project memory from the terminal."""

from __future__ import annotations

import os
import sys
from pathlib import Path


MAX_DOCS = 5


def resolve_vault_path() -> Path:
    env_path = os.environ.get("VAULT_PATH")
    if env_path:
        return Path(env_path).expanduser().resolve()
    return (Path(__file__).resolve().parents[1] / "vault").resolve()


def find_relevant_docs(query: str, vault_path: Path) -> list[Path]:
    if not vault_path.exists():
        return []

    query_terms = [term.lower() for term in query.split() if term.strip()]
    scored: list[tuple[int, Path]] = []

    for md_file in vault_path.rglob("*.md"):
        if not md_file.is_file():
            continue
        content = md_file.read_text(encoding="utf-8", errors="ignore").lower()
        score = sum(content.count(term) for term in query_terms)
        if score > 0:
            scored.append((score, md_file))

    scored.sort(key=lambda item: (-item[0], str(item[1])))
    return [path for _, path in scored[:MAX_DOCS]]


def synthesize_answer(query: str, docs: list[Path], vault_path: Path) -> str:
    if not docs:
        return f"## Răspuns\n\nNu am găsit informații relevante pentru: `{query}`\n"

    lines = [f"## Răspuns pentru: `{query}`", "", "### Documente consultate"]
    for doc in docs:
        rel = doc.relative_to(vault_path)
        lines.append(f"- `{rel}`")

    lines.append("")
    lines.append("### Extrase relevante")
    for doc in docs:
        rel = doc.relative_to(vault_path)
        content = doc.read_text(encoding="utf-8", errors="ignore")[:1200].strip()
        lines.extend(["", f"#### {rel}", "", content or "(gol)"])

    lines.append("")
    lines.append(f"---\nRezultat generat din {len(docs)} document(e).")
    return "\n".join(lines) + "\n"


def main() -> None:
    if len(sys.argv) < 2:
        print("Utilizare: python3 memory/query.py '<întrebarea ta>'")
        sys.exit(1)

    query = " ".join(sys.argv[1:]).strip()
    vault_path = resolve_vault_path()
    docs = find_relevant_docs(query, vault_path)
    print(synthesize_answer(query, docs, vault_path))


if __name__ == "__main__":
    main()
