/**
 * Minigolf Model Definition
 * v1.2.0 - 12mm faalap + 8mm vízelvezető lyukak
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
        height: 1.2, // 12mm = 1.2 cm (frissítve)
        length: COURSE_DIMENSIONS.length, // 250 cm
      },
      holes: [
        // Fő lyuk (golflyuk)
        {
          type: "circle",
          radius: COURSE_DIMENSIONS.holeRadius, // 5.4 cm
          position: {
            x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.holePositionX, // 85 cm a bal széltől
            y: 0,
            z: 0,
          },
        },
        // Vízelvezető lyukak a fő lyuk szektorában (hátsó szakasz - ahol a golflyuk van)
        ...(() => {
          const holes = [];
          const mainHoleX = 250 / 2 - 85; // fő lyuk X pozíciója (165cm a bal széltől)
          const frameWidth = 6; // oldalsó lécek szélessége
          const crossBeamWidth = 12;
          const spacing = 250 / 3; // keresztlécek távolsága

          // Hátsó szektor határai (ahol a fő lyuk van)
          const sectorXStart = -250 / 2 + 2 * spacing + crossBeamWidth / 2; // frame_cross_2 után
          const sectorXEnd = 250 / 2 - crossBeamWidth; // frame_cross_back előtt
          const sectorZStart = -80 / 2 + frameWidth; // bal oldalsó léc után
          const sectorZEnd = 80 / 2 - frameWidth; // jobb oldalsó léc előtt

          // Szektor méretei - nagyobb belső margóval (10cm)
          const sectorWidth = sectorXEnd - sectorXStart - 20; // 10cm szél mindkét oldalon
          const sectorDepth = sectorZEnd - sectorZStart - 20; // 10cm szél mindkét oldalon

          // 4x3 rács (kevesebb lyuk, arányos eloszlás)
          const xSteps = 4;
          const zSteps = 4;
          const xSpacing = sectorWidth / (xSteps - 1);
          const zSpacing = sectorDepth / (zSteps - 1);

          for (let i = 0; i < xSteps; i++) {
            for (let j = 0; j < zSteps; j++) {
              const x = sectorXStart + 10 + i * xSpacing;
              const z = sectorZStart + 10 + j * zSpacing;

              // Ellenőrizzük hogy nem ütközik-e a fő lyukkal
              const distanceFromMainHole = Math.sqrt(
                Math.pow(x - mainHoleX, 2) + Math.pow(z - 0, 2)
              );

              // 8cm távolság a fő lyuktól (biztonságos távolság)
              if (distanceFromMainHole > 8) {
                holes.push({
                  type: "circle",
                  radius: 0.8, // 16mm átmérő = 8mm sugár
                  position: { x, y: 0, z },
                });
              }
            }
          }

          // holes.splice(7, 1);

          return holes;
        })(),

        // Vízelvezető lyukak az első szektorban
        ...(() => {
          const holes = [];
          const frameWidth = 6;
          const crossBeamWidth = 12;
          const spacing = 250 / 3;

          // Első szektor határai
          const sectorXStart = -250 / 2 + crossBeamWidth; // frame_cross_front után
          const sectorXEnd = -250 / 2 + spacing - crossBeamWidth / 2; // frame_cross_1 előtt
          const sectorZStart = -80 / 2 + frameWidth; // bal oldalsó léc után
          const sectorZEnd = 80 / 2 - frameWidth; // jobb oldalsó léc előtt

          const sectorWidth = sectorXEnd - sectorXStart - 20;
          const sectorDepth = sectorZEnd - sectorZStart - 20;

          const xSteps = 4; // rövidebb szektor
          const zSteps = 4;
          const xSpacing = sectorWidth / (xSteps - 1);
          const zSpacing = sectorDepth / (zSteps - 1);

          for (let i = 0; i < xSteps; i++) {
            for (let j = 0; j < zSteps; j++) {
              const x = sectorXStart + 10 + i * xSpacing;
              const z = sectorZStart + 10 + j * zSpacing;

              holes.push({
                type: "circle",
                radius: 0.8, // 16mm átmérő = 8mm sugár
                position: { x, y: 0, z },
              });
            }
          }

          return holes;
        })(),

        // Vízelvezető lyukak a középső szektorban (frame_cross_1 és frame_cross_2 között)
        ...(() => {
          const holes = [];
          const frameWidth = 6;
          const crossBeamWidth = 12;
          const spacing = 250 / 3;

          // Középső szektor határai
          const sectorXStart = -250 / 2 + spacing + crossBeamWidth / 2; // frame_cross_1 után
          const sectorXEnd = -250 / 2 + 2 * spacing - crossBeamWidth / 2; // frame_cross_2 előtt
          const sectorZStart = -80 / 2 + frameWidth;
          const sectorZEnd = 80 / 2 - frameWidth;

          const sectorWidth = sectorXEnd - sectorXStart - 20;
          const sectorDepth = sectorZEnd - sectorZStart - 20;

          const xSteps = 4;
          const zSteps = 4;
          const xSpacing = sectorWidth / (xSteps - 1);
          const zSpacing = sectorDepth / (zSteps - 1);

          for (let i = 0; i < xSteps; i++) {
            for (let j = 0; j < zSteps; j++) {
              const x = sectorXStart + 10 + i * xSpacing;
              const z = sectorZStart + 10 + j * zSpacing;

              holes.push({
                type: "circle",
                radius: 0.8, // 16mm átmérő = 8mm sugár
                position: { x, y: 0, z },
              });
            }
          }

          return holes;
        })(),
      ],
    },
    transform: {
      position: { x: 0, y: -1.2 / 2, z: 0 }, // 12mm/2 = 0.6 cm
    },
    explode: {
      offset: { x: 0, y: 30, z: 0 },
    },
  },

  // Műfű borítás - ugyanazok a lyukak
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
        // Fő lyuk (golflyuk)
        {
          type: "circle",
          radius: COURSE_DIMENSIONS.holeRadius, // 5.4 cm
          position: {
            x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.holePositionX,
            y: 0,
            z: 0,
          },
        },
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
          COURSE_DIMENSIONS.turfThickness / 2 +
          5 -
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
          COURSE_DIMENSIONS.turfThickness / 2 +
          5 -
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
          COURSE_DIMENSIONS.turfThickness / 2 +
          5 -
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
        width: COURSE_DIMENSIONS.width + 2 * COURSE_DIMENSIONS.frameWidth, // 92 cm (oldalkeret szélességéig)
        height: COURSE_DIMENSIONS.sideHeight / 2 + 0.4,
        length: 2, // 6 mm vastag
      },
    },
    transform: {
      position: {
        x: -COURSE_DIMENSIONS.length / 2 - 1, // A pálya elejénél
        y:
          -1.2 - // Frissített faalap vastagság
          COURSE_DIMENSIONS.frameHeight / 2 -
          COURSE_DIMENSIONS.turfThickness, // Fű magasságával lejjebb tolva
        z: 0,
      },
    },
    explode: {
      offset: { x: -40, y: 0, z: 0 },
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
          COURSE_DIMENSIONS.legDiameter / 2,
      },
      {
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2,
        z:
          COURSE_DIMENSIONS.width / 2 -
          COURSE_DIMENSIONS.frameWidth -
          COURSE_DIMENSIONS.legDiameter / 2,
      },
      // 1. belső keresztlécnél
      {
        x: -COURSE_DIMENSIONS.length / 2 + spacing,
        z:
          -COURSE_DIMENSIONS.width / 2 +
          COURSE_DIMENSIONS.frameWidth +
          COURSE_DIMENSIONS.legDiameter / 2,
      },
      {
        x: -COURSE_DIMENSIONS.length / 2 + spacing,
        z:
          COURSE_DIMENSIONS.width / 2 -
          COURSE_DIMENSIONS.frameWidth -
          COURSE_DIMENSIONS.legDiameter / 2,
      },
      // 2. belső keresztlécnél
      {
        x: -COURSE_DIMENSIONS.length / 2 + 2 * spacing,
        z:
          -COURSE_DIMENSIONS.width / 2 +
          COURSE_DIMENSIONS.frameWidth +
          COURSE_DIMENSIONS.legDiameter / 2,
      },
      {
        x: -COURSE_DIMENSIONS.length / 2 + 2 * spacing,
        z:
          COURSE_DIMENSIONS.width / 2 -
          COURSE_DIMENSIONS.frameWidth -
          COURSE_DIMENSIONS.legDiameter / 2,
      },
      // Hátsó keresztlécnél
      {
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2,
        z:
          -COURSE_DIMENSIONS.width / 2 +
          COURSE_DIMENSIONS.frameWidth +
          COURSE_DIMENSIONS.legDiameter / 2,
      },
      {
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2,
        z:
          COURSE_DIMENSIONS.width / 2 -
          COURSE_DIMENSIONS.frameWidth -
          COURSE_DIMENSIONS.legDiameter / 2,
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
          height: COURSE_DIMENSIONS.legHeight, // 15 cm
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
