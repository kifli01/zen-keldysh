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
    // Front szekció
    const frontSection = await import("./models/front/index.js");
    const frontElements = await frontSection.loadSectionElements();
    models.push(...frontElements);

    // Back szekció
    const backSection = await import("./models/back/index.js");
    const backElements = await backSection.loadSectionElements();
    models.push(...backElements);

    // Top szekció
    const topSection = await import("./models/top/index.js");
    const topElements = await topSection.loadSectionElements();
    models.push(...topElements);

    // Összekötó szekció
    const joinerSection = await import("./models/joiner/index.js");
    const joinerElements = await joinerSection.loadSectionElements();
    models.push(...joinerElements);


    console.log(`✅ ${models.length} elem betöltve`);
    return models;
  } catch (error) {
    console.error("❌ Modell betöltési hiba:", error);
    return [];
  }
}

window.loadModels = loadModels;
