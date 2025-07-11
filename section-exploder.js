class SectionExploder {
  constructor() {
    this.sectionConfigs = new Map();
    this.isExploded = false;
    this.originalPositions = new Map();
    this.explodedPositions = new Map();
    this.animationDuration = 500; // Exploder-rel megegyező
    this.viewModeManager = null; // ✅ ViewModeManager referencia
  }

  // ✅ ViewModeManager beállítása (exploder.js mintájára)
  setViewModeManager(viewModeManager) {
    this.viewModeManager = viewModeManager;
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
        z: mesh.position.z,
      });
    });
    console.log(`💾 ${this.originalPositions.size} eredeti pozíció mentve (szekció)`);
  }

  // ✅ EGYSZERŰ: Szekció explode (exploder.js mintájára)
  explodeSections(meshes, elements) {
    if (this.isExploded) return;

    let movedCount = 0;

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      const sectionId = this.extractSectionId(element.id);
      const sectionConfig = this.sectionConfigs.get(sectionId);

      if (sectionConfig && sectionConfig.sectionExplode) {
        // ✅ Exploder.js stílusú animáció hívás
        this.explodeElement(mesh, element, sectionConfig);
        movedCount++;
      }
    });

    this.isExploded = true;
    console.log(`🚀 Szekciók robbantva: ${movedCount} elem mozgatva`);
  }

  // ✅ EGYSZERŰ: Szekciók visszaállítása
  resetSections(meshes, elements) {
    if (!this.isExploded) return;

    let restoredCount = 0;

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      const sectionId = this.extractSectionId(element.id);
      const sectionConfig = this.sectionConfigs.get(sectionId);

      if (sectionConfig) {
        // ✅ Exploder.js stílusú reset
        this.resetElement(mesh, element);
        restoredCount++;
      }
    });

    this.isExploded = false;
    console.log(`🔄 Szekciók visszaállítva: ${restoredCount} elem`);
  }

  // ✅ Egyedi elem robbantása (exploder.js mintájára)
  explodeElement(mesh, element, sectionConfig) {
    const originalPos = this.originalPositions.get(element.id);
    if (!originalPos || !sectionConfig.sectionExplode) return;

    const explodeOffset = sectionConfig.sectionExplode.offset;

    const newPosition = {
      x: originalPos.x + explodeOffset.x,
      y: originalPos.y + explodeOffset.y,
      z: originalPos.z + explodeOffset.z,
    };

    // ✅ Exploder.js animateToPosition használata
    this.animateToPosition(mesh, newPosition);
  }

  // ✅ Egyedi elem visszaállítása (exploder.js mintájára)
  resetElement(mesh, element) {
    const originalPos = this.originalPositions.get(element.id);
    if (!originalPos) return;

    // ✅ Exploder.js animateToPosition használata
    this.animateToPosition(mesh, originalPos);
  }

  // ✅ PONTOSAN az exploder.js animateToPosition függvénye
  animateToPosition(mesh, targetPosition, duration = this.animationDuration) {
    const startPosition = {
      x: mesh.position.x,
      y: mesh.position.y,
      z: mesh.position.z,
    };

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out) - exploder.js-ből
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Interpoláció - exploder.js-ből
      mesh.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easedProgress;
      mesh.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easedProgress;
      mesh.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easedProgress;

      // ✅ Wireframe pozíciók frissítése blueprint módban (exploder.js-ből)
      if (
        this.viewModeManager &&
        this.viewModeManager.getCurrentMode() === "blueprint"
      ) {
        this.viewModeManager.updateWireframePositions(
          new Map([[mesh.userData.elementId, mesh]])
        );
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  // ✅ EGYSZERŰ: Toggle funkció (exploder.js mintájára)
  toggleSections(meshes, elements) {
    if (this.isExploded) {
      this.resetSections(meshes, elements);
    } else {
      this.explodeSections(meshes, elements);
    }
  }

  // Szekció ID kinyerése element ID-ből
  extractSectionId(elementId) {
    const parts = elementId.split('_');
    return parts[0];
  }

  // Állapot lekérdezése
  getState() {
    return {
      isExploded: this.isExploded,
      registeredSections: Array.from(this.sectionConfigs.keys()),
      hasOriginalPositions: this.originalPositions.size > 0,
    };
  }
}

window.SectionExploder = SectionExploder;