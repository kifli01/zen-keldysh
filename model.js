/**
 * Minigolf Model Definition
 * v1.3.0 - HoleGenerator használata, egyszerűsített lyuk generálás
 * Csak az elemek leírása - új struktúrával
 */

// Minigolf pálya elemei
const minigolfElements = [
  // Fő alaplap (felső rétegelt lemez) - 12mm vastagság
  {
    id: "top_plate",
    name: "Faalap",
    type: ELEMENT_TYPES.PLATE,
    material: "PINE_PLYWOOD",
    geometry: {
      type: GEOMETRY_TYPES.EXTRUDE,
      dimensions: {
        width: COURSE_DIMENSIONS.width, // 80 cm
        height: 1.2, // 12mm = 1.2 cm
        length: COURSE_DIMENSIONS.length, // 250 cm
      },
      holes: [
        // Fő lyuk (golflyuk)
        createHole({
          type: "circle",
          radius: COURSE_DIMENSIONS.holeRadius, // 5.4 cm
          position: {
            x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.holePositionX, // 85 cm a bal széltől
            y: 0,
            z: 0,
          },
        }),

        // Vízelvezető lyukak - első szektor
        ...createHoleGrid({
          area: defineArea(
            -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth,
            -COURSE_DIMENSIONS.length / 2 +
              COURSE_DIMENSIONS.length / 3 -
              COURSE_DIMENSIONS.crossBeamWidth / 2,
            -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
            COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth
          ),
          grid: { x: 4, z: 4 },
          holeParams: { type: "circle", radius: 0.8 },
          margin: 10,
        }),

        // Vízelvezető lyukak - középső szektor
        ...createHoleGrid({
          area: defineArea(
            -COURSE_DIMENSIONS.length / 2 +
              COURSE_DIMENSIONS.length / 3 +
              COURSE_DIMENSIONS.crossBeamWidth / 2,
            -COURSE_DIMENSIONS.length / 2 +
              (2 * COURSE_DIMENSIONS.length) / 3 -
              COURSE_DIMENSIONS.crossBeamWidth / 2,
            -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
            COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth
          ),
          grid: { x: 4, z: 4 },
          holeParams: { type: "circle", radius: 0.8 },
          margin: 10,
        }),

        // Vízelvezető lyukak - hátsó szektor (szűrve a fő lyuk környékét)
        ...(() => {
          const mainHoleX =
            COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.holePositionX;
          const holes = createHoleGrid({
            area: defineArea(
              -COURSE_DIMENSIONS.length / 2 +
                (2 * COURSE_DIMENSIONS.length) / 3 +
                COURSE_DIMENSIONS.crossBeamWidth / 2,
              COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth,
              -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
              COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth
            ),
            grid: { x: 4, z: 4 },
            holeParams: { type: "circle", radius: 0.8 },
            margin: 10,
          });

          // Szűrjük ki a fő lyuk közelében lévő lyukakat
          return holes.filter((hole) => {
            const distance = Math.sqrt(
              Math.pow(hole.position.x - mainHoleX, 2) +
                Math.pow(hole.position.z - 0, 2)
            );
            return distance > 8; // 8cm biztonsági távolság
          });
        })(),
      ],
    },
    transform: {
      position: { x: 0, y: 0, z: 0 }, // 12mm/2 = 0.6 cm
    },
    explode: {
      offset: { x: 0, y: 30, z: 0 },
    },
  },

  // Műfű borítás - csak a fő lyuk
  {
    id: "turf",
    name: "Műfű borítás",
    type: ELEMENT_TYPES.COVERING,
    material: "ARTIFICIAL_GRASS",
    geometry: {
      type: GEOMETRY_TYPES.EXTRUDE,
      dimensions: {
        width: COURSE_DIMENSIONS.width, // 80 cm
        height: COURSE_DIMENSIONS.turfThickness, // 0.6 cm
        length: COURSE_DIMENSIONS.length, // 250 cm
      },
      holes: [
        // Fő lyuk (golflyuk) - csak ez kell a műfűhöz
        createHole({
          type: "circle",
          radius: COURSE_DIMENSIONS.holeRadius, // 5.4 cm
          position: {
            x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.holePositionX,
            y: 0,
            z: 0,
          },
        }),
      ],
    },
    transform: {
      position: { x: 0, y: COURSE_DIMENSIONS.turfThickness / 2, z: 0 },
    },
    explode: {
      offset: { x: 0, y: 60, z: 0 },
    },
  },

  // Váz - hosszanti lécek (2 db)
  {
    id: "frame_long_left",
    name: "Bal hosszanti léc",
    type: ELEMENT_TYPES.FRAME,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.BOX,
      dimensions: {
        width: COURSE_DIMENSIONS.frameWidth, // 6 cm
        height: COURSE_DIMENSIONS.frameHeight, // 4 cm
        length: COURSE_DIMENSIONS.length, // 250 cm
      },
    },
    transform: {
      position: {
        x: 0,
        y: -COURSE_DIMENSIONS.frameHeight / 2 - 1.2, // Frissített faalap vastagság
        z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth / 2,
      },
    },
    explode: {
      offset: { x: 0, y: 0, z: -25 },
    },
  },

  {
    id: "frame_long_right",
    name: "Jobb hosszanti léc",
    type: ELEMENT_TYPES.FRAME,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.BOX,
      dimensions: {
        width: COURSE_DIMENSIONS.frameWidth, // 6 cm
        height: COURSE_DIMENSIONS.frameHeight, // 4 cm
        length: COURSE_DIMENSIONS.length, // 250 cm
      },
    },
    transform: {
      position: {
        x: 0,
        y: -COURSE_DIMENSIONS.frameHeight / 2 - 1.2, // Frissített faalap vastagság
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth / 2,
      },
    },
    explode: {
      offset: { x: 0, y: 0, z: 25 },
    },
  },

  // Váz - keresztlécek (első és hátsó)
  {
    id: "frame_cross_front",
    name: "Első keresztléc",
    type: ELEMENT_TYPES.FRAME,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.BOX,
      dimensions: {
        width: COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth, // 68 cm
        height: COURSE_DIMENSIONS.frameHeight, // 4 cm
        length: COURSE_DIMENSIONS.crossBeamWidth, // 12 cm (dupla széles)
      },
    },
    transform: {
      position: {
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2,
        y: -COURSE_DIMENSIONS.frameHeight / 2 - 1.2, // Frissített faalap vastagság
        z: 0,
      },
    },
    explode: {
      offset: { x: 0, y: 0, z: 0 },
    },
  },

  {
    id: "frame_cross_back",
    name: "Hátsó keresztléc",
    type: ELEMENT_TYPES.FRAME,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.BOX,
      dimensions: {
        width: COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth, // 68 cm
        height: COURSE_DIMENSIONS.frameHeight, // 4 cm
        length: COURSE_DIMENSIONS.crossBeamWidth, // 12 cm (dupla széles)
      },
    },
    transform: {
      position: {
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2,
        y: -COURSE_DIMENSIONS.frameHeight / 2 - 1.2, // Frissített faalap vastagság
        z: 0,
      },
    },
    explode: {
      offset: { x: 0, y: 0, z: 0 },
    },
  },

  // Váz - belső keresztlécek (2 db)
  ...Array.from({ length: COURSE_DIMENSIONS.crossBeamCount }, (_, i) => {
    const spacing =
      COURSE_DIMENSIONS.length / (COURSE_DIMENSIONS.crossBeamCount + 1);
    const posX = -COURSE_DIMENSIONS.length / 2 + spacing * (i + 1);

    return {
      id: `frame_cross_${i + 1}`,
      name: `${i + 1}. keresztléc`,
      type: ELEMENT_TYPES.FRAME,
      material: "PINE_SOLID",
      geometry: {
        type: GEOMETRY_TYPES.BOX,
        dimensions: {
          width: COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth, // 68 cm
          height: COURSE_DIMENSIONS.frameHeight, // 4 cm
          length: COURSE_DIMENSIONS.crossBeamWidth, // 12 cm (dupla széles)
        },
      },
      transform: {
        position: {
          x: posX,
          y: -COURSE_DIMENSIONS.frameHeight / 2 - 1.2, // Frissített faalap vastagság
          z: 0,
        },
      },
      explode: {
        offset: { x: 0, y: 0, z: 0 },
      },
      spacing: spacing,
    };
  }),

  // Oldalfalak (2 db)
  {
    id: "wall_left",
    name: "Bal oldali fal",
    type: ELEMENT_TYPES.WALL,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.BOX,
      dimensions: {
        width: COURSE_DIMENSIONS.sideWidth, // 6 cm
        height: COURSE_DIMENSIONS.sideHeight, // 12 cm
        length: COURSE_DIMENSIONS.length, // 250 cm
      },
    },
    transform: {
      position: {
        x: 0,
        y:
          COURSE_DIMENSIONS.turfThickness +
          COURSE_DIMENSIONS.sideVerticalShift -
          COURSE_DIMENSIONS.sideHeight / 2, // 5cm-rel a borítás felett
        z: -COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.sideWidth / 2,
      },
    },
    explode: {
      offset: { x: 0, y: 0, z: -60 },
    },
  },

  {
    id: "wall_right",
    name: "Jobb oldali fal",
    type: ELEMENT_TYPES.WALL,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.BOX,
      dimensions: {
        width: COURSE_DIMENSIONS.sideWidth, // 6 cm
        height: COURSE_DIMENSIONS.sideHeight, // 12 cm
        length: COURSE_DIMENSIONS.length, // 250 cm
      },
    },
    transform: {
      position: {
        x: 0,
        y:
          COURSE_DIMENSIONS.turfThickness +
          COURSE_DIMENSIONS.sideVerticalShift -
          COURSE_DIMENSIONS.sideHeight / 2,
        z: COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.sideWidth / 2,
      },
    },
    explode: {
      offset: { x: 0, y: 0, z: 60 },
    },
  },

  // Végfal
  {
    id: "wall_end",
    name: "Végfal",
    type: ELEMENT_TYPES.WALL,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.BOX,
      dimensions: {
        width: COURSE_DIMENSIONS.width + 2 * COURSE_DIMENSIONS.sideWidth, // 92 cm
        height: COURSE_DIMENSIONS.sideHeight, // 12 cm
        length: COURSE_DIMENSIONS.sideWidth, // 6 cm
      },
    },
    transform: {
      position: {
        x: COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.sideWidth / 2,
        y:
          COURSE_DIMENSIONS.turfThickness +
          COURSE_DIMENSIONS.sideVerticalShift -
          COURSE_DIMENSIONS.sideHeight / 2,
        z: 0,
      },
    },
    explode: {
      offset: { x: 40, y: 0, z: 0 },
    },
  },

  // Kezdő záró elem
  {
    id: "wall_start",
    name: "Kezdő záró elem",
    type: ELEMENT_TYPES.WALL,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.BOX,
      dimensions: {
        width: COURSE_DIMENSIONS.width + 2 * COURSE_DIMENSIONS.sideWidth, // 92 cm (oldalkeret szélességéig)
        height: COURSE_DIMENSIONS.frontHeight,
        length: COURSE_DIMENSIONS.frontWidth,
      },
    },
    transform: {
      position: {
        x: -COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.frontWidth / 2,
        y: -COURSE_DIMENSIONS.frontHeight / 2,
        z: 0,
      },
    },
    explode: {
      offset: { x: -40, y: 0, z: 0 },
    },
  },

  // Minigolf labda - 43mm átmérő
  {
    id: "golf_ball",
    name: "Minigolf labda",
    type: ELEMENT_TYPES.BALL,
    material: "WHITE_PLASTIC",
    geometry: {
      type: GEOMETRY_TYPES.SPHERE, // Gömb geometria
      dimensions: {
        diameter: 4.3, // 43mm
        radius: 2.15, // 21.5mm sugár
      },
    },
    transform: {
      position: {
        x: -COURSE_DIMENSIONS.length / 2 + 20, // 20 cm-rel a pálya elejétől
        y: COURSE_DIMENSIONS.turfThickness + 2.15, // A műfű tetején + labda sugara
        z: -COURSE_DIMENSIONS.width / 2 + 2.15, // Bal szélhez érve (bal oldali fal belseje + labda sugara)
      },
    },
    explode: {
      offset: { x: 0, y: 100, z: 0 },
    },
  },

  // Lábak (8 db) - keresztlécek közepén
  ...Array.from({ length: 8 }, (_, i) => {
    // Láb pozíciók kiszámítása - keresztlécek pozícióihoz igazítva
    const spacing =
      COURSE_DIMENSIONS.length / (COURSE_DIMENSIONS.crossBeamCount + 1);

    const legPositions = [
      // Első keresztlécnél (bal és jobb oldal)
      {
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2,
        z:
          -COURSE_DIMENSIONS.width / 2 +
          COURSE_DIMENSIONS.frameWidth +
          COURSE_DIMENSIONS.legDiameter / 2 +
          COURSE_DIMENSIONS.legInset,
      },
      {
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2,
        z:
          COURSE_DIMENSIONS.width / 2 -
          COURSE_DIMENSIONS.frameWidth -
          COURSE_DIMENSIONS.legDiameter / 2 -
          COURSE_DIMENSIONS.legInset,
      },
      // 1. belső keresztlécnél
      {
        x: -COURSE_DIMENSIONS.length / 2 + spacing,
        z:
          -COURSE_DIMENSIONS.width / 2 +
          COURSE_DIMENSIONS.frameWidth +
          COURSE_DIMENSIONS.legDiameter / 2 +
          COURSE_DIMENSIONS.legInset,
      },
      {
        x: -COURSE_DIMENSIONS.length / 2 + spacing,
        z:
          COURSE_DIMENSIONS.width / 2 -
          COURSE_DIMENSIONS.frameWidth -
          COURSE_DIMENSIONS.legDiameter / 2 -
          COURSE_DIMENSIONS.legInset,
      },
      // 2. belső keresztlécnél
      {
        x: -COURSE_DIMENSIONS.length / 2 + 2 * spacing,
        z:
          -COURSE_DIMENSIONS.width / 2 +
          COURSE_DIMENSIONS.frameWidth +
          COURSE_DIMENSIONS.legDiameter / 2 +
          COURSE_DIMENSIONS.legInset,
      },
      {
        x: -COURSE_DIMENSIONS.length / 2 + 2 * spacing,
        z:
          COURSE_DIMENSIONS.width / 2 -
          COURSE_DIMENSIONS.frameWidth -
          COURSE_DIMENSIONS.legDiameter / 2 -
          COURSE_DIMENSIONS.legInset,
      },
      // Hátsó keresztlécnél
      {
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2,
        z:
          -COURSE_DIMENSIONS.width / 2 +
          COURSE_DIMENSIONS.frameWidth +
          COURSE_DIMENSIONS.legDiameter / 2 +
          COURSE_DIMENSIONS.legInset,
      },
      {
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2,
        z:
          COURSE_DIMENSIONS.width / 2 -
          COURSE_DIMENSIONS.frameWidth -
          COURSE_DIMENSIONS.legDiameter / 2 -
          COURSE_DIMENSIONS.legInset,
      },
    ];

    const pos = legPositions[i];

    return {
      id: `leg_${i + 1}`,
      name: `Láb #${i + 1}`,
      type: ELEMENT_TYPES.LEG,
      material: "PINE_SOLID",
      geometry: {
        type: GEOMETRY_TYPES.CYLINDER,
        dimensions: {
          width: COURSE_DIMENSIONS.legDiameter, // 6 cm
          height: COURSE_DIMENSIONS.legHeight, // 12 cm
          diameter: COURSE_DIMENSIONS.legDiameter, // 6 cm
        },
      },
      transform: {
        position: {
          x: pos.x,
          y:
            -COURSE_DIMENSIONS.frameHeight -
            1.2 - // Frissített faalap vastagság
            COURSE_DIMENSIONS.legHeight / 2,
          z: pos.z,
        },
      },
      explode: {
        offset: { x: 0, y: -30, z: 0 },
      },
    };
  }),
];
