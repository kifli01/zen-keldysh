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
      // ÚJ: Kétlépcsős lyuk jobbról balra
      // csgOperations: [
      //   ...twoStepHole({
      //     position: {
      //       x: 0, // Középen hosszában
      //       y: 0, // Középen magasságban
      //       z: 0, // Fal középpontjában (vastagság irányban)
      //     },
      //     parentThickness: COURSE_DIMENSIONS.sideWidth, // 5 cm (fal vastagsága)
      //     firstHole: {
      //       radius: 2, // 2 cm sugár (4 cm átmérő)
      //       depth: 4, // 4 cm mélység
      //     },
      //     secondHole: {
      //       radius: 1, // 1 cm sugár (2 cm átmérő)
      //       depth: 1, // 1 cm mélység (4+1=5cm = teljes átfúrás)
      //     },
      //     axis: "z", // Z tengely (fal vastagság irányban)
      //     direction: "right", // Jobbról balra (külső oldalról befelé)
      //   }),
      // ],
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
        y: -COURSE_DIMENSIONS.frontHeight / 2,
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
      x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2,
      y: -COURSE_DIMENSIONS.frameHeight - 3 + 0.1,
      z: -COURSE_DIMENSIONS.width / 2 + 0.1, 
    },
    rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
    explodeOffset: { x: 0, y: 0, z: -50 }
  }),
  window.part.smallCorner({
    id: "corner_first_right", // 1. sor, jobb
    position: { 
      x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2,
      y: -COURSE_DIMENSIONS.frameHeight - 3 + 0.1,
      z: COURSE_DIMENSIONS.width / 2 - 0.1, 
    },
    rotation: { x: 0, y: -Math.PI / 2, z: Math.PI / 2 },
    explodeOffset: { x: 0, y: 0, z: 50 }
  }),

  // 2. sor
  window.part.smallCorner({
    id: "corner_second_left", // 2. sor, bal
    position: { 
      x: -COURSE_DIMENSIONS.length / (COURSE_DIMENSIONS.crossBeamCount + 1) + 
      (COURSE_DIMENSIONS.crossBeamWidth * 3) + (COURSE_DIMENSIONS.crossBeamWidth / 2),
      y: -COURSE_DIMENSIONS.frameHeight - 3 + 0.1,
      z: -COURSE_DIMENSIONS.width / 2 + 0.1, 
    },
    rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
    explodeOffset: { x: 0, y: 0, z: -50 }
  }),
  window.part.smallCorner({
    id: "corner_second_right", // 2. sor, jobb
    position: { 
      x: -COURSE_DIMENSIONS.length / (COURSE_DIMENSIONS.crossBeamCount + 1) + 
      (COURSE_DIMENSIONS.crossBeamWidth * 3) + (COURSE_DIMENSIONS.crossBeamWidth / 2),
      y: -COURSE_DIMENSIONS.frameHeight - 3 + 0.1,
      z: COURSE_DIMENSIONS.width / 2 - 0.1, 
    },
    rotation: { x: 0, y: -Math.PI / 2, z: Math.PI / 2 },
    explodeOffset: { x: 0, y: 0, z: 50 }
  }),

   // 3. sor
  window.part.smallCorner({
    id: "corner_third_left", // 3. sor, bal
    position: { 
      x: COURSE_DIMENSIONS.length / (COURSE_DIMENSIONS.crossBeamCount + 1) - 
      (COURSE_DIMENSIONS.crossBeamWidth * 3) - (COURSE_DIMENSIONS.crossBeamWidth / 2),
      y: -COURSE_DIMENSIONS.frameHeight - 3 + 0.1,
      z: -COURSE_DIMENSIONS.width / 2 + 0.1, 
    },
    rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
    explodeOffset: { x: 0, y: 0, z: -50 }
  }),
  window.part.smallCorner({
    id: "corner_third_right", // 3. sor, jobb
    position: { 
      x: COURSE_DIMENSIONS.length / (COURSE_DIMENSIONS.crossBeamCount + 1) - 
      (COURSE_DIMENSIONS.crossBeamWidth * 3) - (COURSE_DIMENSIONS.crossBeamWidth / 2),
      y: -COURSE_DIMENSIONS.frameHeight - 3 + 0.1,
      z: COURSE_DIMENSIONS.width / 2 - 0.1, 
    },
    rotation: { x: 0, y: -Math.PI / 2, z: Math.PI / 2 },
    explodeOffset: { x: 0, y: 0, z: 50 }
  }),

   // 4. sor
  window.part.smallCorner({
    id: "corner_fourth_left", // 4. sor, bal
    position: { 
      x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2,
      y: -COURSE_DIMENSIONS.frameHeight - 3 + 0.1,
      z: -COURSE_DIMENSIONS.width / 2 + 0.1, 
    },
    rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 },
    explodeOffset: { x: 0, y: 0, z: -50 }
  }),
  window.part.smallCorner({
    id: "corner_fourth_right", // 4. sor, jobb
    position: { 
      x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2,
      y: -COURSE_DIMENSIONS.frameHeight - 3 + 0.1,
      z: COURSE_DIMENSIONS.width / 2 - 0.1, 
    },
    rotation: { x: 0, y: -Math.PI / 2, z: Math.PI / 2 },
    explodeOffset: { x: 0, y: 0, z: 50 }
  }),

  window.part.screwHexBig({
    id: "screw_1",
    position: { x: 0, y: 20, z: 0 },
    explodeOffset: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
  }),

  window.part.screwCskSmall({
    id: "screw_2",
    position: { x: -80, y: 40, z: 70 },
    explodeOffset: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
  })
];
