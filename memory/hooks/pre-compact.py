#!/usr/bin/env python3
"""Backup full context before compaction."""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


def resolve_vault_path() -> Path:
    env_path = os.environ.get("VAULT_PATH")
    if env_path:
        return Path(env_path).expanduser().resolve()
    return (Path(__file__).resolve().parents[2] / "vault").resolve()


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def stringify_content(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        values: list[str] = []
        for item in content:
            if isinstance(item, dict):
                values.append(str(item.get("text") or item.get("content") or json.dumps(item, ensure_ascii=False)))
            else:
                values.append(str(item))
        return "\n".join(values)
    if isinstance(content, dict):
        return json.dumps(content, ensure_ascii=False, indent=2)
    return str(content)


def save_backup(messages: list[dict[str, Any]], vault_path: Path) -> Path:
    output_dir = vault_path / "wiki" / "precompact"
    ensure_dir(output_dir)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    file_path = output_dir / f"precompact_{timestamp}.md"

    lines = [f"# Pre-Compact Backup {timestamp}", ""]
    for msg in messages:
        role = str(msg.get("role", "unknown")).upper()
        content = stringify_content(msg.get("content", ""))
        lines.append(f"## {role}")
        lines.append("")
        lines.append(content.strip() or "(empty)")
        lines.append("")

    file_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    return file_path


def main() -> None:
    raw = sys.stdin.read().strip()
    if not raw:
        print("No pre-compact payload received")
        return

    messages = json.loads(raw)
    if not isinstance(messages, list):
        raise ValueError("Expected a JSON list of messages")

    vault_path = resolve_vault_path()
    ensure_dir(vault_path)
    saved_file = save_backup(messages, vault_path)
    print(f"Pre-compact backup saved: {saved_file}")


if __name__ == "__main__":
    main()
