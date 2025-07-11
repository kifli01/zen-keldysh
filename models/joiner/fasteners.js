/**
 * Fasteners Model
 * merevítő fa elemek - háromszög alakú
 * v1.0.0 - Egyszerűsített verzió
 */

const topPosition = -COURSE_DIMENSIONS.frameHeight / 2 - COURSE_DIMENSIONS.topPlateThickness / 2;

export const elements = [
  // Derékszögű háromszög rögzítő elem
  {
    id: "triangle_fastener_1",
    name: "Háromszög merevítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID", // Lucfenyő tömörfa
    geometry: {
      type: GEOMETRY_TYPES.TRIANGLE,
      dimensions: {
          width: COURSE_DIMENSIONS.triangleDims.width, 
          height: COURSE_DIMENSIONS.triangleDims.height, 
          thickness: COURSE_DIMENSIONS.fastenerThickness,
        },
    },
    transform: {
      position: {
        x: -COURSE_DIMENSIONS.frameDistEnd + COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.crossBeamWidth - COURSE_DIMENSIONS.triangleShift, 
        y: topPosition,
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.frameWidth + COURSE_DIMENSIONS.triangleShift - COURSE_DIMENSIONS.frameWidth,
      },
      rotation: { x: Math.PI / 2, y: 0, z: Math.PI / 4 },
    },
    explode: {
      offset: { x: 10, y: 0, z: 0 },
    },
  },
  {
    id: "triangle_fastener_2",
    name: "Háromszög merevítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID", // Lucfenyő tömörfa
    geometry: {
      type: GEOMETRY_TYPES.TRIANGLE,
      dimensions: {
          width: COURSE_DIMENSIONS.triangleDims.width, 
          height: COURSE_DIMENSIONS.triangleDims.height, 
          thickness: COURSE_DIMENSIONS.fastenerThickness,
        },
    },
    transform: {
      position: {
        x: -COURSE_DIMENSIONS.frameDistEnd + COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.crossBeamWidth - COURSE_DIMENSIONS.triangleShift, 
        y: topPosition,
        z: - COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.frameWidth - COURSE_DIMENSIONS.triangleShift + COURSE_DIMENSIONS.frameWidth
      },
      rotation: { x: Math.PI / 2, y: 0, z: (Math.PI / 4) * 3 },
    },
    explode: {
      offset: { x: 10, y: 0, z: 0 },
    },
  },
 

  {
    id: "triangle_fastener_3",
    name: "Háromszög merevítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID", // Lucfenyő tömörfa
    geometry: {
      type: GEOMETRY_TYPES.TRIANGLE,
      dimensions: {
          width: COURSE_DIMENSIONS.triangleDims.width, 
          height: COURSE_DIMENSIONS.triangleDims.height, 
          thickness: COURSE_DIMENSIONS.fastenerThickness,
        },
    },
    transform: {
      position: {
        x: COURSE_DIMENSIONS.frameDistEnd - 
        COURSE_DIMENSIONS.triangleDims.height / 2 + 
        COURSE_DIMENSIONS.triangleShift / 2 - 
        COURSE_DIMENSIONS.crossBeamWidth, 
        y: topPosition,
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.frameWidth + COURSE_DIMENSIONS.triangleShift - COURSE_DIMENSIONS.frameWidth
      },
      rotation: { x: Math.PI / 2, y: 0, z: - (Math.PI / 4) },
    },
    explode: {
      offset: { x: -10, y: 0, z: 0 },
    },
  },
  {
    id: "triangle_fastener_4",
    name: "Háromszög merevítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID", // Lucfenyő tömörfa
    geometry: {
      type: GEOMETRY_TYPES.TRIANGLE,
      dimensions: {
          width: COURSE_DIMENSIONS.triangleDims.width, 
          height: COURSE_DIMENSIONS.triangleDims.height, 
          thickness: COURSE_DIMENSIONS.fastenerThickness,
        },
    },
    transform: {
      position: {
        x: COURSE_DIMENSIONS.frameDistEnd - 
        COURSE_DIMENSIONS.triangleDims.height / 2 + 
        COURSE_DIMENSIONS.triangleShift / 2 - 
        COURSE_DIMENSIONS.crossBeamWidth, 
        y: topPosition,
        z: - COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.frameWidth - COURSE_DIMENSIONS.triangleShift + COURSE_DIMENSIONS.frameWidth
      },
      rotation: { x: Math.PI / 2, y: 0, z: -(Math.PI / 4) * 3 },
    },
    explode: {
      offset: { x: -10, y: 0, z: 0 },
    },
  },
  
];