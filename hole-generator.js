/**
 * Hole Generator
 * Univerzális lyuk generáló függvény a minigolf pályához
 * v1.5.0 - CSG műveletek támogatása
 */

/**
 * Lyuk létrehozása megadott paraméterekkel
 * @param {Object} params - Lyuk paraméterek
 * @param {string} params.type - Lyuk típusa ('circle', 'square', 'oval')
 * @param {number} params.radius - Sugár (circle esetén) vagy szélesség/2
 * @param {number} params.width - Szélesség (square, oval esetén)
 * @param {number} params.height - Magasság (square, oval esetén)
 * @param {Object} params.position - Pozíció {x, y, z}
 * @param {number} params.depth - Mélység (opcionális, alapértelmezett: teljes vastagság)
 * @param {Object} params.rotation - Forgatás {x, y, z} radiánokban (opcionális)
 * @returns {Object} Lyuk objektum
 */
function createHole(params) {
  // Alapértelmezett értékek
  const defaults = {
    type: "circle",
    radius: 1,
    width: 2,
    height: 2,
    position: { x: 0, y: 0, z: 0 },
    depth: null, // null = teljes vastagság
    rotation: { x: 0, y: 0, z: 0 },
  };

  // Paraméterek egyesítése alapértékekkel
  const hole = { ...defaults, ...params };

  // Validáció
  if (hole.type === "circle" && !hole.radius) {
    console.warn("Circle lyukhoz radius szükséges");
    hole.radius = 1;
  }

  if (
    (hole.type === "square" || hole.type === "oval") &&
    (!hole.width || !hole.height)
  ) {
    console.warn("Square/oval lyukhoz width és height szükséges");
    hole.width = hole.width || 2;
    hole.height = hole.height || 2;
  }

  return {
    type: hole.type,
    radius: hole.radius,
    width: hole.width,
    height: hole.height,
    position: hole.position,
    depth: hole.depth,
    rotation: hole.rotation,
  };
}

/**
 * ÚJ: CSG művelet létrehozása lyuk alapján
 * @param {Object} holeParams - createHole paraméterek
 * @param {number} defaultDepth - Alapértelmezett mélység ha nincs megadva
 * @returns {Object} CSG művelet objektum
 */
function createCSGOperation(holeParams, defaultDepth = 10) {
  const hole = createHole(holeParams);

  let operation = {
    type: CSG_OPERATIONS.SUBTRACT,
    position: hole.position,
    rotation: hole.rotation,
  };

  switch (hole.type) {
    case "circle":
      operation.geometry = "cylinder";
      operation.params = {
        radius: hole.radius,
        height: hole.depth || defaultDepth,
        segments: 16,
      };
      break;

    case "square":
      operation.geometry = "box";
      operation.params = {
        width: hole.width,
        height: hole.depth || defaultDepth,
        length: hole.height, // THREE.js box: width, height, depth
      };
      break;

    case "oval":
      // Oval approximáció cylinder-rel (later: scale transform)
      operation.geometry = "cylinder";
      operation.params = {
        radius: Math.max(hole.width, hole.height) / 2,
        height: hole.depth || defaultDepth,
        segments: 32, // Több szegmens az oval hatáshoz
      };
      // TODO: Scale transform hozzáadása oval alakhoz
      operation.scale = {
        x: hole.width / Math.max(hole.width, hole.height),
        z: hole.height / Math.max(hole.width, hole.height),
        y: 1,
      };
      break;

    default:
      console.warn(`Nem támogatott lyuk típus CSG-ben: ${hole.type}`);
      operation.geometry = "cylinder";
      operation.params = {
        radius: 1,
        height: hole.depth || defaultDepth,
        segments: 8,
      };
  }

  return operation;
}

/**
 * ÚJ: Komplex lyuk típusok - lépcsős lyuk
 * @param {Object} params - Lépcsős lyuk paraméterek
 * @param {Array} params.steps - Lépcsők [{radius, depth}]
 * @param {Object} params.position - Pozíció
 * @returns {Array} CSG műveletek tömbje
 */
function createSteppedHole(params) {
  const defaults = {
    steps: [
      { radius: 5, depth: 2 },
      { radius: 3, depth: 5 },
    ],
    position: { x: 0, y: 0, z: 0 },
  };

  const config = { ...defaults, ...params };
  const operations = [];

  let currentDepth = 0;

  config.steps.forEach((step, index) => {
    operations.push({
      type: CSG_OPERATIONS.SUBTRACT,
      geometry: "cylinder",
      params: {
        radius: step.radius,
        height: step.depth,
        segments: 16,
      },
      position: {
        x: config.position.x,
        y: config.position.y - currentDepth - step.depth / 2,
        z: config.position.z,
      },
    });

    currentDepth += step.depth;
  });

  return operations;
}

/**
 * ÚJ: Kónikus lyuk (csökkenő sugár)
 * @param {Object} params - Kónikus lyuk paraméterek
 * @param {number} params.topRadius - Felső sugár
 * @param {number} params.bottomRadius - Alsó sugár
 * @param {number} params.height - Magasság
 * @param {Object} params.position - Pozíció
 * @returns {Object} CSG művelet
 */
function createConicHole(params) {
  const defaults = {
    topRadius: 3,
    bottomRadius: 1,
    height: 5,
    position: { x: 0, y: 0, z: 0 },
  };

  const config = { ...defaults, ...params };

  // Kónikát közelítjük több cylinderrel
  const steps = 8;
  const operations = [];

  for (let i = 0; i < steps; i++) {
    const progress = i / (steps - 1);
    const radius =
      config.topRadius + (config.bottomRadius - config.topRadius) * progress;
    const stepHeight = config.height / steps;

    operations.push({
      type: CSG_OPERATIONS.SUBTRACT,
      geometry: "cylinder",
      params: {
        radius: radius,
        height: stepHeight,
        segments: 16,
      },
      position: {
        x: config.position.x,
        y:
          config.position.y -
          config.height / 2 +
          i * stepHeight +
          stepHeight / 2,
        z: config.position.z,
      },
    });
  }

  return operations;
}

/**
 * Több lyuk létrehozása rács elrendezésben
 * @param {Object} params - Rács paraméterek
 * @param {Object} params.area - Terület {xStart, xEnd, zStart, zEnd}
 * @param {Object} params.grid - Rács {x, z} - lyukak száma irányonként
 * @param {Object} params.holeParams - createHole paraméterek (radius, type, stb.)
 * @param {number} params.margin - Belső margó (cm)
 * @param {boolean} params.useCSG - CSG műveletek használata (alapértelmezett: false - kompatibilitás)
 * @returns {Array} Lyukak tömbje vagy CSG műveletek tömbje
 */
function createHoleGrid(params) {
  const defaults = {
    margin: 10,
    holeParams: { type: "circle", radius: 0.8 },
    useCSG: false, // Alapértelmezetten legacy mód a kompatibilitás miatt
  };

  const config = { ...defaults, ...params };
  const results = [];

  // Munkaterület számítása
  const workWidth = config.area.xEnd - config.area.xStart - 2 * config.margin;
  const workDepth = config.area.zEnd - config.area.zStart - 2 * config.margin;

  // Távolságok számítása
  const xSpacing = workWidth / (config.grid.x - 1);
  const zSpacing = workDepth / (config.grid.z - 1);

  for (let i = 0; i < config.grid.x; i++) {
    for (let j = 0; j < config.grid.z; j++) {
      const x = config.area.xStart + config.margin + i * xSpacing;
      const z = config.area.zStart + config.margin + j * zSpacing;

      const holeParams = {
        ...config.holeParams,
        position: { x, y: 0, z },
      };

      if (config.useCSG) {
        // ÚJ: CSG műveletet ad vissza
        results.push(createCSGOperation(holeParams));
      } else {
        // LEGACY: Hole objektumot ad vissza
        results.push(createHole(holeParams));
      }
    }
  }

  return results;
}

/**
 * ÚJ: Lyukak konvertálása CSG műveletekre (batch)
 * @param {Array} holes - Hole objektumok tömbje
 * @param {number} defaultDepth - Alapértelmezett mélység
 * @returns {Array} CSG műveletek tömbje
 */
function convertHolesToCSGOperations(holes, defaultDepth = 10) {
  if (!holes || holes.length === 0) {
    return [];
  }

  return holes
    .map((hole) => createCSGOperation(hole, defaultDepth))
    .filter(Boolean); // null/undefined értékek kiszűrése
}

/**
 * ÚJ: CSG műveletek optimalizálása
 * @param {Array} operations - CSG műveletek tömbje
 * @returns {Array} Optimalizált CSG műveletek
 */
function optimizeCSGOperations(operations) {
  if (!operations || operations.length === 0) {
    return [];
  }

  // Egyforma műveletek csoportosítása
  const grouped = {};

  operations.forEach((op) => {
    const key = `${op.type}_${op.geometry}_${JSON.stringify(op.params)}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(op);
  });

  // TODO: Batch műveletek implementálása a jövőben
  // Egyelőre az eredeti tömböt adjuk vissza
  return operations;
}

/**
 * Terület definíció helper függvény
 * @param {number} xStart - Kezdő X pozíció
 * @param {number} xEnd - Vég X pozíció
 * @param {number} zStart - Kezdő Z pozíció
 * @param {number} zEnd - Vég Z pozíció
 * @returns {Object} Terület objektum
 */
function defineArea(xStart, xEnd, zStart, zEnd) {
  return { xStart, xEnd, zStart, zEnd };
}

// Példa használat CSG-vel:
//
// // Egyszerű CSG lyuk
// const csgHole = createCSGOperation({
//   type: 'circle',
//   radius: 5.4,
//   position: { x: 85, y: 0, z: 0 },
//   depth: 12
// });
//
// // Lépcsős lyuk
// const steppedHole = createSteppedHole({
//   steps: [
//     { radius: 6, depth: 2 },
//     { radius: 4, depth: 8 }
//   ],
//   position: { x: 100, y: 0, z: 0 }
// });
//
// // CSG rács
// const csgGrid = createHoleGrid({
//   area: defineArea(-100, 100, -30, 30),
//   grid: { x: 4, z: 4 },
//   holeParams: { type: 'circle', radius: 0.8 },
//   useCSG: true
// });

// Legacy példa használat (változatlan):
//
// // Fő golflyuk
// const mainHole = createHole({
//   type: 'circle',
//   radius: 5.4,
//   position: { x: 85, y: 0, z: 0 }
// });
//
// // Vízelvezető lyukak rács
// const drainageHoles = createHoleGrid({
//   area: defineArea(-100, 100, -30, 30),
//   grid: { x: 4, z: 4 },
//   holeParams: { type: 'circle', radius: 0.8 },
//   margin: 10
// });
