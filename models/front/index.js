// Section Front - Összefogó modul
export const sectionConfig = {
  id: "section_front",
  name: "Első szekció",
  type: "section",
  
  transform: {
    position: { x: -COURSE_DIMENSIONS.length, y: 0, z: 0 },
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
    // Helyi elemek betöltése - EREDETI pozíciókkal
    const plate = await import("./plate.js");
    const turf = await import("./turf.js");
    const frame = await import("./frame.js");
    const walls = await import("./walls.js");
    const legs = await import("./legs.js");
    const fasteners = await import("./fasteners.js");
    
    // Elemek összegyűjtése - prefix és pozíció módosítás NÉLKÜL
    elements.push(
      ...addSectionPrefix(plate.elements, "front"),
      ...addSectionPrefix(turf.elements, "front"),
      ...addSectionPrefix(frame.elements, "front"),
      ...addSectionPrefix(walls.elements, "front"),
      ...addSectionPrefix(legs.elements, "front"),
      // ...addSectionPrefix(fasteners.elements, "front")
    );
    
    // Szekció wrapper elem - GROUP geometriával
    const sectionWrapper = {
      id: sectionConfig.id,
      name: sectionConfig.name,
      type: "section",
      geometry: {
        type: "group", // GEOMETRY_TYPES.GROUP
        elements: elements, // Gyerek elemek eredeti pozíciókkal
      },
      transform: sectionConfig.transform, // A GROUP pozíciója
      explode: sectionConfig.explode,
      display: {
        visible: true,
        opacity: 1,
        wireframe: false,
        castShadow: true,
        receiveShadow: true,
      }
    };
    
    return [sectionWrapper]; // Egyetlen wrapper GROUP elem
    
  } catch (error) {
    console.error("❌ Section front betöltési hiba:", error);
    return [];
  }
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