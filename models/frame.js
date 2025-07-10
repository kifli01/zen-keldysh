const topPosition = -COURSE_DIMENSIONS.frameHeight / 2 - COURSE_DIMENSIONS.topPlateThickness / 2;

export const elements = [
  // Váz - hosszanti lécek (2 db) - VÁLTOZATLAN
   // Váz - hosszanti lécek (2 db) - TIPLI LYUKAKKAL
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
      // ÚJ: Tipli lyukak - bal hosszanti léc
      // csgOperations: [
      //   ...Array.from({ length: 5 }, (v, i) => createCircleHole({
      //     radius: 0.2,
      //     position: { 
      //       x: HOLE_POSITION.smallCorner.x[i], 
      //       y: - COURSE_DIMENSIONS.frameHeight / 2 + 1.3 / 2 - 0.1, 
      //       z: - COURSE_DIMENSIONS.frameWidth / 2 + 2 + 0.3 / 2 + 0.2,
      //     },
      //     axis: 'y',
      //     direction: 'bottom',
      //     depth: 1.3,
      //   })),
      //   // Első keresztléc tipliei - 2 lyuk
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2, // -123
      //       y: 0,
      //       z: COURSE_DIMENSIONS.frameWidth / 2 - 1 // +2
      //     },
      //     axis: 'z',
      //     direction: 'right',
      //     depth: 2
      //   }),
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2, // -115
      //       y: 0,
      //       z: COURSE_DIMENSIONS.frameWidth / 2 - 1 // +2
      //     },
      //     axis: 'z',
      //     direction: 'right',
      //     depth: 2,

      //   }),
      //   // 1. belső keresztléc tipliei - 2 lyuk
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.length / 3 - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2, // ~-87.33
      //       y: 0,
      //       z: COURSE_DIMENSIONS.frameWidth / 2 - 1 // +2
      //     },
      //     axis: 'z',
      //     direction: 'right',
      //     depth: 2
      //   }),
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.length / 3 + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2, // ~-79.33
      //       y: 0,
      //       z: COURSE_DIMENSIONS.frameWidth / 2 - 1 // +2
      //     },
      //     axis: 'z',
      //     direction: 'right',
      //     depth: 2
      //   }),
      //   // 2. belső keresztléc tipliei - 2 lyuk
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -COURSE_DIMENSIONS.length / 2 + 2 * COURSE_DIMENSIONS.length / 3 - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2, // ~-4
      //       y: 0,
      //       z: COURSE_DIMENSIONS.frameWidth / 2 - 1 // +2
      //     },
      //     axis: 'z',
      //     direction: 'right',
      //     depth: 2
      //   }),
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -COURSE_DIMENSIONS.length / 2 + 2 * COURSE_DIMENSIONS.length / 3 + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2, // ~+4
      //       y: 0,
      //       z: COURSE_DIMENSIONS.frameWidth / 2 - 1 // +2
      //     },
      //     axis: 'z',
      //     direction: 'right',
      //     depth: 2
      //   }),
      //   // Hátsó keresztléc tipliei - 2 lyuk
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2, // +115
      //       y: 0,
      //       z: COURSE_DIMENSIONS.frameWidth / 2 - 1 // +2
      //     },
      //     axis: 'z',
      //     direction: 'right',
      //     depth: 2
      //   }),
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2, // +123
      //       y: 0,
      //       z: COURSE_DIMENSIONS.frameWidth / 2 - 1 // +2
      //     },
      //     axis: 'z',
      //     direction: 'right',
      //     depth: 2
      //   })
      // ],
    },
    transform: {
      position: {
        x: 0,
        y: topPosition, // Frissített faalap vastagság
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
      // ÚJ: Tipli lyukak - jobb hosszanti léc
      // csgOperations: [
      //   ...Array.from({ length: 5 }, (v, i) => createCircleHole({
      //     radius: 0.2,
      //     position: { 
      //       x: HOLE_POSITION.smallCorner.x[i], 
      //       y: - COURSE_DIMENSIONS.frameHeight / 2 + 1.3 / 2 - 0.1, 
      //       z: COURSE_DIMENSIONS.frameWidth / 2 - 2 - 0.3 / 2 - 0.2,
      //     },
      //     axis: 'y',
      //     direction: 'bottom',
      //     depth: 1.3,
      //   })),
      //   // Első keresztléc tipliei - 2 lyuk
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2, // -123
      //       y: 0,
      //       z: -COURSE_DIMENSIONS.frameWidth / 2 + 1 // -2
      //     },
      //     axis: 'z',
      //     direction: 'left',
      //     depth: 2
      //   }),
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2, // -115
      //       y: 0,
      //       z: -COURSE_DIMENSIONS.frameWidth / 2 + 1 // -2
      //     },
      //     axis: 'z',
      //     direction: 'left',
      //     depth: 2
      //   }),
      //   // 1. belső keresztléc tipliei - 2 lyuk
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.length / 3 - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2, // ~-87.33
      //       y: 0,
      //       z: -COURSE_DIMENSIONS.frameWidth / 2 + 1 // -2
      //     },
      //     axis: 'z',
      //     direction: 'left',
      //     depth: 2
      //   }),
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.length / 3 + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2, // ~-79.33
      //       y: 0,
      //       z: -COURSE_DIMENSIONS.frameWidth / 2 + 1 // -2
      //     },
      //     axis: 'z',
      //     direction: 'left',
      //     depth: 2
      //   }),
      //   // 2. belső keresztléc tipliei - 2 lyuk
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -COURSE_DIMENSIONS.length / 2 + 2 * COURSE_DIMENSIONS.length / 3 - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2, // ~-4
      //       y: 0,
      //       z: -COURSE_DIMENSIONS.frameWidth / 2 + 1 // -2
      //     },
      //     axis: 'z',
      //     direction: 'left',
      //     depth: 2
      //   }),
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -COURSE_DIMENSIONS.length / 2 + 2 * COURSE_DIMENSIONS.length / 3 + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2, // ~+4
      //       y: 0,
      //       z: -COURSE_DIMENSIONS.frameWidth / 2 + 1 // -2
      //     },
      //     axis: 'z',
      //     direction: 'left',
      //     depth: 2
      //   }),
      //   // Hátsó keresztléc tipliei - 2 lyuk
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2, // +115
      //       y: 0,
      //       z: -COURSE_DIMENSIONS.frameWidth / 2 + 1 // -2
      //     },
      //     axis: 'z',
      //     direction: 'left',
      //     depth: 2
      //   }),
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2, // +123
      //       y: 0,
      //       z: -COURSE_DIMENSIONS.frameWidth / 2 + 1 // -2
      //     },
      //     axis: 'z',
      //     direction: 'left',
      //     depth: 2
      //   })
      // ],
    },
    transform: {
      position: {
        x: 0,
        y: topPosition, // Frissített faalap vastagság
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth / 2,
      },
    },
    explode: {
      offset: { x: 0, y: 0, z: 25 },
    },
  },

  // Váz - keresztlécek (első és hátsó) - TIPLI LYUKAKKAL
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
      // ÚJ: Tipli lyukak - első keresztléc
      // csgOperations: [
      //   // Bal oldal - első tipli lyuk
      //   createCircleHole({
      //     radius: 0.4, // 8mm átmérő / 2
      //     position: {
      //       x: -2, // -12/2 + 2 = -4cm
      //       y: 0,  // Keresztléc közepén
      //       z: (COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth) / 2 - 1,
      //     },
      //     axis: 'z',
      //     direction: 'left',
      //     depth: 2
      //   }),
      //   // Bal oldal - második tipli lyuk  
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: 2,   // 12/2 - 2 = 4cm
      //       y: 0,
      //       z: (COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth) / 2 - 1
      //     },
      //     axis: 'z', 
      //     direction: 'left',
      //     depth: 2
      //   }),
      //   // Jobb oldal - első tipli lyuk
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -2,
      //       y: 0,
      //       z: - (COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth) / 2 + 1
      //     },
      //     axis: 'z',
      //     direction: 'right', 
      //     depth: 2
      //   }),
      //   // Jobb oldal - második tipli lyuk
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: 2,
      //       y: 0, 
      //       z: - (COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth) / 2 + 1
      //     },
      //     axis: 'z',
      //     direction: 'right',
      //     depth: 2
      //   })
      // ],
    },
    transform: {
      position: {
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2,
        y: topPosition, // Frissített faalap vastagság
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
      // ÚJ: Tipli lyukak - hátsó keresztléc
      // csgOperations: [
      //   // Bal oldal - első tipli lyuk
      //   createCircleHole({
      //     radius: 0.4, // 8mm átmérő / 2
      //     position: {
      //       x: -2, // -12/2 + 2 = -4cm
      //       y: 0,  // Keresztléc közepén
      //       z: (COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth) / 2 - 1,
      //     },
      //     axis: 'z',
      //     direction: 'left',
      //     depth: 2
      //   }),
      //   // Bal oldal - második tipli lyuk  
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: 2,   // 12/2 - 2 = 4cm
      //       y: 0,
      //       z: (COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth) / 2 - 1
      //     },
      //     axis: 'z', 
      //     direction: 'left',
      //     depth: 2
      //   }),
      //   // Jobb oldal - első tipli lyuk
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -2,
      //       y: 0,
      //       z: - (COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth) / 2 + 1
      //     },
      //     axis: 'z',
      //     direction: 'right', 
      //     depth: 2
      //   }),
      //   // Jobb oldal - második tipli lyuk
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: 2,
      //       y: 0, 
      //       z: - (COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth) / 2 + 1
      //     },
      //     axis: 'z',
      //     direction: 'right',
      //     depth: 2
      //   })
      // ],
    },
    transform: {
      position: {
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2,
        y: topPosition, // Frissített faalap vastagság
        z: 0,
      },
    },
    explode: {
      offset: { x: 0, y: 0, z: 0 },
    },
  },

  // Váz - belső keresztlécek (2 db) - TIPLI LYUKAKKAL
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
        // ÚJ: Tipli lyukak - belső keresztlécek
      //   csgOperations: [
      //   // Bal oldal - első tipli lyuk
      //   createCircleHole({
      //     radius: 0.4, // 8mm átmérő / 2
      //     position: {
      //       x: -2, // -12/2 + 2 = -4cm
      //       y: 0,  // Keresztléc közepén
      //       z: (COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth) / 2 - 1,
      //     },
      //     axis: 'z',
      //     direction: 'left',
      //     depth: 2
      //   }),
      //   // Bal oldal - második tipli lyuk  
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: 2,   // 12/2 - 2 = 4cm
      //       y: 0,
      //       z: (COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth) / 2 - 1
      //     },
      //     axis: 'z', 
      //     direction: 'left',
      //     depth: 2
      //   }),
      //   // Jobb oldal - első tipli lyuk
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: -2,
      //       y: 0,
      //       z: - (COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth) / 2 + 1
      //     },
      //     axis: 'z',
      //     direction: 'right', 
      //     depth: 2
      //   }),
      //   // Jobb oldal - második tipli lyuk
      //   createCircleHole({
      //     radius: 0.4,
      //     position: {
      //       x: 2,
      //       y: 0, 
      //       z: - (COURSE_DIMENSIONS.width - 2 * COURSE_DIMENSIONS.frameWidth) / 2 + 1
      //     },
      //     axis: 'z',
      //     direction: 'right',
      //     depth: 2
      //   })
      // ],
      },
      transform: {
        position: {
          x: posX,
          y: topPosition, // Frissített faalap vastagság
          z: 0,
        },
      },
      explode: {
        offset: { x: 0, y: 0, z: 0 },
      },
      spacing: spacing,
    };
  }),

  // Tipliek a keresztlécekhez - függőlegesen középen - VÁLTOZATLAN
  // Első keresztléc tipliei (4 db)
  // ...(() => {
  //   const crossBeamX =
  //     -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2;
  //   const crossBeamY = -COURSE_DIMENSIONS.frameHeight / 2 - COURSE_DIMENSIONS.topPlateThickness;

  //   return [
  //     // Bal oldal - első tipli
  //     window.part.dowel({
  //       id: "dowel_front_left_1",
  //       position: {
  //         x: crossBeamX - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2, // 2 cm-re a széltől
  //         y: crossBeamY, // Keresztléc közepén
  //         z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
  //       },
  //       explodeOffset: { x: 0, y: 0, z: -15 }, // Csak balra
  //       rotation: { x: Math.PI / 2, y: 0, z: 0 }, // Függőlegesen felfelé
  //     }),
  //     // Bal oldal - második tipli
  //     window.part.dowel({
  //       id: "dowel_front_left_2",
  //       position: {
  //         x: crossBeamX + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2, // 2 cm-re a másik széltől
  //         y: crossBeamY, // Keresztléc közepén
  //         z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
  //       },
  //       explodeOffset: { x: 0, y: 0, z: -15 }, // Csak balra
  //       rotation: { x: Math.PI / 2, y: 0, z: 0 },
  //     }),
  //     // Jobb oldal - első tipli
  //     window.part.dowel({
  //       id: "dowel_front_right_1",
  //       position: {
  //         x: crossBeamX - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2,
  //         y: crossBeamY, // Keresztléc közepén
  //         z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth,
  //       },
  //       explodeOffset: { x: 0, y: 0, z: 15 }, // Csak jobbra
  //       rotation: { x: Math.PI / 2, y: 0, z: 0 },
  //     }),
  //     // Jobb oldal - második tipli
  //     window.part.dowel({
  //       id: "dowel_front_right_2",
  //       position: {
  //         x: crossBeamX + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2,
  //         y: crossBeamY, // Keresztléc közepén
  //         z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth,
  //       },
  //       explodeOffset: { x: 0, y: 0, z: 15 }, // Csak jobbra
  //       rotation: { x: Math.PI / 2, y: 0, z: 0 },
  //     }),
  //   ];
  // })(),

  // // Hátsó keresztléc tipliei (4 db)
  // ...(() => {
  //   const crossBeamX =
  //     COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2;
  //   const crossBeamY = -COURSE_DIMENSIONS.frameHeight / 2 - 1.2;

  //   return [
  //     // Bal oldal - első tipli
  //     window.part.dowel({
  //       id: "dowel_back_left_1",
  //       position: {
  //         x: crossBeamX - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2,
  //         y: crossBeamY, // Keresztléc közepén
  //         z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
  //       },
  //       explodeOffset: { x: 0, y: 0, z: -15 }, // Csak balra
  //       rotation: { x: Math.PI / 2, y: 0, z: 0 },
  //     }),
  //     // Bal oldal - második tipli
  //     window.part.dowel({
  //       id: "dowel_back_left_2",
  //       position: {
  //         x: crossBeamX + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2,
  //         y: crossBeamY, // Keresztléc közepén
  //         z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
  //       },
  //       explodeOffset: { x: 0, y: 0, z: -15 }, // Csak balra
  //       rotation: { x: Math.PI / 2, y: 0, z: 0 },
  //     }),
  //     // Jobb oldal - első tipli
  //     window.part.dowel({
  //       id: "dowel_back_right_1",
  //       position: {
  //         x: crossBeamX - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2,
  //         y: crossBeamY, // Keresztléc közepén
  //         z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth,
  //       },
  //       explodeOffset: { x: 0, y: 0, z: 15 }, // Csak jobbra
  //       rotation: { x: Math.PI / 2, y: 0, z: 0 },
  //     }),
  //     // Jobb oldal - második tipli
  //     window.part.dowel({
  //       id: "dowel_back_right_2",
  //       position: {
  //         x: crossBeamX + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2,
  //         y: crossBeamY, // Keresztléc közepén
  //         z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth,
  //       },
  //       explodeOffset: { x: 0, y: 0, z: 15 }, // Csak jobbra
  //       rotation: { x: Math.PI / 2, y: 0, z: 0 },
  //     }),
  //   ];
  // })(),

  // // Belső keresztlécek tipliei
  // ...Array.from({ length: COURSE_DIMENSIONS.crossBeamCount }, (_, i) => {
  //   const spacing =
  //     COURSE_DIMENSIONS.length / (COURSE_DIMENSIONS.crossBeamCount + 1);
  //   const crossBeamX = -COURSE_DIMENSIONS.length / 2 + spacing * (i + 1);
  //   const crossBeamY = -COURSE_DIMENSIONS.frameHeight / 2 - 1.2;

  //   return [
  //     // Bal oldal - első tipli
  //     window.part.dowel({
  //       id: `dowel_cross_${i + 1}_left_1`,
  //       position: {
  //         x: crossBeamX - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2,
  //         y: crossBeamY, // Keresztléc közepén
  //         z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
  //       },
  //       explodeOffset: { x: 0, y: 0, z: -15 }, // Csak balra
  //       rotation: { x: Math.PI / 2, y: 0, z: 0 },
  //     }),
  //     // Bal oldal - második tipli
  //     window.part.dowel({
  //       id: `dowel_cross_${i + 1}_left_2`,
  //       position: {
  //         x: crossBeamX + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2,
  //         y: crossBeamY, // Keresztléc közepén
  //         z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth,
  //       },
  //       explodeOffset: { x: 0, y: 0, z: -15 }, // Csak balra
  //       rotation: { x: Math.PI / 2, y: 0, z: 0 },
  //     }),
  //     // Jobb oldal - első tipli
  //     window.part.dowel({
  //       id: `dowel_cross_${i + 1}_right_1`,
  //       position: {
  //         x: crossBeamX - COURSE_DIMENSIONS.crossBeamWidth / 2 + 2,
  //         y: crossBeamY, // Keresztléc közepén
  //         z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth,
  //       },
  //       explodeOffset: { x: 0, y: 0, z: 15 }, // Csak jobbra
  //       rotation: { x: Math.PI / 2, y: 0, z: 0 },
  //     }),
  //     // Jobb oldal - második tipli
  //     window.part.dowel({
  //       id: `dowel_cross_${i + 1}_right_2`,
  //       position: {
  //         x: crossBeamX + COURSE_DIMENSIONS.crossBeamWidth / 2 - 2,
  //         y: crossBeamY, // Keresztléc közepén
  //         z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth,
  //       },
  //       explodeOffset: { x: 0, y: 0, z: 15 }, // Csak jobbra
  //       rotation: { x: Math.PI / 2, y: 0, z: 0 },
  //     }),
  //   ];
  // }).flat(),
];
