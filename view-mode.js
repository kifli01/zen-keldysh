/**
 * View Mode Manager
 * Váltás színes nézet és tervrajz stílus között
 * v2.1.0 - TextureManager injektálás, textúra és anyag kód kiszervezve
 */

class ViewModeManager {
  constructor(sceneManager, geometryBuilder, textureManager) {
    this.sceneManager = sceneManager;
    this.geometryBuilder = geometryBuilder;
    this.textureManager = textureManager;
    this.currentMode = "blueprint"; // 'realistic' vagy 'blueprint'

    // Eredeti anyagok mentése
    this.originalMaterials = new Map();

    // Wireframe layer
    this.wireframeLayer = new Map(); // elementId -> wireframe mesh

    // Exploder referencia tárolása
    this.exploder = null;

    // Shader támogatás
    this.toonMaterials = null;

    // Textúrák és anyagok betöltése TextureManager-ből
    this.textures = this.textureManager.getAllTextures();
    this.realisticMaterials = this.textureManager.getRealisticMaterials();
    this.wireframeMaterial = this.textureManager.getWireframeMaterial();

    console.log("ViewModeManager v2.1.0 - TextureManager injektálva");
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

  // Eredeti anyagok mentése
  saveOriginalMaterials(meshes) {
    meshes.forEach((mesh, elementId) => {
      // GROUP esetén nem mentünk material-t (nincs is)
      if (mesh.userData && mesh.userData.isGroup) {
        return;
      }
      
      // Csak ha van material
      if (mesh.material) {
        this.originalMaterials.set(elementId, mesh.material.clone());
      }
    });
  }

  // Wireframe layer létrehozása
  createWireframeLayer(meshes, elements) {
    console.log("🔧 Wireframe layer létrehozása...");

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      // GROUP esetén a gyerek elemeknek wireframe
      if (mesh.userData && mesh.userData.isGroup) {
        mesh.children.forEach((childMesh, index) => {
          const wireframeGeometry = this.createWireframeGeometry(childMesh);
          
          if (wireframeGeometry) {
            const wireframeMesh = new THREE.LineSegments(
              wireframeGeometry,
              this.wireframeMaterial
            );

            // Gyerek pozíció + parent pozíció
            wireframeMesh.position.copy(mesh.position);
            wireframeMesh.position.add(childMesh.position);
            wireframeMesh.rotation.copy(mesh.rotation);
            wireframeMesh.rotation.x += childMesh.rotation.x;
            wireframeMesh.rotation.y += childMesh.rotation.y;
            wireframeMesh.rotation.z += childMesh.rotation.z;
            wireframeMesh.scale.copy(mesh.scale);

            wireframeMesh.userData = {
              isWireframe: true,
              parentId: element.id,
              childIndex: index,
              elementType: element.type,
              isGroupChild: true,
            };

            this.sceneManager.scene.add(wireframeMesh);
            this.wireframeLayer.set(`${element.id}_child_${index}`, wireframeMesh);
          }
          
          // GROUP gyerek elem lyuk körvonalai
          if (element.geometry.elements && element.geometry.elements[index]) {
            const childElement = element.geometry.elements[index];
            
            // Abszolút pozíciójú mesh létrehozása a lyuk körvonalakhoz
            const absoluteChildMesh = {
              position: {
                x: mesh.position.x + childMesh.position.x,
                y: mesh.position.y + childMesh.position.y,
                z: mesh.position.z + childMesh.position.z,
              },
              rotation: {
                x: mesh.rotation.x + childMesh.rotation.x,
                y: mesh.rotation.y + childMesh.rotation.y,
                z: mesh.rotation.z + childMesh.rotation.z,
              },
              userData: childMesh.userData
            };
            
            this.addHoleOutlines(childElement, absoluteChildMesh);
          }
        });
        return;
      }

      // Hagyományos elem wireframe
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

  // ÚJ: Lyuk tengely meghatározása CSG rotáció alapján - JAVÍTOTT v2.0.3
  determineHoleAxis(csgRotation) {
    if (!csgRotation) {
      return "y"; // Alapértelmezett: Y tengely (függőleges)
    }

    // JAVÍTOTT: Rotáció detektálás az új direction rendszerhez
    // hole-generator.js v3.1.0 rotáció mapping:
    // Y tengely: x: 0 vagy Math.PI (up esetén)
    // X tengely: y: ±Math.PI/2
    // Z tengely: x: ±Math.PI/2

    const threshold = 0.1; // Kis tolerancia a floating point hibákhoz

    // Z tengely detektálás: X tengely körül ±90° rotáció
    if (Math.abs(Math.abs(csgRotation.x) - Math.PI / 2) < threshold) {
      return "z"; // Z tengely irányú lyuk (right/left)
    }
    // X tengely detektálás: Y tengely körül ±90° rotáció
    else if (Math.abs(Math.abs(csgRotation.y) - Math.PI / 2) < threshold) {
      return "x"; // X tengely irányú lyuk (forward/backward)
    }
    // Y tengely detektálás: nincs jelentős rotáció VAGY 180° X körül (up)
    else {
      return "y"; // Y tengely irányú lyuk (down/up)
    }
  }

  // ÚJ: Mélység offsetek számítása tengely szerint - JAVÍTOTT v2.0.3
  calculateDepthOffsets(depth, axis) {
    const halfDepth = depth / 2;

    // JAVÍTOTT: Új direction rendszerhez igazítva
    switch (axis) {
      case "x":
        // X tengely: forward/backward (hosszanti irány)
        return {
          top: { x: halfDepth, y: 0, z: 0 }, // Forward irány
          bottom: { x: -halfDepth, y: 0, z: 0 }, // Backward irány
        };
      case "z":
        // Z tengely: right/left (szélességi irány)
        return {
          top: { x: 0, y: 0, z: halfDepth }, // Right irány
          bottom: { x: 0, y: 0, z: -halfDepth }, // Left irány
        };
      case "y":
      default:
        // Y tengely: down/up (magassági irány)
        return {
          top: { x: 0, y: halfDepth, z: 0 }, // Down irány (felül)
          bottom: { x: 0, y: -halfDepth, z: 0 }, // Up irány (alul)
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

      // Debug info a tengely meghatározásához - JAVÍTOTT komment
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

      // GROUP esetén a gyerek elemeket is át kell állítani
      if (mesh.userData && mesh.userData.isGroup) {
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        
        // GROUP gyerekek material váltása
        mesh.children.forEach((childMesh) => {
          if (childMesh.material) {
            const material = this.getBlueprintMaterial(element.type);
            childMesh.material = material;
            childMesh.castShadow = false;
            childMesh.receiveShadow = false;
          }
        });
        return;
      }

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

      // GROUP esetén a gyerek elemeket is át kell állítani
      if (mesh.userData && mesh.userData.isGroup) {
        mesh.castShadow = element.display.castShadow;
        mesh.receiveShadow = element.display.receiveShadow;
        
        // GROUP gyerekek realistic material váltása
        mesh.children.forEach((childMesh) => {
          if (childMesh.material) {
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
            
            childMesh.material = realisticMaterial;
            childMesh.castShadow = element.display.castShadow;
            childMesh.receiveShadow = element.display.receiveShadow;
          }
        });
        return;
      }

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

    if (this.toonMaterials) {
      Object.values(this.toonMaterials).forEach((material) => {
        material.dispose();
      });
    }

    this.originalMaterials.clear();
    this.wireframeLayer.clear();

    console.log("ViewModeManager v2.1.0 destroy - TextureManager anyagokat nem dispose-olja");
  }
}