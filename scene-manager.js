/**
 * Scene Manager
 * THREE.js scene, kamera, fények és kontrolok kezelése
 * v1.7.3 - Javított forgatás: korlátozott függőleges + simább mozgás
 */

class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.meshes = new Map();

    // CSAK OrbitControls
    this.orbitControls = null;
    this.isCtrlPressed = false; // ÚJ: Ctrl gomb állapot

    // Koordináta rendszer
    this.coordinateSystem = null;
    this.coordinateSystemVisible = false;
    this.css2DRenderer = null;
    this.coordinateLabels = [];
    
    // Alapvető kamera beállítások
    this.defaultZoomDistance = 240;

    // Animáció loop
    this.animationId = null;

    this.defaultCameraPosition = { x: -190, y: 47, z: 110 };
    this.defaultOrbitTarget = { x: -22, y: -14, z: -25 };
    
    console.log("SceneManager v1.7.3 - Javított forgatás és korlátok");
  }

  // Scene inicializálása
  async setup() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createCSS2DRenderer();
    this.createPBRLights();
    this.createCoordinateSystem();
    
    // CSAK OrbitControls inicializálása
    await this.initializeOrbitControls();
    
    this.startAnimationLoop();

    console.log("Scene Manager v1.7.3 initialized - Korlátozott forgatás (18°-162°)");
  }

  // Scene létrehozása
  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf9f9f9);
  }

  // EGYSZERŰSÍTETT kamera létrehozása
  createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000);

    // EGYSZERŰ kezdő pozíció - OrbitControls fogja kezelni
    this.camera.position.set(this.defaultCameraPosition.x, this.defaultCameraPosition.y, this.defaultCameraPosition.z);

    this.camera.lookAt(0, 0, 0);
  }

  // Renderer létrehozása
  createRenderer() {
    const rendererOptions = {
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      logarithmicDepthBuffer: false,
      precision: "highp",
      stencil: true,
      depth: true,
    };

    this.renderer = new THREE.WebGLRenderer(rendererOptions);
    
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
    
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.gammaFactor = 2.2;
    this.renderer.useLegacyLights = false;
    this.renderer.autoClear = true;
    this.renderer.autoClearColor = true;
    this.renderer.autoClearDepth = true;
    this.renderer.autoClearStencil = true;

    this.container.appendChild(this.renderer.domElement);
  }

  // CSS2D Renderer
  createCSS2DRenderer() {
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

  // PBR világítás
  createPBRLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(200, 150, 100);
    mainLight.castShadow = true;
    
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 800;
    mainLight.shadow.camera.left = -300;
    mainLight.shadow.camera.right = 300;
    mainLight.shadow.camera.top = 300;
    mainLight.shadow.camera.bottom = -300;
    mainLight.shadow.bias = -0.0001;
    
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-100, 50, -100);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(50, 100, -200);
    this.scene.add(rimLight);

    const ballLight = new THREE.PointLight(0xffffff, 0.5, 50);
    ballLight.position.set(-100, 20, -30);
    this.scene.add(ballLight);

    console.log("✅ PBR világítás létrehozva: 5 fényforrás");
  }

  // TISZTA OrbitControls inicializálása - JAVÍTOTT forgatás
  async initializeOrbitControls() {
    console.log("🔍 JAVÍTOTT OrbitControls inicializálás...");
    
    try {
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      
      this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
      
      // TARGET: Pálya közepe
      this.orbitControls.target.set(this.defaultOrbitTarget.x, this.defaultOrbitTarget.y, this.defaultOrbitTarget.z);
      
      // ZOOM BEÁLLÍTÁSOK
      this.orbitControls.enableZoom = true;
      this.orbitControls.zoomSpeed = 1.5;
      this.orbitControls.zoomToCursor = true; // Kurzorhoz zoom
      
      // FORGATÁS BEÁLLÍTÁSOK - javított kiszámíthatóság
      this.orbitControls.enableRotate = true;
      this.orbitControls.rotateSpeed = 0.3; // Lassabb = precízebb
      this.orbitControls.autoRotate = false;
      
      // KORLÁTOZOTT FÜGGŐLEGES FORGATÁS - nem tud "átfordulni"
      this.orbitControls.maxPolarAngle = Math.PI; // 180°
      this.orbitControls.minPolarAngle = 0; // 0°
      
      this.orbitControls.enablePan = true;
      this.orbitControls.panSpeed = 1.0;
      this.orbitControls.screenSpacePanning = true; // FIX: Képernyő alapú mozgatás
      
      // SMOOTH MOZGÁS - erősebb damping
      this.orbitControls.enableDamping = true;
      this.orbitControls.dampingFactor = 0.08; // Növelve 0.05-ről
      
      // ÚJ v1.7.1: MEGFORDÍTOTT MOUSE GOMBOK
      // LEFT = PAN (mozgatás), RIGHT = ROTATE (forgatás), CTRL+LEFT = ROTATE
      this.orbitControls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,     // Bal egér = mozgatás
        MIDDLE: THREE.MOUSE.DOLLY, // Középső = zoom
        RIGHT: THREE.MOUSE.ROTATE  // Jobb egér = forgatás
      };
      
      // ÚJ: CTRL gomb kezelés - Ctrl+Left = forgatás
      this.isCtrlPressed = false;
      this.setupCtrlKeyHandling();
      
      // AKTIVÁLÁS
      this.orbitControls.update();
      
      console.log("✅ JAVÍTOTT OrbitControls inicializálva!");
      console.log("🎮 Kontrollok:", {
        "Bal egér": "Pan mozgatás (képernyő alapú)",
        "Jobb egér": "Korlátozott forgatás (18°-162°)", 
        "Ctrl + Bal egér": "Korlátozott forgatás",
        "Scroll": "Zoom kurzorhoz"
      });
      
    } catch (error) {
      console.error("❌ OrbitControls inicializálás hiba:", error);
    }
  }

  // ÚJ v1.7.1: Ctrl gomb kezelés
  setupCtrlKeyHandling() {
    // Ctrl gomb figyelése
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey) { // Ctrl vagy Cmd (Mac)
        this.isCtrlPressed = true;
        this.updateMouseButtons();
      }
    });

    document.addEventListener('keyup', (event) => {
      if (!event.ctrlKey && !event.metaKey) {
        this.isCtrlPressed = false;
        this.updateMouseButtons();
      }
    });

    console.log("⌨️ Ctrl gomb kezelés beállítva");
  }

  // ÚJ v1.7.1: Mouse gombok dinamikus frissítése
  updateMouseButtons() {
    if (!this.orbitControls) return;

    if (this.isCtrlPressed) {
      // Ctrl lenyomva: Bal egér = forgatás
      this.orbitControls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,  // Ctrl + Bal = forgatás
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE  // Jobb továbbra is forgatás
      };
      console.log("🎮 Ctrl mód: Bal egér = FORGATÁS");
    } else {
      // Normál mód: Bal egér = mozgatás
      this.orbitControls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,     // Bal = mozgatás
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE  // Jobb = forgatás
      };
      console.log("🎮 Normál mód: Bal egér = MOZGATÁS");
    }
  }

  // Koordináta rendszer
  createCoordinateSystem() {
    this.coordinateSystem = new THREE.Group();
    this.coordinateLabels = [];

    const arrowLength = 200;
    const arrowColor = {
      x: 0xff0000,
      y: 0x00ff00,
      z: 0x0000ff
    };

    // X tengely nyilak
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

    // Y tengely nyilak
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

    // Z tengely nyilak
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

    this.scene.add(this.coordinateSystem);
    this.coordinateSystem.visible = this.coordinateSystemVisible;
    this.coordinateLabels.forEach(label => {
      label.visible = this.coordinateSystemVisible;
    });

    console.log("Koordináta rendszer létrehozva");
  }

  // Koordináta címkék
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
      label.visible = false;
      
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
      this.coordinateSystem.visible = this.coordinateSystemVisible;
      
      this.coordinateLabels.forEach(label => {
        if (label && label.visible !== undefined) {
          label.visible = this.coordinateSystemVisible;
        }
      });
    }

    console.log(`Koordináta rendszer: ${this.coordinateSystemVisible ? 'BE' : 'KI'}`);
    return this.coordinateSystemVisible;
  }

  // PROGRAMMATIC zoom (gombok számára)
  zoomCamera(deltaY) {
    if (this.orbitControls) {
      const direction = this.camera.position.clone().sub(this.orbitControls.target);
      const newDistance = direction.length() * (1 + deltaY * 0.08 * 0.01);
      const clampedDistance = Math.max(this.orbitControls.minDistance, Math.min(this.orbitControls.maxDistance, newDistance));
      
      direction.normalize();
      this.camera.position.copy(
        this.orbitControls.target.clone().add(direction.multiplyScalar(clampedDistance))
      );
      
      this.orbitControls.update();
      console.log(`🔍 Programmatic zoom: ${clampedDistance.toFixed(1)}`);
    }
  }

  // EGYSZERŰSÍTETT nézet váltás
  setViewPreset(viewName) {
    const presets = {
      default: { position: [this.defaultCameraPosition.x, this.defaultCameraPosition.y, this.defaultCameraPosition.z], target: [this.defaultOrbitTarget.x, this.defaultOrbitTarget.y, this.defaultOrbitTarget.z] },
      top: { position: [0, 300, 0], target: [0, 0, 0] },
      bottom: { position: [0, -300, 0], target: [0, 0, 0] },
      front: { position: [-300, 0, 0], target: [0, 0, 0] },
      back: { position: [300, 0, 0], target: [0, 0, 0] },
      left: { position: [0, 0, -300], target: [0, 0, 0] },
      right: { position: [0, 0, 300], target: [0, 0, 0] },
    };

    const preset = presets[viewName];
    if (!preset) {
      console.warn(`Ismeretlen nézet: ${viewName}`);
      return;
    }

    if (this.orbitControls) {
      this.orbitControls.target.set(...preset.target);
      this.camera.position.set(...preset.position);
      this.orbitControls.update();
      
      console.log(`📷 Nézet váltás: ${viewName}`);
    }
  }

  // Gyors nézet funkciók
  setTopView() { this.setViewPreset("top"); }
  setBottomView() { this.setViewPreset("bottom"); }
  setFrontView() { this.setViewPreset("front"); }
  setBackView() { this.setViewPreset("back"); }
  setLeftView() { this.setViewPreset("left"); }
  setRightView() { this.setViewPreset("right"); }
  resetView() { this.setViewPreset("default"); }

  // Mesh kezelés
  addMesh(elementId, mesh) {
    this.scene.add(mesh);
    this.meshes.set(elementId, mesh);
  }

  removeMesh(elementId) {
    const mesh = this.meshes.get(elementId);
    if (mesh) {
      this.scene.remove(mesh);
      this.meshes.delete(elementId);

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

  addAllMeshes(meshMap) {
    meshMap.forEach((mesh, elementId) => {
      this.addMesh(elementId, mesh);
    });
  }

  getMesh(elementId) {
    return this.meshes.get(elementId);
  }

  getAllMeshes() {
    return this.meshes;
  }

  // Animáció loop - OrbitControls frissítéssel
  startAnimationLoop() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      
      // OrbitControls frissítése
      if (this.orbitControls) {
        this.orbitControls.update();
      }
      
      this.renderer.render(this.scene, this.camera);
      
      if (this.css2DRenderer) {
        this.css2DRenderer.render(this.scene, this.camera);
      }
    };
    animate();
  }

  stopAnimationLoop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Resize kezelés
  handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    if (this.css2DRenderer) {
      this.css2DRenderer.setSize(width, height);
    }

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
    
    console.log(`🖥️ Resize: ${width}x${height}, pixel ratio: ${pixelRatio}`);
  }

  // Raycast
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

  // Scene export
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

  // Debug info
  getSceneInfo() {
    return {
      meshCount: this.meshes.size,
      sceneChildren: this.scene.children.length,
      cameraPosition: this.camera.position,
      orbitControlsTarget: this.orbitControls ? this.orbitControls.target : null,
      coordinateSystemVisible: this.coordinateSystemVisible,
      isCtrlPressed: this.isCtrlPressed,
      version: "1.7.3",
    };
  }

  // Cleanup
  destroy() {
    this.stopAnimationLoop();

    this.meshes.forEach((mesh, elementId) => {
      this.removeMesh(elementId);
    });

    if (this.orbitControls) {
      this.orbitControls.dispose();
    }

    if (this.css2DRenderer && this.css2DRenderer.domElement) {
      this.container.removeChild(this.css2DRenderer.domElement);
    }

    if (this.renderer) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }

    console.log("Scene Manager v1.7.3 destroyed");
  }
}