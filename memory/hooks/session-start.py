#!/usr/bin/env python3
"""Load persistent memory context at session start."""

from __future__ import annotations

import os
from pathlib import Path


def resolve_vault_path() -> Path:
    env_path = os.environ.get("VAULT_PATH")
    if env_path:
        return Path(env_path).expanduser().resolve()
    return (Path(__file__).resolve().parents[2] / "vault").resolve()


def read_text_if_exists(path: Path) -> str:
    if path.exists() and path.is_file():
        return path.read_text(encoding="utf-8")
    return ""


def get_latest_markdown(directory: Path) -> str:
    if not directory.exists():
        return ""

    files = sorted(
        [file for file in directory.glob("*.md") if file.is_file()],
        key=lambda file: file.stat().st_mtime,
        reverse=True,
    )
    return read_text_if_exists(files[0]) if files else ""


def main() -> None:
    vault_path = resolve_vault_path()
    index_content = read_text_if_exists(vault_path / "index.md")
    rules_content = read_text_if_exists(vault_path / "CLAUDE.md")
    wiki_index_content = read_text_if_exists(vault_path / "wiki" / "index.md")
    latest_daily_log = get_latest_markdown(vault_path / "wiki" / "daily")

    if not any([index_content, rules_content, wiki_index_content, latest_daily_log]):
        return

    print("=== CONTEXT MEMORY ===")
    print(f"Vault: {vault_path}")

    if index_content:
        print("\n## vault/index.md\n")
        print(index_content)

    if rules_content:
        print("\n## vault/CLAUDE.md\n")
        print(rules_content)

    if wiki_index_content:
        print("\n## vault/wiki/index.md\n")
        print(wiki_index_content)

    if latest_daily_log:
        print("\n## Latest Daily Log\n")
        print(latest_daily_log)

    print("\n=== END CONTEXT ===")


if __name__ == "__main__":
    main()
