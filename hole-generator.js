/**
 * Hole Generator
 * Univerzális lyuk generáló függvény a minigolf pályához
 * v1.3.0 - Egyszerűsített lyuk készítés
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
 * Több lyuk létrehozása rács elrendezésben
 * @param {Object} params - Rács paraméterek
 * @param {Object} params.area - Terület {xStart, xEnd, zStart, zEnd}
 * @param {Object} params.grid - Rács {x, z} - lyukak száma irányonként
 * @param {Object} params.holeParams - createHole paraméterek (radius, type, stb.)
 * @param {number} params.margin - Belső margó (cm)
 * @returns {Array} Lyukak tömbje
 */
function createHoleGrid(params) {
  const defaults = {
    margin: 10,
    holeParams: { type: "circle", radius: 0.8 },
  };

  const config = { ...defaults, ...params };
  const holes = [];

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

      holes.push(
        createHole({
          ...config.holeParams,
          position: { x, y: 0, z },
        })
      );
    }
  }

  return holes;
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

// Példa használat:
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
