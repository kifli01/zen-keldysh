# Minigolf Pálya - Tervrajz Specifikációk - v1.0

## Rajz követelmények

### SVG méretek és méretarány
- **Canvas**: 1200×900px minimum
- **Rajz terület**: 80% a canvas-ból
- **Méretarány**: 1:20 (1mm = 0.05px) vagy 1:10
- **Margók**: min 50px minden oldalon

### Szövegek (ISO 3098 szerint)
- **Címek**: nem kellenek
- **Méretek**: 10-12px
- **Megjegyzések**: nem kellenek  
- **Font**: Arial/sans-serif (egyértelmű olvashatóság)
- **Színek**: fekete (#000) vagy sötétszürke (#333)

### Műszakirajz szabvány leírások
- [text](https://pressbooks.atlanticoer-relatlantique.ca/lined/chapter/d3-12/)
- [text](https://www.mcgill.ca/engineeringdesign/step-step-design-process/basics-graphics-communication/sectioning-technique)
- [text](https://www.mcgill.ca/engineeringdesign/step-step-design-process/basics-graphics-communication/principles-dimensioning)

## Specifikus adatok

### Adatforrások
- Méretek: `COURSE_DIMENSIONS` (constants.js)
- Elemek: `models/*.js` fájlok
- Alkatrészek: `parts.js`
- Lyukak: CSG operations a model fájlokban
- Anyagok: `MATERIALS` objektum

