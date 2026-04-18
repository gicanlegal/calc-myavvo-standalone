# Calculator Juridic — Standalone

Calculator juridic pentru Republica Moldova, versiune standalone (fără server, fără login).

**Funcționează offline** după prima încărcare (CDN-urile sunt cache-uite de browser).

## Ce include

- **Dobândă legală** — conform art. 874 Cod Civil RM (rata BNM + procent suplimentar)
- **Penalitate contractuală** — calcul penalități pe zi, cu sau fără limită
- **Taxă de stat** — conform Legii 213/2023, toate pragurile + instanțe (Fond/Apel/Recurs/Revizuire)
- **Calculator termene** — zile calendaristice și lucrătoare, data+date sau data+zile

Toate calculatoarele: export PDF profesional, temă light/dark, responsive (mobil + desktop).

## Cum rulezi

### Opțiunea 1 — Direct în browser
Deschide `index.html` în orice browser modern (Chrome, Firefox, Safari, Edge).

### Opțiunea 2 — Server local (pentru testare)
```bash
npx serve .
# Deschide http://localhost:3000
```

### Opțiunea 3 — Testare automată
```bash
npm install
npx playwright install
npm test
```

## Integrare în alte proiecte

### Iframe (simplu)
```html
<iframe src="calc/index.html" width="100%" height="900" style="border:none;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.1)"></iframe>
```

### Copiere directă
Copiază `index.html`, `logo.png`, `qr-calc.png` în proiectul tău. Calculatorul funcționează independent, 0 dependințe.

### Mobile (Capacitor)
```bash
npm install
npx cap init "MyCalc" "com.example.calc" --web-dir=.
npx cap add ios
npx cap add android
npx cap open ios  # sau android
```

Vezi `docs/INTEGRATION.md` pentru ghid detaliat.

## Rate BNM

Calculatorul include ~85 de rate istorice BNM (din 2009). Pentru rate actualizate, apasă "Actualizează" — calculatorul face fetch de la proxy-ul BNM (configurat în `BU`). Dacă proxy-ul nu e disponibil, folosește datele locale.

## Temei legal

- **Dobândă:** art. 874 Cod Civil RM — dobânda de întârziere = rata BNM + 9% (non-consumatori) sau + 5% (consumatori)
- **Penalitate:** calculul este conform principiilor din art. 874-878 CC RM
- **Taxă de stat:** Legea taxei de stat Nr. 213 din 31.07.2023

## Structură fișiere

```
calc-myavvo-standalone/
├── index.html              ← Calculatorul complet (single-file)
├── logo.png                ← Logo pentru PDF
├── qr-calc.png             ← QR pentru PDF
├── workers/
│   └── cloudflare-worker-bnm.js  ← Cloudflare Worker proxy BNM (opțional)
├── tests/
│   └── formulas.spec.js    ← Teste Playwright pentru verificare formule
├── docs/
│   ├── INTEGRATION.md      ← Ghid integrare (iframe, Capacitor, PWA)
│   └── STAGE2-MODULARIZATION.md  ← Briefing pentru etapa 2 (modularizare)
├── package.json
├── playwright.config.js
└── README.md
```

## Git — cum push pe GitHub

1. Creează un repo nou pe GitHub (fără README)
2. În mapa `calc-myavvo-standalone`:
```bash
git init
git add .
git commit -m "initial: standalone calculator extracted from calc-myavvo"
git remote add origin https://github.com/THE-username/THE-repo.git
git push -u origin main
```

## Proprietar
**Gheorghe Macovei** — avocat, Republica Moldova