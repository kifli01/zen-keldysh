/**
 * View Mode Manager
 * Váltás színes nézet és tervrajz stílus között
 * v1.5.0 - Textúrák és javított edge rendering
 */

class ViewModeManager {
  constructor(sceneManager, geometryBuilder) {
    this.sceneManager = sceneManager;
    this.geometryBuilder = geometryBuilder;
    this.currentMode = "blueprint"; // 'realistic' vagy 'blueprint' - alapértelmezett: tervrajz

    // Eredeti anyagok mentése
    this.originalMaterials = new Map();

    // Textúrák létrehozása
    this.textures = this.createTextures();

    // Blueprint anyagok - textúrával, simított felületekkel
    this.blueprintMaterials = {
      plate: new THREE.MeshLambertMaterial({
        color: 0xffffff,
        map: this.textures.paper, // Papír textúra
        transparent: false,
        flatShading: false,
        side: THREE.DoubleSide,
      }),
      frame: new THREE.MeshLambertMaterial({
        color: 0xf5f5f5,
        map: this.textures.paper,
        transparent: false,
        flatShading: false,
        side: THREE.DoubleSide,
      }),
      covering: new THREE.MeshLambertMaterial({
        color: 0xe0e0e0,
        map: this.textures.fabric, // Szövet textúra műfűhöz
        transparent: false,
        flatShading: false,
        side: THREE.DoubleSide,
      }),
      wall: new THREE.MeshLambertMaterial({
        color: 0xf0f0f0,
        map: this.textures.paper,
        transparent: false,
        flatShading: false,
        side: THREE.DoubleSide,
      }),
      leg: new THREE.MeshLambertMaterial({
        color: 0xe8e8e8,
        map: this.textures.paper,
        transparent: false,
        flatShading: false,
        side: THREE.DoubleSide,
      }),
      ball: new THREE.MeshLambertMaterial({
        color: 0xffffff,
        transparent: false,
        flatShading: false,
        side: THREE.DoubleSide,
      }),
    };

    // Realistic anyagok - valószerű textúrákkal
    this.realisticMaterials = {
      plate: new THREE.MeshPhongMaterial({
        color: 0xa47b51,
        map: this.textures.wood,
        shininess: 10,
        transparent: false,
      }),
      frame: new THREE.MeshPhongMaterial({
        color: 0xbf9f7e,
        map: this.textures.wood,
        shininess: 10,
        transparent: false,
      }),
      covering: new THREE.MeshPhongMaterial({
        color: 0x96b965,
        map: this.textures.grass,
        shininess: 2,
        transparent: false,
      }),
      wall: new THREE.MeshPhongMaterial({
        color: 0xbf9f7e,
        map: this.textures.wood,
        shininess: 10,
        transparent: false,
      }),
      leg: new THREE.MeshPhongMaterial({
        color: 0xbf9f7e,
        map: this.textures.wood,
        shininess: 10,
        transparent: false,
      }),
      ball: new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 30,
        transparent: false,
      }),
    };

    // Wireframe anyagok (körvonalakhoz)
    this.wireframeMaterials = new Map();
  }

  // ÚJ: Textúrák létrehozása procedurálisan
  createTextures() {
    const textures = {};

    // Papír textúra (blueprint módhoz)
    textures.paper = this.createPaperTexture();

    // Fa textúra (realistic módhoz)
    textures.wood = this.createWoodTexture();

    // Műfű textúra (realistic módhoz)
    textures.grass = this.createGrassTexture();

    // Szövet textúra (blueprint műfűhöz)
    textures.fabric = this.createFabricTexture();

    return textures;
  }

  // Papír textúra - finoman szürkés, zajjal
  createPaperTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    // Alap fehér háttér
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 512, 512);

    // Finom zaj hozzáadása
    const imageData = context.getImageData(0, 0, 512, 512);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 10;
      data[i] = Math.max(0, Math.min(255, 255 + noise)); // R
      data[i + 1] = Math.max(0, Math.min(255, 255 + noise)); // G
      data[i + 2] = Math.max(0, Math.min(255, 255 + noise)); // B
      data[i + 3] = 255; // A
    }

    context.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  // Fa textúra - barna árnyalatokkal
  createWoodTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    // Fa alapszín
    context.fillStyle = "#8B4513";
    context.fillRect(0, 0, 512, 512);

    // Fa erezetminta
    for (let i = 0; i < 20; i++) {
      context.strokeStyle = `rgba(139, 69, 19, ${0.1 + Math.random() * 0.3})`;
      context.lineWidth = 2 + Math.random() * 4;
      context.beginPath();
      context.moveTo(0, Math.random() * 512);
      context.bezierCurveTo(
        128,
        Math.random() * 512,
        384,
        Math.random() * 512,
        512,
        Math.random() * 512
      );
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  // Műfű textúra - zöld fűszálakkal
  createGrassTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    // Alap zöld háttér
    context.fillStyle = "#228B22";
    context.fillRect(0, 0, 512, 512);

    // Fűszálak mintája
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const length = 5 + Math.random() * 15;

      context.strokeStyle = `rgba(34, 139, 34, ${0.3 + Math.random() * 0.7})`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + (Math.random() - 0.5) * 4, y - length);
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
  }

  // Szövet textúra - blueprint műfűhöz
  createFabricTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    // Alap világos szürke
    context.fillStyle = "#f0f0f0";
    context.fillRect(0, 0, 512, 512);

    // Szövet keresztminta
    context.strokeStyle = "rgba(200, 200, 200, 0.5)";
    context.lineWidth = 1;

    // Vízszintes vonalak
    for (let y = 0; y < 512; y += 8) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(512, y);
      context.stroke();
    }

    // Függőleges vonalak
    for (let x = 0; x < 512; x += 8) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, 512);
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
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

      // Edge wireframe hozzáadása - csak eredeti formák körvonalához
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

    // Realistic anyagok alkalmazása
    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      // Realistic anyag kiválasztása típus szerint
      let realisticMaterial;
      switch (element.type) {
        case "plate":
          realisticMaterial = this.realisticMaterials.plate;
          break;
        case "frame":
          realisticMaterial = this.realisticMaterials.frame;
          break;
        case "covering":
          realisticMaterial = this.realisticMaterials.covering;
          break;
        case "wall":
          realisticMaterial = this.realisticMaterials.wall;
          break;
        case "leg":
          realisticMaterial = this.realisticMaterials.leg;
          break;
        case "ball":
          realisticMaterial = this.realisticMaterials.ball;
          break;
        default:
          realisticMaterial = this.realisticMaterials.frame;
      }

      mesh.material = realisticMaterial;
      mesh.castShadow = element.display.castShadow;
      mesh.receiveShadow = element.display.receiveShadow;

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

  // Edge outline hozzáadása - csak eredeti formák körvonalához
  addEdgeOutline(mesh, elementId) {
    // Detektáljuk hogy ez eredeti forma-e vagy CSG eredmény
    const isCSGResult = mesh.userData.hasCSGOperations;

    if (isCSGResult) {
      // CSG eredményhez nem adunk edge-et - a textúra elfedi a poligonokat
      console.log(`CSG mesh, edge kihagyva: ${elementId}`);
      return;
    }

    // Csak eredeti formákhoz adunk edge outline-t
    const edges = new THREE.EdgesGeometry(mesh.geometry, 25);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x888888,
      linewidth: 1,
      transparent: true,
      opacity: 0.6,
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

  // Blueprint megvilágítás - sokkal világosabb
  setBlueprintLighting() {
    // Összes fény eltávolítása
    const lightsToRemove = [];
    this.sceneManager.scene.traverse((object) => {
      if (object.isLight) {
        lightsToRemove.push(object);
      }
    });
    lightsToRemove.forEach((light) => this.sceneManager.scene.remove(light));

    // Erős ambient light - egyenletes világítás
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.sceneManager.scene.add(ambientLight);

    // Lágy directional light felülről
    const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
    topLight.position.set(0, 100, 0);
    this.sceneManager.scene.add(topLight);

    // További lágy fény oldalt a jobb megvilágításért
    const sideLight = new THREE.DirectionalLight(0xffffff, 0.3);
    sideLight.position.set(50, 50, 50);
    this.sceneManager.scene.add(sideLight);

    // Mentés a későbbi visszaállításhoz
    this.sceneManager.blueprintLights = [ambientLight, topLight, sideLight];
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

    // Realistic anyagok cleanup
    Object.values(this.realisticMaterials).forEach((material) => {
      material.dispose();
    });

    // Textúrák cleanup
    Object.values(this.textures).forEach((texture) => {
      texture.dispose();
    });

    this.originalMaterials.clear();
    this.wireframeMaterials.clear();
  }
}
