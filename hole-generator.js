/**
 * Hole Generator
 * Egyszerűsített lyuk generáló - tetszőleges tengely irányú circle lyukak
 * v2.1.0 - Axis támogatás hozzáadva
 */

const holeExtension = 0.05;

/**
 * Körlyuk CSG művelet létrehozása tetszőleges tengely irányban
 * @param {Object} params - Lyuk paraméterek
 * @param {number} params.radius - Sugár (cm)
 * @param {Object} params.position - Pozíció {x, y, z}
 * @param {string} params.axis - Lyuk iránya: 'x', 'y', 'z' (alapértelmezett: 'y')
 * @param {number} params.depth - Mélység (opcionális, auto-számítás parent alapján)
 * @param {number} params.parentThickness - Parent elem vastagsága auto-mélységhez
 * @returns {Object} CSG művelet objektum
 */
function createCircleHole(params) {
  const {
    radius = 1,
    position = { x: 0, y: 0, z: 0 },
    axis = "y", // ÚJ: tengely irány
    depth,
    parentThickness = 10,
  } = params;

  // Automatikus mélység számítás ha nincs megadva
  const finalDepth =
    depth !== undefined ? depth : parentThickness + holeExtension;

  // ÚJ: Rotáció számítása az axis alapján
  let rotation = { x: 0, y: 0, z: 0 };

  switch (axis.toLowerCase()) {
    case "x":
      // X tengely irányú lyuk - 90° forgatás Z tengely körül
      rotation = { x: 0, y: 0, z: Math.PI / 2 };
      break;
    case "z":
      // Z tengely irányú lyuk - 90° forgatás X tengely körül
      rotation = { x: Math.PI / 2, y: 0, z: 0 };
      break;
    case "y":
    default:
      // Y tengely irányú lyuk - nincs rotáció (alapértelmezett)
      rotation = { x: 0, y: 0, z: 0 };
      break;
  }

  return {
    type: CSG_OPERATIONS.SUBTRACT,
    geometry: "cylinder",
    params: {
      radius: radius,
      height: finalDepth,
      segments: 64,
    },
    position: position,
    rotation: rotation, // ÚJ: rotáció hozzáadása
  };
}

/**
 * Körlyukak rács elrendezése
 * @param {Object} params - Rács paraméterek
 * @param {Object} params.area - Terület {xStart, xEnd, zStart, zEnd}
 * @param {Object} params.grid - Rács {x, z} - lyukak száma irányonként
 * @param {number} params.radius - Lyuk sugár (cm)
 * @param {string} params.axis - Lyuk iránya: 'x', 'y', 'z' (alapértelmezett: 'y')
 * @param {number} params.margin - Belső margó (cm)
 * @param {number} params.parentThickness - Parent elem vastagsága
 * @param {Array} params.skip - Kihagyandó pozíciók [{x, z}, ...]
 * @returns {Array} CSG műveletek tömbje
 */
function createCircleHoleGrid(params) {
  const {
    area,
    grid,
    radius = 0.8,
    axis = "y", // Meghagyva alapértelmezettnek - rácsoknál jellemzően Y irány
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
            axis: axis,
            parentThickness: parentThickness,
          })
        );
    }
  }

  return operations;
}

/**
 * Kétlépcsős lyuk létrehozása (pl. süllyesztett csavar lyuk)
 * @param {Object} params - Lyuk paraméterek
 * @param {Object} params.position - Lyuk pozíciója
 * @param {number} params.parentThickness - Parent elem vastagsága
 * @param {Object} params.firstHole - Első lyuk {radius, depth}
 * @param {Object} params.secondHole - Második lyuk {radius, depth}
 * @param {string} params.axis - Lyuk iránya: 'x', 'y', 'z' (KÖTELEZŐ)
 * @returns {Array} CSG műveletek tömbje
 */
function twoStepHole(params) {
  const { position, parentThickness, firstHole, secondHole, axis } = params;

  if (!axis) {
    console.error("twoStepHole: axis paraméter kötelező!");
    return [];
  }

  // JAVÍTOTT: Tengely irányú offset számítása
  // Az első lyuk mindig a "bejárati" oldalon van, a második mélyebben
  let firstOffset, secondOffset;

  // Első lyuk offset: elem felszínéhez közel
  const firstOffsetDistance =
    (parentThickness - firstHole.depth) / 2 + holeExtension;

  // Második lyuk offset: mélyebben, az első lyuk után
  const secondOffsetDistance =
    (firstOffsetDistance - secondHole.depth) / 2 + holeExtension;

  switch (axis.toLowerCase()) {
    case "x":
      // X tengely irányú lyuk - pozitív X irányból fúrunk befelé
      firstOffset = { x: firstOffsetDistance, y: 0, z: 0 };
      secondOffset = { x: secondOffsetDistance, y: 0, z: 0 };
      break;

    case "z":
      // Z tengely irányú lyuk - pozitív Z irányból fúrunk befelé
      firstOffset = { x: 0, y: 0, z: firstOffsetDistance };
      secondOffset = { x: 0, y: 0, z: secondOffsetDistance };
      break;

    case "y":
      // Y tengely irányú lyuk - pozitív Y irányból fúrunk befelé (felülről lefelé)
      firstOffset = { x: 0, y: firstOffsetDistance, z: 0 };
      secondOffset = { x: 0, y: secondOffsetDistance, z: 0 };
      break;

    default:
      console.error(`twoStepHole: Ismeretlen axis: ${axis}`);
      return [];
  }

  // Végső pozíciók számítása
  const firstPos = {
    x: position.x + firstOffset.x,
    y: position.y + firstOffset.y,
    z: position.z + firstOffset.z,
  };

  const secondPos = {
    x: position.x + secondOffset.x,
    y: position.y + secondOffset.y,
    z: position.z + secondOffset.z,
  };

  return [
    createCircleHole({
      radius: firstHole.radius,
      position: firstPos,
      axis: axis,
      depth: firstHole.depth + holeExtension,
    }),
    createCircleHole({
      radius: secondHole.radius,
      position: secondPos,
      axis: axis,
      depth: secondHole.depth + holeExtension,
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
// // Függőleges lyuk (axis megadása szükséges):
// createCircleHole({
//   radius: 5.4,
//   position: { x: 0, y: 0, z: 0 },
//   axis: 'y'
// });
//
// // Oldalsó lyuk (X irány):
// createCircleHole({
//   radius: 2.5,
//   position: { x: 0, y: 0, z: 0 },
//   axis: 'x'
// });
//
// // Elülső/hátsó lyuk (Z irány):
// createCircleHole({
//   radius: 1.5,
//   position: { x: 0, y: 0, z: 0 },
//   axis: 'z'
// });
//
// // Rács Y irányú lyukakkal (alapértelmezett):
// createCircleHoleGrid({
//   area: defineArea(-50, 50, -30, 30),
//   grid: { x: 3, z: 2 },
//   radius: 1.0
// });
//
// // Kétlépcsős lyuk (axis KÖTELEZŐ):
// twoStepHole({
//   position: { x: 0, y: 0, z: 0 },
//   parentThickness: 12,
//   firstHole: { radius: 8, depth: 3 },
//   secondHole: { radius: 4, depth: 9 },
//   axis: 'y'  // KÖTELEZŐ megadni!
// });
