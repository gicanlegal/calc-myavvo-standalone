# UI/UX Decisions

## Rezumat
Aplicația folosește un design system bazat pe glass morphism, CSS variables pentru theming și dark mode persistent. Deciziile de design sunt concentrate în `src/App.tsx` și `src/components/ThemeToggle.tsx`.

## Glass Morphism

Constanta `GLASS` din `App.tsx:18` definește stilul de container reutilizat în toată aplicația:
```
bg-[var(--glass-bg)] backdrop-blur-xl rounded-[var(--radius)]
border border-[var(--glass-border)] shadow-[var(--glass-shadow)]
```
Toate blocurile principale (header, tabs, calculator, footer) folosesc acest pattern.

## Branding și culori

- **Titlu "CalcJuridic."** — gradient `135deg, #38bdf8 → #3b82f6` (sky-500 → blue-500), aplicat cu `bg-clip-text text-transparent`
- **Tab activ** — același gradient albastru + `shadow-[0_4px_15px_rgba(14,165,233,0.3)]`
- **Accent color** — `var(--accent)`, folosit pentru contorul BNM și hover pe butoane
- **Subtitlu** — "myAVVO — Hub Juridic Moldova" în `var(--text-muted)`

## BNM Status Block

Locație: `App.tsx:57-71`

Logica de culoare a statusului:
- **Emerald-500 / "Actualizat"** — rate încărcate cu succes (`ratesCount > 0 && !ratesError`)
- **Rose-500 / "Offline"** — eroare la fetch (`ratesError === true`)
- **text-muted / ratesStatus** — stare intermediară (loading, mesaj personalizat)

Butonul de refresh (⟳) face spin animat când `bnmLoading === true` și se dezactivează cu `disabled:cursor-wait`.

## Dark Mode

Implementare: `ThemeToggle.tsx`

- Starea temei se salvează în `localStorage` cu cheia `theme`
- Fallback: `window.matchMedia('(prefers-color-scheme: dark)')` — respectă preferința sistemului
- Tema se aplică prin `data-theme` attribute pe `document.documentElement`
- Iconițe: `<Moon>` în light mode, `<Sun>` în dark mode (din `lucide-react`)
- Butonul este `fixed top-6 right-6`, z-index 50, deasupra oricărui conținut

## Layout

- `max-w-[900px]` centrat cu `mx-auto`, padding `my-10 px-4`
- Layout responsiv: header folosește `flex-col sm:flex-row`
- Tab-urile folosesc `flex-wrap` cu `min-w-[120px]` pe fiecare buton

## CSS Variables

Theming-ul este controlat prin CSS custom properties (ex. `--glass-bg`, `--text-main`, `--text-muted`, `--accent`, `--border`, `--surface-2`, `--radius`, `--shadow`, `--glass-border`, `--glass-shadow`). Valorile se schimbă în funcție de `[data-theme="dark"]`.

## Câmp Nume executor

Prezent în: `CalculatorDobanda.tsx` (Pasul 7) și `CalculatorPenalitate.tsx` (Pasul 8), plasat imediat înainte de butonul "Calculează".

- Câmp text opțional, placeholder "Nume, Prenume"
- Stilizare identică cu celelalte input-uri din formular (`--input-bg`, `--accent`)
- Dacă e completat, apare în PDF ca `Calcul efectuat de: [valoare introdusă]`
- Dacă e gol, PDF păstrează linia de semnat `___________________________`
- Logica de afișare este în `pdfExport.ts` (funcțiile `exportDobandaPDF` și `exportPenalitatePDF`), parametrul opțional `numeExecutor?: string`

## Conexiuni
- [[architecture]]
- [[project-overview]]

## Sursă
- `src/App.tsx`
- `src/components/ThemeToggle.tsx`
