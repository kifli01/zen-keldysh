/**
 * Fasteners Model
 * Rögzítő fa elemek - háromszög alakú
 * v1.0.0 - Egyszerűsített verzió
 */

/**
 * Derékszögű egyenlő szárú háromszög méretei kiszámítása
 * @param {number} legLength - A szár hossza (cm)
 * @returns {Object} {width, height} - Szélesség és magasság
 */
function calculateRightTriangleDimensions(legLength) {
  const width = 2 * legLength;  // Alap = 2 × szár
  const height = legLength;     // Magasság = szár
  return { width, height };
}

function calculate45DegreeTrapezoidWidth(topWidth, height) {
  const bottomWidth = topWidth + (2 * height);
  return bottomWidth;
}

const fastenerThickness = 4;
const triangleDims = calculateRightTriangleDimensions(12);
const triangleShift = 0.3;
const trapezoidHeight = 10;
const trapezoidTopWidth = 14;
const trapezoidBottomdWidth =  calculate45DegreeTrapezoidWidth(trapezoidTopWidth, trapezoidHeight);

export const elements = [
  // Derékszögű háromszög rögzítő elem
  {
    id: "triangle_fastener_1",
    name: "Háromszög rögzítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID", // Lucfenyő tömörfa
    geometry: {
      type: GEOMETRY_TYPES.TRIANGLE,
      dimensions: {
          width: triangleDims.width, 
          height: triangleDims.height, 
          thickness: fastenerThickness,
        },
    },
    transform: {
      position: {
        x: -COURSE_DIMENSIONS.length / 2 + triangleDims.height / 2 - triangleShift, 
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            fastenerThickness / 2,
        z: COURSE_DIMENSIONS.width / 2 - triangleDims.height / 2 + triangleShift,
      },
      rotation: { x: Math.PI / 2, y: 0, z: Math.PI / 4 },
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
    },
  },
  {
    id: "triangle_fastener_2",
    name: "Háromszög rögzítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID", // Lucfenyő tömörfa
    geometry: {
      type: GEOMETRY_TYPES.TRIANGLE,
      dimensions: {
          width: triangleDims.width, 
          height: triangleDims.height, 
          thickness: fastenerThickness,
        },
    },
    transform: {
      position: {
        x: -COURSE_DIMENSIONS.length / 2 + triangleDims.height / 2 - triangleShift, 
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            fastenerThickness / 2,
        z: - COURSE_DIMENSIONS.width / 2 + triangleDims.height / 2 - triangleShift
      },
      rotation: { x: Math.PI / 2, y: 0, z: (Math.PI / 4) * 3 },
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
    },
  },
  {
    id: "triangle_fastener_3",
    name: "Háromszög rögzítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID", // Lucfenyő tömörfa
    geometry: {
      type: GEOMETRY_TYPES.TRIANGLE,
      dimensions: {
          width: triangleDims.width, 
          height: triangleDims.height, 
          thickness: fastenerThickness,
        },
    },
    transform: {
      position: {
        x: COURSE_DIMENSIONS.length / 2 - triangleDims.height / 2 + triangleShift, 
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            fastenerThickness / 2,
        z: COURSE_DIMENSIONS.width / 2 - triangleDims.height / 2 + triangleShift
      },
      rotation: { x: Math.PI / 2, y: 0, z: - (Math.PI / 4) },
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
    },
  },
  {
    id: "triangle_fastener_4",
    name: "Háromszög rögzítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID", // Lucfenyő tömörfa
    geometry: {
      type: GEOMETRY_TYPES.TRIANGLE,
      dimensions: {
          width: triangleDims.width, 
          height: triangleDims.height, 
          thickness: fastenerThickness,
        },
    },
    transform: {
      position: {
        x: COURSE_DIMENSIONS.length / 2 - triangleDims.height / 2 + triangleShift, 
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            fastenerThickness / 2,
        z: - COURSE_DIMENSIONS.width / 2 + triangleDims.height / 2 - triangleShift
      },
      rotation: { x: Math.PI / 2, y: 0, z: -(Math.PI / 4) * 3 },
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
    },
  },
  {
    id: "trapezoid_fastener_1",
    name: "Trapéz rögzítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.TRAPEZOID,
      dimensions: {
        topWidth: trapezoidTopWidth,
        bottomWidth: trapezoidBottomdWidth, 
        height: trapezoidHeight,
        thickness: fastenerThickness,
      },
    },
    transform: {
      position: {
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.spacing,
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            fastenerThickness / 2,
        z: COURSE_DIMENSIONS.width / 2 - trapezoidHeight / 2,
      },
      rotation: { x: Math.PI / 2, y: 0, z: -(Math.PI / 2) * 2 }, 
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
    },
  },
  {
    id: "trapezoid_fastener_2",
    name: "Trapéz rögzítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.TRAPEZOID,
      dimensions: {
        topWidth: trapezoidTopWidth,
        bottomWidth: trapezoidBottomdWidth, 
        height: trapezoidHeight,
        thickness: fastenerThickness,
      },
    },
    transform: {
      position: {
        x: -COURSE_DIMENSIONS.length / 2 + COURSE_DIMENSIONS.spacing,
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            fastenerThickness / 2,
        z: -COURSE_DIMENSIONS.width / 2 + trapezoidHeight / 2,
      },
      rotation: { x: Math.PI / 2, y: 0, z: (Math.PI / 2) * 4 }, 
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
    },
  },
  {
    id: "trapezoid_fastener_3",
    name: "Trapéz rögzítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.TRAPEZOID,
      dimensions: {
        topWidth: trapezoidTopWidth,
        bottomWidth: trapezoidBottomdWidth, 
        height: trapezoidHeight,
        thickness: fastenerThickness,
      },
    },
    transform: {
      position: {
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.spacing,
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            fastenerThickness / 2,
        z: COURSE_DIMENSIONS.width / 2 - trapezoidHeight / 2,
      },
      rotation: { x: Math.PI / 2, y: 0, z: -(Math.PI / 2) * 2 }, 
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
    },
  },
  {
    id: "trapezoid_fastener_4",
    name: "Trapéz rögzítő",
    type: ELEMENT_TYPES.FASTENER,
    material: "PINE_SOLID",
    geometry: {
      type: GEOMETRY_TYPES.TRAPEZOID,
      dimensions: {
        topWidth: trapezoidTopWidth,
        bottomWidth: trapezoidBottomdWidth, 
        height: trapezoidHeight,
        thickness: fastenerThickness,
      },
    },
    transform: {
      position: {
        x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.spacing,
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            fastenerThickness / 2,
        z: -COURSE_DIMENSIONS.width / 2 + trapezoidHeight / 2,
      },
      rotation: { x: Math.PI / 2, y: 0, z: (Math.PI / 2) * 4 }, 
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
    },
  },
];