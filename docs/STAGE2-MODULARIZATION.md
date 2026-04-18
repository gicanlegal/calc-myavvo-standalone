# STAGE 2 — Modularizare Calculator

## Misiune

Refactorizarea calculatorului `index.html` (monolitic, ~870 linii JS) într-un modul web reutilizabil, cu **formulele protejate** (nu în plain-text), gata pentru integrare în portaluri, aplicații mobile (Capacitor), și distribution ca NPM package.

---

## Obiective principale

### 1. Arhitectură modulară

Separă codul în fișiere pe domenii funcționale:

```
src/
├── core/
│   ├── dobanda.js        ← Formula art.874 CC (rata BNM + procent, perioade, plăți)
│   ├── penalitate.js     ← Formula penalitate pe zi, limite, sold
│   ├── taxa-stat.js      ← Scara L.213/2023 cu toate pragurile
│   └── zile.js           ← Calculator zile calendaristice/lucrătoare
├── bnm/
│   ├── rates.js          ← Fetch + cache rate BNM (localStorage + fetch + RD fallback)
│   └── worker-proxy.js   ← Wrapper pentru Cloudflare Worker proxy BNM
├── ui/
│   ├── renderer.js       ← Randare DOM (tabs, card-uri, rezultate, tabele)
│   └── theme.js          ← Light/dark toggle, salvare în localStorage
├── pdf/
│   ├── export-dobanda.js
│   ├── export-penalitate.js
│   ├── export-taxa.js
│   ├── export-zile.js
│   └── pdf-common.js     ← _pdfHdr, _pdfFtr, _pdfStats, _pdfDate, loadLogoAndQr
└── main.js               ← Asamblează și exportă API-ul public
```

### 2. Build system

Tool: **Vite** + **Rollup** + **javascript-obfuscator**

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  input: 'src/main.js',
  output: {
    file: 'dist/myavvo-calc.min.js',
    format: 'iife',
    name: 'MyAvvoCalc',
    sourcemap: false,
  },
  plugins: [
    // obfuscare formulele din src/core/ cu javascript-obfuscator
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: { passes: 3 }
    }
  }
});
```

### 3. Protecția formulelor (CRITICAL)

Formulele nu trebuie să fie vizibile în plain-text în bundle-ul final. Opțiuni:

#### Opțiunea A — Ofuscare JavaScript (recomandat pentru independentă totală)
```javascript
// vite.config.js
import JavaScriptObfuscator from 'javascript-obfuscator';

function obfuscatePlugin() {
  return {
    name: 'obfuscate-formulas',
    transform(code, id) {
      if (id.includes('src/core/')) {
        return {
          code: JavaScriptObfuscator.obfuscate(code, {
            target: 'browser',
            compact: true,
            controlFlowFlattening: true,
            deadCodeInjection: true,
            stringArray: true,
            stringArrayThreshold: 0.8,
            rotateStringArray: true,
          }).getObfuscatedCode(),
          map: null,
        };
      }
      return null;
    }
  };
}
```

**Rezultat:** formulele critice (dobanda, taxa-stat, penalitate) vor fi complet ofuscate — variabile redenumite, string-uri criptate, control flow distorsionat. UI și PDF rămân lizibile.

#### Opțiunea B — Worker backend (maximă securitate)
Mută formulele critice în Cloudflare Worker / serverless:

```javascript
// src/core/dobanda.js — versiune proxy (formulele rămân pe server)
export async function calcDobanda(input) {
  const r = await fetch('https://your-worker.workers.dev/calc/dobanda', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' }
  });
  return r.json();
}
```

**Avantaje:** formule niciodată în browser. **Dezavantaje:** necesită conexiune online, dependință de server.

#### Opțiunea C — Hibrid (recomandat inițial)
- UI și PDF: plain JS (nu e sensibil)
- Taxă de stat (scara L.213/2023): ofuscat puternic
- Dobândă (art.874 CC): ofuscat mediu

### 4. API public

```typescript
interface CalcOptions {
  theme?: 'light' | 'dark' | 'auto';      // default: 'auto' (respectă sistemul)
  locale?: string;                        // default: 'ro-MD'
  currency?: string;                      // default: 'MDL'
  tabs?: string[];                        // default: ['dobanda','pen','taxa','zile']
  container?: string | HTMLElement;       // selector sau element
  onResult?: (type, result) => void;      // callback după calcul
  bnmProxyUrl?: string;                   // URL custom pentru rate BNM
}

// Mount calculator într-un container
mountCalculator('#calc-container', options);

// Sau ca Web Component
<myavvo-calculator theme="dark" tabs="dobanda,taxa" currency="EUR"></myavvo-calculator>
```

### 5. Bundle output

```javascript
// dist/
myavvo-calc.min.js   ← toate JS-urile (ofuscat + minificat)
myavvo-calc.css      ← toate CSS-urile (minificat)
myavvo-calc.d.ts      ← TypeScript definitions (opțional)
```

Integratorul copiază 2 fișiere și face:
```html
<link rel="stylesheet" href="myavvo-calc.css">
<script src="myavvo-calc.min.js"></script>
<div id="calc"></div>
<script>mountCalculator('#calc');</script>
```

### 6. Tests — verificare formule vs baseline

Versiunea modularizată TREBUIE să producă aceleași rezultate ca versiunea originală.

**Baza de test:** `tests/formula-baseline.json` din Stage 1.

```javascript
// tests/formulas-modular.spec.js
import { test, expect } from '@playwright/test';
import baseline from './formula-baseline.json';

for (const scenario of baseline.scenarios) {
  test(`${scenario.tab} - ${scenario.name}`, async ({ page }) => {
    // mount modular calculator
    await mountCalculator(page.locator('#calc'));
    // pre-completează datele
    await fillForm(scenario.input);
    // calculează
    await page.click(scenario.calcButton);
    // verifică rezultatul
    expect(scenario.output.total).toBeCloseTo(
      await page.locator(scenario.resultSelector).textContent(),
      { precision: 2 }
    );
  });
}
```

**Cerință:** 16/16 scenarii trec. Dacă pica unul → investighează și remediază înainte de a continua.

### 7. Mobile — Capacitor

Același bundle funcționează în Capacitor. După build Vite:

```bash
npx cap init "myAVVO Calc" "com.myavvo.calculator" --web-dir=dist
npx cap add ios
npx cap add android
npx cap sync
```

---

## Pași de implementare (ordine)

1. **Parsează `index.html` existent** — identifică granițele dintre `cD()`, `cP()`, `cT()`, `cZ()` (formulele), `_pdfHdr` etc. și creează fișierele corespondente în `src/`

2. **Extrage CSS** din `<style>` într-un `src/styles/main.css`

3. **Extrage template HTML** din `<body>` în `src/index.html`

4. **Implementează build Vite** cu obfuscare pe `src/core/`

5. **Creează `mountCalculator()` și `<myavvo-calculator>` Web Component

6. **Rulează tests/formulas.spec.js** pe versiunea modulară — trebuie să treacă 16/16

7. **Build release** → `dist/`

8. **Test Capacitor** (iOS simulator + Android emulator)

---

## Dependințe recomandate

```json
{
  "devDependencies": {
    "vite": "^5.0.0",
    "rollup": "^4.0.0",
    "javascript-obfuscator": "^4.0.0",
    "@playwright/test": "^1.59.1"
  }
}
```

## Timp estimat

~4-6 ore pentru un dezvoltator experimentat.

---

## Referințe

- Formula baseline: `tests/formula-baseline.json`
- Calculator original (Stage 1): `index.html`
- Ghid integrare: `docs/INTEGRATION.md`