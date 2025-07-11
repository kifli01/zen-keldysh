export const elements = [
  // Műfű borítás - CSG-re átállítva
  {
    id: "turf",
    name: "Műfű borítás",
    type: ELEMENT_TYPES.COVERING,
    material: "ARTIFICIAL_GRASS",
    shade: 10,
    geometry: {
      type: GEOMETRY_TYPES.BOX, // VÁLTOZÁS: BOX geometria CSG műveletekkel
      dimensions: {
        width: COURSE_DIMENSIONS.width, // 80 cm
        height: COURSE_DIMENSIONS.turfThickness, // 0.6 cm
        length: COURSE_DIMENSIONS.length, // 250 cm
      },
    },
    transform: {
      position: { x: 0, y: COURSE_DIMENSIONS.topPlateThickness / 2 + COURSE_DIMENSIONS.turfThickness / 2, z: 0 }, // Magasabbra helyezve: +0.7cm
    },
    explode: {
      offset: { x: 0, y: 60, z: 0 },
    },
  },
];
