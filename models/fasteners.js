/**
 * Fasteners Model
 * merevítő fa elemek - háromszög alakú
 * v1.0.0 - Egyszerűsített verzió
 */

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
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.triangleShift, 
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            COURSE_DIMENSIONS.fastenerThickness / 2,
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.triangleShift,
      },
      rotation: { x: Math.PI / 2, y: 0, z: Math.PI / 4 },
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
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
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.triangleShift, 
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            COURSE_DIMENSIONS.fastenerThickness / 2,
        z: - COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.triangleShift
      },
      rotation: { x: Math.PI / 2, y: 0, z: (Math.PI / 4) * 3 },
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
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
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.triangleShift, 
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            COURSE_DIMENSIONS.fastenerThickness / 2,
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.triangleShift
      },
      rotation: { x: Math.PI / 2, y: 0, z: - (Math.PI / 4) },
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
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
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.triangleDims.height / 2 + COURSE_DIMENSIONS.triangleShift, 
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            COURSE_DIMENSIONS.fastenerThickness / 2,
        z: - COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.triangleDims.height / 2 - COURSE_DIMENSIONS.triangleShift
      },
      rotation: { x: Math.PI / 2, y: 0, z: -(Math.PI / 4) * 3 },
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
    },
  },
  {
    id: "trapezoid_fastener_1",
    name: "Trapéz merevítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.TRAPEZOID,
      dimensions: {
        topWidth: COURSE_DIMENSIONS.trapezoidTopWidth,
        bottomWidth: COURSE_DIMENSIONS.trapezoidBottomdWidth, 
        height: COURSE_DIMENSIONS.trapezoidHeight,
        thickness: COURSE_DIMENSIONS.fastenerThickness,
      },
    },
    transform: {
      position: {
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.spacing,
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            COURSE_DIMENSIONS.fastenerThickness / 2,
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.trapezoidHeight / 2,
      },
      rotation: { x: Math.PI / 2, y: 0, z: -(Math.PI / 2) * 2 }, 
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
    },
  },
  {
    id: "trapezoid_fastener_2",
    name: "Trapéz merevítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.TRAPEZOID,
      dimensions: {
        topWidth: COURSE_DIMENSIONS.trapezoidTopWidth,
        bottomWidth: COURSE_DIMENSIONS.trapezoidBottomdWidth, 
        height: COURSE_DIMENSIONS.trapezoidHeight,
        thickness: COURSE_DIMENSIONS.fastenerThickness,
      },
    },
    transform: {
      position: {
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.spacing,
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            COURSE_DIMENSIONS.fastenerThickness / 2,
        z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.trapezoidHeight / 2,
      },
      rotation: { x: Math.PI / 2, y: 0, z: (Math.PI / 2) * 4 }, 
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
    },
  },
  {
    id: "trapezoid_fastener_3",
    name: "Trapéz merevítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.TRAPEZOID,
      dimensions: {
        topWidth: COURSE_DIMENSIONS.trapezoidTopWidth,
        bottomWidth: COURSE_DIMENSIONS.trapezoidBottomdWidth, 
        height: COURSE_DIMENSIONS.trapezoidHeight,
        thickness: COURSE_DIMENSIONS.fastenerThickness,
      },
    },
    transform: {
      position: {
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.spacing,
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            COURSE_DIMENSIONS.fastenerThickness / 2,
        z: COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.trapezoidHeight / 2,
      },
      rotation: { x: Math.PI / 2, y: 0, z: -(Math.PI / 2) * 2 }, 
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
    },
  },
  {
    id: "trapezoid_fastener_4",
    name: "Trapéz merevítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.TRAPEZOID,
      dimensions: {
        topWidth: COURSE_DIMENSIONS.trapezoidTopWidth,
        bottomWidth: COURSE_DIMENSIONS.trapezoidBottomdWidth, 
        height: COURSE_DIMENSIONS.trapezoidHeight,
        thickness: COURSE_DIMENSIONS.fastenerThickness,
      },
    },
    transform: {
      position: {
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.spacing,
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            COURSE_DIMENSIONS.fastenerThickness / 2,
        z: -COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.trapezoidHeight / 2,
      },
      rotation: { x: Math.PI / 2, y: 0, z: (Math.PI / 2) * 4 }, 
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
    },
  },
];