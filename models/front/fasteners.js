/**
 * Fasteners Model
 * merevítő fa elemek - háromszög alakú
 * v1.0.0 - Egyszerűsített verzió
 */

const topPosition = -COURSE_DIMENSIONS.frameHeight / 2 - COURSE_DIMENSIONS.topPlateThickness / 2;
const spacingFront = COURSE_DIMENSIONS.length / (COURSE_DIMENSIONS.crossBeamCount + 1);
// const spacingBack = COURSE_DIMENSIONS.length / (COURSE_DIMENSIONS.crossBeamCount);


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
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.crossBeamWidth - COURSE_DIMENSIONS.triangleShift, 
        y: topPosition,
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.frameWidth + COURSE_DIMENSIONS.triangleShift,
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
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.crossBeamWidth - COURSE_DIMENSIONS.triangleShift, 
        y: topPosition,
        z: - COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.frameWidth - COURSE_DIMENSIONS.triangleShift
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
        x: -COURSE_DIMENSIONS.length / 2 + spacingFront - COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2 + COURSE_DIMENSIONS.triangleShift, 
        y: topPosition,
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.frameWidth + COURSE_DIMENSIONS.triangleShift
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
        x: -COURSE_DIMENSIONS.length / 2 + spacingFront - COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.crossBeamWidth / 2 + COURSE_DIMENSIONS.triangleShift, 
        y: topPosition,
        z: - COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.frameWidth - COURSE_DIMENSIONS.triangleShift
      },
      rotation: { x: Math.PI / 2, y: 0, z: -(Math.PI / 4) * 3 },
    },
    explode: {
      offset: { x: -10, y: 0, z: 0 },
    },
  },

  {
    id: "triangle_fastener_5",
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
        x: -COURSE_DIMENSIONS.length / 2 + spacingFront + COURSE_DIMENSIONS.triangleDims.height - COURSE_DIMENSIONS.crossBeamWidth / 2 +  COURSE_DIMENSIONS.triangleShift, 
        y: topPosition,
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.frameWidth + COURSE_DIMENSIONS.triangleShift,
      },
      rotation: { x: Math.PI / 2, y: 0, z: Math.PI / 4 },
    },
    explode: {
      offset: { x: 10, y: 0, z: 0 },
    },
  },
  {
    id: "triangle_fastener_6",
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
        x: -COURSE_DIMENSIONS.length / 2 + spacingFront + COURSE_DIMENSIONS.triangleDims.height - COURSE_DIMENSIONS.crossBeamWidth / 2 + COURSE_DIMENSIONS.triangleShift, 
        y: topPosition,
        z: - COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.frameWidth - COURSE_DIMENSIONS.triangleShift
      },
      rotation: { x: Math.PI / 2, y: 0, z: (Math.PI / 4) * 3 },
    },
    explode: {
      offset: { x: 10, y: 0, z: 0 },
    },
  },
  {
    id: "triangle_fastener_7",
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
        x: COURSE_DIMENSIONS.length / 2 - spacingFront - COURSE_DIMENSIONS.triangleDims.height + COURSE_DIMENSIONS.crossBeamWidth / 2 - COURSE_DIMENSIONS.triangleShift, 
        y: topPosition,
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.frameWidth + COURSE_DIMENSIONS.triangleShift
      },
      rotation: { x: Math.PI / 2, y: 0, z: - (Math.PI / 4) },
    },
    explode: {
      offset: { x: -10, y: 0, z: 0 },
    },
  },
  {
    id: "triangle_fastener_8",
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
        x: COURSE_DIMENSIONS.length / 2 - spacingFront - COURSE_DIMENSIONS.triangleDims.height + COURSE_DIMENSIONS.crossBeamWidth / 2 - COURSE_DIMENSIONS.triangleShift, 
        y: topPosition,
        z: - COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.frameWidth - COURSE_DIMENSIONS.triangleShift
      },
      rotation: { x: Math.PI / 2, y: 0, z: -(Math.PI / 4) * 3 },
    },
    explode: {
      offset: { x: -10, y: 0, z: 0 },
    },
  },
  
  {
    id: "triangle_fastener_9",
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
        x: COURSE_DIMENSIONS.length / 2 - spacingFront + COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2 - COURSE_DIMENSIONS.triangleShift, 
        y: topPosition,
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.frameWidth + COURSE_DIMENSIONS.triangleShift,
      },
      rotation: { x: Math.PI / 2, y: 0, z: Math.PI / 4 },
    },
    explode: {
      offset: { x: 10, y: 0, z: 0 },
    },
  },
  {
    id: "triangle_fastener_10",
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
        x: COURSE_DIMENSIONS.length / 2 - spacingFront + COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.crossBeamWidth / 2 - COURSE_DIMENSIONS.triangleShift, 
        y: topPosition,
        z: - COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.frameWidth - COURSE_DIMENSIONS.triangleShift
      },
      rotation: { x: Math.PI / 2, y: 0, z: (Math.PI / 4) * 3 },
    },
    explode: {
      offset: { x: 10, y: 0, z: 0 },
    },
  },
  {
    id: "triangle_fastener_11",
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
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.crossBeamWidth + COURSE_DIMENSIONS.triangleShift, 
        y: topPosition,
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.frameWidth + COURSE_DIMENSIONS.triangleShift
      },
      rotation: { x: Math.PI / 2, y: 0, z: - (Math.PI / 4) },
    },
    explode: {
      offset: { x: -10, y: 0, z: 0 },
    },
  },
  {
    id: "triangle_fastener_12",
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
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.crossBeamWidth + COURSE_DIMENSIONS.triangleShift, 
        y: topPosition,
        z: - COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.frameWidth - COURSE_DIMENSIONS.triangleShift
      },
      rotation: { x: Math.PI / 2, y: 0, z: -(Math.PI / 4) * 3 },
    },
    explode: {
      offset: { x: -10, y: 0, z: 0 },
    },
  },
];