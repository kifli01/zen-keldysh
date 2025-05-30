export const elements = [
  {
    id: "top_plate",
    name: "Faalap",
    type: ELEMENT_TYPES.PLATE,
    material: "PINE_PLYWOOD",
    geometry: {
      type: GEOMETRY_TYPES.BOX,
      dimensions: {
        width: COURSE_DIMENSIONS.width, // 80 cm
        height: 1.2, // 12mm = 1.2 cm
        length: COURSE_DIMENSIONS.length, // 250 cm
      },
      csgOperations: [
        ...twoStepHole({
          position: {
            x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.holePositionX,
            y: 0,
            z: 0,
          },
          axis: "y",
          parentThickness: 1.2,
          firstHole: { radius: 8.7, depth: 0.3 },
          secondHole: { radius: 6.6, depth: 0.9 },
        }),

        // Vízelvezető lyukak - első szektor
        ...createCircleHoleGrid({
          area: defineArea(
            -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth,
            -COURSE_DIMENSIONS.length / 2 +
              COURSE_DIMENSIONS.length / 3 -
              COURSE_DIMENSIONS.crossBeamWidth / 2,
            -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
            COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth
          ),
          grid: { x: 4, z: 4 },
          radius: 0.8,
          margin: 10,
          parentThickness: 1.2,
        }),

        // Vízelvezető lyukak - középső szektor
        ...createCircleHoleGrid({
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
          radius: 0.8,
          margin: 10,
          parentThickness: 1.2,
        }),

        // Vízelvezető lyukak - hátsó szektor (szűrve a fő lyuk környékét)

        ...createCircleHoleGrid({
          area: defineArea(
            -COURSE_DIMENSIONS.length / 2 +
              (2 * COURSE_DIMENSIONS.length) / 3 +
              COURSE_DIMENSIONS.crossBeamWidth / 2,
            COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth,
            -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
            COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth
          ),
          grid: { x: 4, z: 4 },
          radius: 0.8,
          margin: 10,
          parentThickness: 1.2,
          skip: [
            { x: 1, z: 1 },
            { x: 1, z: 2 },
          ],
        }),
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
