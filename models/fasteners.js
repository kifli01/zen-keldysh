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

const fastenerThickness = 4;
const triangleDims = calculateRightTriangleDimensions(10);

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
        x: -COURSE_DIMENSIONS.length / 2 + triangleDims.height / 2, 
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            fastenerThickness / 2,
        z: COURSE_DIMENSIONS.width / 2 - triangleDims.height / 2
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
        x: -COURSE_DIMENSIONS.length / 2 + triangleDims.height / 2, 
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            fastenerThickness / 2,
        z: - COURSE_DIMENSIONS.width / 2 + triangleDims.height / 2
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
        x: COURSE_DIMENSIONS.length / 2 - triangleDims.height / 2, 
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            fastenerThickness / 2,
        z: COURSE_DIMENSIONS.width / 2 - triangleDims.height / 2
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
        x: COURSE_DIMENSIONS.length / 2 - triangleDims.height / 2, 
        y: -COURSE_DIMENSIONS.frameHeight -
            COURSE_DIMENSIONS.topPlateThickness / 2 - 
            fastenerThickness / 2,
        z: - COURSE_DIMENSIONS.width / 2 + triangleDims.height / 2
      },
      rotation: { x: Math.PI / 2, y: 0, z: -(Math.PI / 4) * 3 },
    },
    explode: {
      offset: { x: 0, y: -20, z: 0 },
    },
  },
];