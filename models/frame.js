export const elements = [
  // Váz - hosszanti lécek (2 db) - VÁLTOZATLAN
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

  // Váz - keresztlécek (első és hátsó) - VÁLTOZATLAN
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

  // Váz - belső keresztlécek (2 db) - VÁLTOZATLAN
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

  // Tipliek a keresztlécekhez - függőlegesen középen
  // Első keresztléc tipliei (4 db)
  ...(() => {
    const crossBeamX =
      -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2;
    const crossBeamY = -COURSE_DIMENSIONS.frameHeight / 2 - 1.2;

    return [
      // Bal oldal - első tipli
      window.part.dowel({
        id: "dowel_front_left_1",
        position: {
          x: crossBeamX - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2, // 2 cm-re a széltől
          y: crossBeamY, // Keresztléc közepén
          z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
        },
        explodeOffset: { x: 0, y: 0, z: -15 }, // Csak balra
        rotation: { x: Math.PI / 2, y: 0, z: 0 }, // Függőlegesen felfelé
      }),
      // Bal oldal - második tipli
      window.part.dowel({
        id: "dowel_front_left_2",
        position: {
          x: crossBeamX + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2, // 2 cm-re a másik széltől
          y: crossBeamY, // Keresztléc közepén
          z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
        },
        explodeOffset: { x: 0, y: 0, z: -15 }, // Csak balra
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
      }),
      // Jobb oldal - első tipli
      window.part.dowel({
        id: "dowel_front_right_1",
        position: {
          x: crossBeamX - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2,
          y: crossBeamY, // Keresztléc közepén
          z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth,
        },
        explodeOffset: { x: 0, y: 0, z: 15 }, // Csak jobbra
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
      }),
      // Jobb oldal - második tipli
      window.part.dowel({
        id: "dowel_front_right_2",
        position: {
          x: crossBeamX + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2,
          y: crossBeamY, // Keresztléc közepén
          z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth,
        },
        explodeOffset: { x: 0, y: 0, z: 15 }, // Csak jobbra
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
      }),
    ];
  })(),

  // Hátsó keresztléc tipliei (4 db)
  ...(() => {
    const crossBeamX =
      COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2;
    const crossBeamY = -COURSE_DIMENSIONS.frameHeight / 2 - 1.2;

    return [
      // Bal oldal - első tipli
      window.part.dowel({
        id: "dowel_back_left_1",
        position: {
          x: crossBeamX - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2,
          y: crossBeamY, // Keresztléc közepén
          z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
        },
        explodeOffset: { x: 0, y: 0, z: -15 }, // Csak balra
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
      }),
      // Bal oldal - második tipli
      window.part.dowel({
        id: "dowel_back_left_2",
        position: {
          x: crossBeamX + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2,
          y: crossBeamY, // Keresztléc közepén
          z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
        },
        explodeOffset: { x: 0, y: 0, z: -15 }, // Csak balra
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
      }),
      // Jobb oldal - első tipli
      window.part.dowel({
        id: "dowel_back_right_1",
        position: {
          x: crossBeamX - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2,
          y: crossBeamY, // Keresztléc közepén
          z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth,
        },
        explodeOffset: { x: 0, y: 0, z: 15 }, // Csak jobbra
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
      }),
      // Jobb oldal - második tipli
      window.part.dowel({
        id: "dowel_back_right_2",
        position: {
          x: crossBeamX + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2,
          y: crossBeamY, // Keresztléc közepén
          z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth,
        },
        explodeOffset: { x: 0, y: 0, z: 15 }, // Csak jobbra
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
      }),
    ];
  })(),

  // Belső keresztlécek tipliei
  ...Array.from({ length: COURSE_DIMENSIONS.crossBeamCount }, (_, i) => {
    const spacing =
      COURSE_DIMENSIONS.length / (COURSE_DIMENSIONS.crossBeamCount + 1);
    const crossBeamX = -COURSE_DIMENSIONS.length / 2 + spacing * (i + 1);
    const crossBeamY = -COURSE_DIMENSIONS.frameHeight / 2 - 1.2;

    return [
      // Bal oldal - első tipli
      window.part.dowel({
        id: `dowel_cross_${i + 1}_left_1`,
        position: {
          x: crossBeamX - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2,
          y: crossBeamY, // Keresztléc közepén
          z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
        },
        explodeOffset: { x: 0, y: 0, z: -15 }, // Csak balra
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
      }),
      // Bal oldal - második tipli
      window.part.dowel({
        id: `dowel_cross_${i + 1}_left_2`,
        position: {
          x: crossBeamX + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2,
          y: crossBeamY, // Keresztléc közepén
          z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
        },
        explodeOffset: { x: 0, y: 0, z: -15 }, // Csak balra
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
      }),
      // Jobb oldal - első tipli
      window.part.dowel({
        id: `dowel_cross_${i + 1}_right_1`,
        position: {
          x: crossBeamX - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2,
          y: crossBeamY, // Keresztléc közepén
          z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth,
        },
        explodeOffset: { x: 0, y: 0, z: 15 }, // Csak jobbra
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
      }),
      // Jobb oldal - második tipli
      window.part.dowel({
        id: `dowel_cross_${i + 1}_right_2`,
        position: {
          x: crossBeamX + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2,
          y: crossBeamY, // Keresztléc közepén
          z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth,
        },
        explodeOffset: { x: 0, y: 0, z: 15 }, // Csak jobbra
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
      }),
    ];
  }).flat(),
];
