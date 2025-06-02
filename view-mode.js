/**
 * View Mode Manager
 * Váltás színes nézet és tervrajz stílus között
 * v4.0.0 - Teljes refaktor: WireframeManager, MaterialManager, LightingManager használatával
 */

class ViewModeManager {
  constructor(sceneManager, geometryBuilder, textureManager) {
    this.sceneManager = sceneManager;
    this.geometryBuilder = geometryBuilder;
    this.textureManager = textureManager;
    this.currentMode = "blueprint"; // 'realistic' vagy 'blueprint'

    // Exploder referencia tárolása
    this.exploder = null;

    // ÚJ: Specializált manager objektumok inicializálása
    this.csgWireframeHelper = new CSGWireframeHelper();
    this.wireframeManager = new WireframeManager(sceneManager, this.csgWireframeHelper);
    this.materialManager = new MaterialManager(textureManager);
    this.lightingManager = new LightingManager(sceneManager);

    // Inicializálás
    this.materialManager.initialize();

    console.log("ViewModeManager v4.0.0 - Teljes refaktor kész");
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

  // Eredeti anyagok mentése (delegálás MaterialManager-hez)
  saveOriginalMaterials(meshes) {
    this.materialManager.saveOriginalMaterials(meshes);
  }

  // Váltás tervrajz nézetbe
  switchToBlueprint(meshes, elements, force = false) {
    if (this.currentMode === "blueprint" && !force) return;

    console.log("🔄 Váltás tervrajz nézetbe...");

    // Anyag váltás MaterialManager-rel
    this.materialManager.applyBlueprintMaterials(meshes, elements);

    // Árnyékok kikapcsolása minden elemen
    this.setShadowsForElements(meshes, elements, false);

    // Wireframe layer létrehozása WireframeManager-rel
    this.wireframeManager.createWireframeLayer(meshes, elements);

    // Exploded állapot kezelése
    const isExploded = this.exploder && this.exploder.getState().isExploded;
    if (isExploded) {
      console.log("🔧 Exploded állapot észlelve, wireframe pozíciók frissítése...");
      setTimeout(() => {
        this.wireframeManager.updateWireframePositions(meshes);
      }, 50);
    }

    // Világítás beállítása LightingManager-rel
    this.lightingManager.setBlueprintLighting();
    this.lightingManager.setBackgroundForMode("blueprint");

    this.currentMode = "blueprint";
    console.log(`✅ Tervrajz nézet aktív (wireframe: ${this.wireframeManager.wireframeLayer.size} elem, exploded: ${isExploded})`);
  }

  // Váltás színes nézetbe
  switchToRealistic(meshes, elements) {
    if (this.currentMode === "realistic") return;

    console.log("🔄 Váltás színes nézetbe...");

    // Wireframe layer eltávolítása WireframeManager-rel
    this.wireframeManager.removeWireframeLayer();

    // Anyag váltás MaterialManager-rel
    this.materialManager.applyRealisticMaterials(meshes, elements);

    // Árnyékok bekapcsolása minden elemen
    this.setShadowsForElements(meshes, elements, true);

    // Világítás beállítása LightingManager-rel
    this.lightingManager.setRealisticLighting();
    this.lightingManager.setBackgroundForMode("realistic");

    this.currentMode = "realistic";
    console.log("✅ Színes nézet aktív");
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

  // ÚJ: Manager objektumok lekérése (debug/advanced használathoz)
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

  // ÚJ: Speciális funkcionalitások egyszerű elérhetősége
  
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

  // ÚJ: Teljes állapot információ
  getViewModeInfo() {
    return {
      currentMode: this.currentMode,
      displayName: this.getModeDisplayName(),
      wireframe: this.wireframeManager.getWireframeInfo(),
      materials: this.materialManager.getMaterialInfo(),
      lighting: this.lightingManager.getLightingInfo(),
      version: "4.0.0"
    };
  }

  // Debug - teljes állapot kiírása
  logStatus() {
    console.log("=== VIEW MODE MANAGER STATUS v4.0.0 ===");
    console.log("Aktuális mód:", this.currentMode);
    console.log("Wireframe info:", this.wireframeManager.getWireframeInfo());
    console.log("Material info:", this.materialManager.getMaterialInfo());
    console.log("Lighting info:", this.lightingManager.getLightingInfo());
    console.log("=====================================");
  }

  // Cleanup
  destroy() {
    console.log("🧹 ViewModeManager v4.0.0 cleanup...");
    
    // Manager objektumok cleanup-ja
    this.wireframeManager.destroy();
    this.materialManager.destroy();
    this.lightingManager.destroy();
    this.csgWireframeHelper.destroy();

    // Referenciák nullázása
    this.exploder = null;
    this.currentMode = null;

    console.log("ViewModeManager v4.0.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.ViewModeManager = ViewModeManager;