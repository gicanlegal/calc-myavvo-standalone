#!/usr/bin/env python3
"""Save end-of-session conversation context into the vault."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


MAX_MESSAGES = 30


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
        parts: list[str] = []
        for item in content:
            if isinstance(item, dict):
                text = item.get("text") or item.get("content") or json.dumps(item, ensure_ascii=False)
                parts.append(str(text))
            else:
                parts.append(str(item))
        return "\n".join(parts)
    if isinstance(content, dict):
        return json.dumps(content, ensure_ascii=False, indent=2)
    return str(content)


def save_session_messages(messages: list[dict[str, Any]], vault_path: Path) -> Path:
    output_dir = vault_path / "wiki" / "daily"
    ensure_dir(output_dir)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    file_path = output_dir / f"session_{timestamp}.md"

    lines = [f"# Session {timestamp}", ""]
    for msg in messages[-MAX_MESSAGES:]:
        role = str(msg.get("role", "unknown")).upper()
        content = stringify_content(msg.get("content", ""))
        lines.append(f"## {role}")
        lines.append("")
        lines.append(content.strip() or "(empty)")
        lines.append("")

    file_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    return file_path


def append_log(vault_path: Path, session_file: Path) -> None:
    log_file = vault_path / "log.md"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    line = f"- [{timestamp}] Sesiune: salvat context în `{session_file.relative_to(vault_path)}`\n"

    if log_file.exists():
        current = log_file.read_text(encoding="utf-8")
    else:
        current = "# Activity Log\n\n## Sesiuni recente\n"

    log_file.write_text(current.rstrip() + "\n" + line, encoding="utf-8")


def trigger_compile(vault_path: Path) -> None:
    compile_script = Path(__file__).resolve().parents[1] / "compile.py"
    if not compile_script.exists():
        return

    env = os.environ.copy()
    env["VAULT_PATH"] = str(vault_path)
    subprocess.Popen(
        [sys.executable, str(compile_script)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        env=env,
    )


def main() -> None:
    raw = sys.stdin.read().strip()
    if not raw:
        print("No session payload received")
        return

    messages = json.loads(raw)
    if not isinstance(messages, list):
        raise ValueError("Expected a JSON list of messages")

    vault_path = resolve_vault_path()
    ensure_dir(vault_path)

    session_file = save_session_messages(messages, vault_path)
    append_log(vault_path, session_file)
    trigger_compile(vault_path)

    print(f"Session saved to: {session_file}")


if __name__ == "__main__":
    main()
