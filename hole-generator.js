/**
 * Terület definíció helper - VÁLTOZATLAN
 */
function defineArea(xStart, xEnd, zStart, zEnd) {
  return { xStart, xEnd, zStart, zEnd };
}

/**
 * Lyukak szűrése távolság alapján - VÁLTOZATLAN
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
/**
 * Hole Generator
 * Lyuk generáló tengely és irány támogatással
 * v3.0.0 - Direction paraméter hozzáadva minden tengelyhez
 */

const holeExtension = 0.05;

// ÚJ: Direction-rotáció mapping
const DIRECTION_ROTATIONS = {
  y: {
    down: { x: 0, y: 0, z: 0 }, // Felülről lefelé (alapértelmezett)
    up: { x: Math.PI, y: 0, z: 0 }, // Alulról felfelé (180° flip)
  },
  x: {
    right: { x: 0, y: 0, z: Math.PI / 2 }, // Balról jobbra (alapértelmezett)
    left: { x: 0, y: 0, z: -Math.PI / 2 }, // Jobbról balra
  },
  z: {
    forward: { x: Math.PI / 2, y: 0, z: 0 }, // Hátulról előre (alapértelmezett)
    backward: { x: -Math.PI / 2, y: 0, z: 0 }, // Elölről hátra
  },
};

// ELTÁVOLÍTVA: Direction-pozíció offset mapping (már nem kell)
// A direction csak rotációt befolyásol, pozíciót nem!

// ÚJ: Érvényes direction értékek validálása
const VALID_DIRECTIONS = {
  y: ["down", "up"],
  x: ["right", "left"],
  z: ["forward", "backward"],
};

/**
 * Körlyuk CSG művelet létrehozása tetszőleges tengely és irány szerint
 * @param {Object} params - Lyuk paraméterek
 * @param {number} params.radius - Sugár (cm)
 * @param {Object} params.position - Pozíció {x, y, z}
 * @param {string} params.axis - Lyuk tengelye: 'x', 'y', 'z' (alapértelmezett: 'y')
 * @param {string} params.direction - Lyuk iránya tengely szerint (ÚJ paraméter)
 *   - Y tengely: 'down' (felülről), 'up' (alulról)
 *   - X tengely: 'right' (balról), 'left' (jobbról)
 *   - Z tengely: 'forward' (hátulról), 'backward' (elölről)
 * @param {number} params.depth - Mélység (opcionális, auto-számítás parent alapján)
 * @param {number} params.parentThickness - Parent elem vastagsága auto-mélységhez
 * @returns {Object} CSG művelet objektum
 */
function createCircleHole(params) {
  const {
    radius = 1,
    position = { x: 0, y: 0, z: 0 },
    axis = "y",
    direction, // ÚJ paraméter
    depth,
    parentThickness = 10,
  } = params;

  // Axis normalizálás
  const normalizedAxis = axis.toLowerCase();

  // Direction alapértelmezett értékek
  const defaultDirection = getDefaultDirection(normalizedAxis);
  const finalDirection = direction ? direction.toLowerCase() : defaultDirection;

  // Direction validálás
  if (!validateDirection(normalizedAxis, finalDirection)) {
    console.warn(
      `Érvénytelen direction '${finalDirection}' a '${normalizedAxis}' tengelyhez. Alapértelmezett használata: '${defaultDirection}'`
    );
    finalDirection = defaultDirection;
  }

  // Automatikus mélység számítás ha nincs megadva
  const finalDepth =
    depth !== undefined ? depth : parentThickness + holeExtension;

  // ÚJ: Rotáció számítása axis + direction alapján
  const rotation = getDirectionRotation(normalizedAxis, finalDirection);

  // JAVÍTÁS: Pozíció változatlan marad - direction csak rotációt befolyásol
  const finalPosition = position; // Nincs pozíció offset!

  console.log(
    `🔧 Lyuk létrehozás: ${normalizedAxis} tengely, ${finalDirection} irány, pozíció változatlan:`,
    finalPosition
  );

  return {
    type: CSG_OPERATIONS.SUBTRACT,
    geometry: "cylinder",
    params: {
      radius: radius,
      height: finalDepth,
      segments: 64,
    },
    position: finalPosition,
    rotation: rotation,
    // ÚJ: Metadata a debugging-hez (pozíció offset eltávolítva)
    metadata: {
      axis: normalizedAxis,
      direction: finalDirection,
      originalPosition: position,
    },
  };
}

/**
 * ÚJ: Alapértelmezett irány lekérése tengelyhez
 */
function getDefaultDirection(axis) {
  const defaults = {
    y: "down", // Felülről lefelé
    x: "right", // Balról jobbra
    z: "forward", // Hátulról előre
  };
  return defaults[axis] || "down";
}

/**
 * ÚJ: Direction validálás
 */
function validateDirection(axis, direction) {
  const validDirections = VALID_DIRECTIONS[axis];
  return validDirections && validDirections.includes(direction);
}

/**
 * ÚJ: Rotáció lekérése axis + direction alapján
 */
function getDirectionRotation(axis, direction) {
  const axisRotations = DIRECTION_ROTATIONS[axis];
  if (!axisRotations) {
    console.warn(`Ismeretlen axis: ${axis}`);
    return { x: 0, y: 0, z: 0 };
  }

  const rotation = axisRotations[direction];
  if (!rotation) {
    console.warn(`Ismeretlen direction '${direction}' a '${axis}' tengelyhez`);
    return axisRotations[getDefaultDirection(axis)];
  }

  return rotation;
}

/**
 * Körlyukak rács elrendezése - FRISSÍTETT direction támogatással
 * @param {Object} params - Rács paraméterek
 * @param {Object} params.area - Terület {xStart, xEnd, zStart, zEnd}
 * @param {Object} params.grid - Rács {x, z} - lyukak száma irányonként
 * @param {number} params.radius - Lyuk sugár (cm)
 * @param {string} params.axis - Lyuk iránya: 'x', 'y', 'z' (alapértelmezett: 'y')
 * @param {string} params.direction - Lyuk direction (ÚJ paraméter)
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
    axis = "y",
    direction, // ÚJ paraméter
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
        skip && skip.findIndex((e) => e.x === i && e.z === j) > -1;

      if (!isSkipped) {
        operations.push(
          createCircleHole({
            radius: radius,
            position: { x, y: 0, z },
            axis: axis,
            direction: direction, // ÚJ: direction továbbítása
            parentThickness: parentThickness,
          })
        );
      }
    }
  }

  console.log(
    `🎯 Rács lyukak: ${operations.length} db (${axis} tengely, ${
      direction || "alapértelmezett"
    } irány)`
  );

  return operations;
}

/**
 * Kétlépcsős lyuk létrehozása - FRISSÍTETT direction támogatással
 * @param {Object} params - Lyuk paraméterek
 * @param {Object} params.position - Lyuk pozíciója
 * @param {number} params.parentThickness - Parent elem vastagsága
 * @param {Object} params.firstHole - Első lyuk {radius, depth}
 * @param {Object} params.secondHole - Második lyuk {radius, depth}
 * @param {string} params.axis - Lyuk iránya: 'x', 'y', 'z' (KÖTELEZŐ)
 * @param {string} params.direction - Lyuk direction (ÚJ paraméter)
 * @returns {Array} CSG műveletek tömbje
 */
function twoStepHole(params) {
  const { position, parentThickness, firstHole, secondHole, axis, direction } =
    params;

  if (!axis) {
    console.error("twoStepHole: axis paraméter kötelező!");
    return [];
  }

  const normalizedAxis = axis.toLowerCase();
  const finalDirection = direction
    ? direction.toLowerCase()
    : getDefaultDirection(normalizedAxis);

  // Direction validálás
  if (!validateDirection(normalizedAxis, finalDirection)) {
    console.warn(
      `twoStepHole: Érvénytelen direction '${finalDirection}' a '${normalizedAxis}' tengelyhez`
    );
    return [];
  }

  console.log(
    `🔧 Kétlépcsős lyuk: ${normalizedAxis} tengely, ${finalDirection} irány`
  );

  // JAVÍTÁS: Direction NEM befolyásolja a pozíciót, csak a rotációt
  // Mindkét lyuk ugyanazon pozíciónál van, csak különböző mélységben

  const firstHoleParams = {
    radius: firstHole.radius,
    position: position, // Eredeti pozíció
    axis: normalizedAxis,
    direction: finalDirection,
    depth: firstHole.depth + holeExtension,
  };

  // A második lyuk ugyanazon pozíción, csak más mélységű
  const secondHoleParams = {
    radius: secondHole.radius,
    position: position, // Ugyanaz a pozíció!
    axis: normalizedAxis,
    direction: finalDirection,
    depth: secondHole.depth + holeExtension,
  };

  return [
    createCircleHole(firstHoleParams),
    createCircleHole(secondHoleParams),
  ];
}

/**
 * Terület definíció helper - VÁLTOZATLAN
 */
function defineArea(xStart, xEnd, zStart, zEnd) {
  return { xStart, xEnd, zStart, zEnd };
}

/**
 * Lyukak szűrése távolság alapján - VÁLTOZATLAN
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

/**
 * ÚJ: Debug információ lyukakról
 */
function debugHoleConfiguration(hole) {
  console.log("🔍 Lyuk konfiguráció:", {
    axis: hole.metadata?.axis,
    direction: hole.metadata?.direction,
    position: hole.position,
    rotation: hole.rotation,
  });
}

// Példa használat:
//
// // Alapértelmezett Y tengely, felülről lefelé:
// createCircleHole({
//   radius: 5.4,
//   position: { x: 0, y: 0, z: 0 },  // Lyuk középpontja
//   axis: 'y'  // direction: 'down' alapértelmezett
// });
//
// // Y tengely, alulról felfelé:
// createCircleHole({
//   radius: 5.4,
//   position: { x: 0, y: 0, z: 0 },  // Lyuk középpontja (ugyanott)
//   axis: 'y',
//   direction: 'up'  // Csak rotáció változik!
// });
//
// // X tengely, jobbról balra:
// createCircleHole({
//   radius: 2.5,
//   position: { x: 0, y: 0, z: 0 },  // Lyuk középpontja
//   axis: 'x',
//   direction: 'left'  // Csak rotáció
// });
//
// // Kétlépcsős lyuk - mindkét lyuk ugyanazon pozíción:
// twoStepHole({
//   position: { x: 0, y: 0, z: 0 },  // Lyuk középpontja
//   parentThickness: 12,
//   firstHole: { radius: 8, depth: 3 },
//   secondHole: { radius: 4, depth: 9 },
//   axis: 'y',
//   direction: 'down'  // Csak orientáció
// });
