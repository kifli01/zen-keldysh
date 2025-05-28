/**
 * Exploder
 * Robbantott nézet kezelése - elemek szétszedése és visszaállítása
 * v1.1.0 - Wireframe layer támogatás
 */

class Exploder {
  constructor() {
    this.originalPositions = new Map();
    this.isExploded = false;
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

  // Robbantott pozíciók beállítása
  explode(meshes, elements) {
    if (this.isExploded) return;

    // Ha még nem mentettük az eredeti pozíciókat
    if (this.originalPositions.size === 0) {
      this.saveOriginalPositions(meshes);
    }

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh || !element.explode) return;

      const originalPos = this.originalPositions.get(element.id);
      const explodeOffset = element.explode.offset;

      // Új pozíció = eredeti + offset
      const newPosition = {
        x: originalPos.x + explodeOffset.x,
        y: originalPos.y + explodeOffset.y,
        z: originalPos.z + explodeOffset.z,
      };

      this.animateToPosition(mesh, newPosition);
    });

    this.isExploded = true;
  }

  // Eredeti pozíciókra visszaállítás
  reset(meshes) {
    if (!this.isExploded) return;

    this.originalPositions.forEach((originalPos, elementId) => {
      const mesh = meshes.get(elementId);
      if (!mesh) return;

      this.animateToPosition(mesh, originalPos);
    });

    this.isExploded = false;
  }

  // Toggle - váltás robbantott és eredeti között
  toggle(meshes, elements) {
    if (this.isExploded) {
      this.reset(meshes);
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

  // MÓDOSÍTOTT: Azonnali pozíció beállítás - wireframe layer támogatással
  setPositionImmediate(meshes, elements, exploded = false) {
    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      if (exploded && element.explode) {
        const originalPos =
          this.originalPositions.get(element.id) || element.transform.position;
        const explodeOffset = element.explode.offset;

        mesh.position.set(
          originalPos.x + explodeOffset.x,
          originalPos.y + explodeOffset.y,
          originalPos.z + explodeOffset.z
        );
      } else {
        const originalPos =
          this.originalPositions.get(element.id) || element.transform.position;
        mesh.position.set(originalPos.x, originalPos.y, originalPos.z);
      }
    });

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

  // Aktuális állapot lekérdezése
  getState() {
    return {
      isExploded: this.isExploded,
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
    this.originalPositions.clear();
    this.isExploded = false;
  }
}
