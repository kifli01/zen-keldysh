import { addSectionPrefix } from "../helper.js";

export const sectionConfig = {
  id: "back",
  name: "Hátsó szekció", 
  position: { x: COURSE_DIMENSIONS.length / 2, y: 0, z: 0 }, // Jobbra eltolás
  sectionExplode: {
    offset: { x: 20, y: 0, z: 0 }, // Jobbra mozgatás
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
    
    // ✅ PREFIX + POZÍCIÓ ELTOLÁS
    elements.push(
      ...addSectionPrefix(plate.elements, "back", sectionConfig),
      ...addSectionPrefix(frame.elements, "back", sectionConfig),
      ...addSectionPrefix(walls.elements, "back", sectionConfig),
      ...addSectionPrefix(legs.elements, "back", sectionConfig),
      ...addSectionPrefix(fasteners.elements, "back", sectionConfig)
    );
    
    console.log(`✅ Back szekció betöltve: ${elements.length} elem`);
    return elements;
    
  } catch (error) {
    console.error("❌ Section back betöltési hiba:", error);
    return [];
  }
}

export { loadSectionElements };