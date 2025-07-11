class SectionExploder {
  constructor() {
    this.sectionConfigs = new Map(); // sectionId -> config
    this.isExploded = false;
    this.originalPositions = new Map(); // elementId -> original position
    this.explodedPositions = new Map(); // elementId -> exploded position
  }

  // Szekció konfiguráció regisztrálása
  registerSectionConfig(sectionConfig) {
    this.sectionConfigs.set(sectionConfig.id, sectionConfig);
    console.log(`📋 Szekció regisztrálva: ${sectionConfig.id}`);
  }

  // Eredeti pozíciók mentése
  saveOriginalPositions(meshes) {
    meshes.forEach((mesh, elementId) => {
      this.originalPositions.set(elementId, {
        x: mesh.position.x,
        y: mesh.position.y,
        z: mesh.position.z
      });
    });
    console.log(`💾 ${this.originalPositions.size} eredeti pozíció mentve`);
  }

  // Szekció explode alkalmazása
  explodeSections(meshes) {
    if (this.isExploded) return;

    let movedCount = 0;

    meshes.forEach((mesh, elementId) => {
      // Szekció ID kinyerése az element ID-ből
      const sectionId = this.extractSectionId(elementId);
      const sectionConfig = this.sectionConfigs.get(sectionId);

      if (sectionConfig && sectionConfig.sectionExplode) {
        const originalPos = this.originalPositions.get(elementId);
        const explodeOffset = sectionConfig.sectionExplode.offset;

        // Új pozíció számítása
        const newPosition = {
          x: originalPos.x + explodeOffset.x,
          y: originalPos.y + explodeOffset.y,
          z: originalPos.z + explodeOffset.z
        };

        // Pozíció alkalmazása
        mesh.position.set(newPosition.x, newPosition.y, newPosition.z);
        this.explodedPositions.set(elementId, newPosition);
        movedCount++;
      }
    });

    this.isExploded = true;
    console.log(`🚀 Szekciók robbantva: ${movedCount} elem mozgatva`);
  }

  // Szekciók visszaállítása
  resetSections(meshes) {
    if (!this.isExploded) return;

    let restoredCount = 0;

    this.originalPositions.forEach((originalPos, elementId) => {
      const mesh = meshes.get(elementId);
      if (mesh) {
        mesh.position.set(originalPos.x, originalPos.y, originalPos.z);
        restoredCount++;
      }
    });

    this.explodedPositions.clear();
    this.isExploded = false;
    console.log(`🔄 Szekciók visszaállítva: ${restoredCount} elem`);
  }

  // Toggle funkció
  toggleSections(meshes) {
    if (this.isExploded) {
      this.resetSections(meshes);
    } else {
      this.explodeSections(meshes);
    }
  }

  // Szekció ID kinyerése element ID-ből
  extractSectionId(elementId) {
    // "front_top_plate" -> "front"
    const parts = elementId.split('_');
    return parts[0];
  }

  // Állapot lekérdezése
  getState() {
    return {
      isExploded: this.isExploded,
      registeredSections: Array.from(this.sectionConfigs.keys()),
      movedElements: this.explodedPositions.size
    };
  }
}

window.SectionExploder = SectionExploder;