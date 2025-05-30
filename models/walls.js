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
      csgOperations: [
        ...twoStepHole({
          position: {
            x: 0, // Középen hosszában
            y: 0, // Középen magasságban
            z: 0, // Fal középpontjában (vastagság irányban)
          },
          parentThickness: COURSE_DIMENSIONS.sideWidth, // 5 cm (fal vastagsága)
          firstHole: {
            radius: 2, // 2 cm sugár (4 cm átmérő)
            depth: 4, // 4 cm mélység
          },
          secondHole: {
            radius: 1, // 1 cm sugár (2 cm átmérő)
            depth: 1, // 1 cm mélység (4+1=5cm = teljes átfúrás)
          },
          axis: "z", // Z tengely (fal vastagság irányban)
          direction: "right", // Jobbról balra (külső oldalról befelé)
        }),
      ],
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
];
