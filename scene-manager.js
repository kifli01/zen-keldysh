/**
 * Scene Manager
 * THREE.js scene, kamera, fények és kontrolok kezelése
 * v1.3.0 - PBR világítás és tone mapping
 */

class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.meshes = new Map();

    // Koordináta rendszer
    this.coordinateSystem = null;
    this.coordinateSystemVisible = false;
    this.css2DRenderer = null;
    this.coordinateLabels = [];
    
    console.log("SceneManager konstruktor - koordináta rendszer állapot:", this.coordinateSystemVisible);

    // Kontroll változók
    this.controls = {
      isDragging: false,
      spaceDown: false,
      previousMousePosition: { x: 0, y: 0 },
    };

    // Alapértelmezett kamera pozíció
    this.defaultCameraPosition = { x: -250, y: 100, z: 200 };

    // Előre definiált nézetek - csak irányok
    this.viewPresets = {
      default: {
        direction: this.defaultCameraPosition,
        target: { x: 0, y: 0, z: 0 },
      },
      top: { direction: { x: 0, y: 1, z: 0 }, target: { x: 0, y: 0, z: 0 } },
      bottom: {
        direction: { x: 0, y: -1, z: 0 },
        target: { x: 0, y: 0, z: 0 },
      },
      front: { direction: { x: -1, y: 0, z: 0 }, target: { x: 0, y: 0, z: 0 } },
      back: { direction: { x: 1, y: 0, z: 0 }, target: { x: 0, y: 0, z: 0 } },
      left: { direction: { x: 0, y: 0, z: -1 }, target: { x: 0, y: 0, z: 0 } },
      right: { direction: { x: 0, y: 0, z: 1 }, target: { x: 0, y: 0, z: 0 } },
    };

    // Animáció loop
    this.animationId = null;
  }

  // Scene inicializálása
  setup() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createCSS2DRenderer();
    this.createPBRLights(); // ÚJ: PBR világítás
    this.createCoordinateSystem();
    this.setupEventListeners();
    this.startAnimationLoop();

    console.log("Scene Manager v1.3.0 initialized - PBR lighting");
  }

  // Scene létrehozása
  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf9f9f9);
  }

  // Kamera létrehozása
  createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000);

    this.camera.position.set(
      this.defaultCameraPosition.x,
      this.defaultCameraPosition.y,
      this.defaultCameraPosition.z
    );

    this.camera.lookAt(0, 0, 0);
  }

  // ÚJ: PBR kompatibilis renderer létrehozása
  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance" // GPU gyorsítás
    });
    
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    
    // ÚJ: PBR beállítások (hardcoded hogy ne függjön konstansoktól)
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.physicallyCorrectLights = true;
    
    // ÚJ: Tone mapping és color management
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    
    // ÚJ: Fejlett renderelési beállítások
    this.renderer.gammaFactor = 2.2;
    this.renderer.useLegacyLights = false; // Modern világítás

    console.log("✅ PBR Renderer létrehozva:", {
      toneMapping: this.renderer.toneMapping,
      physicallyCorrectLights: this.renderer.physicallyCorrectLights,
      outputEncoding: this.renderer.outputEncoding
    });

    this.container.appendChild(this.renderer.domElement);
  }

  // CSS2D Renderer létrehozása koordináta címkékhez
  createCSS2DRenderer() {
    // CSS2DRenderer csak akkor, ha elérhető
    if (window.CSS2DRenderer) {
      this.css2DRenderer = new window.CSS2DRenderer();
      this.css2DRenderer.setSize(
        this.container.clientWidth,
        this.container.clientHeight
      );
      this.css2DRenderer.domElement.style.position = 'absolute';
      this.css2DRenderer.domElement.style.top = '0px';
      this.css2DRenderer.domElement.style.pointerEvents = 'none';
      this.container.appendChild(this.css2DRenderer.domElement);
      console.log("CSS2DRenderer inicializálva");
    } else {
      console.warn("CSS2DRenderer nem elérhető, címkék nélkül folytatás");
    }
  }

  // ÚJ: PBR kompatibilis világítás létrehozása
  createPBRLights() {
    // 1. Erős ambient light - globális megvilágítás
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // 2. Fő directional light - nap szimulálása
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(200, 150, 100);
    mainLight.castShadow = true;
    
    // Fejlett árnyék beállítások PBR-hez
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 800;
    mainLight.shadow.camera.left = -300;
    mainLight.shadow.camera.right = 300;
    mainLight.shadow.camera.top = 300;
    mainLight.shadow.camera.bottom = -300;
    mainLight.shadow.bias = -0.0001; // Árnyék pontosság
    
    this.scene.add(mainLight);

    // 3. Fill light - árnyékok kitöltése
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-100, 50, -100);
    this.scene.add(fillLight);

    // 4. Rim light - kontúr világítás
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(50, 100, -200);
    this.scene.add(rimLight);

    // 5. ÚJ: Point light a labda közelében - lokális fény
    const ballLight = new THREE.PointLight(0xffffff, 0.5, 50);
    ballLight.position.set(-100, 20, -30);
    this.scene.add(ballLight);

    console.log("✅ PBR világítás létrehozva: 5 fényforrás");
  }

  // Koordináta rendszer létrehozása
  createCoordinateSystem() {
    this.coordinateSystem = new THREE.Group();
    this.coordinateLabels = [];

    const arrowLength = 200;
    const arrowColor = {
      x: 0xff0000, // Piros - X tengely
      y: 0x00ff00, // Zöld - Y tengely  
      z: 0x0000ff  // Kék - Z tengely
    };

    // X tengely nyilak (pozitív és negatív irány)
    const xArrowPos = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      arrowLength,
      arrowColor.x,
      arrowLength * 0.05,
      arrowLength * 0.025
    );
    this.coordinateSystem.add(xArrowPos);

    const xArrowNeg = new THREE.ArrowHelper(
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      arrowLength,
      arrowColor.x,
      arrowLength * 0.05,
      arrowLength * 0.025
    );
    this.coordinateSystem.add(xArrowNeg);

    // Y tengely nyilak (pozitív és negatív irány)
    const yArrowPos = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      arrowLength,
      arrowColor.y,
      arrowLength * 0.05,
      arrowLength * 0.025
    );
    this.coordinateSystem.add(yArrowPos);

    const yArrowNeg = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, 0),
      arrowLength,
      arrowColor.y,
      arrowLength * 0.05,
      arrowLength * 0.025
    );
    this.coordinateSystem.add(yArrowNeg);

    // Z tengely nyilak (pozitív és negatív irány)
    const zArrowPos = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, 0),
      arrowLength,
      arrowColor.z,
      arrowLength * 0.05,
      arrowLength * 0.025
    );
    this.coordinateSystem.add(zArrowPos);

    const zArrowNeg = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0, 0),
      arrowLength,
      arrowColor.z,
      arrowLength * 0.05,
      arrowLength * 0.025
    );
    this.coordinateSystem.add(zArrowNeg);

    // Címkék létrehozása (ha CSS2DRenderer elérhető)
    if (this.css2DRenderer && window.CSS2DObject) {
      this.createCoordinateLabels(arrowLength);
    }

    // Koordináta rendszer hozzáadása a scene-hez
    this.scene.add(this.coordinateSystem);
    
    // Alapértelmezett láthatóság beállítása (nyilak és címkék együtt)
    this.coordinateSystem.visible = this.coordinateSystemVisible;
    this.coordinateLabels.forEach(label => {
      label.visible = this.coordinateSystemVisible;
    });

    console.log("Koordináta rendszer létrehozva");
  }

  // Koordináta címkék létrehozása
  createCoordinateLabels(arrowLength) {
    const labelOffset = arrowLength + 10;
    
    const labels = [
      { text: "X+\nHÁTUL", position: [labelOffset, 0, 0], color: "#ff0000" },
      { text: "X-\nELŐL", position: [-labelOffset, 0, 0], color: "#ff0000" },
      { text: "Y+\nFENT", position: [0, labelOffset, 0], color: "#00ff00" },
      { text: "Y-\nLENT", position: [0, -labelOffset, 0], color: "#00ff00" },
      { text: "Z+\nJOBB", position: [0, 0, labelOffset], color: "#0000ff" },
      { text: "Z-\nBAL", position: [0, 0, -labelOffset], color: "#0000ff" }
    ];

    labels.forEach((labelData) => {
      const labelDiv = document.createElement('div');
      labelDiv.className = 'coordinate-label';
      labelDiv.textContent = labelData.text;
      labelDiv.style.color = labelData.color;
      labelDiv.style.fontFamily = 'Arial, sans-serif';
      labelDiv.style.fontSize = '10px';
      labelDiv.style.fontWeight = 'bold';
      labelDiv.style.background = 'rgba(255, 255, 255, 0.9)';
      labelDiv.style.padding = '3px 5px';
      labelDiv.style.borderRadius = '4px';
      labelDiv.style.border = `2px solid ${labelData.color}`;
      labelDiv.style.pointerEvents = 'none';
      labelDiv.style.textAlign = 'center';
      labelDiv.style.whiteSpace = 'pre-line';

      const label = new window.CSS2DObject(labelDiv);
      label.position.set(...labelData.position);
      
      // KÉNYSZERÍTETT REJTÉS
      label.visible = false;
      
      // Címke is a koordináta rendszer gyerekének
      this.coordinateSystem.add(label);
      this.coordinateLabels.push(label);
    });

    console.log("Koordináta címkék létrehozva - mind rejtett állapotban");
  }

  // Koordináta rendszer ki/be kapcsolása
  toggleCoordinateSystem(visible = null) {
    if (visible !== null) {
      this.coordinateSystemVisible = visible;
    } else {
      this.coordinateSystemVisible = !this.coordinateSystemVisible;
    }

    if (this.coordinateSystem) {
      // Nyilak és címkék együtt kapcsolása
      this.coordinateSystem.visible = this.coordinateSystemVisible;
      
      // EXTRA: Címkék külön is, ha nem öröklik a parent láthatóságot
      this.coordinateLabels.forEach(label => {
        if (label && label.visible !== undefined) {
          label.visible = this.coordinateSystemVisible;
        }
      });
    }

    console.log(`Koordináta rendszer: ${this.coordinateSystemVisible ? 'BE' : 'KI'}`);
    return this.coordinateSystemVisible;
  }

  // ÚJ: PBR render beállítások módosítása
  updatePBRSettings(settings = {}) {
    if (settings.toneMapping !== undefined) {
      this.renderer.toneMapping = settings.toneMapping;
    }
    if (settings.toneMappingExposure !== undefined) {
      this.renderer.toneMappingExposure = settings.toneMappingExposure;
    }
    if (settings.physicallyCorrectLights !== undefined) {
      this.renderer.physicallyCorrectLights = settings.physicallyCorrectLights;
    }
    
    console.log("PBR beállítások frissítve:", settings);
  }

  // Event listener-ek beállítása
  setupEventListeners() {
    // Keyboard events
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        this.controls.spaceDown = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        this.controls.spaceDown = false;
      }
    });

    // Mouse events - csak a renderer canvas-ra
    this.renderer.domElement.addEventListener("mousedown", (e) => {
      this.controls.isDragging = true;
      this.controls.previousMousePosition = { x: e.offsetX, y: e.offsetY };
    });

    document.addEventListener("mouseup", () => {
      this.controls.isDragging = false;
    });

    document.addEventListener("mousemove", (e) => {
      if (!this.controls.isDragging) return;

      const deltaMove = {
        x: e.offsetX - this.controls.previousMousePosition.x,
        y: e.offsetY - this.controls.previousMousePosition.y,
      };

      if (this.controls.spaceDown) {
        // Mozgatás (pan)
        this.panScene(deltaMove);
      } else {
        // Forgatás
        this.rotateScene(deltaMove);
      }

      this.controls.previousMousePosition = { x: e.offsetX, y: e.offsetY };
    });

    // Zoom (wheel)
    this.renderer.domElement.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.zoomCamera(e.deltaY);
    });

    // Window resize
    window.addEventListener("resize", () => {
      this.handleResize();
    });
  }

  // Scene forgatása
  rotateScene(deltaMove) {
    const rotationSpeed = 0.01;
    this.scene.rotation.y += deltaMove.x * rotationSpeed;
    this.scene.rotation.x += deltaMove.y * rotationSpeed;
  }

  // Scene mozgatása
  panScene(deltaMove) {
    const panSpeed = 0.5;
    this.scene.position.x += deltaMove.x * panSpeed;
    this.scene.position.y -= deltaMove.y * panSpeed;
  }

  // Kamera zoom - javított verzió
  zoomCamera(deltaY) {
    const zoomSpeed = 0.1;
    const zoomFactor = 1 + deltaY * zoomSpeed * 0.01;

    // A kamera pozíciót a középponttól való távolság alapján skálázzuk
    const target = new THREE.Vector3(0, 0, 0); // Középpont
    const direction = this.camera.position.clone().sub(target);
    const newDistance = direction.length() * zoomFactor;

    // Távolság korlátozása
    const clampedDistance = Math.max(50, Math.min(400, newDistance));

    // Új pozíció számítása
    direction.normalize();
    this.camera.position.copy(
      target.clone().add(direction.multiplyScalar(clampedDistance))
    );

    // Biztosítjuk, hogy a kamera a középpontra néz
    this.camera.lookAt(target);
  }

  // ÚJ: Kamera pozíció váltása előre definiált nézetekre
  setViewPreset(viewName, animate = false) {
    const preset = this.viewPresets[viewName];
    if (!preset) {
      console.warn(`Ismeretlen nézet: ${viewName}`);
      return;
    }

    // Scene pozíció és forgatás nullázása
    this.scene.position.set(0, 0, 0);
    this.scene.rotation.set(0, 0, 0);

    // Jelenlegi távolság megőrzése
    const currentDistance = this.camera.position.length();

    let newPosition;

    if (viewName === "default") {
      // Default nézetnél az eredeti pozíciót használjuk
      newPosition = new THREE.Vector3(
        preset.direction.x,
        preset.direction.y,
        preset.direction.z
      );
    } else {
      // Más nézeteknél az irányt normalizáljuk és megszorozzuk a jelenlegi távolsággal
      const direction = new THREE.Vector3(
        preset.direction.x,
        preset.direction.y,
        preset.direction.z
      ).normalize();

      newPosition = direction.multiplyScalar(currentDistance);
    }

    // Azonnali pozíció beállítás - nincs animáció
    this.camera.position.set(newPosition.x, newPosition.y, newPosition.z);
    this.camera.lookAt(preset.target.x, preset.target.y, preset.target.z);
  }

  // ÚJ: Kamera animáció egy pozícióba
  animateCameraToPosition(targetPosition, targetLookAt, duration = 800) {
    const startPosition = this.camera.position.clone();
    const startLookAt = new THREE.Vector3(0, 0, 0); // Jelenlegi célpont

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Pozíció interpoláció
      this.camera.position.x =
        startPosition.x + (targetPosition.x - startPosition.x) * easedProgress;
      this.camera.position.y =
        startPosition.y + (targetPosition.y - startPosition.y) * easedProgress;
      this.camera.position.z =
        startPosition.z + (targetPosition.z - startPosition.z) * easedProgress;

      // LookAt interpoláció
      const currentLookAt = startLookAt
        .clone()
        .lerp(
          new THREE.Vector3(targetLookAt.x, targetLookAt.y, targetLookAt.z),
          easedProgress
        );
      this.camera.lookAt(currentLookAt);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  // ÚJ: Gyors nézet váltó gombok funkciói
  setTopView() {
    this.setViewPreset("top");
  }
  setBottomView() {
    this.setViewPreset("bottom");
  }
  setFrontView() {
    this.setViewPreset("front");
  }
  setBackView() {
    this.setViewPreset("back");
  }
  setLeftView() {
    this.setViewPreset("left");
  }
  setRightView() {
    this.setViewPreset("right");
  }

  // Mesh hozzáadása a scene-hez
  addMesh(elementId, mesh) {
    this.scene.add(mesh);
    this.meshes.set(elementId, mesh);
  }

  // Mesh eltávolítása
  removeMesh(elementId) {
    const mesh = this.meshes.get(elementId);
    if (mesh) {
      this.scene.remove(mesh);
      this.meshes.delete(elementId);

      // Cleanup
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => material.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    }
  }

  // Összes mesh hozzáadása
  addAllMeshes(meshMap) {
    meshMap.forEach((mesh, elementId) => {
      this.addMesh(elementId, mesh);
    });
  }

  // Mesh lekérése
  getMesh(elementId) {
    return this.meshes.get(elementId);
  }

  // Összes mesh
  getAllMeshes() {
    return this.meshes;
  }

  // Nézet visszaállítása
  resetView() {
    this.setViewPreset("default");
  }

  // Animáció loop
  startAnimationLoop() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
      
      // CSS2D renderer frissítése
      if (this.css2DRenderer) {
        this.css2DRenderer.render(this.scene, this.camera);
      }
    };
    animate();
  }

  // Animáció megállítása
  stopAnimationLoop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Ablak átméretezés kezelése
  handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    // CSS2D renderer átméretezése
    if (this.css2DRenderer) {
      this.css2DRenderer.setSize(width, height);
    }
  }

  // Elem keresése pozíció alapján (raycast)
  getElementAtPosition(x, y) {
    const mouse = new THREE.Vector2();
    mouse.x = (x / this.container.clientWidth) * 2 - 1;
    mouse.y = -(y / this.container.clientHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const meshArray = Array.from(this.meshes.values());
    const intersects = raycaster.intersectObjects(meshArray);

    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      return mesh.userData;
    }

    return null;
  }

  // Scene export (GLTF)
  exportScene(binary = false) {
    return new Promise((resolve, reject) => {
      if (!window.THREE.GLTFExporter) {
        reject(new Error("GLTFExporter nem elérhető"));
        return;
      }

      const exporter = new THREE.GLTFExporter();
      const options = {
        binary: binary,
        includeCustomExtensions: true,
      };

      exporter.parse(this.scene, resolve, reject, options);
    });
  }

  // ÚJ: Debug info PBR adatokkal
  getSceneInfo() {
    return {
      meshCount: this.meshes.size,
      sceneChildren: this.scene.children.length,
      cameraPosition: this.camera.position,
      scenePosition: this.scene.position,
      sceneRotation: this.scene.rotation,
      coordinateSystemVisible: this.coordinateSystemVisible,
      // PBR info
      pbrSettings: {
        toneMapping: this.renderer.toneMapping,
        toneMappingExposure: this.renderer.toneMappingExposure,
        physicallyCorrectLights: this.renderer.physicallyCorrectLights,
        outputEncoding: this.renderer.outputEncoding,
      },
      version: "1.3.0",
    };
  }

  // Cleanup
  destroy() {
    this.stopAnimationLoop();

    // Meshek tisztítása
    this.meshes.forEach((mesh, elementId) => {
      this.removeMesh(elementId);
    });

    // CSS2D renderer cleanup
    if (this.css2DRenderer && this.css2DRenderer.domElement) {
      this.container.removeChild(this.css2DRenderer.domElement);
    }

    // Renderer cleanup
    if (this.renderer) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }

    console.log("Scene Manager v1.3.0 destroyed");
  }
}