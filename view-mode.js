/**
 * View Mode Manager
 * Váltás színes nézet és tervrajz stílus között
 * v2.0.0 - Legacy holes támogatás eltávolítva, dupla rotáció javítva
 */

class ViewModeManager {
  constructor(sceneManager, geometryBuilder) {
    this.sceneManager = sceneManager;
    this.geometryBuilder = geometryBuilder;
    this.currentMode = "blueprint"; // 'realistic' vagy 'blueprint'

    // Eredeti anyagok mentése
    this.originalMaterials = new Map();

    // Wireframe layer
    this.wireframeLayer = new Map(); // elementId -> wireframe mesh

    // Exploder referencia tárolása
    this.exploder = null;

    // Shader támogatás
    this.toonMaterials = null;

    // Textúrák létrehozása
    this.textures = this.createTextures();

    // Realistic anyagok - valószerű textúrákkal
    this.realisticMaterials = {
      plate: new THREE.MeshPhongMaterial({
        color: 0xb99379,
        shininess: 10,
        transparent: false,
      }),
      frame: new THREE.MeshPhongMaterial({
        color: 0xecc5a9,
        map: this.textures.wood,
        shininess: 10,
        transparent: false,
      }),
      covering: new THREE.MeshPhongMaterial({
        color: 0xa5bc49,
        map: this.textures.grass,
        shininess: 2,
        transparent: false,
      }),
      wall: new THREE.MeshPhongMaterial({
        color: 0xecc5a9,
        map: this.textures.wood,
        shininess: 10,
        transparent: false,
      }),
      leg: new THREE.MeshPhongMaterial({
        color: 0xecc5a9,
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

    // Wireframe anyag
    this.wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x333333,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    });
  }

  // Exploder referencia beállítása
  setExploder(exploder) {
    this.exploder = exploder;
    console.log("✅ Exploder referencia beállítva ViewModeManager-ben");
  }

  // Shader támogatás beállítása
  setShadersAvailable(available) {
    if (available) {
      this.createToonShaderMaterials();
      console.log(`Custom shader támogatás: ✅`);
    } else {
      console.log(`Custom shader támogatás: ❌ (fallback anyagok használata)`);
    }
  }

  // Toon shader anyagok létrehozása
  createToonShaderMaterials() {
    try {
      // Shader kódok lekérése DOM-ból
      const vertexShader =
        document.getElementById("toonVertexShader")?.textContent;
      const fragmentShader =
        document.getElementById("toonFragmentShader")?.textContent;

      if (!vertexShader || !fragmentShader) {
        console.warn("❌ Toon shader kódok nem találhatóak");
        return false;
      }

      // Közös shader uniforms
      const commonUniforms = {
        lightDirection: { value: new THREE.Vector3(3, 1, 1).normalize() },
        paperStrength: { value: 0.0 },
        paperTexture: { value: this.textures.paper },
      };

      // Toon anyagok létrehozása - tiszta fehér
      this.toonMaterials = {
        default: new THREE.ShaderMaterial({
          uniforms: {
            ...commonUniforms,
            color: { value: new THREE.Color(0xffffff) },
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          side: THREE.DoubleSide,
        }),
      };

      console.log("✅ Toon shader anyagok létrehozva");
      return true;
    } catch (error) {
      console.error("❌ Toon shader anyagok létrehozási hiba:", error);
      return false;
    }
  }

  // Textúrák létrehozása
  createTextures() {
    const textures = {};

    textures.paper = this.createPaperTexture();
    textures.wood = this.createWoodTexture();
    textures.grass = this.createGrassTexture();

    return textures;
  }

  // Papír textúra létrehozása
  createPaperTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 512, 512);

    const imageData = context.getImageData(0, 0, 512, 512);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 1;
      data[i] = Math.max(0, Math.min(255, 255 + noise));
      data[i + 1] = Math.max(0, Math.min(255, 255 + noise));
      data[i + 2] = Math.max(0, Math.min(255, 255 + noise));
      data[i + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    return texture;
  }

  // Fa textúra létrehozása
  createWoodTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    context.fillStyle = "#AF815F";
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

  // Műfű textúra létrehozása
  createGrassTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    context.fillStyle = "#A5BC49";
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

  // Eredeti anyagok mentése
  saveOriginalMaterials(meshes) {
    meshes.forEach((mesh, elementId) => {
      this.originalMaterials.set(elementId, mesh.material.clone());
    });
  }

  // Wireframe layer létrehozása
  createWireframeLayer(meshes, elements) {
    console.log("🔧 Wireframe layer létrehozása...");

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      const wireframeGeometry = this.createWireframeGeometry(mesh);

      if (wireframeGeometry) {
        const wireframeMesh = new THREE.LineSegments(
          wireframeGeometry,
          this.wireframeMaterial
        );

        wireframeMesh.position.copy(mesh.position);
        wireframeMesh.rotation.copy(mesh.rotation);
        wireframeMesh.scale.copy(mesh.scale);

        wireframeMesh.userData = {
          isWireframe: true,
          parentId: element.id,
          elementType: element.type,
        };

        this.sceneManager.scene.add(wireframeMesh);
        this.wireframeLayer.set(element.id, wireframeMesh);
      }

      this.addHoleOutlines(element, mesh);
    });

    console.log(`🎯 Wireframe layer kész: ${this.wireframeLayer.size} elem`);
  }

  // Wireframe geometria létrehozása
  createWireframeGeometry(mesh) {
    try {
      let geometry;

      if (mesh.userData.hasCSGOperations) {
        geometry = this.createSimplifiedBoundingGeometry(mesh);
      } else {
        geometry = mesh.geometry;
      }

      const edgesGeometry = new THREE.EdgesGeometry(geometry, 15);
      return edgesGeometry;
    } catch (error) {
      console.error(
        `Wireframe geometria hiba (${mesh.userData.elementId}):`,
        error
      );
      return null;
    }
  }

  // Egyszerűsített befoglaló geometria készítése
  createSimplifiedBoundingGeometry(mesh) {
    const userData = mesh.userData;
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());

    switch (userData.elementType) {
      case "plate":
      case "covering":
      case "frame":
      case "wall":
        return new THREE.BoxGeometry(size.x, size.y, size.z);

      case "leg":
        const radius = Math.max(size.x, size.z) / 2;
        return new THREE.CylinderGeometry(radius, radius, size.y, 16);

      case "ball":
        const sphereRadius = Math.max(size.x, size.y, size.z) / 2;
        return new THREE.SphereGeometry(sphereRadius, 16, 12);

      default:
        return new THREE.BoxGeometry(size.x, size.y, size.z);
    }
  }

  // Lyukak körvonalainak hozzáadása - CSAK CSG műveletek
  addHoleOutlines(element, mesh) {
    const csgOperations = element.geometry.csgOperations;
    let holeCount = 0;

    // Csak CSG műveletek alapján lyukak keresése
    if (csgOperations && csgOperations.length > 0) {
      csgOperations.forEach((operation, index) => {
        if (operation.type === "subtract") {
          const holeOutlines = this.createHoleOutlineGeometry(operation, mesh);
          if (holeOutlines && holeOutlines.length > 0) {
            holeOutlines.forEach((holeOutline, outlineIndex) => {
              this.addHoleOutlineToScene(
                holeOutline,
                mesh,
                element.id,
                `csg_${index}_${holeOutline.type}`
              );
              holeCount++;
            });
          }
        }
      });
    }

    if (holeCount > 0) {
      console.log(`🔵 ${holeCount} lyuk körvonal hozzáadva: ${element.id}`);
    }
  }

  // CSG művelet alapján lyuk körvonal készítése - JAVÍTOTT rotáció és pozíció kezelés v3
  createHoleOutlineGeometry(csgOperation, parentMesh) {
    try {
      const position = csgOperation.position || { x: 0, y: 0, z: 0 };
      const depth = csgOperation.params.height || 10;

      let outlines = [];

      // ÚJ: Lyuk tengely meghatározása CSG rotáció alapján
      const holeAxis = this.determineHoleAxis(csgOperation.rotation);
      const depthOffsets = this.calculateDepthOffsets(depth, holeAxis);

      switch (csgOperation.geometry) {
        case "cylinder":
          const radius = csgOperation.params.radius;
          const segments = csgOperation.params.segments || 32;

          // Felső körvonal - JAVÍTOTT pozícióval
          const topCircleGeometry = new THREE.CircleGeometry(radius, segments);
          const topEdgesGeometry = new THREE.EdgesGeometry(topCircleGeometry);

          this.applyCSGRotationToGeometry(
            topEdgesGeometry,
            csgOperation.rotation
          );

          outlines.push({
            geometry: topEdgesGeometry,
            position: {
              x: position.x + depthOffsets.top.x,
              y: position.y + depthOffsets.top.y,
              z: position.z + depthOffsets.top.z,
            },
            type: "top",
          });

          // Alsó körvonal - JAVÍTOTT pozícióval
          const bottomCircleGeometry = new THREE.CircleGeometry(
            radius,
            segments
          );
          const bottomEdgesGeometry = new THREE.EdgesGeometry(
            bottomCircleGeometry
          );

          this.applyCSGRotationToGeometry(
            bottomEdgesGeometry,
            csgOperation.rotation
          );

          outlines.push({
            geometry: bottomEdgesGeometry,
            position: {
              x: position.x + depthOffsets.bottom.x,
              y: position.y + depthOffsets.bottom.y,
              z: position.z + depthOffsets.bottom.z,
            },
            type: "bottom",
          });
          break;

        case "box":
          const width = csgOperation.params.width;
          const length =
            csgOperation.params.length || csgOperation.params.height;

          // Felső téglalap - JAVÍTOTT pozícióval
          const topPlaneGeometry = new THREE.PlaneGeometry(width, length);
          const topPlaneEdges = new THREE.EdgesGeometry(topPlaneGeometry);

          this.applyCSGRotationToGeometry(topPlaneEdges, csgOperation.rotation);

          outlines.push({
            geometry: topPlaneEdges,
            position: {
              x: position.x + depthOffsets.top.x,
              y: position.y + depthOffsets.top.y,
              z: position.z + depthOffsets.top.z,
            },
            type: "top",
          });

          // Alsó téglalap - JAVÍTOTT pozícióval
          const bottomPlaneGeometry = new THREE.PlaneGeometry(width, length);
          const bottomPlaneEdges = new THREE.EdgesGeometry(bottomPlaneGeometry);

          this.applyCSGRotationToGeometry(
            bottomPlaneEdges,
            csgOperation.rotation
          );

          outlines.push({
            geometry: bottomPlaneEdges,
            position: {
              x: position.x + depthOffsets.bottom.x,
              y: position.y + depthOffsets.bottom.y,
              z: position.z + depthOffsets.bottom.z,
            },
            type: "bottom",
          });
          break;

        default:
          console.warn(
            `Nem támogatott lyuk geometria: ${csgOperation.geometry}`
          );
          return [];
      }

      return outlines;
    } catch (error) {
      console.error("CSG lyuk körvonal hiba:", error);
      return [];
    }
  }

  // ÚJ: Lyuk tengely meghatározása CSG rotáció alapján
  determineHoleAxis(csgRotation) {
    if (!csgRotation) {
      return "y"; // Alapértelmezett: Y tengely (függőleges)
    }

    // CSG rotációk a hole-generator.js-ből:
    // X tengely: {x: 0, y: 0, z: Math.PI/2}
    // Z tengely: {x: Math.PI/2, y: 0, z: 0}
    // Y tengely: {x: 0, y: 0, z: 0}

    const threshold = 0.1; // Kis tolerancia a floating point hibákhoz

    if (Math.abs(csgRotation.z - Math.PI / 2) < threshold) {
      return "x"; // X tengely irányú lyuk
    } else if (Math.abs(csgRotation.x - Math.PI / 2) < threshold) {
      return "z"; // Z tengely irányú lyuk
    } else {
      return "y"; // Y tengely irányú lyuk (alapértelmezett)
    }
  }

  // ÚJ: Mélység offsetek számítása tengely szerint
  calculateDepthOffsets(depth, axis) {
    const halfDepth = depth / 2;

    switch (axis) {
      case "x":
        return {
          top: { x: halfDepth, y: 0, z: 0 },
          bottom: { x: -halfDepth, y: 0, z: 0 },
        };
      case "z":
        return {
          top: { x: 0, y: 0, z: halfDepth },
          bottom: { x: 0, y: 0, z: -halfDepth },
        };
      case "y":
      default:
        return {
          top: { x: 0, y: halfDepth, z: 0 },
          bottom: { x: 0, y: -halfDepth, z: 0 },
        };
    }
  }

  // ÚJ: CSG rotáció alkalmazása wireframe geometrián - DEBUG infóval
  applyCSGRotationToGeometry(geometry, csgRotation) {
    // Alapértelmezett orientáció: XY sík -> XZ síkra forgatás (vízszintes)
    geometry.rotateX(Math.PI / 2);

    // Ha van CSG rotáció, alkalmazzuk azt is
    if (
      csgRotation &&
      (csgRotation.x !== 0 || csgRotation.y !== 0 || csgRotation.z !== 0)
    ) {
      const rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeRotationFromEuler(
        new THREE.Euler(csgRotation.x, csgRotation.y, csgRotation.z)
      );
      geometry.applyMatrix4(rotationMatrix);

      // Debug info a tengely meghatározásához
      const axis = this.determineHoleAxis(csgRotation);
      console.log(
        `🔄 CSG wireframe: ${axis} tengely, rotáció: x:${(
          (csgRotation.x * 180) /
          Math.PI
        ).toFixed(1)}° y:${((csgRotation.y * 180) / Math.PI).toFixed(1)}° z:${(
          (csgRotation.z * 180) /
          Math.PI
        ).toFixed(1)}°`
      );
    }
  }

  // Lyuk körvonal hozzáadása a scene-hez - EGYSZERŰSÍTETT rotáció kezelés
  addHoleOutlineToScene(holeOutline, parentMesh, elementId, holeId) {
    try {
      const holeWireframe = new THREE.LineSegments(
        holeOutline.geometry,
        this.wireframeMaterial
      );

      const originalHolePosition = {
        x: holeOutline.position.x,
        y: holeOutline.position.y,
        z: holeOutline.position.z,
      };

      // Pozíció beállítása (parent + hole offset)
      holeWireframe.position.set(
        parentMesh.position.x + holeOutline.position.x,
        parentMesh.position.y + holeOutline.position.y,
        parentMesh.position.z + holeOutline.position.z
      );

      // JAVÍTÁS v2: Csak parent mesh rotációját alkalmazzuk
      // A CSG rotáció már a geometriában van az applyCSGRotationToGeometry-ban
      holeWireframe.rotation.set(
        parentMesh.rotation.x,
        parentMesh.rotation.y,
        parentMesh.rotation.z
      );

      holeWireframe.userData = {
        isHoleOutline: true,
        parentId: elementId,
        holeId: holeId,
        originalHolePosition: originalHolePosition,
      };

      this.sceneManager.scene.add(holeWireframe);

      const combinedKey = `${elementId}_hole_${holeId}`;
      this.wireframeLayer.set(combinedKey, holeWireframe);
    } catch (error) {
      console.error("Lyuk körvonal scene hozzáadás hiba:", error);
    }
  }

  // Wireframe layer eltávolítása
  removeWireframeLayer() {
    console.log("🧹 Wireframe layer eltávolítása...");

    this.wireframeLayer.forEach((wireframeMesh, elementId) => {
      this.sceneManager.scene.remove(wireframeMesh);
      wireframeMesh.geometry.dispose();
    });

    this.wireframeLayer.clear();
    console.log("✅ Wireframe layer törölve");
  }

  // Wireframe pozíciók frissítése
  updateWireframePositions(meshes) {
    this.wireframeLayer.forEach((wireframeMesh, key) => {
      if (!key.includes("_hole_")) {
        // Sima elem wireframe
        const originalMesh = meshes.get(key);
        if (originalMesh && wireframeMesh) {
          wireframeMesh.position.copy(originalMesh.position);
          wireframeMesh.rotation.copy(originalMesh.rotation);
          wireframeMesh.scale.copy(originalMesh.scale);
        }
      } else {
        // Lyuk wireframe
        const elementId = key.split("_hole_")[0];
        const originalMesh = meshes.get(elementId);

        if (
          originalMesh &&
          wireframeMesh &&
          wireframeMesh.userData.isHoleOutline
        ) {
          const holePosition = wireframeMesh.userData.originalHolePosition || {
            x: 0,
            y: 0,
            z: 0,
          };

          // Pozíció frissítése
          wireframeMesh.position.set(
            originalMesh.position.x + holePosition.x,
            originalMesh.position.y + holePosition.y,
            originalMesh.position.z + holePosition.z
          );

          // JAVÍTÁS: Rotáció frissítése - csak parent rotáció
          wireframeMesh.rotation.copy(originalMesh.rotation);
        }
      }
    });
  }

  // Váltás tervrajz nézetbe
  switchToBlueprint(meshes, elements, force = false) {
    if (this.currentMode === "blueprint" && !force) return;

    console.log("🔄 Váltás tervrajz nézetbe...");

    if (this.originalMaterials.size === 0) {
      this.saveOriginalMaterials(meshes);
    }

    this.sceneManager.renderer.shadowMap.enabled = false;
    this.sceneManager.scene.background = new THREE.Color(0xffffff);

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      const material = this.getBlueprintMaterial(element.type);

      mesh.material = material;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    });

    this.createWireframeLayer(meshes, elements);

    const isExploded = this.exploder && this.exploder.getState().isExploded;
    if (isExploded) {
      console.log(
        "🔧 Exploded állapot észlelve, wireframe pozíciók frissítése..."
      );
      setTimeout(() => {
        this.updateWireframePositions(meshes);
      }, 50);
    }

    this.setBlueprintLighting();

    this.currentMode = "blueprint";
    console.log(
      `✅ Tervrajz nézet aktív (wireframe: ${this.wireframeLayer.size} elem, exploded: ${isExploded})`
    );
  }

  // Blueprint anyag kiválasztása
  getBlueprintMaterial(elementType) {
    return this.toonMaterials.default;
  }

  // Váltás színes nézetbe
  switchToRealistic(meshes, elements) {
    if (this.currentMode === "realistic") return;

    console.log("🔄 Váltás színes nézetbe...");

    this.removeWireframeLayer();

    this.sceneManager.renderer.shadowMap.enabled = true;
    this.sceneManager.scene.background = new THREE.Color(0xf9f9f9);

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
    });

    this.setRealisticLighting();

    this.currentMode = "realistic";
    console.log("✅ Színes nézet aktív");
  }

  // Toggle - váltás a két nézet között
  toggle(meshes, elements) {
    if (this.currentMode === "realistic") {
      this.switchToBlueprint(meshes, elements);
    } else {
      this.switchToRealistic(meshes, elements);
    }
  }

  // Blueprint megvilágítás
  setBlueprintLighting() {
    const lightsToRemove = [];
    this.sceneManager.scene.traverse((object) => {
      if (object.isLight) {
        lightsToRemove.push(object);
      }
    });
    lightsToRemove.forEach((light) => this.sceneManager.scene.remove(light));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.sceneManager.scene.add(ambientLight);

    this.sceneManager.blueprintLights = [ambientLight];
  }

  // Realistic megvilágítás visszaállítása
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

  // Cleanup
  destroy() {
    this.removeWireframeLayer();

    Object.values(this.realisticMaterials).forEach((material) => {
      material.dispose();
    });

    if (this.toonMaterials) {
      Object.values(this.toonMaterials).forEach((material) => {
        material.dispose();
      });
    }

    this.wireframeMaterial.dispose();

    Object.values(this.textures).forEach((texture) => {
      texture.dispose();
    });

    this.originalMaterials.clear();
    this.wireframeLayer.clear();
  }
}
