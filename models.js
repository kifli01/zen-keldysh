/**
 * Models Loader
 * Egyszerű modell betöltő
 * v1.6.0
 */

// Modellek importálása
async function loadModels() {
  console.log("!!!!!! loadModels");
  const models = [];

  try {
    // Alaplemez
    const basePlate = await import("./models/plate.js");
    models.push(...basePlate.elements);

    // Műfű
    const turf = await import("./models/turf.js");
    models.push(...turf.elements);

    // // Váz
    const frame = await import("./models/frame.js");
    models.push(...frame.elements);

    // // Falak
    const walls = await import("./models/walls.js");
    models.push(...walls.elements);

    // // Lábak
    const legs = await import("./models/legs.js");
    models.push(...legs.elements);

    // // Labda
    const ball = await import("./models/ball.js");
    models.push(...ball.elements);

    const fasteners = await import("./models/fasteners.js");
    models.push(...fasteners.elements);

    console.log(`✅ ${models.length} elem betöltve`);
    return models;
  } catch (error) {
    console.error("❌ Modell betöltési hiba:", error);
    return [];
  }
}

window.loadModels = loadModels;
