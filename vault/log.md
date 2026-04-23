# Activity Log

## Format
- [YYYY-MM-DD HH:MM] Operație: descriere scurtă

## Sesiuni recente
- [2026-04-23 00:00] Inițializare: creat sistemul de memorie pentru proiect.
- [2026-04-23 00:00] Wiki: adăugate paginile `project-overview` și `architecture` pentru onboarding de agenți.
- [2026-04-23 00:48] Sesiune: salvat context în `wiki/daily/session_2026-04-23_00-48-20.md`
- [2026-04-23 00:00] Wiki: documentate suita de testare Playwright și quality gates CI/CD + pre-commit.
- [2026-04-23 00:00] Comenzi: adăugate slash commands locale pentru onboarding și actualizare memorie în `.claude/commands/`.
- [2026-04-23 00:00] Comenzi: adăugată comanda `/close-task` pentru închidere task, persistare memorie și verificare status repo.
- [2026-04-23] UI: bloc BNM din header — "Actualizat" afișat în verde (emerald-500), "Offline" în roșu (rose-500) la eroare. Fișier: `src/App.tsx:60`.
- [2026-04-23] Repo: adăugat `playwright-report/`, `test-results/`, `.playwright-mcp/` în `.gitignore`. Scos `test-results/.last-run.json` din tracking.
- [2026-04-23 11:45] Deploy: fixat workflow Cloudflare Pages — `projectName` corectat la `calc-myavvo-standalone`, adăugat `deployments: write`, push-uit branch `bento-final`. Deploy reușit, 19/19 teste passed.
- [2026-04-23 12:30] Wiki cleanup: șters artefact test `wiki/daily/session_2026-04-23_00-48-20.md` și `concepts/session-2026-04-23-00-48-20.md`. Adăugate pagini noi: `branch-strategy` și `ui-ux-decisions`.
- [2026-04-23] Feature: adăugat câmp "Calcul efectuat de:" în CalculatorDobanda și CalculatorPenalitate (pas 7/8 în formular). Câmpul apare în PDF ca "Calcul efectuat de: [nume]". Fișiere: `src/components/CalculatorDobanda.tsx`, `src/components/CalculatorPenalitate.tsx`, `src/utils/pdfExport.ts`.
- [2026-04-23] Fix: PDF Detaliat — Dobânda trimite acum `displayRows` (expandat zi cu zi). Penalitate: adăugat `expandDetailed`, fixat tabel UI și PDF să respecte `displayMode`.
- [2026-04-23] Fix: dropdown CurrencySelector era transparent din cauza că toate variabilele CSS (`--surface`, `--input-bg`) folosesc `rgba()`. Adăugat `--dropdown-bg: #ffffff` (light) / `#0f172a` (dark) în `index.css`. Fișier: `src/components/CurrencySelector.tsx`, `src/index.css`.
