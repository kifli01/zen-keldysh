# Minigolf Pálya - Tervrajz Specifikációk - v1.3

## Instrukciók
**FONTOS**: 
- Olvasd végig ezt a fájlt alaposan !!!
- Töltsd be a linkeket, és a forrásanyagokat.
- Együttesen értelmezd ezeket, ha valami féreérthető akkor előbb jelezd azt mielőtt továbbmennél.
- NE TALÁLJ KI ELEMEKET
- Pontosan illeszd az elemet egymáshoz, úgy ahogyan az a tervekben szerepel.
- Pontosan mérj és értelmezzd a méreteket, pl: a pálya méreteire még rájön a falak vastagsága.
- A láthattó elemeket, és lyukakat jelenítsd csak, de az egymésba ágyazottakat is.
- Minden látható elem látható méretét jelnítsd meg pontosan az adott nézetben.
- Ne rajzolj le semmi olyat ami nincs a tervekben.

## Rajz követelmények

### Fájl formátum és canvas
- **Kimenet**: SVG (image/svg+xml)
- **Canvas**: 7016×4961px (A2, 300 DPI)
- **ViewBox**: "0 0 7016 4961"
- **Reszponzívitás**: style="width: 100%; height: auto; max-width: 800px;"
- **Méretarány**: 1:10 (ISO 5455 standard)
- **Koordináta rendszer**: SVG standard (bal felső = 0,0)
- **Konverzió**: **1mm valós = 0.236px rajzon**
- **Kimenet**: Tiszta SVG fájl (image/svg+xml)
- **Tervrajz Pozícionálás**: Vetikálisan és Horizontálisan is Középre

### Szövegek és Cimkék (ISO 3098 szerint)
**TILTOTT elemek**
❌ Címek (title)
❌ Megjegyzések (notes)
❌ Hosszú leírások
❌ Anyag listák
❌ Méretarány megjelölés
❌ Verzió szám
❌ Ø szimb
 
**Font**
Arial/sans-serif (egyértelmű olvashatóság)

### Színek használata
- Kizárólag Fekete-Fehér

## Specifikus adatok

### Példák a minőségre - ez a minimum elvárás
- blueprints/examples/sample-1.svg
- blueprints/examples/sample-2.svg

### Műszakirajz szabvány leírások
- [text](https://pressbooks.atlanticoer-relatlantique.ca/lined/chapter/d3-12/)
- [text](https://www.mcgill.ca/engineeringdesign/step-step-design-process/basics-graphics-communication/sectioning-technique)
- [text](https://www.mcgill.ca/engineeringdesign/step-step-design-process/basics-graphics-communication/principles-dimensioning)

### Adatforrások
- Méretek: `COURSE_DIMENSIONS` (constants.js)
- Elemek: `models/*.js` fájlok
- Alkatrészek: `parts.js`
- Lyukak: CSG operations a model fájlokban
- Anyagok: `MATERIALS` objektum
