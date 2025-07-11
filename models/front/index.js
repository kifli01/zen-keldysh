// section-front/index.js - PREFIX ALAPÚ MEGOLDÁS
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
    const turf = await import("./turf.js");
    const frame = await import("./frame.js");
    const walls = await import("./walls.js");
    const legs = await import("./legs.js");
    const fasteners = await import("./fasteners.js");
    
    // ✅ PREFIX HOZZÁADÁSA + POZÍCIÓ ELTOLÁS
    elements.push(
      ...addSectionPrefix(plate.elements, "front"),
      ...addSectionPrefix(turf.elements, "front"),
      ...addSectionPrefix(frame.elements, "front"),
      ...addSectionPrefix(walls.elements, "front"),
      ...addSectionPrefix(legs.elements, "front"),
      ...addSectionPrefix(fasteners.elements, "front")
    );
    
    console.log(`✅ Front szekció betöltve: ${elements.length} elem`);
    return elements;
    
  } catch (error) {
    console.error("❌ Section front betöltési hiba:", error);
    return [];
  }
}

// ✅ KULCS FÜGGVÉNY: Prefix + pozíció eltolás
function addSectionPrefix(elements, sectionId) {
  return elements.map(element => {
    const originalPos = element.transform?.position || { x: 0, y: 0, z: 0 };
    const sectionOffset = sectionConfig.position;
    
    return {
      ...element,
      // ✅ Új ID prefix-szel
      id: `${sectionId}_${element.id}`,
      
      // ✅ Metadata megőrzése
      sectionId: sectionId,
      originalId: element.id,
      
      // ✅ POZÍCIÓ ELTOLÁS
      transform: {
        ...element.transform,
        position: {
          x: originalPos.x + sectionOffset.x,
          y: originalPos.y + sectionOffset.y,
          z: originalPos.z + sectionOffset.z,
        }
      },
      
      // ✅ Explode pozíció módosítása is
      explode: element.explode ? {
        ...element.explode,
        offset: {
          x: element.explode.offset.x + sectionOffset.x,
          y: element.explode.offset.y,
          z: element.explode.offset.z + sectionOffset.z,
        }
      } : undefined
    };
  });
}

export { loadSectionElements };