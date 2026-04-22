#!/usr/bin/env python3
"""Lint the vault for broken links, orphan pages and other issues."""

from __future__ import annotations

import os
import re
from pathlib import Path


LINK_RE = re.compile(r"\[\[([^\]]+)\]\]")


def resolve_vault_path() -> Path:
    env_path = os.environ.get("VAULT_PATH")
    if env_path:
        return Path(env_path).expanduser().resolve()
    return (Path(__file__).resolve().parents[1] / "vault").resolve()


def markdown_files(root: Path) -> list[Path]:
    return [file for file in root.rglob("*.md") if file.is_file()]


def build_existing_names(files: list[Path], vault_path: Path) -> set[str]:
    names: set[str] = set()
    for file in files:
        names.add(file.stem)
        names.add(str(file.relative_to(vault_path)).replace("\\", "/").removesuffix(".md"))
    return names


def check_broken_links(files: list[Path], existing: set[str]) -> list[tuple[Path, str]]:
    broken: list[tuple[Path, str]] = []
    ignored_targets = {"nume-pagina", "folder/pagina"}

    for file in files:
        content = file.read_text(encoding="utf-8", errors="ignore")
        for raw_link in LINK_RE.findall(content):
            target = raw_link.split("|")[0].strip().replace(".md", "")
            if not target or target.endswith("/") or target in ignored_targets:
                continue
            base = target.split("/")[-1]
            if target not in existing and base not in existing:
                broken.append((file, raw_link))
    return broken


def find_orphans(files: list[Path]) -> list[Path]:
    refs: set[str] = set()
    by_stem = {file.stem: file for file in files}

    for file in files:
        content = file.read_text(encoding="utf-8", errors="ignore")
        for raw_link in LINK_RE.findall(content):
            refs.add(raw_link.split("|")[0].split("/")[-1].replace(".md", ""))

    orphans = [file for stem, file in by_stem.items() if stem not in refs and file.name != "index.md"]
    return sorted(orphans)


def find_short_pages(files: list[Path], min_words: int = 30) -> list[tuple[Path, int]]:
    short: list[tuple[Path, int]] = []
    ignored = {"log.md"}
    ignored_parts = {"daily", "compiled", "precompact"}
    for file in files:
        if file.name in ignored or any(part in ignored_parts for part in file.parts):
            continue
        words = len(file.read_text(encoding="utf-8", errors="ignore").split())
        if words < min_words:
            short.append((file, words))
    return short


def main() -> None:
    vault_path = resolve_vault_path()
    files = markdown_files(vault_path)
    existing = build_existing_names(files, vault_path)
    broken = check_broken_links(files, existing)
    orphans = find_orphans(files)
    short_pages = find_short_pages(files)

    print("=== VAULT LINT REPORT ===\n")

    if broken:
        print(f"❌ Broken links: {len(broken)}")
        for file, link in broken[:20]:
            print(f"- {file.relative_to(vault_path)} -> [[{link}]]")
    else:
        print("✅ No broken links")

    if orphans:
        print(f"\n⚠️ Orphan pages: {len(orphans)}")
        for file in orphans[:20]:
            print(f"- {file.relative_to(vault_path)}")
    else:
        print("\n✅ No orphan pages")

    if short_pages:
        print(f"\n⚠️ Short pages: {len(short_pages)}")
        for file, words in short_pages[:20]:
            print(f"- {file.relative_to(vault_path)} ({words} words)")
    else:
        print("\n✅ No short pages")

    print("\n=== END REPORT ===")


if __name__ == "__main__":
    main()
