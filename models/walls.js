export const elements = [
  // Oldalfalak (2 db) - VÁLTOZATLAN
  {
    id: "wall_left",
    name: "Bal oldali fal",
    type: ELEMENT_TYPES.WALL,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.BOX,
      dimensions: {
        width: COURSE_DIMENSIONS.sideWidth, // 5 cm
        height: COURSE_DIMENSIONS.sideHeight, // 16 cm
        length: COURSE_DIMENSIONS.length, // 250 cm
      },
    },
    transform: {
      position: {
        x: 0,
        y:
          COURSE_DIMENSIONS.turfThickness +
          COURSE_DIMENSIONS.sideVerticalShift -
          COURSE_DIMENSIONS.sideHeight / 2, // 6cm-rel a borítás felett
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
        width: COURSE_DIMENSIONS.sideWidth, // 5 cm
        height: COURSE_DIMENSIONS.sideHeight, // 16 cm
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

  // Végfal - VÁLTOZATLAN
  {
    id: "wall_end",
    name: "Végfal",
    type: ELEMENT_TYPES.WALL,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.BOX,
      dimensions: {
        width: COURSE_DIMENSIONS.width + 2 * COURSE_DIMENSIONS.sideWidth, // 92 cm
        height: COURSE_DIMENSIONS.sideHeight, // 16 cm
        length: COURSE_DIMENSIONS.sideWidth, // 5 cm
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

  // Kezdő záró elem - VÁLTOZATLAN
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
        y: -COURSE_DIMENSIONS.frontHeight / 2 + COURSE_DIMENSIONS.topPlateThickness / 2,
        z: 0,
      },
    },
    explode: {
      offset: { x: -40, y: 0, z: 0 },
    },
  },

  // SAROKVASAK

  // 1. sor
  window.part.smallCorner({
    id: "corner_first_left", // 1. sor, bal
    position: { 
      x: -COURSE_DIMENSIONS.length / 2 + 3 / 2,
      y: -COURSE_DIMENSIONS.frameHeight - 2 + 0.1,
      z: -COURSE_DIMENSIONS.width / 2 + 0.1, 
    },
    rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
    explodeOffset: { x: 0, y: 0, z: -50 }
  }),
  window.part.smallCorner({
    id: "corner_first_right", // 1. sor, jobb
    position: { 
      x: -COURSE_DIMENSIONS.length / 2 + 3 / 2,
      y: -COURSE_DIMENSIONS.frameHeight - 2 + 0.1,
      z: COURSE_DIMENSIONS.width / 2 - 0.1, 
    },
    rotation: { x: 0, y: -Math.PI / 2, z: Math.PI / 2 },
    explodeOffset: { x: 0, y: 0, z: 50 }
  }),

  // 2. sor
  window.part.smallCorner({
    id: "corner_second_left", // 2. sor, bal
    position: { 
      x: -COURSE_DIMENSIONS.length / 4,
      y: -COURSE_DIMENSIONS.frameHeight - 2 + 0.1,
      z: -COURSE_DIMENSIONS.width / 2 + 0.1, 
    },
    rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
    explodeOffset: { x: 0, y: 0, z: -50 }
  }),
  window.part.smallCorner({
    id: "corner_second_right", // 2. sor, jobb
    position: { 
      x: -COURSE_DIMENSIONS.length / 4,
      y: -COURSE_DIMENSIONS.frameHeight - 2 + 0.1,
      z: COURSE_DIMENSIONS.width / 2 - 0.1, 
    },
    rotation: { x: 0, y: -Math.PI / 2, z: Math.PI / 2 },
    explodeOffset: { x: 0, y: 0, z: 50 }
  }),

   // 3. sor
  window.part.smallCorner({
    id: "corner_third_left", // 3. sor, bal
    position: { 
      x: 0,
      y: -COURSE_DIMENSIONS.frameHeight - 2 + 0.1,
      z: -COURSE_DIMENSIONS.width / 2 + 0.1, 
    },
    rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
    explodeOffset: { x: 0, y: 0, z: -50 }
  }),
  window.part.smallCorner({
    id: "corner_third_right", // 3. sor, jobb
    position: { 
      x: 0,
      y: -COURSE_DIMENSIONS.frameHeight - 2 + 0.1,
      z: COURSE_DIMENSIONS.width / 2 - 0.1, 
    },
    rotation: { x: 0, y: -Math.PI / 2, z: Math.PI / 2 },
    explodeOffset: { x: 0, y: 0, z: 50 }
  }),

   // 4. sor
  window.part.smallCorner({
    id: "corner_fourth_left", // 4. sor, bal
    position: { 
      x: COURSE_DIMENSIONS.length / 4,
      y: -COURSE_DIMENSIONS.frameHeight - 2 + 0.1,
      z: -COURSE_DIMENSIONS.width / 2 + 0.1, 
    },
    rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
    explodeOffset: { x: 0, y: 0, z: -50 }
  }),
  window.part.smallCorner({
    id: "corner_fourth_right", // 4. sor, jobb
    position: { 
      x: COURSE_DIMENSIONS.length / 4,
      y: -COURSE_DIMENSIONS.frameHeight - 2 + 0.1,
      z: COURSE_DIMENSIONS.width / 2 - 0.1, 
    },
    rotation: { x: 0, y: -Math.PI / 2, z: Math.PI / 2 },
    explodeOffset: { x: 0, y: 0, z: 50 }
  }),

  // 5. sor
  window.part.smallCorner({
    id: "corner_fifth_left", // 5. sor, bal
    position: { 
      x: COURSE_DIMENSIONS.length / 2 - 3 / 2,
      y: -COURSE_DIMENSIONS.frameHeight - 2 + 0.1,
      z: -COURSE_DIMENSIONS.width / 2 + 0.1, 
    },
    rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
    explodeOffset: { x: 0, y: 0, z: -50 }
  }),
  window.part.smallCorner({
    id: "corner_fifth_right", // 5. sor, jobb
    position: { 
      x: COURSE_DIMENSIONS.length / 2 - 3 / 2,
      y: -COURSE_DIMENSIONS.frameHeight - 2 + 0.1,
      z: COURSE_DIMENSIONS.width / 2 - 0.1, 
    },
    rotation: { x: 0, y: -Math.PI / 2, z: Math.PI / 2 },
    explodeOffset: { x: 0, y: 0, z: 50 }
  }),

  ...Array.from({ length: 5 }, (v, i) => window.part.tessauerSmall({
    id: `tessauer_left_wall_${i}`,
    position: { 
      x: HOLE_POSITION.smallCorner.x[i], 
      y: - HOLE_POSITION.smallCorner.y - 2 - 0.2 - 0.15 - 0.15, 
      z: HOLE_POSITION.smallCorner.z + 1.3 / 2 - 0.1
    },
    explodeOffset: { x: 0, y: 0, z: 55 },
    rotation: { x: Math.PI / 2, y: 0, z: 0 },
  })),

  ...Array.from({ length: 5 }, (v, i) => window.part.tessauerSmall({
    id: `tessauer_right_wall_${i}`,
    position: { 
      x: HOLE_POSITION.smallCorner.x[i], 
      y: - HOLE_POSITION.smallCorner.y - 2 - 0.2 - 0.15 - 0.15, 
      z: - HOLE_POSITION.smallCorner.z - 1.3 / 2 + 0.1
    },
    explodeOffset: { x: 0, y: 0, z: -55 },
    rotation: { x: Math.PI / 2, y: 0, z: 0 },
  }))

  
];
