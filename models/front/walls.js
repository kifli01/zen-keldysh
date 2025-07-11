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
      csgOperations: [
        ...Array.from({ length: 5 }, (v, i) => createCircleHole({
          radius: 0.2,
          position: { 
            x: HOLE_POSITION.smallCorner.x[i], 
            y: 0, 
            z: COURSE_DIMENSIONS.sideWidth / 2 + 0.1
          },
          axis: 'z',
          direction: 'left',
          depth: 1.3,
        })),
      ],
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
      csgOperations: [
        ...Array.from({ length: 5 }, (v, i) => createCircleHole({
          radius: 0.2,
          position: { 
            x: HOLE_POSITION.smallCorner.x[i], 
            y: 0, 
            z: - COURSE_DIMENSIONS.sideWidth / 2 - 0.1
          },
          axis: 'z',
          direction: 'right',
          depth: 1.3,
        })),
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
];
