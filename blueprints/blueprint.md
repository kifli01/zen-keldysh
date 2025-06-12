# Minigolf Pálya - Tervrajz Specifikációk - v1.4

## Instrukciók
**FONTOS**: 
- Olvasd végig ezt a fájlt alaposan !!!
- Töltsd be a linkeket, és a forrásanyagokat.
- Együttesen értelmezd ezeket, ha valami féreérthető akkor előbb jelezd azt mielőtt továbbmennél.
- Az elemek pozíciója egy 3D-s programhoz (THREE js) vannak megadva, melyek általában az origó körül vannak pozícionálva, ezeket kell neked átforgatnod 2D-be a helyes műszaki rajzhoz.
- NE TALÁLJ KI ELEMEKET
- Pontosan illeszd az elemet egymáshoz, úgy ahogyan az a tervekben szerepel.
- Pontosan mérj és értelmezzd a méreteket, pl: a pálya méreteire még rájön a falak vastagsága.
- A láthattó elemeket, és lyukakat jelenítsd csak, de az egymésba ágyazottakat is.
- Minden látható elem látható méretét jelnítsd meg pontosan az adott nézetben.
- Ne rajzolj le semmi olyat ami nincs a tervekben.

## Rajz követelmények

### Fájl formátum és canvas
- **Kimenet**: SVG (image/svg+xml)
- **Canvas**: 7016×4961px
- **ViewBox**: "0 0 7016 4961"
- **Reszponzívitás**: style="width: 100%; height: auto; max-width: 800px;"
- **Koordináta rendszer**: SVG standard (bal felső = 0,0)
- **Konverzió**: 1mm = 2px
- **Kimenet**: Tiszta SVG fájl (image/svg+xml)
- **Tervrajz pozíció**: x=500, y=500 (bal felső sarok)

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
