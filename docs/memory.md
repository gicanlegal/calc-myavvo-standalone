# Sistem de memorie al proiectului

Acest proiect include un sistem de memorie persistentă inspirat de metoda Karpathy / Claude Code Memory.

## Structură

- `vault/` - baza de cunoștințe persistentă
- `memory/hooks/` - hook-uri pentru integrare cu Claude Code
- `memory/compile.py` - compilează logurile de sesiune în pagini wiki
- `memory/query.py` - interoghează knowledge base-ul din terminal
- `memory/lint.py` - verifică sănătatea vault-ului

## Flux recomandat pentru agenți

1. Citește `vault/index.md`
2. Citește `vault/CLAUDE.md`
3. Citește `vault/wiki/index.md`
4. Consultă `vault/wiki/` după topic
5. Adaugă cunoștințe noi în wiki și actualizează indexurile

## Comenzi utile

```bash
npm run memory:lint
npm run memory:compile
python3 memory/query.py "implementare memorie"
```

## Integrare Claude Code

Hook-urile sunt păstrate în repo pentru portabilitate:

- `memory/hooks/session-start.py`
- `memory/hooks/session-end.py`
- `memory/hooks/pre-compact.py`

Exemplu de configurare în `~/.claude/settings.json`:

```json
{
  "hooks": {
    "session_start": {
      "command": "python3",
      "args": ["/Users/gheorghemacovei/Desktop/proiect_calc-myavvo-standalone/memory/hooks/session-start.py"],
      "env": {
        "VAULT_PATH": "/Users/gheorghemacovei/Desktop/proiect_calc-myavvo-standalone/vault"
      }
    },
    "session_end": {
      "command": "python3",
      "args": ["/Users/gheorghemacovei/Desktop/proiect_calc-myavvo-standalone/memory/hooks/session-end.py"],
      "env": {
        "VAULT_PATH": "/Users/gheorghemacovei/Desktop/proiect_calc-myavvo-standalone/vault"
      }
    },
    "pre_compact": {
      "command": "python3",
      "args": ["/Users/gheorghemacovei/Desktop/proiect_calc-myavvo-standalone/memory/hooks/pre-compact.py"],
      "env": {
        "VAULT_PATH": "/Users/gheorghemacovei/Desktop/proiect_calc-myavvo-standalone/vault"
      }
    }
  }
}
```

## Observații

- Memoria din repo poate fi folosită de orice agent care citește fișierele proiectului.
- Hook-urile automate depind de platforma agentului; exemplul de mai sus este pentru Claude Code.
- `compile.py` este un compilator local simplu, fără integrare LLM externă.
