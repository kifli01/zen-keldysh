// Section Front - Összefogó modul
export const sectionConfig = {
  id: "section_back",
  name: "Hátsó szekció",
  type: "section",
  
  transform: {
    position: { x: COURSE_DIMENSIONS.length, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  
  explode: {
    offset: { x: 0, y: 0, z: 0 },
  },
  
  bounds: {
    length: 83.3,
    startX: -125,
    endX: -41.7
  }
};

async function loadSectionElements() {
  const elements = [];
  
  try {
    const plate = await import("./plate.js");
    const turf = await import("./turf.js");
    const frame = await import("./frame.js");
    const walls = await import("./walls.js");
    const legs = await import("./legs.js");
    // const fasteners = await import("./fasteners.js");
    
    elements.push(
      ...addSectionPrefix(plate.elements, "back"),
      ...addSectionPrefix(turf.elements, "back"),
      ...addSectionPrefix(frame.elements, "back"),
      ...addSectionPrefix(walls.elements, "back"),
      ...addSectionPrefix(legs.elements, "back"),
      // ...addSectionPrefix(fasteners.elements, "back")
    );
    
  } catch (error) {
    console.error("❌ Section back betöltési hiba:", error);
  }
  
  return elements;
}

function addSectionPrefix(elements, section) {
  return elements.map(element => ({
    ...element,
    id: `${section}_${element.id}`,
    sectionId: section,
    originalId: element.id
  }));
}

export { loadSectionElements };