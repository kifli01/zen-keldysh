/**
 * Hole Generator
 * Lyuk generáló tengely és irány támogatással
 * v3.1.0 - TwoStepHole javított direction logika
 */

const holeExtension = 0.05;

// JAVÍTOTT: Direction-rotáció mapping - logikus tengely-irány megfeleltetés
const DIRECTION_ROTATIONS = {
  y: {
    down: { x: 0, y: 0, z: 0 }, // Felülről lefelé (alapértelmezett)
    up: { x: Math.PI, y: 0, z: 0 }, // Alulról felfelé (X tengely körül 180°)
  },
  x: {
    forward: { x: 0, y: Math.PI / 2, z: 0 }, // Hátulról előre (Y tengely körül +90°)
    backward: { x: 0, y: -Math.PI / 2, z: 0 }, // Elölről hátra (Y tengely körül -90°)
  },
  z: {
    right: { x: -Math.PI / 2, y: 0, z: 0 }, // Jobbról balra (X tengely körül -90°)
    left: { x: Math.PI / 2, y: 0, z: 0 }, // Balról jobbra (X tengely körül +90°)
  },
};

// JAVÍTOTT: Érvényes direction értékek - logikus tengely-irány párosítás
const VALID_DIRECTIONS = {
  y: ["down", "up"], // Magassági irányok
  x: ["forward", "backward"], // Hosszanti irányok (pálya hossza mentén)
  z: ["right", "left"], // Szélességi irányok (pálya szélessége mentén)
};

/**
 * Körlyuk CSG művelet létrehozása tetszőleges tengely és irány szerint
 * @param {Object} params - Lyuk paraméterek
 * @param {number} params.radius - Sugár (cm)
 * @param {Object} params.position - Pozíció {x, y, z}
 * @param {string} params.axis - Lyuk tengelye: 'x', 'y', 'z' (alapértelmezett: 'y')
 * @param {string} params.direction - Lyuk iránya tengely szerint (ÚJ paraméter)
 *   - Y tengely: 'down' (felülről), 'up' (alulról)
 *   - X tengely: 'forward' (hátulról), 'backward' (elölről)
 *   - Z tengely: 'right' (jobbról), 'left' (balról)
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
  let finalDirection = direction ? direction.toLowerCase() : defaultDirection;

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
 * JAVÍTOTT: Alapértelmezett irány lekérése tengelyhez - logikus alapértékek
 */
function getDefaultDirection(axis) {
  const defaults = {
    y: "down", // Magasság: felülről lefelé (természetes gravitáció)
    x: "forward", // Hosszúság: hátulról előre (természetes haladás)
    z: "right", // Szélesség: jobbról balra (természetes jobb kéz használat)
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
 * Kétlépcsős lyuk létrehozása - JAVÍTOTT direction logika v3.1.0
 * @param {Object} params - Lyuk paraméterek
 * @param {Object} params.position - Lyuk KÖZÉPPONTJÁNAK pozíciója (alap referencia)
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

  // JAVÍTOTT v3.1.0: Direction alapú pozíció számítás
  const positions = calculateTwoStepPositions(
    position,
    normalizedAxis,
    finalDirection,
    parentThickness,
    firstHole,
    secondHole
  );

  const firstHoleParams = {
    radius: firstHole.radius,
    position: positions.firstPosition,
    axis: normalizedAxis,
    direction: finalDirection,
    depth: firstHole.depth + holeExtension,
  };

  const secondHoleParams = {
    radius: secondHole.radius,
    position: positions.secondPosition,
    axis: normalizedAxis,
    direction: finalDirection,
    depth: secondHole.depth + holeExtension,
  };

  console.log(`📍 Első lyuk pozíció:`, positions.firstPosition);
  console.log(`📍 Második lyuk pozíció:`, positions.secondPosition);

  return [
    createCircleHole(firstHoleParams),
    createCircleHole(secondHoleParams),
  ];
}

/**
 * ÚJ v3.1.0: Kétlépcsős lyuk pozíciók számítása direction szerint
 * @param {Object} basePosition - Alap pozíció (lyuk középpontja)
 * @param {string} axis - Tengely ('x', 'y', 'z')
 * @param {string} direction - Irány
 * @param {number} parentThickness - Parent elem vastagsága
 * @param {Object} firstHole - Első lyuk paraméterek
 * @param {Object} secondHole - Második lyuk paraméterek
 * @returns {Object} {firstPosition, secondPosition}
 */
function calculateTwoStepPositions(
  basePosition,
  axis,
  direction,
  parentThickness,
  firstHole,
  secondHole
) {
  // 1. Felület referencia pont meghatározása (honnan indítjuk a fúrást)
  const surfaceOffset = getSurfaceOffset(axis, direction, parentThickness);

  // 2. Fúrás irány meghatározása (+ vagy - irányba haladunk)
  const depthDirection = getDepthDirection(axis, direction);

  // 3. Tengely koordináta meghatározása ('x', 'y', vagy 'z')
  const axisCoord = getAxisCoordinate(axis);

  // 4. Első lyuk pozíciója: felülettől befelé
  const firstPosition = {
    ...basePosition,
    [axisCoord]:
      basePosition[axisCoord] +
      surfaceOffset +
      depthDirection * (firstHole.depth / 2),
  };

  // 5. Második lyuk pozíciója: első lyuk után folytatva
  const secondPosition = {
    ...basePosition,
    [axisCoord]:
      basePosition[axisCoord] +
      surfaceOffset +
      depthDirection * (firstHole.depth + secondHole.depth / 2),
  };

  return { firstPosition, secondPosition };
}

/**
 * ÚJ: Felület offset számítása - honnan indítjuk a fúrást
 */
function getSurfaceOffset(axis, direction, parentThickness) {
  const halfThickness = parentThickness / 2;

  switch (axis) {
    case "y":
      return direction === "down" ? halfThickness : -halfThickness;
    case "x":
      return direction === "right" ? -halfThickness : halfThickness;
    case "z":
      return direction === "forward" ? -halfThickness : halfThickness;
    default:
      return 0;
  }
}

/**
 * ÚJ: Mélység irány meghatározása - melyik irányba haladunk
 */
function getDepthDirection(axis, direction) {
  switch (axis) {
    case "y":
      return direction === "down" ? -1 : 1; // down: lefelé (-), up: felfelé (+)
    case "x":
      return direction === "right" ? 1 : -1; // right: jobbra (+), left: balra (-)
    case "z":
      return direction === "forward" ? 1 : -1; // forward: előre (+), backward: hátra (-)
    default:
      return 1;
  }
}

/**
 * ÚJ: Tengely koordináta string lekérése
 */
function getAxisCoordinate(axis) {
  return axis; // 'x' -> 'x', 'y' -> 'y', 'z' -> 'z'
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
// // Kétlépcsős lyuk - JAVÍTOTT direction logika:
// twoStepHole({
//   position: { x: 0, y: 0, z: 0 },  // Lyuk KÖZÉPPONTJA (nem felszín!)
//   parentThickness: 12,             // Parent elem vastagsága
//   firstHole: { radius: 8, depth: 3 },   // Nagy, sekély (csavarfej)
//   secondHole: { radius: 4, depth: 9 },  // Kis, mély (csavarmenet)
//   axis: 'y',
//   direction: 'down'  // Felülről lefelé fúrás
//
//   // Eredmény:
//   // - Első lyuk: y = 0 + 6 - 1.5 = 4.5 (felül kezdődik)
//   // - Második lyuk: y = 0 + 6 - 3 - 4.5 = -1.5 (első után folytatódik)
// });
//
// // X tengely, balról jobbra:
// twoStepHole({
//   position: { x: 0, y: 0, z: 0 },
//   parentThickness: 10,
//   firstHole: { radius: 6, depth: 2 },
//   secondHole: { radius: 3, depth: 6 },
//   axis: 'x',
//   direction: 'right'  // Bal oldalról jobbra
//
//   // Eredmény:
//   // - Első lyuk: x = 0 - 5 + 1 = -4 (bal oldalról kezdődik)
//   // - Második lyuk: x = 0 - 5 + 2 + 3 = 0 (első után folytatódik)
// });
