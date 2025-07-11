// section-back/index.js - HÁTSÓ SZEKCIÓ
export const sectionConfig = {
  id: "back",
  name: "Hátsó szekció", 
  position: { x: COURSE_DIMENSIONS.length / 2, y: 0, z: 0 }, // Jobbra eltolás
  sectionExplode: {
    offset: { x: 100, y: 0, z: 0 }, // Jobbra mozgatás
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
    
    // ✅ PREFIX + POZÍCIÓ ELTOLÁS
    elements.push(
      ...addSectionPrefix(plate.elements, "back"),
      ...addSectionPrefix(turf.elements, "back"),
      ...addSectionPrefix(frame.elements, "back"),
      ...addSectionPrefix(walls.elements, "back"),
      ...addSectionPrefix(legs.elements, "back"),
      ...addSectionPrefix(fasteners.elements, "back")
    );
    
    console.log(`✅ Back szekció betöltve: ${elements.length} elem`);
    return elements;
    
  } catch (error) {
    console.error("❌ Section back betöltési hiba:", error);
    return [];
  }
}

// ✅ UGYANAZ a prefix függvény mint a front-ban
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
      
      // ✅ POZÍCIÓ ELTOLÁS - back szekció jobbra megy
      transform: {
        ...element.transform,
        position: {
          x: originalPos.x + sectionOffset.x, // +83.3 cm jobbra
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