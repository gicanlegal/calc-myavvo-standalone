# Memory — Rulează rutina completă de memorie pentru acest proiect

Execută automat aceste **3 funcții de memorie** în cadrul proiectului curent și lucrează **doar în limitele acestui repo**.

## 1. Citește memoria proiectului
La începutul sesiunii, citește în ordine:
1. `vault/index.md`
2. `vault/CLAUDE.md`
3. `vault/wiki/index.md`
4. paginile relevante din `vault/wiki/concepts/`
5. ultimul fișier din `vault/wiki/daily/`, dacă există și este relevant

După citire, afișează foarte scurt:
- contextul curent al proiectului
- ce este deja documentat în wiki
- ce lipsește sau ce trebuie actualizat

## 2. Folosește memoria în timpul taskului
Pe durata lucrului:
- consultă wiki-ul înainte să tragi concluzii despre proiect
- evită duplicarea informației deja existente
- dacă utilizatorul menționează schimbări noi, verifică dacă sunt deja în wiki
- tratează `vault/wiki/concepts/` ca sursa principală de cunoaștere persistentă

## 3. Persistă memoria la final
La finalul taskului, dacă ai descoperit sau modificat informație importantă:
- actualizează sau creează pagini relevante în `vault/wiki/concepts/`
- actualizează `vault/wiki/index.md` dacă apar topicuri noi
- actualizează `vault/index.md` dacă trebuie expuse topicuri principale noi
- adaugă o intrare scurtă în `vault/log.md`
- rulează `python3 memory/lint.py` dacă ai modificat wiki-ul, pentru a verifica consistența

## Reguli obligatorii
- Nu folosi memorie din alte proiecte.
- Nu scrie în afara `vault/` pentru informația de memorie, cu excepția cazului când taskul cere explicit altceva.
- Dacă informația e temporară sau brută, preferă `vault/wiki/daily/`.
- Dacă informația e stabilă și reutilizabilă, preferă `vault/wiki/concepts/`.
- Dacă utilizatorul cere doar analiză, nu inventa update-uri în wiki; actualizează memoria doar când apar informații utile persistente.

## Răspuns așteptat
După executarea comenzii:
1. confirmă ce ai citit din memorie
2. rezumă contextul relevant
3. continuă cu taskul cerut de utilizator
4. la final, spune clar dacă ai actualizat wiki-ul sau nu
