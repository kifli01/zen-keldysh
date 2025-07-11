// section-joiner/index.js - PREFIX ALAPÚ MEGOLDÁS
export const sectionConfig = {
  id: "joiner",
  name: "Összekötő szekció",
  position: { x: 0, y: 0, z: 0 }, // Eltolás pozíció
  sectionExplode: {
    offset: { x: 0, y: -50, z: 0 }, // Lefelé mozgatás
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
      ...addSectionPrefix(frame.elements, "joiner"),
      ...addSectionPrefix(fasteners.elements, "joiner")
    );
    
    console.log(`✅ joiner szekció betöltve: ${elements.length} elem`);
    return elements;
    
  } catch (error) {
    console.error("❌ Section joiner betöltési hiba:", error);
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