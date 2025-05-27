/**
 * View Mode Manager
 * Váltás színes nézet és tervrajz stílus között
 * v1.6.0 - Toon shader és papírszerű megjelenés
 */

class ViewModeManager {
  constructor(sceneManager, geometryBuilder) {
    this.sceneManager = sceneManager;
    this.geometryBuilder = geometryBuilder;
    this.currentMode = "blueprint"; // 'realistic' vagy 'blueprint'

    // Eredeti anyagok mentése
    this.originalMaterials = new Map();

    // ÚJ: Képességek ellenőrzése
    this.capabilities = {
      postProcessing: false,
      customShaders: false,
    };

    // Textúrák létrehozása
    this.textures = this.createTextures();

    // ÚJ: Toon shader anyagok (ha támogatott)
    this.toonMaterials = null;

    // Blueprint anyagok - TISZTA FEHÉR fallback anyagok
    this.blueprintMaterials = {
      plate: new THREE.MeshLambertMaterial({
        color: 0xffffff, // Tiszta fehér
        transparent: false,
        flatShading: false,
        side: THREE.DoubleSide,
      }),
      frame: new THREE.MeshLambertMaterial({
        color: 0xffffff, // Tiszta fehér
        transparent: false,
        flatShading: false,
        side: THREE.DoubleSide,
      }),
      covering: new THREE.MeshLambertMaterial({
        color: 0xffffff, // Tiszta fehér
        transparent: false,
        flatShading: false,
        side: THREE.DoubleSide,
      }),
      wall: new THREE.MeshLambertMaterial({
        color: 0xffffff, // Tiszta fehér
        transparent: false,
        flatShading: false,
        side: THREE.DoubleSide,
      }),
      leg: new THREE.MeshLambertMaterial({
        color: 0xffffff, // Tiszta fehér
        transparent: false,
        flatShading: false,
        side: THREE.DoubleSide,
      }),
      ball: new THREE.MeshLambertMaterial({
        color: 0xffffff, // Tiszta fehér
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

    // Wireframe anyagok (körvonalakhoz) - fallback
    this.wireframeMaterials = new Map();
  }

  // ÚJ: Post-processing elérhetőség beállítása
  setPostProcessingAvailable(available) {
    this.capabilities.postProcessing = available;
    console.log(`Post-processing támogatás: ${available ? "✅" : "❌"}`);
  }

  // ÚJ: Custom shader elérhetőség beállítása
  setShadersAvailable(available) {
    this.capabilities.customShaders = available;

    if (available) {
      // Toon shader anyagok létrehozása
      this.createToonShaderMaterials();
      console.log(`Custom shader támogatás: ✅`);
    } else {
      console.log(`Custom shader támogatás: ❌ (fallback anyagok használata)`);
    }
  }

  // ÚJ: Toon shader anyagok létrehozása + ERROR HANDLING
  createToonShaderMaterials() {
    try {
      // Shader kódok lekérése a HTML-ből
      const vertexShader =
        document.getElementById("toonVertexShader")?.textContent;
      const fragmentShader =
        document.getElementById("toonFragmentShader")?.textContent;

      if (!vertexShader || !fragmentShader) {
        console.warn(
          "❌ Toon shader kódok nem találhatóak, fallback használata"
        );
        return false;
      }

      console.log(
        "✅ Shader kódok megtalálva, próbálkozás shader anyagokkal..."
      );

      // Teszt shader létrehozása először
      const testMaterial = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0xffffff) },
          lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
          paperStrength: { value: 0.0 }, // Nincs textúra teszt céljából
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide,
      });

      // Shader compile teszt
      console.log("🧪 Shader compile teszt...");

      // Közös shader uniforms
      const commonUniforms = {
        lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
        paperStrength: { value: 0.0 }, // KIKAPCSOLVA TESZTELÉSHEZ
        paperTexture: { value: this.textures.paper },
      };

      // Toon anyagok létrehozása minden típushoz - TISZTA FEHÉR
      this.toonMaterials = {
        plate: new THREE.ShaderMaterial({
          uniforms: {
            ...commonUniforms,
            color: { value: new THREE.Color(0xffffff) }, // Tiszta fehér
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          side: THREE.DoubleSide,
        }),

        frame: new THREE.ShaderMaterial({
          uniforms: {
            ...commonUniforms,
            color: { value: new THREE.Color(0xffffff) }, // Tiszta fehér
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          side: THREE.DoubleSide,
        }),

        covering: new THREE.ShaderMaterial({
          uniforms: {
            ...commonUniforms,
            color: { value: new THREE.Color(0xffffff) }, // Tiszta fehér
            paperTexture: { value: this.textures.fabric },
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          side: THREE.DoubleSide,
        }),

        wall: new THREE.ShaderMaterial({
          uniforms: {
            ...commonUniforms,
            color: { value: new THREE.Color(0xffffff) }, // Tiszta fehér
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          side: THREE.DoubleSide,
        }),

        leg: new THREE.ShaderMaterial({
          uniforms: {
            ...commonUniforms,
            color: { value: new THREE.Color(0xffffff) }, // Tiszta fehér
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          side: THREE.DoubleSide,
        }),

        ball: new THREE.ShaderMaterial({
          uniforms: {
            ...commonUniforms,
            color: { value: new THREE.Color(0xffffff) }, // Tiszta fehér
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          side: THREE.DoubleSide,
        }),
      };

      console.log(
        "✅ Toon shader anyagok létrehozva - TISZTA FEHÉR beállítással"
      );
      return true;
    } catch (error) {
      console.error("❌ Toon shader anyagok létrehozási hiba:", error);
      console.log("📴 Fallback anyagokra váltás...");
      return false;
    }
  }

  // ÚJ: Outline shader anyag létrehozása
  createOutlineShaderMaterial() {
    try {
      const vertexShader = document.getElementById(
        "outlineVertexShader"
      )?.textContent;
      const fragmentShader = document.getElementById(
        "outlineFragmentShader"
      )?.textContent;

      if (!vertexShader || !fragmentShader) {
        return null;
      }

      return new THREE.ShaderMaterial({
        uniforms: {
          outlineColor: { value: new THREE.Color(0x333333) },
          outlineThickness: { value: 2.0 },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.BackSide,
        transparent: true,
      });
    } catch (error) {
      console.error("Outline shader hiba:", error);
      return null;
    }
  }

  // Textúrák létrehozása (módosított - finomabb papír hatás)
  createTextures() {
    const textures = {};

    // Papír textúra - finomabb, kevésbé látható
    textures.paper = this.createPaperTexture();

    // Fa textúra
    textures.wood = this.createWoodTexture();

    // Műfű textúra
    textures.grass = this.createGrassTexture();

    // Szövet textúra - finomabb
    textures.fabric = this.createFabricTexture();

    return textures;
  }

  // MÓDOSÍTOTT: Sokkal finomabb papír textúra - szinte láthatatlan
  createPaperTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    // Alap fehér háttér
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 512, 512);

    // MINIMÁLIS zaj - szinte láthatatlan
    const imageData = context.getImageData(0, 0, 512, 512);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 1; // Nagyon kicsi zaj: 1 helyett 4
      data[i] = Math.max(0, Math.min(255, 255 + noise)); // R
      data[i + 1] = Math.max(0, Math.min(255, 255 + noise)); // G
      data[i + 2] = Math.max(0, Math.min(255, 255 + noise)); // B
      data[i + 3] = 255; // A
    }

    context.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16); // Nagyobb ismétlés = finomabb minta
    return texture;
  }

  // Többi textúra funkció változatlan...
  createWoodTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    context.fillStyle = "#8B4513";
    context.fillRect(0, 0, 512, 512);

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

  createGrassTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    context.fillStyle = "#228B22";
    context.fillRect(0, 0, 512, 512);

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

  // MÓDOSÍTOTT: Finomabb szövet textúra
  createFabricTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    context.fillStyle = "#f8f8f8";
    context.fillRect(0, 0, 512, 512);

    // Finomabb keresztminta
    context.strokeStyle = "rgba(230, 230, 230, 0.3)";
    context.lineWidth = 0.5;

    for (let y = 0; y < 512; y += 12) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(512, y);
      context.stroke();
    }

    for (let x = 0; x < 512; x += 12) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, 512);
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  // Eredeti anyagok mentése
  saveOriginalMaterials(meshes) {
    meshes.forEach((mesh, elementId) => {
      this.originalMaterials.set(elementId, mesh.material.clone());
    });
  }

  // MÓDOSÍTOTT: Váltás tervrajz nézetbe - DEBUG módban
  switchToBlueprint(meshes, elements, force = false) {
    if (this.currentMode === "blueprint" && !force) return;

    console.log("🔄 Váltás tervrajz nézetbe...");

    // Eredeti anyagok mentése (ha még nem történt meg)
    if (this.originalMaterials.size === 0) {
      this.saveOriginalMaterials(meshes);
    }

    // Árnyékok kikapcsolása
    this.sceneManager.renderer.shadowMap.enabled = false;

    // Scene háttér fehérre
    this.sceneManager.scene.background = new THREE.Color(0xffffff);
    console.log("✅ Háttér fehérre állítva");

    // Anyagok cseréje - toon shader vagy fallback
    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      // Anyag kiválasztása
      let material;

      if (this.capabilities.customShaders && this.toonMaterials) {
        // ✅ Toon shader anyagok használata
        material = this.getBlueprintMaterial(element.type, true);
        console.log(`🎨 Shader anyag alkalmazva: ${element.id}`);
      } else {
        // ❌ Fallback hagyományos anyagok
        material = this.getBlueprintMaterial(element.type, false);
        console.log(`📄 Fallback anyag alkalmazva: ${element.id}`);
      }

      mesh.material = material;
      mesh.castShadow = false;
      mesh.receiveShadow = false;

      // NINCS körvonal - tiszta papír makettszerű megjelenés
      // Az outline hatást a shader adja
    });

    // Fények módosítása (egyenletes megvilágítás)
    this.setBlueprintLighting();

    this.currentMode = "blueprint";
    console.log(
      `✅ Tervrajz nézet aktív (shader: ${
        this.capabilities.customShaders ? "✅" : "❌"
      })`
    );
    console.log(`📊 Toon materials ready: ${!!this.toonMaterials}`);
  }

  // ÚJ: Blueprint anyag kiválasztása (shader vagy fallback)
  getBlueprintMaterial(elementType, useShader = false) {
    const materialSource = useShader
      ? this.toonMaterials
      : this.blueprintMaterials;

    switch (elementType) {
      case "plate":
        return materialSource.plate;
      case "frame":
        return materialSource.frame;
      case "covering":
        return materialSource.covering;
      case "wall":
        return materialSource.wall;
      case "leg":
        return materialSource.leg;
      case "ball":
        return materialSource.ball;
      default:
        return materialSource.frame;
    }
  }

  // Váltás színes nézetbe (változatlan)
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
    console.log("Színes nézet aktív");
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

  // Edge outline hozzáadása - ERŐSEBB KONTÚROK
  addEdgeOutline(mesh, elementId) {
    // CSG eredményhez is adunk edge-et a jobb láthatóságért
    const isCSGResult = mesh.userData.hasCSGOperations;
    if (isCSGResult) {
      console.log(`CSG mesh körvonal hozzáadva: ${elementId}`);
    }

    const edges = new THREE.EdgesGeometry(mesh.geometry, 15); // Csökkentett threshold = több vonal
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x333333, // Sötétebb szürke
      linewidth: 2, // Vastagabb vonalak
      transparent: true,
      opacity: 0.8, // Erősebb körvonal
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

  // MÓDOSÍTOTT: Blueprint megvilágítás - tiszta fehér háttér
  setBlueprintLighting() {
    // Összes fény eltávolítása
    const lightsToRemove = [];
    this.sceneManager.scene.traverse((object) => {
      if (object.isLight) {
        lightsToRemove.push(object);
      }
    });
    lightsToRemove.forEach((light) => this.sceneManager.scene.remove(light));

    // Erős, egyenletes világítás - minden fehér legyen
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Erősebb intenzitás
    this.sceneManager.scene.add(ambientLight);

    // Mentés a későbbi visszaállításhoz
    this.sceneManager.blueprintLights = [ambientLight];
  }

  // Realistic megvilágítás visszaállítása (változatlan)
  setRealisticLighting() {
    if (this.sceneManager.blueprintLights) {
      this.sceneManager.blueprintLights.forEach((light) => {
        this.sceneManager.scene.remove(light);
      });
      delete this.sceneManager.blueprintLights;
    }

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

  // ÚJ: Képességek lekérdezése debug-hoz
  getCapabilities() {
    return {
      ...this.capabilities,
      toonMaterialsReady: !!this.toonMaterials,
      shadersLoaded: this.capabilities.customShaders,
    };
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

    // ÚJ: Toon anyagok cleanup
    if (this.toonMaterials) {
      Object.values(this.toonMaterials).forEach((material) => {
        material.dispose();
      });
    }

    // Textúrák cleanup
    Object.values(this.textures).forEach((texture) => {
      texture.dispose();
    });

    this.originalMaterials.clear();
    this.wireframeMaterials.clear();
  }
}
