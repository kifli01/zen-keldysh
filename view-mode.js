/**
 * View Mode Manager
 * Váltás színes nézet és tervrajz stílus között
 * v1.8.0 - Wireframe layer pozíció javítás exploded állapot kezeléshez
 */

class ViewModeManager {
  constructor(sceneManager, geometryBuilder) {
    this.sceneManager = sceneManager;
    this.geometryBuilder = geometryBuilder;
    this.currentMode = "blueprint"; // 'realistic' vagy 'blueprint'

    // Eredeti anyagok mentése
    this.originalMaterials = new Map();

    // ÚJ: Wireframe layer
    this.wireframeLayer = new Map(); // elementId -> wireframe mesh

    // ÚJ: Exploder referencia tárolása
    this.exploder = null;

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
        color: 0xb99379,
        // map: this.textures.wood,
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

    // ÚJ: Egységes wireframe anyag
    this.wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x333333, // Sötét szürke
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    });

    // Wireframe anyagok (legacy) - most üres lesz
    this.wireframeMaterials = new Map();
  }

  // ÚJ: Exploder referencia beállítása
  setExploder(exploder) {
    this.exploder = exploder;
    console.log("✅ Exploder referencia beállítva ViewModeManager-ben");
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
        lightDirection: { value: new THREE.Vector3(3, 1, 1).normalize() },
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

  // ÚJ: Wireframe layer létrehozása
  createWireframeLayer(meshes, elements) {
    console.log("🔧 Wireframe layer létrehozása...");

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      // 1. Alap wireframe geometria létrehozása (befoglaló forma)
      const wireframeGeometry = this.createWireframeGeometry(mesh);

      if (wireframeGeometry) {
        const wireframeMesh = new THREE.LineSegments(
          wireframeGeometry,
          this.wireframeMaterial
        );

        // Pozíció, forgatás, skálázás másolása
        wireframeMesh.position.copy(mesh.position);
        wireframeMesh.rotation.copy(mesh.rotation);
        wireframeMesh.scale.copy(mesh.scale);

        // Metadata
        wireframeMesh.userData = {
          isWireframe: true,
          parentId: element.id,
          elementType: element.type,
        };

        // Scene-hez adás és tárolás
        this.sceneManager.scene.add(wireframeMesh);
        this.wireframeLayer.set(element.id, wireframeMesh);

        console.log(`✅ Wireframe létrehozva: ${element.id}`);
      }

      // 2. ÚJ: Lyukak körvonalainak hozzáadása
      this.addHoleOutlines(element, mesh);
    });

    console.log(`🎯 Wireframe layer kész: ${this.wireframeLayer.size} elem`);
  }

  // ÚJ: Wireframe geometria létrehozása - lyukak nélküli verzió
  createWireframeGeometry(mesh) {
    try {
      let geometry;

      // CSG eredményhez egyszerűsített befoglaló forma készítése
      if (mesh.userData.hasCSGOperations) {
        console.log(
          `🔧 CSG mesh egyszerűsített wireframe: ${mesh.userData.elementId}`
        );
        geometry = this.createSimplifiedBoundingGeometry(mesh);
      } else {
        // Nem CSG mesh esetén az eredeti geometria használata
        geometry = mesh.geometry;
      }

      // EdgesGeometry létrehozása
      const edgesGeometry = new THREE.EdgesGeometry(geometry, 15); // 15 fok threshold

      // Ha egyszerűsített geometriát készítettünk, azt később tisztítjuk fel
      if (geometry !== mesh.geometry) {
        // A geometry-t később dispose-oljuk amikor a wireframe mesh törlődik
      }

      return edgesGeometry;
    } catch (error) {
      console.error(
        `Wireframe geometria hiba (${mesh.userData.elementId}):`,
        error
      );
      return null;
    }
  }

  // ÚJ: Egyszerűsített befoglaló geometria készítése (lyukak nélkül)
  createSimplifiedBoundingGeometry(mesh) {
    const userData = mesh.userData;

    // Bounding box alapján egyszerűsített forma készítése
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());

    // Elem típus alapján megfelelő egyszerűsített geometria
    switch (userData.elementType) {
      case "plate":
      case "covering":
      case "frame":
      case "wall":
        // Box geometria
        return new THREE.BoxGeometry(size.x, size.y, size.z);

      case "leg":
        // Cylinder geometria
        const radius = Math.max(size.x, size.z) / 2;
        return new THREE.CylinderGeometry(radius, radius, size.y, 16);

      case "ball":
        // Sphere geometria
        const sphereRadius = Math.max(size.x, size.y, size.z) / 2;
        return new THREE.SphereGeometry(sphereRadius, 16, 12);

      default:
        // Fallback: box
        return new THREE.BoxGeometry(size.x, size.y, size.z);
    }
  }

  // ÚJ: Lyukak körvonalainak hozzáadása
  addHoleOutlines(element, mesh) {
    // CSG műveletek ellenőrzése
    const csgOperations = element.geometry.csgOperations;
    const holes = element.geometry.holes; // Legacy holes támogatás

    let holeCount = 0;

    // 1. CSG műveletek alapján lyukak keresése
    if (csgOperations && csgOperations.length > 0) {
      csgOperations.forEach((operation, index) => {
        if (operation.type === "subtract") {
          const holeOutlines = this.createHoleOutlineGeometry(operation, mesh);
          if (holeOutlines && holeOutlines.length > 0) {
            // Több körvonal hozzáadása (felső és alsó)
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

    // 2. Legacy holes támogatás
    if (holes && holes.length > 0) {
      holes.forEach((hole, index) => {
        const holeOutlines = this.createLegacyHoleOutlineGeometry(hole, mesh);
        if (holeOutlines && holeOutlines.length > 0) {
          // Több körvonal hozzáadása (felső és alsó)
          holeOutlines.forEach((holeOutline, outlineIndex) => {
            this.addHoleOutlineToScene(
              holeOutline,
              mesh,
              element.id,
              `legacy_${index}_${holeOutline.type}`
            );
            holeCount++;
          });
        }
      });
    }

    if (holeCount > 0) {
      console.log(`🔵 ${holeCount} lyuk körvonal hozzáadva: ${element.id}`);
    }
  }

  // ÚJ: CSG művelet alapján lyuk körvonal készítése
  createHoleOutlineGeometry(csgOperation, parentMesh) {
    try {
      const position = csgOperation.position || { x: 0, y: 0, z: 0 };
      const depth = csgOperation.params.height || 10; // Lyuk mélysége

      let outlines = []; // Több körvonal tárolása

      switch (csgOperation.geometry) {
        case "cylinder":
          // Kör körvonal - felső és alsó
          const radius = csgOperation.params.radius;
          const segments = csgOperation.params.segments || 32;

          // Felső körvonal
          const topCircleGeometry = new THREE.CircleGeometry(radius, segments);
          const topEdgesGeometry = new THREE.EdgesGeometry(topCircleGeometry);
          topEdgesGeometry.rotateX(Math.PI / 2);

          outlines.push({
            geometry: topEdgesGeometry,
            position: {
              x: position.x,
              y: position.y + depth / 2, // Felső pozíció
              z: position.z,
            },
            rotation: csgOperation.rotation || { x: 0, y: 0, z: 0 },
            type: "top",
          });

          // Alsó körvonal
          const bottomCircleGeometry = new THREE.CircleGeometry(
            radius,
            segments
          );
          const bottomEdgesGeometry = new THREE.EdgesGeometry(
            bottomCircleGeometry
          );
          bottomEdgesGeometry.rotateX(Math.PI / 2);

          outlines.push({
            geometry: bottomEdgesGeometry,
            position: {
              x: position.x,
              y: position.y - depth / 2, // Alsó pozíció
              z: position.z,
            },
            rotation: csgOperation.rotation || { x: 0, y: 0, z: 0 },
            type: "bottom",
          });
          break;

        case "box":
          // Téglalap körvonal - felső és alsó
          const width = csgOperation.params.width;
          const length =
            csgOperation.params.length || csgOperation.params.height;

          // Felső téglalap
          const topPlaneGeometry = new THREE.PlaneGeometry(width, length);
          const topPlaneEdges = new THREE.EdgesGeometry(topPlaneGeometry);
          topPlaneEdges.rotateX(Math.PI / 2);

          outlines.push({
            geometry: topPlaneEdges,
            position: {
              x: position.x,
              y: position.y + depth / 2, // Felső pozíció
              z: position.z,
            },
            rotation: csgOperation.rotation || { x: 0, y: 0, z: 0 },
            type: "top",
          });

          // Alsó téglalap
          const bottomPlaneGeometry = new THREE.PlaneGeometry(width, length);
          const bottomPlaneEdges = new THREE.EdgesGeometry(bottomPlaneGeometry);
          bottomPlaneEdges.rotateX(Math.PI / 2);

          outlines.push({
            geometry: bottomPlaneEdges,
            position: {
              x: position.x,
              y: position.y - depth / 2, // Alsó pozíció
              z: position.z,
            },
            rotation: csgOperation.rotation || { x: 0, y: 0, z: 0 },
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

  // ÚJ: Legacy hole körvonal készítése
  createLegacyHoleOutlineGeometry(hole, parentMesh) {
    try {
      const depth = hole.depth || 10; // Alapértelmezett mélység
      let outlines = [];

      switch (hole.type) {
        case "circle":
          const radius = hole.radius;

          // Felső körvonal
          const topCircleGeometry = new THREE.CircleGeometry(radius, 32);
          const topEdgesGeometry = new THREE.EdgesGeometry(topCircleGeometry);
          topEdgesGeometry.rotateX(Math.PI / 2);

          outlines.push({
            geometry: topEdgesGeometry,
            position: {
              x: hole.position.x,
              y: hole.position.y + depth / 2,
              z: hole.position.z,
            },
            rotation: hole.rotation || { x: 0, y: 0, z: 0 },
            type: "top",
          });

          // Alsó körvonal
          const bottomCircleGeometry = new THREE.CircleGeometry(radius, 32);
          const bottomEdgesGeometry = new THREE.EdgesGeometry(
            bottomCircleGeometry
          );
          bottomEdgesGeometry.rotateX(Math.PI / 2);

          outlines.push({
            geometry: bottomEdgesGeometry,
            position: {
              x: hole.position.x,
              y: hole.position.y - depth / 2,
              z: hole.position.z,
            },
            rotation: hole.rotation || { x: 0, y: 0, z: 0 },
            type: "bottom",
          });
          break;

        case "square":
          // Felső téglalap
          const topPlaneGeometry = new THREE.PlaneGeometry(
            hole.width,
            hole.height
          );
          const topPlaneEdges = new THREE.EdgesGeometry(topPlaneGeometry);
          topPlaneEdges.rotateX(Math.PI / 2);

          outlines.push({
            geometry: topPlaneEdges,
            position: {
              x: hole.position.x,
              y: hole.position.y + depth / 2,
              z: hole.position.z,
            },
            rotation: hole.rotation || { x: 0, y: 0, z: 0 },
            type: "top",
          });

          // Alsó téglalap
          const bottomPlaneGeometry = new THREE.PlaneGeometry(
            hole.width,
            hole.height
          );
          const bottomPlaneEdges = new THREE.EdgesGeometry(bottomPlaneGeometry);
          bottomPlaneEdges.rotateX(Math.PI / 2);

          outlines.push({
            geometry: bottomPlaneEdges,
            position: {
              x: hole.position.x,
              y: hole.position.y - depth / 2,
              z: hole.position.z,
            },
            rotation: hole.rotation || { x: 0, y: 0, z: 0 },
            type: "bottom",
          });
          break;

        default:
          console.warn(`Nem támogatott legacy lyuk típus: ${hole.type}`);
          return [];
      }

      return outlines;
    } catch (error) {
      console.error("Legacy lyuk körvonal hiba:", error);
      return [];
    }
  }

  // ÚJ: Lyuk körvonal hozzáadása a scene-hez
  addHoleOutlineToScene(holeOutline, parentMesh, elementId, holeId) {
    try {
      // LineSegments használata a wireframe vonalakhoz
      const holeWireframe = new THREE.LineSegments(
        holeOutline.geometry,
        this.wireframeMaterial
      );

      // Eredeti lyuk pozíció mentése (explode támogatáshoz)
      const originalHolePosition = {
        x: holeOutline.position.x,
        y: holeOutline.position.y,
        z: holeOutline.position.z,
      };

      // Pozíció beállítása (parent mesh + hole offset)
      holeWireframe.position.set(
        parentMesh.position.x + holeOutline.position.x,
        parentMesh.position.y + holeOutline.position.y,
        parentMesh.position.z + holeOutline.position.z
      );

      // Forgatás alkalmazása
      if (holeOutline.rotation) {
        holeWireframe.rotation.set(
          holeOutline.rotation.x,
          holeOutline.rotation.y,
          holeOutline.rotation.z
        );
      }

      // Parent mesh forgatásának alkalmazása
      holeWireframe.rotation.x += parentMesh.rotation.x;
      holeWireframe.rotation.y += parentMesh.rotation.y;
      holeWireframe.rotation.z += parentMesh.rotation.z;

      // Metadata
      holeWireframe.userData = {
        isHoleOutline: true,
        parentId: elementId,
        holeId: holeId,
        originalHolePosition: originalHolePosition, // Explode támogatáshoz
      };

      // Scene-hez adás
      this.sceneManager.scene.add(holeWireframe);

      // Wireframe layer-hez tárolás (kombinált kulcs)
      const combinedKey = `${elementId}_hole_${holeId}`;
      this.wireframeLayer.set(combinedKey, holeWireframe);
    } catch (error) {
      console.error("Lyuk körvonal scene hozzáadás hiba:", error);
    }
  }

  // ÚJ: Wireframe layer eltávolítása
  removeWireframeLayer() {
    console.log("🧹 Wireframe layer eltávolítása...");

    this.wireframeLayer.forEach((wireframeMesh, elementId) => {
      // Scene-ből eltávolítás
      this.sceneManager.scene.remove(wireframeMesh);

      // Cleanup
      wireframeMesh.geometry.dispose();

      // Ha egyszerűsített geometria volt használva az edges-hez, azt is tisztítjuk
      if (wireframeMesh.userData.hasSimplifiedGeometry) {
        // A simplified geometry már dispose-olva van a wireframe geometry-val együtt
      }

      // Material nem kell dispose-olni, mert közös
    });

    this.wireframeLayer.clear();
    console.log("✅ Wireframe layer törölve");
  }

  // JAVÍTOTT: Wireframe pozíciók frissítése (explode támogatáshoz)
  updateWireframePositions(meshes) {
    this.wireframeLayer.forEach((wireframeMesh, key) => {
      // Alap wireframe elemek frissítése
      if (!key.includes("_hole_")) {
        const originalMesh = meshes.get(key);
        if (originalMesh && wireframeMesh) {
          wireframeMesh.position.copy(originalMesh.position);
          wireframeMesh.rotation.copy(originalMesh.rotation);
          wireframeMesh.scale.copy(originalMesh.scale);
        }
      } else {
        // Lyuk körvonalak frissítése
        const elementId = key.split("_hole_")[0];
        const originalMesh = meshes.get(elementId);

        if (
          originalMesh &&
          wireframeMesh &&
          wireframeMesh.userData.isHoleOutline
        ) {
          // Parent mesh pozíciójához képest relatív pozíció
          const holePosition = wireframeMesh.userData.originalHolePosition || {
            x: 0,
            y: 0,
            z: 0,
          };

          wireframeMesh.position.set(
            originalMesh.position.x + holePosition.x,
            originalMesh.position.y + holePosition.y,
            originalMesh.position.z + holePosition.z
          );

          // Parent mesh forgatásának alkalmazása
          wireframeMesh.rotation.copy(originalMesh.rotation);
        }
      }
    });
  }

  // JAVÍTOTT: Váltás tervrajz nézetbe - exploded állapot figyelése
  switchToBlueprint(meshes, elements, force = false) {
    if (this.currentMode === "blueprint" && !force) return;

    console.log("🔄 Váltás tervrajz nézetbe (wireframe layer)...");

    // Eredeti anyagok mentése (ha még nem történt meg)
    if (this.originalMaterials.size === 0) {
      this.saveOriginalMaterials(meshes);
    }

    // Árnyékok kikapcsolása
    this.sceneManager.renderer.shadowMap.enabled = false;

    // Scene háttér fehérre
    this.sceneManager.scene.background = new THREE.Color(0xffffff);
    console.log("✅ Háttér fehérre állítva");

    // Eredeti mesh-ek anyagcseréje (fehér/toon)
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
    });

    // ÚJ: Wireframe layer létrehozása
    this.createWireframeLayer(meshes, elements);

    // JAVÍTOTT: Exploded állapot ellenőrzése és wireframe pozíciók frissítése
    if (this.exploder && this.exploder.getState().isExploded) {
      console.log(
        "🔧 Exploded állapot észlelve, wireframe pozíciók frissítése..."
      );
      this.updateWireframePositions(meshes);
    }

    // Fények módosítása (egyenletes megvilágítás)
    this.setBlueprintLighting();

    this.currentMode = "blueprint";
    console.log(
      `✅ Tervrajz nézet aktív (shader: ${
        this.capabilities.customShaders ? "✅" : "❌"
      }, wireframe: ${this.wireframeLayer.size} elem)`
    );
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

  // MÓDOSÍTOTT: Váltás színes nézetbe - wireframe layer eltávolítással
  switchToRealistic(meshes, elements) {
    if (this.currentMode === "realistic") return;

    console.log("🔄 Váltás színes nézetbe...");

    // ÚJ: Wireframe layer eltávolítása
    this.removeWireframeLayer();

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
    });

    // Fények visszaállítása
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

  // MÓDOSÍTOTT: Edge pozíció frissítése - most wireframe layert frissít
  updateEdgePositions(meshes) {
    this.updateWireframePositions(meshes);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Erősebb intenzitás
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
      wireframeLayerSize: this.wireframeLayer.size,
    };
  }

  // MÓDOSÍTOTT: Cleanup - wireframe layer is törölve
  destroy() {
    // ÚJ: Wireframe layer cleanup
    this.removeWireframeLayer();

    // Legacy wireframe meshek eltávolítása (ha maradt volna)
    this.wireframeMaterials.forEach((edgeLines, elementId) => {
      if (edgeLines && edgeLines.parent) {
        this.sceneManager.scene.remove(edgeLines);
        if (edgeLines.geometry) edgeLines.geometry.dispose();
        if (edgeLines.material) edgeLines.material.dispose();
      }
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

    // ÚJ: Wireframe material cleanup
    this.wireframeMaterial.dispose();

    // Textúrák cleanup
    Object.values(this.textures).forEach((texture) => {
      texture.dispose();
    });

    this.originalMaterials.clear();
    this.wireframeMaterials.clear();
    this.wireframeLayer.clear();
  }
}
