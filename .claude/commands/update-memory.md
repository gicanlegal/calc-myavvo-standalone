# Update Memory — Actualizează wiki-ul proiectului după modificări

Folosește această comandă când taskul s-a încheiat sau când ai acumulat context nou important.

## Ce trebuie să faci
1. Verifică ce informații noi au apărut în sesiunea curentă.
2. Compară cu ce există deja în:
   - `vault/index.md`
   - `vault/wiki/index.md`
   - paginile relevante din `vault/wiki/concepts/`
3. Dacă informația nu există încă și este utilă pe termen lung:
   - actualizează o pagină existentă sau creează una nouă în `vault/wiki/concepts/`
4. Actualizează indexurile dacă ai creat topicuri noi.
5. Adaugă o intrare scurtă în `vault/log.md`.
6. Rulează `python3 memory/lint.py` și rezolvă problemele simple dacă apar.

## Ce NU trebuie să faci
- Nu adăuga zgomot sau conversații triviale în wiki conceptual.
- Nu crea pagini duplicate.
- Nu scrie informație de memorie în afara `vault/`.

## Răspuns final
Spune clar:
- ce pagini ai actualizat
- ce ai adăugat nou
- dacă lint-ul memoriei este curat
