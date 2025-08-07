import { addSectionPrefix } from "../helper.js";

export const sectionConfig = {
  id: "top",
  name: "Felső szekció",
  position: { x: 0, y: 0, z: 0 },
  sectionExplode: {
    offset: { x: 0, y: 20, z: 0 },
    duration: 1000, // ms
    easing: "easeInOut"
  },
};

async function loadSectionElements() {
  const elements = [];
  
  try {
    const turf = await import("./turf.js");
    const ball = await import("./ball.js");
    const sheets = await import("./sheets.js");

    // ✅ PREFIX HOZZÁADÁSA + POZÍCIÓ ELTOLÁS
    elements.push(
      ...addSectionPrefix(turf.elements, "top", sectionConfig),
      ...addSectionPrefix(ball.elements, "top", sectionConfig),
      ...addSectionPrefix(sheets.elements, "top", sectionConfig),
    );
    
    console.log(`✅ Top szekció betöltve: ${elements.length} elem`);
    return elements;
    
  } catch (error) {
    console.error("❌ Section top betöltési hiba:", error);
    return [];
  }
}

export { loadSectionElements };