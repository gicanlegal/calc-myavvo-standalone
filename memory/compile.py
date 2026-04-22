#!/usr/bin/env python3
"""Compile daily session logs into reusable wiki concept pages."""

from __future__ import annotations

import os
import re
from collections import Counter
from datetime import datetime
from pathlib import Path


STOP_WORDS = {
    "the", "and", "for", "with", "that", "this", "from", "into", "were", "have", "has", "had",
    "you", "your", "about", "care", "project", "memory", "wiki", "session", "hook", "hooks", "agent",
    "agents", "code", "file", "files", "will", "would", "should", "could", "can", "are", "was",
    "în", "din", "pentru", "care", "este", "sunt", "sau", "cu", "iar", "după", "fără", "prin",
    "acest", "această", "aceste", "acolo", "poate", "dacă", "fi", "la", "de", "și", "un", "o",
    "ce", "mai", "nu", "se", "sa", "și", "ori", "iarăși", "că", "ca", "pe", "lui", "ei",
}


def resolve_vault_path() -> Path:
    env_path = os.environ.get("VAULT_PATH")
    if env_path:
        return Path(env_path).expanduser().resolve()
    return (Path(__file__).resolve().parents[1] / "vault").resolve()


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "concept"


def get_uncompiled_logs(vault_path: Path) -> list[Path]:
    daily_dir = vault_path / "wiki" / "daily"
    if not daily_dir.exists():
        return []

    compiled_dir = vault_path / "wiki" / "compiled"
    ensure_dir(compiled_dir)
    compiled_names = {file.stem for file in compiled_dir.glob("*.md") if file.is_file()}

    pending: list[Path] = []
    for file in sorted(daily_dir.glob("*.md")):
        if file.stem not in compiled_names:
            pending.append(file)
    return pending


def extract_keywords(text: str, limit: int = 5) -> list[str]:
    words = re.findall(r"[A-Za-zĂÂÎȘȚăâîșț0-9_-]{4,}", text.lower())
    filtered = [word for word in words if word not in STOP_WORDS]
    counts = Counter(filtered)
    return [word for word, _ in counts.most_common(limit)]


def build_concept(log_file: Path) -> dict[str, str]:
    content = log_file.read_text(encoding="utf-8")
    keywords = extract_keywords(content)
    title_seed = " ".join(keywords[:3]) if keywords else log_file.stem.replace("_", " ")
    title = f"Session Summary: {title_seed}".strip()
    slug = slugify(log_file.stem)

    lines = [line.strip() for line in content.splitlines() if line.strip()]
    excerpt = "\n".join(lines[:20])[:1800].strip()
    summary = (
        f"Rezumat generat automat din `{log_file.name}`. "
        f"Cuvinte-cheie detectate: {', '.join(keywords) if keywords else 'n/a'}."
    )
    links = "\n".join(f"- {keyword}" for keyword in keywords[:5]) or "- Nicio conexiune detectată automat"

    return {
        "title": title,
        "slug": slug,
        "summary": summary,
        "details": excerpt or "Nu există suficient conținut pentru extragere.",
        "links": links,
    }


def write_compiled_marker(log_file: Path, vault_path: Path) -> None:
    compiled_dir = vault_path / "wiki" / "compiled"
    ensure_dir(compiled_dir)
    marker = compiled_dir / f"{log_file.stem}.md"
    marker.write_text(
        f"# Compiled Marker\n\n- Source: [[../daily/{log_file.name}]]\n- Compiled at: {datetime.now().isoformat()}\n",
        encoding="utf-8",
    )


def write_concept_page(log_file: Path, vault_path: Path) -> Path:
    concept = build_concept(log_file)
    concepts_dir = vault_path / "wiki" / "concepts"
    ensure_dir(concepts_dir)

    target = concepts_dir / f"{concept['slug']}.md"
    target.write_text(
        "\n".join(
            [
                f"# {concept['title']}",
                "",
                "## Rezumat",
                concept["summary"],
                "",
                "## Detalii",
                concept["details"],
                "",
                "## Conexiuni",
                concept["links"],
                "",
                "## Sursă",
                f"- [[../daily/{log_file.name}]]",
                "",
                "> Notă: această pagină este compilată automat și poate fi rafinată manual.",
            ]
        ) + "\n",
        encoding="utf-8",
    )
    return target


def update_index(vault_path: Path, created_pages: list[Path]) -> None:
    if not created_pages:
        return

    index_file = vault_path / "wiki" / "index.md"
    if index_file.exists():
        content = index_file.read_text(encoding="utf-8")
    else:
        content = "# Wiki Index\n\n"

    section_header = "## Pagini compilate automat"
    if section_header not in content:
        content = content.rstrip() + f"\n\n{section_header}\n"

    existing_lines = set(content.splitlines())
    additions = []
    for page in created_pages:
        line = f"- [[concepts/{page.stem}]]"
        if line not in existing_lines:
            additions.append(line)

    if additions:
        content = content.rstrip() + "\n" + "\n".join(additions) + "\n"
        index_file.write_text(content, encoding="utf-8")


def main() -> None:
    vault_path = resolve_vault_path()
    ensure_dir(vault_path)

    pending_logs = get_uncompiled_logs(vault_path)
    print(f"Found {len(pending_logs)} uncompiled logs")

    created_pages: list[Path] = []
    for log_file in pending_logs:
        page = write_concept_page(log_file, vault_path)
        write_compiled_marker(log_file, vault_path)
        created_pages.append(page)
        print(f"Compiled: {log_file.name} -> {page.name}")

    update_index(vault_path, created_pages)

    if created_pages:
        print(f"Created {len(created_pages)} concept page(s)")
    else:
        print("Nothing new to compile")


if __name__ == "__main__":
    main()
