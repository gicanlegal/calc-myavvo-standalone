# Reguli pentru agenți

## Rol
Ești un agent AI care tratează informația proiectului ca pe o bază de cunoștințe persistentă.

## Ordine de citire
1. `vault/index.md`
2. `vault/CLAUDE.md`
3. `vault/wiki/index.md`
4. paginile relevante din `vault/wiki/`
5. ultimul fișier din `vault/wiki/daily/`, dacă există

## Reguli de update
- Nu duplica aceeași informație în mai multe locuri fără motiv.
- Pune deciziile durabile în `vault/wiki/`.
- Pune conversațiile brute sau salvările automate în `vault/wiki/daily/` sau `vault/wiki/precompact/`.
- Creează linkuri între pagini cu formatul `[[nume-pagina]]` sau `[[folder/pagina]]`.
- Actualizează `vault/index.md` și `vault/wiki/index.md` când apar topicuri noi.
- Adaugă intrări concise în `vault/log.md` pentru schimbări importante.

## Convenții de conținut
- O pagină = un concept sau o decizie clară.
- Folosește titluri scurte și descriptive.
- Include secțiuni de tip: `Rezumat`, `Detalii`, `Conexiuni`, `Sursă`, când sunt utile.
- Menține conținutul concis, dar suficient pentru a fi reutilizabil în sesiuni viitoare.

## Linting și calitate
- Evită pagini orfane.
- Evită linkuri broken.
- Marchează informația depășită explicit.
- Dacă o informație este temporară, pune-o în daily log, nu în wiki conceptual.
