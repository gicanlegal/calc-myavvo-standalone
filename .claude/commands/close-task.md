# Close Task — Închide taskul și persistă contextul util

Folosește această comandă la finalul unui task, înainte să consideri sesiunea încheiată.

## Ce trebuie să faci

### 1. Rezumă schimbările
Afișează un rezumat scurt și clar al taskului finalizat:
- ce s-a modificat
- ce fișiere au fost afectate
- ce a fost verificat
- ce a rămas eventual deschis

### 2. Actualizează memoria proiectului
Execută rutina de memorie doar în limitele acestui proiect:
1. verifică wiki-ul existent:
   - `vault/index.md`
   - `vault/wiki/index.md`
   - paginile relevante din `vault/wiki/concepts/`
2. dacă există informații noi persistente, actualizează sau creează pagini în `vault/wiki/concepts/`
3. actualizează indexurile dacă au apărut topicuri noi
4. adaugă o intrare scurtă în `vault/log.md`

### 3. Verifică memoria
Dacă ai modificat wiki-ul:
- rulează `python3 memory/lint.py`
- rezolvă problemele simple dacă apar
- raportează dacă memoria este curată

### 4. Verifică starea repo-ului
Afișează un status scurt relevant pentru utilizator:
- fișiere modificate
- fișiere noi
- dacă există schimbări necomise

## Reguli
- Lucrează doar în acest repo.
- Nu folosi memorie din alte proiecte.
- Nu adăuga în wiki informații triviale sau temporare.
- Dacă taskul nu a produs informație reutilizabilă, spune explicit că nu a fost necesar update în wiki.

## Răspuns final
La final, răspunde cu aceste 4 puncte:
1. **Task summary**
2. **Memory updated**: da/nu + ce pagini
3. **Memory lint**: curat / probleme
4. **Git status**: scurt rezumat
