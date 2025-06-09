/**
 * View Mode Manager
 * Váltás színes nézet és tervrajz stílus között
 * v5.0.0 - Pure PBR Simplified - Restore pattern használata
 */

class ViewModeManager {
  constructor(sceneManager, geometryBuilder, textureManager) {
    this.sceneManager = sceneManager;
    this.geometryBuilder = geometryBuilder;
    this.textureManager = textureManager;
    this.currentMode = "realistic"; // Alapértelmezett: színes PBR
    this.firstInitialization = true;

    // Exploder referencia tárolása
    this.exploder = null;

    // Specializált manager objektumok inicializálása
    this.csgWireframeHelper = new CSGWireframeHelper();
    this.wireframeManager = new WireframeManager(sceneManager, this.csgWireframeHelper);
    this.materialManager = new MaterialManager(textureManager);
    this.lightingManager = new LightingManager(sceneManager);

    // Inicializálás
    this.materialManager.initialize();

    console.log("ViewModeManager v5.0.0 - Pure PBR Simplified");
  }

  // Exploder referencia beállítása
  setExploder(exploder) {
    this.exploder = exploder;
    console.log("✅ Exploder referencia beállítva ViewModeManager-ben");
  }

  // Shader támogatás beállítása
  setShadersAvailable(available) {
    const success = this.materialManager.setShadersAvailable(available);
    console.log(`Custom shader támogatás: ${success ? '✅' : '❌'}`);
  }

  // Eredeti PBR anyagok mentése - EGYSZERŰSÍTETT
  saveOriginalPBRMaterials(meshes) {
    this.materialManager.saveOriginalPBRMaterials(meshes);
    console.log("💾 Eredeti PBR anyagok mentve a MaterialManager-ben");
  }

  // Váltás tervrajz nézetbe
  async switchToBlueprint(meshes, elements, force = false) {
    if (this.currentMode === "blueprint" && !force) return;

    console.log("🔄 Váltás tervrajz nézetbe...");

    // Blueprint anyagok alkalmazása
    this.materialManager.applyBlueprintMaterials(meshes, elements);

    // Árnyékok kikapcsolása minden elemen
    this.setShadowsForElements(meshes, elements, false);

    // Wireframe layer létrehozása
    this.wireframeManager.createWireframeLayer(meshes, elements);

    // Exploded állapot kezelése
    const isExploded = this.exploder && this.exploder.getState().isExploded;
    if (isExploded) {
      console.log("🔧 Exploded állapot észlelve, wireframe pozíciók frissítése...");
      setTimeout(() => {
        this.wireframeManager.updateWireframePositions(meshes);
      }, 50);
    }

    // Világítás beállítása
    this.lightingManager.setBlueprintLighting();
    this.lightingManager.setBackgroundForMode("blueprint");
    await window.setBlueprintPostProcesing();
    this.currentMode = "blueprint";
    console.log(`✅ Tervrajz nézet aktív (wireframe: ${this.wireframeManager.wireframeLayer.size} elem, exploded: ${isExploded})`);
  }

  // Váltás színes nézetbe - EGYSZERŰSÍTETT RESTORE PATTERN
  async switchToRealistic(meshes, elements) {
    if (this.currentMode === "realistic" && !this.firstInitialization) return;

    console.log("🔄 Váltás színes nézetbe...");

    // Wireframe layer eltávolítása
    this.wireframeManager.removeWireframeLayer();

    // EGYSZERŰSÍTETT: Eredeti PBR anyagok visszaállítása
    if (this.firstInitialization) {
      // Első inicializáláskor a GeometryBuilder már létrehozta a PBR material-okat
      // Csak mentjük őket a jövőbeli váltásokhoz
      this.saveOriginalPBRMaterials(meshes);
      console.log("🎨 Első inicializálás: PBR material-ok mentése");
    } else {
      // Későbbi váltásoknál visszaállítjuk a mentett PBR material-okat
      this.materialManager.restoreRealisticMaterials(meshes, elements);
      console.log("🎨 PBR material-ok visszaállítva");
    }

    // Árnyékok bekapcsolása minden elemen
    this.setShadowsForElements(meshes, elements, true);

    // Világítás beállítása
    this.lightingManager.setRealisticLighting();
    this.lightingManager.setBackgroundForMode("realistic");

    await window.window.setRealisticPostProcesing()
    this.currentMode = "realistic";
    this.firstInitialization = false;
    console.log("✅ Színes PBR nézet aktív");
  }

  // Árnyékok beállítása elemeken
  setShadowsForElements(meshes, elements, enabled) {
    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      // GROUP esetén a gyerek elemeket is át kell állítani
      if (mesh.userData && mesh.userData.isGroup) {
        mesh.castShadow = enabled ? element.display.castShadow : false;
        mesh.receiveShadow = enabled ? element.display.receiveShadow : false;
        
        mesh.children.forEach((childMesh) => {
          childMesh.castShadow = enabled ? element.display.castShadow : false;
          childMesh.receiveShadow = enabled ? element.display.receiveShadow : false;
        });
        return;
      }

      // Hagyományos elem
      mesh.castShadow = enabled ? element.display.castShadow : false;
      mesh.receiveShadow = enabled ? element.display.receiveShadow : false;
    });
  }

  // Toggle - váltás a két nézet között
  toggle(meshes, elements) {
    if (this.currentMode === "realistic") {
      this.switchToBlueprint(meshes, elements);
    } else {
      this.switchToRealistic(meshes, elements);
    }
  }

  // Aktuális mód lekérdezése
  getCurrentMode() {
    return this.currentMode;
  }

  // Mód név megjelenítéshez
  getModeDisplayName() {
    return this.currentMode === "realistic" ? "Színes" : "Tervrajz";
  }

  // Manager objektumok lekérése
  getWireframeManager() {
    return this.wireframeManager;
  }

  getMaterialManager() {
    return this.materialManager;
  }

  getLightingManager() {
    return this.lightingManager;
  }

  getCSGWireframeHelper() {
    return this.csgWireframeHelper;
  }

  // Speciális funkcionalitások egyszerű elérhetősége
  
  // Wireframe láthatóság szabályozás
  setWireframeVisibility(visible) {
    this.wireframeManager.setWireframeVisibility(visible);
  }

  // Elem wireframe láthatóság
  setElementWireframeVisibility(elementId, visible) {
    this.wireframeManager.setElementWireframeVisibility(elementId, visible);
  }

  // Világítás intenzitás
  setLightingIntensity(intensity) {
    this.lightingManager.setLightingIntensity(intensity);
  }

  // Árnyékok be/ki
  toggleShadows(enabled) {
    this.lightingManager.toggleShadows(enabled);
  }

  // Wireframe pozíciók frissítése (explode/reset esetén)
  updateWireframePositions(meshes) {
    if (this.currentMode === "blueprint") {
      this.wireframeManager.updateWireframePositions(meshes);
    }
  }

  // PBR Properties frissítése (delegálás MaterialManager-hez)
  updateMeshPBRProperties(mesh, properties) {
    return this.materialManager.updatePBRProperties(mesh, properties);
  }

  // Teljes állapot információ
  getViewModeInfo() {
    return {
      currentMode: this.currentMode,
      displayName: this.getModeDisplayName(),
      firstInitialization: this.firstInitialization,
      purePBR: true,
      legacySupport: false,
      wireframe: this.wireframeManager.getWireframeInfo(),
      materials: this.materialManager.getMaterialInfo(),
      lighting: this.lightingManager.getLightingInfo(),
      version: "5.0.0"
    };
  }

  // Debug - teljes állapot kiírása
  logStatus() {
    console.log("=== VIEW MODE MANAGER STATUS v5.0.0 ===");
    console.log("Aktuális mód:", this.currentMode);
    console.log("Első inicializálás:", this.firstInitialization);
    console.log("Wireframe info:", this.wireframeManager.getWireframeInfo());
    console.log("Material info:", this.materialManager.getMaterialInfo());
    console.log("Lighting info:", this.lightingManager.getLightingInfo());
    
    // PBR material-ok debug
    this.materialManager.listSavedMaterials();
    console.log("=====================================");
  }

  // Cleanup
  destroy() {
    console.log("🧹 ViewModeManager v5.0.0 cleanup...");
    
    // Manager objektumok cleanup-ja
    this.wireframeManager.destroy();
    this.materialManager.destroy();
    this.lightingManager.destroy();
    this.csgWireframeHelper.destroy();

    // Referenciák nullázása
    this.exploder = null;
    this.currentMode = null;
    this.firstInitialization = true;

    console.log("ViewModeManager v5.0.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.ViewModeManager = ViewModeManager;