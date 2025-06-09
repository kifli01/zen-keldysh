/**
 * Exploder
 * Robbantott nézet kezelése - elemek szétszedése és visszaállítása
 * v1.2.0 - Fokozatos robbantás slider támogatással
 */

class Exploder {
  constructor() {
    this.originalPositions = new Map();
    this.isExploded = false;
    this.currentExplodeLevel = 0; // ÚJ: 0-100% közötti érték
    this.animationDuration = 500; // ms
    this.viewModeManager = null; // ViewModeManager referencia
  }

  // ViewModeManager beállítása
  setViewModeManager(viewModeManager) {
    this.viewModeManager = viewModeManager;
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
  }

  // ÚJ v1.2.0: Fokozatos robbantás beállítása (0-100%)
  setExplodeLevel(percentage, meshes, elements) {
    // Percentage normalizálása 0-100 között
    const normalizedPercentage = Math.max(0, Math.min(100, percentage));
    this.currentExplodeLevel = normalizedPercentage;

    // Exploded állapot frissítése
    this.isExploded = normalizedPercentage > 0;
    window.modelIsExploded = this.isExploded;

    // Ha még nem mentettük az eredeti pozíciókat
    if (this.originalPositions.size === 0) {
      this.saveOriginalPositions(meshes);
    }

    // Minden elem pozíciójának kiszámítása és beállítása
    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh || !element.explode) return;

      const originalPos = this.originalPositions.get(element.id);
      const explodeOffset = element.explode.offset;

      // Interpolált pozíció = eredeti + (offset * percentage/100)
      const factor = normalizedPercentage / 100;
      const newPosition = {
        x: originalPos.x + (explodeOffset.x * factor),
        y: originalPos.y + (explodeOffset.y * factor),
        z: originalPos.z + (explodeOffset.z * factor),
      };

      this.animateToPosition(mesh, newPosition);
    });

    console.log(`🎚️ Explode level: ${normalizedPercentage}%`);
  }

  // ÚJ v1.2.0: Aktuális explode level lekérése
  getExplodeLevel() {
    return this.currentExplodeLevel;
  }

  // Robbantott pozíciók beállítása (eredeti funkció - most 100%-ra állít)
  explode(meshes, elements) {
    this.setExplodeLevel(100, meshes, elements);
  }

  // Eredeti pozíciókra visszaállítás (eredeti funkció - most 0%-ra állít)
  reset(meshes, elements) {
    this.setExplodeLevel(0, meshes, elements);
  }

  // Toggle - váltás robbantott és eredeti között (eredeti funkció)
  toggle(meshes, elements) {
    if (this.currentExplodeLevel > 0) {
      this.reset(meshes, elements);
    } else {
      this.explode(meshes, elements);
    }
  }

  // MÓDOSÍTOTT: Animáció egy pozícióba - wireframe layer támogatással
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

      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Interpoláció
      mesh.position.x =
        startPosition.x + (targetPosition.x - startPosition.x) * easedProgress;
      mesh.position.y =
        startPosition.y + (targetPosition.y - startPosition.y) * easedProgress;
      mesh.position.z =
        startPosition.z + (targetPosition.z - startPosition.z) * easedProgress;

      // ÚJ: Wireframe pozíciók frissítése blueprint módban
      if (
        this.viewModeManager &&
        this.viewModeManager.getCurrentMode() === "blueprint"
      ) {
        // Wireframe layer frissítése az aktuális mesh-hez
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

  // MÓDOSÍTOTT: Azonnali pozíció beállítás - explode level figyelembevételével
  setPositionImmediate(meshes, elements, exploded = false) {
    // Exploded paraméter alapján explode level beállítása
    const targetLevel = exploded ? 100 : 0;
    
    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      const originalPos =
        this.originalPositions.get(element.id) || element.transform.position;

      if (exploded && element.explode) {
        const explodeOffset = element.explode.offset;
        const factor = targetLevel / 100;

        mesh.position.set(
          originalPos.x + (explodeOffset.x * factor),
          originalPos.y + (explodeOffset.y * factor),
          originalPos.z + (explodeOffset.z * factor)
        );
      } else {
        mesh.position.set(originalPos.x, originalPos.y, originalPos.z);
      }
    });

    this.currentExplodeLevel = targetLevel;
    this.isExploded = exploded;

    // ÚJ: Wireframe pozíciók frissítése blueprint módban
    if (
      this.viewModeManager &&
      this.viewModeManager.getCurrentMode() === "blueprint"
    ) {
      this.viewModeManager.updateWireframePositions(meshes);
    }
  }

  // Egyedi elem robbantása
  explodeElement(mesh, element) {
    if (!element.explode) return;

    const originalPos =
      this.originalPositions.get(element.id) || element.transform.position;
    const explodeOffset = element.explode.offset;

    const newPosition = {
      x: originalPos.x + explodeOffset.x,
      y: originalPos.y + explodeOffset.y,
      z: originalPos.z + explodeOffset.z,
    };

    this.animateToPosition(mesh, newPosition);
  }

  // Egyedi elem visszaállítása
  resetElement(mesh, element) {
    const originalPos =
      this.originalPositions.get(element.id) || element.transform.position;
    this.animateToPosition(mesh, originalPos);
  }

  // Elemek csoportos kezelése típus szerint
  explodeByType(meshes, elements, elementType) {
    const filteredElements = elements.filter((el) => el.type === elementType);

    filteredElements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (mesh) {
        this.explodeElement(mesh, element);
      }
    });
  }

  resetByType(meshes, elements, elementType) {
    const filteredElements = elements.filter((el) => el.type === elementType);

    filteredElements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (mesh) {
        this.resetElement(mesh, element);
      }
    });
  }

  // MÓDOSÍTOTT: Aktuális állapot lekérdezése - explode level-lel
  getState() {
    return {
      isExploded: this.isExploded,
      explodeLevel: this.currentExplodeLevel, // ÚJ
      hasOriginalPositions: this.originalPositions.size > 0,
      elementCount: this.originalPositions.size,
    };
  }

  // Eredeti pozíciók frissítése (ha változtak az elemek)
  updateOriginalPositions(meshes, elements) {
    this.originalPositions.clear();
    this.saveOriginalPositions(meshes);
  }

  // Debug info
  logState() {
    console.log("Exploder State:", this.getState());
    console.log(
      "Original Positions:",
      Array.from(this.originalPositions.entries())
    );
  }

  // Animáció sebesség beállítása
  setAnimationDuration(duration) {
    this.animationDuration = Math.max(100, duration); // minimum 100ms
  }

  // Cleanup
  destroy() {
    window.modelIsExploded = false;
    this.originalPositions.clear();
    this.isExploded = false;
    this.currentExplodeLevel = 0; // ÚJ
  }
}