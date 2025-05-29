/**
 * Hole Generator
 * Egyszerűsített lyuk generáló - csak circle lyukak
 * v2.0.0 - Optimalizált, csak CSG műveletek
 */

const holeExtension = 0.05;

/**
 * Körlyuk CSG művelet létrehozása
 * @param {Object} params - Lyuk paraméterek
 * @param {number} params.radius - Sugár (cm)
 * @param {Object} params.position - Pozíció {x, y, z}
 * @param {number} params.depth - Mélység (opcionális, auto-számítás parent alapján)
 * @param {number} params.parentThickness - Parent elem vastagsága auto-mélységhez
 * @returns {Object} CSG művelet objektum
 */
function createCircleHole(params) {
  const {
    radius = 1,
    position = { x: 0, y: 0, z: 0 },
    depth,
    parentThickness = 10,
  } = params;

  // Automatikus mélység számítás ha nincs megadva
  const finalDepth =
    depth !== undefined ? depth : parentThickness + holeExtension;

  return {
    type: CSG_OPERATIONS.SUBTRACT,
    geometry: "cylinder",
    params: {
      radius: radius,
      height: finalDepth,
      segments: 64,
    },
    position: position,
  };
}

/**
 * Körlyukak rács elrendezése
 * @param {Object} params - Rács paraméterek
 * @param {Object} params.area - Terület {xStart, xEnd, zStart, zEnd}
 * @param {Object} params.grid - Rács {x, z} - lyukak száma irányonként
 * @param {number} params.radius - Lyuk sugár (cm)
 * @param {number} params.margin - Belső margó (cm)
 * @param {number} params.parentThickness - Parent elem vastagsága
 * @returns {Array} CSG műveletek tömbje
 */
function createCircleHoleGrid(params) {
  const {
    area,
    grid,
    radius = 0.8,
    margin = 10,
    parentThickness = 10,
    skip,
  } = params;

  if (!area || !grid) {
    console.error("Area és grid paraméterek kötelezőek");
    return [];
  }

  const operations = [];

  // Munkaterület számítása
  const workWidth = area.xEnd - area.xStart - 2 * margin;
  const workDepth = area.zEnd - area.zStart - 2 * margin;

  // Távolságok számítása
  const xSpacing = grid.x > 1 ? workWidth / (grid.x - 1) : 0;
  const zSpacing = grid.z > 1 ? workDepth / (grid.z - 1) : 0;

  for (let i = 0; i < grid.x; i++) {
    for (let j = 0; j < grid.z; j++) {
      const x = area.xStart + margin + i * xSpacing;
      const z = area.zStart + margin + j * zSpacing;

      const isSkipped =
        skip && skip.findIndex((e) => e.x === i && e.z === j) > -1
          ? true
          : false;

      console.log("!!! SKIP", "isSkipped", isSkipped);

      !isSkipped &&
        operations.push(
          createCircleHole({
            radius: radius,
            position: { x, y: 0, z },
            parentThickness: parentThickness,
          })
        );
    }
  }

  return operations;
}

function twoStepHole(params) {
  const firstY =
    params.position.y +
    (params.parentThickness - params.firstHole.depth) / 2 +
    holeExtension;

  const secondDepth = params.secondHole.depth + 2 * holeExtension;

  const secondY = firstY - secondDepth / 2 - 3 * holeExtension;

  return [
    createCircleHole({
      radius: params.firstHole.radius,
      position: {
        x: params.position.x,
        y: firstY,
        z: params.position.z,
      },
      depth: params.firstHole.depth,
    }),
    createCircleHole({
      radius: params.secondHole.radius,
      position: {
        x: params.position.x,
        y: secondY,
        z: params.position.z,
      },
      depth: secondDepth,
    }),
  ];
}

/**
 * Terület definíció helper
 * @param {number} xStart - Kezdő X pozíció
 * @param {number} xEnd - Vég X pozíció
 * @param {number} zStart - Kezdő Z pozíció
 * @param {number} zEnd - Vég Z pozíció
 * @returns {Object} Terület objektum
 */
function defineArea(xStart, xEnd, zStart, zEnd) {
  return { xStart, xEnd, zStart, zEnd };
}

/**
 * Lyukak szűrése távolság alapján (főlyuk környékének kihagyása)
 * @param {Array} operations - CSG műveletek tömbje
 * @param {Object} centerPosition - Központi pozíció {x, z}
 * @param {number} minDistance - Minimum távolság (cm)
 * @returns {Array} Szűrt CSG műveletek
 */
function filterHolesByDistance(operations, centerPosition, minDistance = 8) {
  return operations.filter((operation) => {
    const distance = Math.sqrt(
      Math.pow(operation.position.x - centerPosition.x, 2) +
        Math.pow(operation.position.z - centerPosition.z, 2)
    );
    return distance >= minDistance;
  });
}

// Példa használat:
//
// // Fő golflyuk
// const mainHole = createMainGolfHole({
//   position: {
//     x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.holePositionX,
//     y: 0,
//     z: 0
//   },
//   parentThickness: 1.2
// });
//
// // Vízelvezető lyukak rács
// const drainageHoles = createCircleHoleGrid({
//   area: defineArea(-100, 100, -30, 30),
//   grid: { x: 4, z: 4 },
//   radius: 0.8,
//   margin: 10,
//   parentThickness: 1.2
// });
//
// // Szűrés főlyuk környékének kihagyásával
// const filteredHoles = filterHolesByDistance(
//   drainageHoles,
//   { x: 85, z: 0 },
//   8
// );
