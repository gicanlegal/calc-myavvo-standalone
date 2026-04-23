# Branch Strategy

## Rezumat
Proiectul folosește 3 branch-uri principale cu roluri distincte. Workflow-ul de deploy este legat de `bento-final`, nu de `main`.

## Branch-uri

| Branch | Rol | Stare |
|--------|-----|-------|
| `main` | Branch principal / producție referință | Stabil, nu e branch activ de lucru curent |
| `bento-redesign` | Branch experimental de redesign UI | Absorbit în `bento-final` (`9c4c9c0`) |
| `bento-final` | Branch activ de lucru curent | Deploy configurat din acest branch |

## Flux de lucru

1. Munca se face pe `bento-final`
2. Commit-urile sunt push-uite pe `origin/bento-final`
3. CI/CD (`cloudflare-pages.yml`) rulează testele și deploy-ează din `bento-final`
4. `main` este punctul de referință pentru PR-uri și merge final

## De ce `bento-final` și nu `main`

- `bento-final` a absorbit cel mai bun din `bento-redesign` (commit `9c4c9c0`)
- Workflow-ul Cloudflare Pages a fost configurat explicit pentru `bento-final` (commit `1ba3da6`)
- `main` rămâne branch de referință pentru eventuale merge-uri

## Implicații pentru agenți

- Verifică întotdeauna că ești pe `bento-final` înainte să faci modificări
- Push-urile trebuie să fie pe `origin/bento-final` pentru a declanșa CI/CD
- Nu fă push direct pe `main` fără merge deliberat

## Conexiuni
- [[ci-cd-and-quality-gates]]
- [[project-overview]]

## Sursă
- `git log --oneline`
- `git branch -a`
- `.github/workflows/cloudflare-pages.yml`
