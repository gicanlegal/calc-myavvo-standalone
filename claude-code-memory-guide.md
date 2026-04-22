# Ghid Detaliat de Implementare: Sistem de Memorie pentru Claude Code (Metoda Karpathy)

Acest document conține instrucțiuni pas cu pas pentru implementarea sistemului de memorie persistentă pentru Claude Code, bazat pe metoda lui Andrej Karpathy.

---

## Cuprins

1. [Arhitectura Sistemului](#1-arhitectura-sistemului)
2. [Configurare de Bază - 5 Minute](#2-configurare-de-bază---5-minute)
3. [Instalare Obsidian și Configurare](#3-instalare-obsidian-și-configurare)
4. [Configurare Chrome Web Clipper](#4-configurare-chrome-web-clipper)
5. [Nivel Avansat: Hooks Automatice](#5-nivel-avansat-hooks-automate)
6. [Scripturi Utilitare](#6-scripturi-utilitare)
7. [Interogări Wiki din Terminal](#7-interogări-wiki-din-terminal)
8. [Verificare și Lint](#8-verificare-și-lint)

---

## 1. Arhitectura Sistemului

Sistemul funcționează pe 4 etape, analoge unui compilator:

| Etapa | Analog | Descriere |
|-------|--------|-----------|
| 1 | **Source Code (RAW)** | Date brute: articole, PDF, transcrisuri |
| 2 | **Compiler (LLM)** | Claude procesează și creează Wiki |
| 3 | **Executable (Wiki)** | Wiki gata cu index, concepte, legături |
| 4 | **Testing (Linting)** | Verificare automată pentru erori |

### Structura de Foldere

```
vault/
├── raw/                    # Date brute (nemodificate)
├── wiki/                   # Knowledge base procesată
│   ├── index.md           # Index principal - citește primul
│   └── [topic]/           # Subfoldere pe topic
│       └── index.md       # Index per topic
├── index.md               # Index principal la rădăcină
├── CLAUDE.md              # Reguli pentru agent
└── log.md                 # Istoric operațiuni
```

---

## 2. Configurare de Bază - 5 Minute

### Pasul 2.1: Creează Structura de Foldere Manual

```bash
# Creează structura de bază
mkdir -p vault/{raw,wiki}
touch vault/index.md vault/CLAUDE.md vault/log.md

# Verifică structura
tree vault/
```

### Pasul 2.2: Creează Fișierul Index Principal

```markdown
<!-- vault/index.md -->
# Knowledge Base Index

Acest fișier este punctul de intrare pentru agent. Citește-l primul.

## Structură
- [[raw/]] - Date brute neprocesate
- [[wiki/]] - Knowledge base procesată

## Topicuri Principale
<!-- Adaugă linkuri către subsection index-uri -->

## Utilizare
Agentul trebuie să:
1. Citească acest index la începutul fiecărei sesiuni
2. Navigheze către wiki-ul relevant folosind linkurile
3. Actualizeze index-ul când adaugă informații noi
```

### Pasul 2.3: Creează Fișierul CLAUDE.md

```markdown
<!-- vault/CLAUDE.md -->
# Reguli pentru Claude Code

## Rol
Ești un agent AI specializat în gestionarea cunoștințelor. Tratezi informația ca pe cod.

## Navigare Wiki
1. La fiecare sesiune nouă, citește mai întâi `vault/index.md`
2. Din index, navighează către wiki-urile relevante
3. Folosește linkuri bidirecționale între documente

## Reguli de Update
- Când procesezi articole RAW, creează multiple wiki-uri
- Rezumă conceptele cheie din fiecare articol
- Creează linkuri către documente asociate
- Actualizează index-ul după adăugarea informațiilor noi

## Optimizare Tokeni
- Nu rescrie aceeași informație de mai multe ori
- Folosește referințe către documente existente
- Menține wiki-urile concise dar complete

## Linting
- Verifică periodic pentru link-uri broken
- Identifică pagini orfane (fără referințe)
- Asigură coerența între documente
```

### Pasul 2.4: Creează Fișierul Log

```markdown
<!-- vault/log.md -->
# Activity Log

## Format
- [DATE] Operație: Descriere

## Sesiuni Recente
<!-- Adaugă intrare nouă pentru fiecare operație -->
```

---

## 3. Instalare Obsidian și Configurare

### Pasul 3.1: Instalează Obsidian

```bash
# Pentru Linux (AppImage)
wget https://github.com/obsidianmd/obsidian-releases/releases/latest/download/obsidian.asar -O ~/obsidian.asar

# Pentru macOS (Homebrew)
brew install --cask obsidian

# Pentru Windows - descarcă de pe https://obsidian.md
```

### Pasul 3.2: Creează Vault-ul în Obsidian

```bash
# Deschide Obsidian și creează un vault nou
# File > Open Vault > New Vault
# Numele vault-ului: karpathy-demo (sau ce dorești)
# Locația: ~/vault
```

**minimax note:** Dacă ai deja un vault existent, îl poți folosi direct. Obsidian va detecta automat folderul `vault/` creat manual.

### Pasul 3.3: Activează Graph View (Opțional)

```bash
# În Obsidian:
# 1. Settings (roțița) > Community plugins > Browse
# 2. Caută "Graph View"
# 3. Instalează și activează
# 4. Apasă pe iconița de graf în sidebar pentru a vedea conexiunile
```

---

## 4. Configurare Chrome Web Clipper

### Pasul 4.1: Instalează Extensia

```bash
# În Chrome:
# 1. Accesează Chrome Web Store
# 2. Caută "Obsidian Web Clipper"
# 3. Instalează extensia
```

### Pasul 4.2: Configurează Șablonul

```bash
# 1. Click pe iconița Web Clipper în Chrome
# 2. Setări (roata dințată)
# 3. Templates > Create/Edit template
# 4. În câmpul "Note Location" modifică:
#    DE LA: {{clippings}}
#    LA: {{vault}}/raw/
```

### Pasul 4.3: Instalează Plugin Local Images Plus

```bash
# În Obsidian:
# 1. Settings > Community plugins > Browse
# 2. Caută "Local Images Plus"
# 3. Instalează
# 4. Revino la Community plugins și activează "Local Images Plus"
```

**minimax note:** Fără acest plugin, Web Clipper va insera doar link-uri către imagini, nu imaginile efective. La procesarea RAW, imaginile vor fi goale.

---

## 5. Nivel Avansat: Hooks Automate

Acest nivel adaugă memorie automată - Claude Code va salva singur cunoștințele.

### Pasul 5.1: Clonează Repositoriul

```bash
# Clonează repositoriul claude-memory-compiler
git clone https://github.com/coleam00/claude-memory-compiler.git

# Verifică structura
ls -la claude-memory-compiler/
```

### Pasul 5.2: Instalează Dependințele

```bash
# Intră în folder
cd claude-memory-compiler

# Instalează cu uv (sau pip)
uv sync

# SAU dacă nu ai uv:
pip install -r requirements.txt
```

### Pasul 5.3: Copiază Hook-urile în Proiect

```bash
# Copiază toate fișierele necesare
cp -r hooks/ ~/.claude/hooks/
cp scripts/* ~/projects/your-project/
cp -r vault ~/projects/your-project/

# Verifică copierea
ls -la ~/.claude/hooks/
```

### Pasul 5.4: Configurează Hook-ul session-start.py

```python
#!/usr/bin/env python3
"""
session-start.py - "Memoria de pornire"
Se execută la începutul fiecărei sesiuni Claude Code.
Citește index.md și ultimul daily log, le adaugă în context.
"""

import sys
import os
from pathlib import Path

def get_wiki_index(vault_path: str) -> str:
    """Citește index-ul principal al wiki-ului."""
    index_file = Path(vault_path) / "index.md"
    if index_file.exists():
        return index_file.read_text()
    return ""

def get_latest_daily_log(vault_path: str) -> str:
    """Citește ultimul daily log."""
    log_dir = Path(vault_path) / "wiki" / "daily"
    if not log_dir.exists():
        return ""

    # Găsește cel mai recent fișier log
    log_files = sorted(log_dir.glob("*.md"), key=os.path.getmtime, reverse=True)
    if log_files:
        return log_files[0].read_text()
    return ""

def main():
    vault_path = os.environ.get("VAULT_PATH", "./vault")

    index_content = get_wiki_index(vault_path)
    daily_log = get_latest_daily_log(vault_path)

    # Trimite la stdout pentru a fi captat de Claude
    if index_content or daily_log:
        print("=== CONTEXT MEMORY ===")
        if index_content:
            print(f"\n## Wiki Index:\n{index_content}")
        if daily_log:
            print(f"\n## Latest Daily Log:\n{daily_log}")
        print("=== END CONTEXT ===\n")

if __name__ == "__main__":
    main()
```

### Pasul 5.5: Configurează Hook-ul session-end.py

```python
#!/usr/bin/env python3
"""
session-end.py - "Memoria de salvare"
Se execută la închiderea sesiunii.
Salvează ultimele 30 de mesaje și compilează un rezumat.
"""

import sys
import json
import os
from datetime import datetime
from pathlib import Path

def save_session_messages(messages: list, output_dir: str) -> str:
    """Salvează mesajele sesiunii într-un fișier temporar."""
    output_path = Path(output_dir) / "wiki" / "daily"
    output_path.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
    filename = f"session_{timestamp}.md"
    filepath = output_path / filename

    # Conversie la markdown
    content = f"# Session {timestamp}\n\n"
    for msg in messages[-30:]:  # Ultimele 30 de mesaje
        role = msg.get("role", "user")
        content += f"**{role.upper()}**:\n{msg.get('content', '')}\n\n"

    filepath.write_text(content)
    return str(filepath)

def trigger_flush():
    """Pornește procesul de compilare în fundal."""
    compile_script = Path(__file__).parent / "compile.py"
    if compile_script.exists():
        os.system(f"python3 {compile_script} &")

def main():
    # Citește mesajele din stdin (transmise de Claude)
    messages = json.loads(sys.stdin.read())

    vault_path = os.environ.get("VAULT_PATH", "./vault")

    # Salvează sesiunea
    saved_file = save_session_messages(messages, vault_path)
    print(f"Session saved to: {saved_file}")

    # Pornește compilarea în fundal
    trigger_flush()

if __name__ == "__main__":
    main()
```

### Pasul 5.6: Configurează Hook-ul pre-compact.py

```python
#!/usr/bin/env python3
"""
pre-compact.py - "Memoria de siguranță"
Se execută înainte de comprimarea contextului.
Salvează toate mesajele pentru a nu pierde nimic.
"""

import sys
import json
import os
from datetime import datetime
from pathlib import Path

def save_precompact_messages(messages: list, vault_path: str):
    """Salvează mesajele înainte de comprimare."""
    output_dir = Path(vault_path) / "wiki" / "precompact"
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
    filename = f"precompact_{timestamp}.md"
    filepath = output_dir / filename

    content = f"# Pre-Compact Backup {timestamp}\n\n"
    for msg in messages:
        role = msg.get("role", "unknown")
        content += f"**{role.upper()}**:\n{msg.get('content', '')}\n\n"

    filepath.write_text(content)
    return str(filepath)

def main():
    messages = json.loads(sys.stdin.read())
    vault_path = os.environ.get("VAULT_PATH", "./vault")

    saved_file = save_precompact_messages(messages, vault_path)
    print(f"Pre-compact backup saved: {saved_file}")

if __name__ == "__main__":
    main()
```

### Pasul 5.7: Adaugă Hook-urile în Configurația Claude

```bash
# Creează sau editează ~/.claude/settings.json
cat >> ~/.claude/settings.json << 'EOF'
{
  "hooks": {
    "session_start": {
      "command": "python3",
      "args": ["~/.claude/hooks/session-start.py"],
      "env": {
        "VAULT_PATH": "~/projects/your-project/vault"
      }
    },
    "session_end": {
      "command": "python3",
      "args": ["~/.claude/hooks/session-end.py"],
      "env": {
        "VAULT_PATH": "~/projects/your-project/vault"
      }
    },
    "pre_compact": {
      "command": "python3",
      "args": ["~/.claude/hooks/pre-compact.py"],
      "env": {
        "VAULT_PATH": "~/projects/your-project/vault"
      }
    }
  }
}
EOF
```

---

## 6. Scripturi Utilitare

### Pasul 6.1: Scriptul compile.py

```python
#!/usr/bin/env python3
"""
compile.py - Compilatorul de Conștințe
Transformă log-urile brute în wiki-uri structurate.
"""

import os
import sys
from pathlib import Path
from datetime import datetime

def get_uncompiled_logs(vault_path: str) -> list:
    """Găsește toate log-urile necompilate."""
    daily_dir = Path(vault_path) / "wiki" / "daily"
    if not daily_dir.exists():
        return []

    compiled_dir = Path(vault_path) / "wiki" / "compiled"
    compiled_files = set(f.stem for f in compiled_dir.glob("*.md")) if compiled_dir.exists() else set()

    uncompiled = []
    for log_file in daily_dir.glob("*.md"):
        if log_file.stem not in compiled_files:
            uncompiled.append(log_file)

    return uncompiled

def compile_log_to_wiki(log_file: Path, vault_path: str) -> str:
    """Compilează un log în wiki-uri individuale."""
    content = log_file.read_text()

    # EXTRAGERE CONCEPTE (prompt pentru LLM)
    # În producție, aici ai trimite către Claude API
    concepts = extract_concepts(content)

    # CREARE WIKI-URI
    wiki_dir = Path(vault_path) / "wiki" / "concepts"
    wiki_dir.mkdir(parents=True, exist_ok=True)

    created_files = []
    for concept in concepts:
        filename = f"{concept['slug']}.md"
        filepath = wiki_dir / filename

        wiki_content = f"""# {concept['title']}

## Rezumat
{concept['summary']}

## Detalii
{concept['details']}

## Conexiuni
{concept.get('links', '')}

## Sursă
- Log original: [[../daily/{log_file.name}]]
"""

        filepath.write_text(wiki_content)
        created_files.append(str(filepath))

    return created_files

def extract_concepts(content: str) -> list:
    """Extrage concepte din conținut. Necesită LLM."""
    # NOTĂ: Aici trebuie să integrezi Claude API
    # Pentru demo, returnez structură placeholder
    return [
        {
            "title": "Concept Extras",
            "slug": "concept-1",
            "summary": "Placeholder - integrate Claude API",
            "details": content[:500],
            "links": ""
        }
    ]

def update_index(vault_path: str, new_pages: list):
    """Actualizează index-ul principal."""
    index_file = Path(vault_path) / "index.md"

    if index_file.exists():
        content = index_file.read_text()
    else:
        content = "# Knowledge Base Index\n\n"

    # Adaugă legături către noile pagini
    content += "\n## Pagini Noi Compilate\n"
    for page in new_pages:
        content += f"- [[wiki/concepts/{Path(page).name}]]\n"

    index_file.write_text(content)

def main():
    vault_path = os.environ.get("VAULT_PATH", "./vault")

    uncompiled = get_uncompiled_logs(vault_path)
    print(f"Found {len(uncompiled)} uncompiled logs")

    all_created = []
    for log_file in uncompiled:
        print(f"Compiling: {log_file.name}")
        created = compile_log_to_wiki(log_file, vault_path)
        all_created.extend(created)

    if all_created:
        update_index(vault_path, all_created)
        print(f"Created {len(all_created)} wiki pages")

if __name__ == "__main__":
    main()
```

### Pasul 6.2: Scriptul query.py

```python
#!/usr/bin/env python3
"""
query.py - Interogare Wiki din Terminal
Răspunde la întrebări despre wiki fără a deschide Claude Code.
"""

import os
import sys
from pathlib import Path

def read_index(vault_path: str) -> str:
    """Citește index-ul principal."""
    index_file = Path(vault_path) / "index.md"
    if index_file.exists():
        return index_file.read_text()
    return ""

def find_relevant_docs(query: str, vault_path: str) -> list:
    """Găsește documentele relevante pentru query."""
    wiki_dir = Path(vault_path) / "wiki"
    relevant = []

    # Caută în toate fișierele markdown
    for md_file in wiki_dir.rglob("*.md"):
        if md_file.name == "index.md":
            continue

        content = md_file.read_text()
        # Simplu keyword matching - îmbunătățește cu embedding-uri
        query_lower = query.lower()
        if any(word in content.lower() for word in query_lower.split()):
            relevant.append(md_file)

    return relevant[:5]  # Max 5 documente

def synthesize_answer(query: str, docs: list) -> str:
    """Sintetizează răspunsul din documente."""
    if not docs:
        return "Nu am găsit informații relevante în wiki."

    # EXTRAGERE LLM (pentru producție)
    combined = "\n\n".join([f"## {d.name}\n{d.read_text()[:1000]}" for d in docs])

    answer = f"""## Răspuns la întrebarea: "{query}"

### Documente Consultate
{', '.join([f'[[{d.name}]]' for d in docs])}

### Conținut Relevant
{combined}

---
*Generat din {len(docs)} documente*
"""

    return answer

def main():
    if len(sys.argv) < 2:
        print("Utilizare: python query.py '<întrebarea ta>'")
        sys.exit(1)

    query = " ".join(sys.argv[1:])
    vault_path = os.environ.get("VAULT_PATH", "./vault")

    print(f"Întrebare: {query}\n")

    docs = find_relevant_docs(query, vault_path)
    answer = synthesize_answer(query, docs)

    print(answer)

if __name__ == "__main__":
    main()
```

### Pasul 6.3: Scriptul lint.py

```python
#!/usr/bin/env python3
"""
lint.py - Verificator de Sănătate Wiki
Verifică wiki-ul pentru erori și inconsistențe.
"""

import os
import re
from pathlib import Path
from collections import defaultdict

def check_broken_links(vault_path: str) -> list:
    """Găsește link-uri către fișiere inexistente."""
    wiki_dir = Path(vault_path) / "wiki"
    broken = []

    # Găsește toate fișierele existente
    existing = {f.stem: f for f in wiki_dir.rglob("*.md")}

    # Verifică fiecare fișier pentru link-uri
    for md_file in wiki_dir.rglob("*.md"):
        content = md_file.read_text()
        links = re.findall(r'\[\[([^\]]+)\]\]', content)

        for link in links:
            # Extrage numele fișierului din link
            link_name = link.split('/')[-1].replace('.md', '')
            if link_name not in existing and link not in existing:
                broken.append((md_file, link))

    return broken

def find_orphan_pages(vault_path: str) -> list:
    """Găsește pagini la care nimeni nu se referă."""
    wiki_dir = Path(vault_path) / "wiki"
    referenced = set()
    all_files = set()

    # Colectează toate fișierele
    for md_file in wiki_dir.rglob("*.md"):
        all_files.add(md_file.stem)

        # Găsește toate referințele
        content = md_file.read_text()
        links = re.findall(r'\[\[([^\]]+)\]\]', content)
        for link in links:
            link_name = link.split('/')[-1].replace('.md', '')
            referenced.add(link_name)

    # Paginile orfane sunt cele care nu sunt referențiate
    orphans = all_files - referenced
    orphans.discard('index')  # Exclude index-ul principal

    return list(orphans)

def find_uncompiled_logs(vault_path: str) -> list:
    """Găsește log-uri RAW care nu au fost compilate în wiki."""
    raw_dir = Path(vault_path) / "raw"
    wiki_dir = Path(vault_path) / "wiki"

    if not raw_dir.exists():
        return []

    # Găsește tot conținutul raw
    raw_files = {f.stem: f for f in raw_dir.rglob("*.md")}

    # Găsește tot conținutul wiki
    wiki_content = ""
    for f in wiki_dir.rglob("*.md"):
        wiki_content += f.read_text()

    uncompiled = []
    for stem, file in raw_files.items():
        if stem.lower() not in wiki_content.lower():
            uncompiled.append(file)

    return uncompiled

def find_empty_pages(vault_path: str, min_words: int = 200) -> list:
    """Găsește pagini goale sau prea scurte."""
    wiki_dir = Path(vault_path) / "wiki"
    empty = []

    for md_file in wiki_dir.rglob("*.md"):
        content = md_file.read_text()
        word_count = len(content.split())
        if word_count < min_words:
            empty.append((md_file, word_count))

    return empty

def main():
    vault_path = os.environ.get("VAULT_PATH", "./vault")

    print("=== WIKI LINT REPORT ===\n")

    # Verifică link-uri broken
    broken = check_broken_links(vault_path)
    if broken:
        print(f"❌ Broken Links ({len(broken)}):")
        for file, link in broken[:10]:
            print(f"   {file.name} -> {link}")
    else:
        print("✅ No broken links")

    # Verifică pagini orfane
    orphans = find_orphan_pages(vault_path)
    if orphans:
        print(f"\n⚠️ Orphan Pages ({len(orphans)}):")
        for page in orphans[:10]:
            print(f"   {page}")
    else:
        print("\n✅ No orphan pages")

    # Verifică log-uri necompilate
    uncompiled = find_uncompiled_logs(vault_path)
    if uncompiled:
        print(f"\n📄 Uncompiled Logs ({len(uncompiled)}):")
        for file in uncompiled[:10]:
            print(f"   {file.name}")
    else:
        print("\n✅ All logs compiled")

    # Verifică pagini goale
    empty = find_empty_pages(vault_path)
    if empty:
        print(f"\n⚠️ Empty Pages ({len(empty)}):")
        for file, count in empty[:10]:
            print(f"   {file.name} ({count} words)")
    else:
        print("\n✅ All pages have sufficient content")

    print("\n=== END REPORT ===")

if __name__ == "__main__":
    main()
```

---

## 7. Interogări Wiki din Terminal

### Utilizare Query Script

```bash
# Interogare simplă
python3 ~/projects/your-project/query.py "cum funcționează auth"

# Interogare complexă
python3 ~/projects/your-project/query.py "bugs cunoscute în API"

# Export rezultat în fișier
python3 ~/projects/your-project/query.py "arhitectura sistemului" > ~/research.md
```

### Adaugă Alias în ~/.bashrc

```bash
# Adaugă în ~/.bashrc
alias wiki-query='python3 ~/projects/your-project/query.py'
alias wiki-lint='python3 ~/projects/your-project/lint.py'
alias wiki-compile='python3 ~/projects/your-project/compile.py'

# Recaracterizare
source ~/.bashrc

# Utilizare
wiki-query "configurare nginx"
```

---

## 8. Verificare și Lint

### Rulare Manuală

```bash
# Verifică sănătatea wiki-ului
python3 ~/projects/your-project/lint.py

# Rulează compilarea pentru log-uri noi
python3 ~/projects/your-project/compile.py

# Ambele în secvență
wiki-lint && wiki-compile
```

### Automatizare cu Cron

```bash
# Editează crontab
crontab -e

# Adaugă linia pentru rulare zilnică la 18:00
0 18 * * * cd ~/projects/your-project && python3 lint.py >> logs/lint.log 2>&1

# Adaugă compilare nocturnă la 19:00
0 19 * * * cd ~/projects/your-project && python3 compile.py >> logs/compile.log 2>&1
```

**minimax note:** Rulează lint-ul înainte de compile pentru a identifica și marca problemele înainte de procesare.

---

## Troubleshooting

### Problema: Hook-urile nu se execută

```bash
# Verifică permisiunile
chmod +x ~/.claude/hooks/session-start.py
chmod +x ~/.claude/hooks/session-end.py
chmod +x ~/.claude/hooks/pre-compact.py

# Verifică căile în configurație
cat ~/.claude/settings.json
```

### Problema: Web Clipper nu salvează imaginile

```bash
# Verifică că plugin-ul Local Images Plus este activat
# Settings > Community plugins > Local Images Plus > Enabled

# Verifică că path-ul în Web Clipper conține "vault/raw"
```

### Problema: Wiki-ul crește prea mare

```markdown
<!-- În CLAUDE.md adaugă regulă de limitare -->
## Limitări Dimensiune
- Maxim 50 de pagini per topic
- Rezumate max 500 cuvinte per pagină
- Șterge pagini duplicate lunar
```

---

## Îmbunătățiri Recomandate

**minimax note:** Următoarele îmbunătățiri nu sunt acoperite în video dar sunt recomandate pentru producție:

### 1. Integrare Claude API pentru Compile

```python
# Adaugă în compile.py
import anthropic

client = anthropic.Anthropic()

def llm_summarize(text: str) -> str:
    """Rezumare cu Claude API."""
    response = client.messages.create(
        model="claude-opus-4",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"Rezumă acest text în puncte cheie:\n{text}"
        }]
    )
    return response.content[0].text
```

### 2. Backup Automat

```bash
# Adaugă în crontab pentru backup zilnic
0 20 * * * tar -czf ~/backups/vault_$(date +\%Y\%m\%d).tar.gz ~/projects/your-project/vault/
```

### 3. Multi-Project Wiki

```markdown
<!-- În ~/.claude/CLAUDE.md global -->
## Global Wiki Access
wiki_path: ~/global-vault/wiki
projects:
  - name: project-a
    vault: ~/projects/project-a/vault
  - name: project-b
    vault: ~/projects/project-b/vault
```

### 4. Metrici de Consum Tokeni

```python
# Adaugă în session-end.py
def track_token_usage():
    """Salvează metrici de consum."""
    # Calculează și salvează tokens per sesiune
    pass
```

### 5. Notificări Discord/Slack

```python
# Adaugă în compile.py pentru notificări
import requests

def send_notification(message: str, webhook_url: str):
    """Trimite notificare către Discord/Slack."""
    payload = {"content": message}
    requests.post(webhook_url, json=payload)
```

### 6. Auto-Tag și Categorizare

```python
# Adaugă în compile.py
def auto_categorize(concept: dict) -> list:
    """Auto-generez tags bazate pe conținut."""
    tags = []
    keywords = {
        "security": ["auth", "password", "encrypt", "token"],
        "bug": ["fix", "error", "issue", "crash"],
        "feature": ["add", "new", "implement", "create"],
        "config": ["set", "config", "env", "variable"]
    }

    content_lower = concept.get("details", "").lower()
    for category, words in keywords.items():
        if any(word in content_lower for word in words):
            tags.append(category)

    return tags
```

---

## Quick Reference Card

```
╔═══════════════════════════════════════════════════════════════╗
║                    QUICK REFERENCE                            ║
╠═══════════════════════════════════════════════════════════════╣
║  Setup:                                                       ║
║    mkdir -p vault/{raw,wiki}                                 ║
║    git clone https://github.com/coleam00/claude-memory-compiler.git ║
║                                                               ║
║  Hooks:                                                       ║
║    ~/.claude/hooks/session-start.py  → Memoria de pornire    ║
║    ~/.claude/hooks/session-end.py    → Salvare sesiune        ║
║    ~/.claude/hooks/pre-compact.py    → Backup pre-comprimare  ║
║                                                               ║
║  Scripts:                                                     ║
║    python3 query.py "<întrebare>"  → Interogare wiki          ║
║    python3 lint.py                → Verificare sănătate       ║
║    python3 compile.py             → Compilare log-uri         ║
║                                                               ║
║  Alias-uri (adaugă în ~/.bashrc):                             ║
║    alias wiki-query='python3 ~/path/query.py'                 ║
║    alias wiki-lint='python3 ~/path/lint.py'                   ║
║    alias wiki-compile='python3 ~/path/compile.py'            ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Referințe

- Repositoriu Original: `https://github.com/coleam00/claude-memory-compiler`
- Obsidian: `https://obsidian.md`
- Postarea Andrej Karpathy: X/Twitter

---

*Document generat pe baza video-ului "Wiki Memory for Claude Code" de Edward Grishin (FUTURAAI)*
