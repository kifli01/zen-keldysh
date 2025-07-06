export const elements = [
  // Minigolf labda - 43mm átmérő - VÁLTOZATLAN
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
        y: COURSE_DIMENSIONS.topPlateThickness / 2 + COURSE_DIMENSIONS.turfThickness / 2 + 2.75, // A műfű tetején + labda sugara
        z: -COURSE_DIMENSIONS.width / 2 + 2.15, // Bal szélhez érve (bal oldali fal belseje + labda sugara)
      },
    },
    explode: {
      offset: { x: 0, y: 100, z: 0 },
    },
  },
];
