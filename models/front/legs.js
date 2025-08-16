export const elements = [
  // Lábak (8 db) - keresztlécek közepén - VÁLTOZATLAN
  ...Array.from({ length: 4 }, (_, i) => {

    const legPositions = [
      // Első keresztlécnél (bal és jobb oldal)
      {
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2 + COURSE_DIMENSIONS.frameWidth + COURSE_DIMENSIONS.legShift,
        z:
          -COURSE_DIMENSIONS.width / 2 +
          COURSE_DIMENSIONS.frameWidth / 2 +
          COURSE_DIMENSIONS.legInset,
      },
      {
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2 + COURSE_DIMENSIONS.frameWidth + COURSE_DIMENSIONS.legShift,
        z:
          COURSE_DIMENSIONS.width / 2 -
          COURSE_DIMENSIONS.frameWidth / 2 -
          COURSE_DIMENSIONS.legInset,
      },
      // Hátsó keresztlécnél
      {
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2 - COURSE_DIMENSIONS.frameWidth - COURSE_DIMENSIONS.frameDistEnd - COURSE_DIMENSIONS.legShift,
        z:
          -COURSE_DIMENSIONS.width / 2 +
          COURSE_DIMENSIONS.frameWidth / 2 +
          COURSE_DIMENSIONS.legInset,
      },
      {
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2 - COURSE_DIMENSIONS.frameWidth - COURSE_DIMENSIONS.frameDistEnd - COURSE_DIMENSIONS.legShift,
        z:
          COURSE_DIMENSIONS.width / 2 -
          COURSE_DIMENSIONS.frameWidth / 2 -
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
            COURSE_DIMENSIONS.topPlateThickness / 2 - // Frissített faalap vastagság
            COURSE_DIMENSIONS.legHeight / 2,
          z: pos.z,
        },
      },
      explode: {
        offset: { x: 0, y: -10, z: 0 },
      },
    };
  }),
];
