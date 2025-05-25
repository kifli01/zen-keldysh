/**
 * View Mode Manager
 * Váltás színes nézet és tervrajz stílus között
 */

class ViewModeManager {
  constructor(sceneManager, geometryBuilder) {
    this.sceneManager = sceneManager;
    this.geometryBuilder = geometryBuilder;
    this.currentMode = "blueprint"; // 'realistic' vagy 'blueprint' - alapértelmezett: tervrajz

    // Eredeti anyagok mentése
    this.originalMaterials = new Map();

    // Blueprint anyagok - papír szerű
    this.blueprintMaterials = {
      plate: new THREE.MeshLambertMaterial({
        color: 0xffffff, // fehér
        transparent: false,
      }),
      frame: new THREE.MeshLambertMaterial({
        color: 0xf0f0f0, // nagyon világos szürke
        transparent: false,
      }),
      covering: new THREE.MeshLambertMaterial({
        color: 0xd0d0d0, // sötétebb szürke a műfűnek
        transparent: false,
      }),
      wall: new THREE.MeshLambertMaterial({
        color: 0xe0e0e0, // közép szürke
        transparent: false,
      }),
      leg: new THREE.MeshLambertMaterial({
        color: 0xd8d8d8, // sötétebb szürke
        transparent: false,
      }),
      ball: new THREE.MeshLambertMaterial({
        color: 0xf8f8f8, // nagyon világos szürke (fehér labda)
        transparent: false,
      }),
    };

    // Wireframe anyagok (körvonalakhoz)
    this.wireframeMaterials = new Map();
  }

  // Eredeti anyagok mentése
  saveOriginalMaterials(meshes) {
    meshes.forEach((mesh, elementId) => {
      this.originalMaterials.set(elementId, mesh.material.clone());
    });
  }

  // Váltás tervrajz nézetbe
  switchToBlueprint(meshes, elements, force = false) {
    if (this.currentMode === "blueprint" && !force) return;

    // Eredeti anyagok mentése (ha még nem történt meg)
    if (this.originalMaterials.size === 0) {
      this.saveOriginalMaterials(meshes);
    }

    // Árnyékok kikapcsolása
    this.sceneManager.renderer.shadowMap.enabled = false;

    // Scene háttér fehérre
    this.sceneManager.scene.background = new THREE.Color(0xffffff);

    // Anyagok cseréje
    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      // Blueprint anyag kiválasztása típus szerint
      let blueprintMaterial;
      switch (element.type) {
        case "plate":
          blueprintMaterial = this.blueprintMaterials.plate;
          break;
        case "frame":
          blueprintMaterial = this.blueprintMaterials.frame;
          break;
        case "covering":
          blueprintMaterial = this.blueprintMaterials.covering;
          break;
        case "wall":
          blueprintMaterial = this.blueprintMaterials.wall;
          break;
        case "leg":
          blueprintMaterial = this.blueprintMaterials.leg;
          break;
        default:
          blueprintMaterial = this.blueprintMaterials.frame;
      }

      mesh.material = blueprintMaterial;
      mesh.castShadow = false;
      mesh.receiveShadow = false;

      // Edge wireframe hozzáadása csak a külső kontúrhoz
      this.addEdgeOutline(mesh, element.id);
    });

    // Fények módosítása (egyenletes megvilágítás)
    this.setBlueprintLighting();

    this.currentMode = "blueprint";
  }

  // Váltás színes nézetbe
  switchToRealistic(meshes, elements) {
    if (this.currentMode === "realistic") return;

    // Árnyékok bekapcsolása
    this.sceneManager.renderer.shadowMap.enabled = true;

    // Scene háttér eredeti színre
    this.sceneManager.scene.background = new THREE.Color(0xf9f9f9);

    // Eredeti anyagok visszaállítása
    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      const originalMaterial = this.originalMaterials.get(element.id);
      if (originalMaterial) {
        mesh.material = originalMaterial;
        mesh.castShadow = element.display.castShadow;
        mesh.receiveShadow = element.display.receiveShadow;
      }

      // Edge outline eltávolítása
      this.removeEdgeOutline(element.id);
    });

    // Fények visszaállítása
    this.setRealisticLighting();

    this.currentMode = "realistic";
  }

  // Toggle - váltás a két nézet között
  toggle(meshes, elements) {
    if (this.currentMode === "realistic") {
      this.switchToBlueprint(meshes, elements);
    } else {
      this.switchToRealistic(meshes, elements);
    }
  }

  // Edge outline pozíció frissítése (explode-hoz)
  updateEdgePositions(meshes) {
    this.wireframeMaterials.forEach((edgeLines, elementId) => {
      const mesh = meshes.get(elementId);
      if (mesh && edgeLines) {
        edgeLines.position.copy(mesh.position);
        edgeLines.rotation.copy(mesh.rotation);
        edgeLines.scale.copy(mesh.scale);
      }
    });
  }

  // Edge outline hozzáadása (csak külső élek)
  addEdgeOutline(mesh, elementId) {
    const edges = new THREE.EdgesGeometry(mesh.geometry, 15); // 15 fokos küszöb
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x333333,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    });

    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
    edgeLines.position.copy(mesh.position);
    edgeLines.rotation.copy(mesh.rotation);
    edgeLines.scale.copy(mesh.scale);

    edgeLines.userData = { isEdgeOutline: true, parentId: elementId };

    this.sceneManager.scene.add(edgeLines);
    this.wireframeMaterials.set(elementId, edgeLines);
  }

  // Edge outline eltávolítása
  removeEdgeOutline(elementId) {
    const edgeLines = this.wireframeMaterials.get(elementId);
    if (edgeLines) {
      this.sceneManager.scene.remove(edgeLines);

      // Cleanup
      edgeLines.geometry.dispose();
      edgeLines.material.dispose();

      this.wireframeMaterials.delete(elementId);
    }
  }

  // Blueprint megvilágítás
  setBlueprintLighting() {
    // Összes fény eltávolítása
    const lightsToRemove = [];
    this.sceneManager.scene.traverse((object) => {
      if (object.isLight) {
        lightsToRemove.push(object);
      }
    });
    lightsToRemove.forEach((light) => this.sceneManager.scene.remove(light));

    // Lágy, diffúz megvilágítás
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.sceneManager.scene.add(ambientLight);

    // Egy lágy directional light felülről
    const topLight = new THREE.DirectionalLight(0xffffff, 0.3);
    topLight.position.set(0, 100, 0);
    this.sceneManager.scene.add(topLight);

    // Mentés a későbbi visszaállításhoz
    this.sceneManager.blueprintLights = [ambientLight, topLight];
  }

  // Realistic megvilágítás visszaállítása
  setRealisticLighting() {
    // Blueprint fények eltávolítása
    if (this.sceneManager.blueprintLights) {
      this.sceneManager.blueprintLights.forEach((light) => {
        this.sceneManager.scene.remove(light);
      });
      delete this.sceneManager.blueprintLights;
    }

    // Eredeti fények visszaállítása
    this.sceneManager.createLights();
  }

  // Aktuális mód lekérdezése
  getCurrentMode() {
    return this.currentMode;
  }

  // Mód név megjelenítéshez
  getModeDisplayName() {
    return this.currentMode === "realistic" ? "Színes" : "Tervrajz";
  }

  // Cleanup
  destroy() {
    // Wireframe meshek eltávolítása
    this.wireframeMaterials.forEach((edgeLines, elementId) => {
      this.removeEdgeOutline(elementId);
    });

    // Blueprint anyagok cleanup
    Object.values(this.blueprintMaterials).forEach((material) => {
      material.dispose();
    });

    this.originalMaterials.clear();
    this.wireframeMaterials.clear();
  }
}
