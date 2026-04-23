# CI/CD and Quality Gates

## Rezumat
Proiectul are mecanisme de calitate atât local, cât și în CI. Există pre-commit hooks cu Husky + lint-staged, iar workflow-ul principal de Cloudflare Pages rulează testele înainte de deploy.

## Pre-commit local

### Configurație observată
- `package.json` include scriptul `"prepare": "husky"`
- `package.json` include `lint-staged`
- hook-ul `.husky/pre-commit` rulează `npx lint-staged`

### Ce rulează pe fișiere staged
Conform `package.json`:
- `eslint --fix`
- `tsc --noEmit`

Aceasta creează un filtru de calitate înainte de commit pentru fișierele TypeScript și TSX staged.

## GitHub Actions

### Workflow principal observat
Fișier: `.github/workflows/cloudflare-pages.yml`

### Structură
Workflow-ul are două joburi:
1. `test`
2. `deploy`

### Ordine de rulare
Jobul `test` execută:
- checkout
- setup Node.js
- `npm ci`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- instalare Playwright Chromium
- `npx playwright test`
- upload artifact pentru `playwright-report`

Jobul `deploy` are:
- `needs: test`
- deploy la Cloudflare Pages doar după succesul testelor

## Implicații
- dacă lint-ul, type-check-ul, build-ul sau testele Playwright pică, deploy-ul este blocat
- raportul Playwright este păstrat ca artifact pentru debugging
- există un minim set de quality gates consistente între local și CI

## Verificări raportate
Starea raportată în proiect:
- `npm run lint` — 0 erori
- `npx tsc --noEmit` — 0 erori
- `npm run build` — succes
- `npx playwright test` — 19/19 passed

## Observații
- în `.github/workflows/` există și alte workflow-uri, deci acest fișier nu este singurul workflow din repo
- pentru onboarding agenți, `cloudflare-pages.yml` este un workflow-cheie deoarece leagă validarea de deploy
- `projectName` din workflow trebuie să corespundă exact cu numele proiectului din Cloudflare Dashboard
- permisiunea `deployments: write` este necesară pentru `cloudflare/pages-action@v1` ca să poată crea GitHub Deployment

## Probleme întâlnite și rezolvate
1. **Project not found (404)** — `projectName` era `calc-myavvo` în loc de `calc-myavvo-standalone`. Fix: actualizat în workflow.
2. **Resource not accessible by integration (403)** — lipsea `deployments: write` în `permissions`. Fix: adăugat.
3. **Branch nepushuit** — commit-urile cu modificări erau doar în local. Fix: `git push origin bento-final`.

## Conexiuni
- [[testing-strategy]]
- [[project-overview]]
- [[architecture]]

## Sursă
- `package.json`
- `.husky/pre-commit`
- `.github/workflows/cloudflare-pages.yml`
