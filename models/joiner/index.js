import { addSectionPrefix } from "../helper.js";

export const sectionConfig = {
  id: "joiner",
  name: "Összekötő szekció",
  position: { x: 0, y: 0, z: 0 }, // Eltolás pozíció
  sectionExplode: {
    offset: { x: 0, y: -20, z: 0 }, // Lefelé mozgatás
    duration: 800,
    easing: "easeInOut"
  }
};

async function loadSectionElements() {
  const elements = [];
  
  try {
    // Eredeti elemek betöltése
    const frame = await import("./frame.js");
    const fasteners = await import("./fasteners.js");

    
    // ✅ PREFIX HOZZÁADÁSA + POZÍCIÓ ELTOLÁS
    elements.push(
      ...addSectionPrefix(frame.elements, "joiner", sectionConfig),
      ...addSectionPrefix(fasteners.elements, "joiner", sectionConfig)
    );
    
    console.log(`✅ joiner szekció betöltve: ${elements.length} elem`);
    return elements;
    
  } catch (error) {
    console.error("❌ Section joiner betöltési hiba:", error);
    return [];
  }
}

export { loadSectionElements };