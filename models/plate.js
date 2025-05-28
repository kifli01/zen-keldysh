export const elements = [
  {
    id: "top_plate",
    name: "Faalap",
    type: ELEMENT_TYPES.PLATE,
    material: "PINE_PLYWOOD",
    geometry: {
      type: GEOMETRY_TYPES.BOX, // VÁLTOZÁS: BOX geometria CSG műveletekkel
      dimensions: {
        width: COURSE_DIMENSIONS.width, // 80 cm
        height: 1.2, // 12mm = 1.2 cm
        length: COURSE_DIMENSIONS.length, // 250 cm
      },
      // TESZT: Egyszerű áttörő lyuk először
      csgOperations: [
        // 1. Felső rész: 174mm átmérő, 3mm mélység
        createCSGOperation({
          type: "circle",
          radius: 8.7, // 174mm / 2 = 87mm = 8.7cm
          position: {
            x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.holePositionX,
            y: 0.43, // Felső pozíció: faalap teteje felé eltolva
            z: 0,
          },
          depth: 0.5, // 3mm = 0.3cm mélység
        }),

        // 2. Alsó rész: 112mm átmérő, teljes áttörés
        createCSGOperation({
          type: "circle",
          radius: 5.6, // 112mm / 2 = 56mm = 5.6cm
          position: {
            x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.holePositionX,
            y: 0, // Középső pozíció
            z: 0,
          },
          depth: 2.0, // Teljes áttörés
        }),

        // Vízelvezető lyukak - első szektor (CSG)
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
          holeParams: {
            type: "circle",
            radius: 0.8,
            depth: 1.2 + 0.1, // Átmegy a lapon
          },
          margin: 10,
          useCSG: true, // ÚJ: CSG műveletek használata
        }),

        // Vízelvezető lyukak - középső szektor (CSG)
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
          holeParams: {
            type: "circle",
            radius: 0.8,
            depth: 1.2 + 0.1,
          },
          margin: 10,
          useCSG: true, // ÚJ: CSG műveletek használata
        }),

        // Vízelvezető lyukak - hátsó szektor (szűrve a fő lyuk környékét) (CSG)
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
            holeParams: {
              type: "circle",
              radius: 0.8,
              depth: 1.2 + 0.1,
            },
            margin: 10,
            useCSG: true, // ÚJ: CSG műveletek használata
          });

          // Szűrjük ki a fő lyuk közelében lévő lyukakat
          return holes.filter((operation) => {
            const distance = Math.sqrt(
              Math.pow(operation.position.x - mainHoleX, 2) +
                Math.pow(operation.position.z - 0, 2)
            );
            return distance > 8; // 8cm biztonsági távolság
          });
        })(),
      ],
    },
    transform: {
      position: { x: 0, y: 0, z: 0 },
    },
    explode: {
      offset: { x: 0, y: 30, z: 0 },
    },
  },
];
