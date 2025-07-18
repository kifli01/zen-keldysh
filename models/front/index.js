import { addSectionPrefix } from "../helper.js";

export const sectionConfig = {
  id: "front",
  name: "Első szekció",
  position: { x: -COURSE_DIMENSIONS.length / 2, y: 0, z: 0 }, // Eltolás pozíció
  sectionExplode: {
    offset: { x: -20, y: 0, z: 0 }, // Balra mozgatás
    duration: 1000, // ms
    easing: "easeInOut"
  },
};

async function loadSectionElements() {
  const elements = [];
  
  try {
    // Eredeti elemek betöltése
    const plate = await import("./plate.js");
    const frame = await import("./frame.js");
    const walls = await import("./walls.js");
    const legs = await import("./legs.js");
    const fasteners = await import("./fasteners.js");
    
    // ✅ PREFIX HOZZÁADÁSA + POZÍCIÓ ELTOLÁS
    elements.push(
      ...addSectionPrefix(plate.elements, "front", sectionConfig),
      ...addSectionPrefix(frame.elements, "front", sectionConfig),
      ...addSectionPrefix(walls.elements, "front", sectionConfig),
      ...addSectionPrefix(legs.elements, "front", sectionConfig),
      ...addSectionPrefix(fasteners.elements, "front", sectionConfig)
    );
    
    console.log(`✅ Front szekció betöltve: ${elements.length} elem`);
    return elements;
    
  } catch (error) {
    console.error("❌ Section front betöltési hiba:", error);
    return [];
  }
}

export { loadSectionElements };