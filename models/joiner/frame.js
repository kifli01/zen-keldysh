const topPosition = -COURSE_DIMENSIONS.frameHeight / 2 - COURSE_DIMENSIONS.topPlateThickness / 2;

export const elements = [
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
        length: COURSE_DIMENSIONS.frameDistEnd * 2, 
      },
    },
    transform: {
      position: {
        x: 0,
        y: topPosition, // Frissített faalap vastagság
        z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.frameWidth / 2 + COURSE_DIMENSIONS.frameWidth,
      },
    },
    explode: {
      offset: { x: 0, y: 0, z: -10 },
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
        length: COURSE_DIMENSIONS.frameDistEnd * 2, // 250 cm
      },
    },
    transform: {
      position: {
        x: 0,
        y: topPosition, // Frissített faalap vastagság
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.frameWidth / 2 - COURSE_DIMENSIONS.frameWidth,
      },
    },
    explode: {
      offset: { x: 0, y: 0, z: 10 },
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
        width: COURSE_DIMENSIONS.width - 4 * COURSE_DIMENSIONS.frameWidth, // 68 cm
        height: COURSE_DIMENSIONS.frameHeight, // 4 cm
        length: COURSE_DIMENSIONS.crossBeamWidth, // 12 cm (dupla széles)
      },
    },
    transform: {
      position: {
        x: -COURSE_DIMENSIONS.frameDistEnd + COURSE_DIMENSIONS.frameWidth / 2,
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
        width: COURSE_DIMENSIONS.width - 4 * COURSE_DIMENSIONS.frameWidth, // 68 cm
        height: COURSE_DIMENSIONS.frameHeight, // 4 cm
        length: COURSE_DIMENSIONS.crossBeamWidth, // 12 cm (dupla széles)
      },
    },
    transform: {
      position: {
        x: COURSE_DIMENSIONS.frameDistEnd - COURSE_DIMENSIONS.frameWidth / 2,
        y: topPosition, // Frissített faalap vastagság
        z: 0,
      },
    },
    explode: {
      offset: { x: 0, y: 0, z: 0 },
    },
  },

];
