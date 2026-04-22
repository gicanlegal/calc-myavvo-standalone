# calc-myavvo-standalone

Aplicație React + TypeScript + Vite.

## Comenzi principale

```bash
npm run dev
npm run build
npm run lint
npm run test
```

## Sistem de memorie pentru agenți

Proiectul include un sistem de memorie persistentă în repo, pentru a permite agenților să păstreze context util între sesiuni.

### Locații importante
- `vault/` - knowledge base persistentă
- `memory/hooks/` - hook-uri pentru Claude Code
- `memory/compile.py` - compilează logurile de sesiune în pagini wiki
- `memory/query.py` - caută în memorie din terminal
- `memory/lint.py` - verifică sănătatea memoriei
- `docs/memory.md` - documentație de utilizare și integrare

### Comenzi memorie

```bash
npm run memory:lint
npm run memory:compile
python3 memory/query.py "implementare memorie"
```

### Ordine recomandată pentru agenți
1. Citește `vault/index.md`
2. Citește `vault/CLAUDE.md`
3. Citește `vault/wiki/index.md`
4. Consultă paginile relevante din `vault/wiki/`

## Integrare hook-uri Claude Code

Hook-urile sunt versionate în proiect și pot fi conectate din `~/.claude/settings.json`.

Vezi:
- `docs/memory.md`
- `claude-code-memory-guide.md`
