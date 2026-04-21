# Changelog

## [2026-04-21] — Corectare completă lint + TypeScript (P0/P1/P2)

### Fixed — ESLint
- **react-hooks/set-state-in-effect** rezolvat în 4 fișiere:
  - `App.tsx`: inițializat `bnmLoading=true`, efectul inițial nu mai apelează setState sincron
  - `ThemeToggle.tsx`: tema inițială citită din `localStorage` prin lazy initializer; DOM sincronizat printr-un efect separat pe schimbarea temei
  - `CalculatorZile.tsx`: `todayStr` calculat cu `useState(() => formatDateRO(new Date()))`, eliminat `useEffect` inutil
  - `DatePicker.tsx`: sincronizarea `inputVal` mutată în pattern-ul "adjusting state during render"; sincronizarea view-ului calendarului tratată direct în handler-ul butonului de deschidere
- **@typescript-eslint/no-explicit-any** eliminat din toate fișierele:
  - `pdfExport.ts`: definite interfețe `CalcRowData`, `AutoTableOptions`, `AutoTableCellData`, `AutoTablePageData`
  - `bnmRates.ts`: `(x: any)` înlocuit cu `(x: { d: string; r: number })`
  - `CalculatorDobanda.tsx`: `catch (e: any)` înlocuit cu `catch (err: unknown)` + type narrowing
- **@typescript-eslint/no-unused-vars** rezolvat:
  - Eliminate importuri nefolosite: `React` (5 componente), `useCallback`, `X`, `StepHeader`
  - Eliminate variabile moarte: `debtCounter`, `payCounter` din `CalculatorDobanda`
  - Parametri catch nefolosiți înlocuiți cu `catch` fără binding (TS 4.0+)
- **no-useless-escape** rezolvat în `DatePicker.tsx` și `bnmRates.ts`

### Fixed — TypeScript Build
- **TS2339**: `doc.internal.getNumberOfPages()` înlocuit cu apel safe
- **TS6133**: parametrul `logoB64` neutilizat prefixat cu `_`
- **TS2345**: câmpul `r` marcat opțional în `CalcRowData`

### Fixed — Tailwind CSS v4
- Adăugat `@source "../src"` în `index.css` — fără această directivă, Tailwind v4 nu scana fișierele sursă și nu genera nicio clasă utilitar

### Rezultat
- `npm run lint` — 0 erori
- `npx tsc --noEmit` — 0 erori
- `npm run build` — build reușit

---

## [2026-04-21]

### Fixed
- **PDF Diacritics**: Integrated Roboto (Regular & Bold) custom fonts to correctly display Romanian characters (ă, â, î, ș, ț) in all exported PDF documents.
- **Branding Update**: Changed the primary accent color from teal (`#38B2AE`) to the new brand blue (`#11a5ea`) across all PDF templates (headers, borders, and accents).
- **Calendar Visibility**: Removed transparency and backdrop blur from the `DatePicker` component to ensure text is fully legible when the calendar overlays other elements.
- **BNM Rates Block**: 
    - Improved visibility in light mode with a more prominent border (`border-slate-200`) and shadow.
    - Updated the status text to display "Actualizat" for a clearer user confirmation.
    - Refined the refresh button for better accessibility.

### Technical
- Added `src/utils/fonts.ts` containing Base64 encoded Roboto fonts.
- Refactored `pdfExport.ts` to use a centralized `createDoc` utility for font registration.
- Updated `App.tsx` and `DatePicker.tsx` for UI improvements.
