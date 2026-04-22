# Testing Strategy

## Rezumat
Proiectul are o suită Playwright activă cu **19 teste** distribuite în **6 fișiere**, iar starea raportată este că toate trec. Strategia actuală acoperă smoke tests, funcționalitatea fiecărui calculator și validarea exportului PDF la nivel de stabilitate.

## Suite existente

### Smoke
Fișier: `tests/smoke.spec.ts`

Acoperă:
- încărcarea paginii și brandingul de bază
- navigarea între toate cele 4 tab-uri
- toggle dark/light mode
- statusul sau încărcarea ratelor BNM

### Calculator Dobândă
Fișier: `tests/calculator-dobanda.spec.ts`

Acoperă:
- validare formular când lipsesc datele
- calcul de dobândă pentru caz simplu
- adăugare și ștergere de plată

### Calculator Penalitate
Fișier: `tests/calculator-penalitate.spec.ts`

Acoperă:
- validare formular
- calcul de penalitate pentru caz simplu
- aplicarea limitei de 180 de zile

### Calculator Taxă
Fișier: `tests/calculator-taxa.spec.ts`

Acoperă:
- taxă patrimonială pentru persoană fizică
- taxă nepatrimonială
- schimbare instanță și recalculare

### Calculator Zile
Fișier: `tests/calculator-zile.spec.ts`

Acoperă:
- mod Data → Data
- mod Data + Zile
- opțiunea „Include prima zi”

### Export PDF
Fișier: `tests/pdf-export.spec.ts`

Acoperă verificarea că exportul PDF nu produce erori în consolă pentru modulele relevante.

## Status validat
- `npx playwright test --list` afișează 19 teste în 6 fișiere
- starea raportată: **19/19 passed**

## Observații
- testele sunt orientate pe comportament și UX critic
- PDF-ul este validat pentru stabilitate, nu pentru comparație binară a fișierului generat
- pentru regresii de formule, această suită este o bază bună, dar poate fi extinsă ulterior cu baseline numeric mai strict

## Conexiuni
- [[ci-cd-and-quality-gates]]
- [[project-overview]]
- [[architecture]]

## Sursă
- `tests/smoke.spec.ts`
- `tests/calculator-dobanda.spec.ts`
- `tests/calculator-penalitate.spec.ts`
- `tests/calculator-taxa.spec.ts`
- `tests/calculator-zile.spec.ts`
- `tests/pdf-export.spec.ts`
