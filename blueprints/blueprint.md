# Minigolf Pálya - Tervrajz Specifikációk - v1.1

## Instrukciók
**FONTOS**: 
- Olvasd végig ezt a fájlt alaposan
- Töltsd be a linkeket, és a forrásanyagokat.
- Együttesen értelmezd ezeket, ha valami féreérthető akkor előbb jelezd azt mielptt továbbmennél.

## Rajz követelmények

### Fájl formátum és struktúra
- **Kimene**t: Tiszta SVG fájl (image/svg+xml)
- **Canvas méret**: A2 landscape = 594×420mm = 1683×1191px (283.46 DPI)
- **Koordináta rendszer**: SVG standard (bal felső sarok = 0,0)
- **Encoding**: UTF-8

### SVG méretek és méretarány
- **Canvas**: 1200×900px minimum
- **Rajz terület**: 80% a canvas-ból
- **Méretarány**: 1:20 (1mm = 0.05px) vagy 1:10
- **Margók**: min 50px minden oldalon

### Szövegek és Cimkék (ISO 3098 szerint)
**TILTOTT elemek**
❌ Címek (title)
❌ Megjegyzések (notes)
❌ Hosszú leírások
❌ Anyag listák

**ENGEDÉLYEZETT elemek**
Méretek (csak számok)
✅ Méretarány megjelölés
✅ Verzió szám
✅ Ø szimb
 
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

