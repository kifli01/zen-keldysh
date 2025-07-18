const addSectionPrefix = (elements, sectionId, sectionConfig) => {
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

export { addSectionPrefix };