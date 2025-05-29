export const elements = [
  // Műfű borítás - CSG-re átállítva
  {
    id: "turf",
    name: "Műfű borítás",
    type: ELEMENT_TYPES.COVERING,
    material: "ARTIFICIAL_GRASS",
    geometry: {
      type: GEOMETRY_TYPES.BOX, // VÁLTOZÁS: BOX geometria CSG műveletekkel
      dimensions: {
        width: COURSE_DIMENSIONS.width, // 80 cm
        height: COURSE_DIMENSIONS.turfThickness, // 0.6 cm
        length: COURSE_DIMENSIONS.length, // 250 cm
      },
      // ÚJ: CSG művelet - felső lyuk mérete a műfűhöz
      csgOperations: [
        createCircleHole({
          radius: 5.4,
          position: {
            x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.holePositionX,
            y: 0,
            z: 0,
          },
          depth: COURSE_DIMENSIONS.turfThickness,
        }),
      ],
    },
    transform: {
      position: { x: 0, y: COURSE_DIMENSIONS.turfThickness / 2 + 0.7, z: 0 }, // Magasabbra helyezve: +0.7cm
    },
    explode: {
      offset: { x: 0, y: 60, z: 0 },
    },
  },
];
