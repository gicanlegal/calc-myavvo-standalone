# Architecture

## Rezumat
Aplicația are o arhitectură frontend simplă, centrată pe un shell React care comută între module de calcul. Logica este împărțită între componente UI și utilitare, cu accent pe experiență standalone și pe integrare de date externe pentru rate BNM.

## Structură principală

### Entry points
- `src/main.tsx` montează aplicația React în `#root`
- `src/App.tsx` controlează layout-ul principal, tab-urile și încărcarea ratelor BNM

### Componente
În `src/components/` există componente specializate pentru:
- `CalculatorDobanda.tsx`
- `CalculatorPenalitate.tsx`
- `CalculatorTaxa.tsx`
- `CalculatorZile.tsx`
- `ThemeToggle.tsx`
- componente auxiliare precum `DatePicker`, `CurrencySelector`, `FormComponents`, `Layout`

### Utilitare
În `src/utils/` există logică de suport pentru:
- `bnmRates.ts` - fetch / inițializare rate BNM
- `pdfExport.ts` - generare documente PDF
- `helpers.ts` - funcții utilitare
- `fonts.ts` - fonturi pentru PDF cu diacritice corecte

## Flux funcțional de nivel înalt
1. Aplicația pornește din `main.tsx`
2. `App.tsx` inițializează ratele BNM și afișează statusul lor
3. utilizatorul selectează un tab de calculator
4. componenta calculatorului relevant gestionează input, calcul și export
5. utilitarele furnizează logică comună pentru BNM, PDF și formatare

## Decizii arhitecturale observate
- shell unic cu tab-uri în loc de routing multi-page
- logică modularizată pe componente, dar încă în același frontend
- utilizare Tailwind CSS v4 pentru styling
- păstrarea testelor Playwright pentru validare comportamentală
- quality gates locale prin Husky + lint-staged
- quality gates CI prin GitHub Actions înainte de deploy
- documentație existentă pentru o etapă viitoare de modularizare mai puternică

## Direcție de evoluție
Conform `docs/STAGE2-MODULARIZATION.md`, arhitectura țintește:
- separarea pe domenii funcționale
- expunerea unui API public de montare
- posibilă protecție a formulelor
- distribuție ca bundle reutilizabil / posibil pachet integrabil

## Riscuri și observații
- `src/App.tsx` este încă punct central pentru mai multe responsabilități UI și stare globală de nivel mic
- proiectul pare să combine UI, logică de calcul și integrare într-un singur frontend, ceea ce poate fi suficient acum, dar poate cere modularizare suplimentară
- documentația indică o tranziție planificată spre o arhitectură mai clar separată

## Conexiuni
- [[project-overview]]
- [[testing-strategy]]
- [[ci-cd-and-quality-gates]]
- [[../index]]

## Sursă
- `src/App.tsx`
- `src/main.tsx`
- `src/components/`
- `src/utils/`
- `docs/STAGE2-MODULARIZATION.md`
- `CHANGELOG.md`
