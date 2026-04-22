# Project Overview

## Rezumat
`calc-myavvo-standalone` este o aplicație standalone construită cu React, TypeScript și Vite pentru calcule juridice relevante în Republica Moldova. Aplicația oferă mai multe module de calcul într-o interfață unificată și include integrare pentru rate BNM, export PDF și suport de theming.

## Scop
Proiectul urmărește să ofere un calculator juridic reutilizabil și ușor de integrat, orientat către brandul myAVVO / Hub Juridic Moldova.

## Module funcționale principale
- **Dobândă legală**
- **Penalitate**
- **Taxă de stat**
- **Calculator zile**

## Tehnologii
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Playwright pentru testare
- jsPDF + jspdf-autotable pentru export PDF
- integrare rate BNM prin utilitare dedicate

## Fișiere și zone importante
- `src/App.tsx` - shell-ul principal al aplicației, tab-uri și status BNM
- `src/components/` - componente UI și calculatoare pe module
- `src/utils/bnmRates.ts` - inițializare și management al ratelor BNM
- `src/utils/pdfExport.ts` - export PDF
- `docs/INTEGRATION.md` - ghid de integrare externă
- `docs/STAGE2-MODULARIZATION.md` - direcție arhitecturală pentru modularizare

## Stare curentă observată
- proiectul rulează ca aplicație Vite standalone
- există suită Playwright activă cu 19 teste în 6 fișiere, raportată ca 19/19 passed
- există bază de memorie persistentă în `vault/`
- există quality gates locale și CI înainte de deploy
- există orientare spre modularizare și eventuală integrare mai largă

## Conexiuni
- [[architecture]]
- [[testing-strategy]]
- [[ci-cd-and-quality-gates]]
- [[../index]]
- [[../../CLAUDE]]

## Sursă
- `src/App.tsx`
- `src/main.tsx`
- `package.json`
- `docs/INTEGRATION.md`
- `docs/STAGE2-MODULARIZATION.md`
- `CHANGELOG.md`
