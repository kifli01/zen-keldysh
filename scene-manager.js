/**
 * Scene Manager
 * THREE.js scene, kamera, fények és kontrolok kezelése
 * v1.5.0 - Kamera LookAt és Zoom módosítás
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

    // ÚJ v1.5.0: Kamera beállítások optimalizálása
    this.defaultZoomDistance = 240; // Alapértelmezett zoom távolság
    
    // Kamera pozíció számítása a defaultZoomDistance alapján (konzisztencia)
    const direction = new THREE.Vector3(-200, 60, 120).normalize();
    this.defaultCameraPosition = {
      x: direction.x * this.defaultZoomDistance,
      y: direction.y * this.defaultZoomDistance,
      z: direction.z * this.defaultZoomDistance
    };

    // Előre definiált nézetek - ÚJ lookAt offset-tel
    this.viewPresets = {
      default: {
        direction: this.defaultCameraPosition,
        target: { x: 0, y: 0, z: 0 },
      },
      top: { 
        direction: { x: 0, y: 1, z: 0 }, 
        target: { x: 0, y: 0, z: 0 },
      },
      bottom: {
        direction: { x: 0, y: -1, z: 0 },
        target: { x: 0, y: 0, z: 0 },
      },
      front: { 
        direction: { x: -1, y: 0, z: 0 }, 
        target: { x: 0, y: 0, z: 0 } 
      },
      back: { 
        direction: { x: 1, y: 0, z: 0 }, 
        target: { x: 0, y: 0, z: 0 } 
      },
      left: { 
        direction: { x: 0, y: 0, z: -1 }, 
        target: { x: 0, y: 0, z: 0 } 
      },
      right: { 
        direction: { x: 0, y: 0, z: 1 }, 
        target: { x: 0, y: 0, z: 0 } 
      },
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
    this.createPBRLights();
    this.createCoordinateSystem();
    this.setupEventListeners();
    this.startAnimationLoop();

    console.log("Scene Manager v1.5.0 initialized - Optimalizált kamera és zoom");
  }

  // Scene létrehozása
  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf9f9f9);
  }

  // ÚJ v1.5.0: Optimalizált kamera létrehozása
  createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000);

    // Optimalizált kamera pozíció
    this.camera.position.set(
      this.defaultCameraPosition.x,
      this.defaultCameraPosition.y,
      this.defaultCameraPosition.z
    );

    // ÚJ v1.5.0: Kamera lejjebb néz, így a pálya feljebb tűnik
    this.camera.lookAt(0, 0, 0);
    
    console.log(`📷 Kamera beállítva - pozíció: (${this.defaultCameraPosition.x}, ${this.defaultCameraPosition.y}, ${this.defaultCameraPosition.z})`);
  }

  // ENHANCED v1.4.0: Fejlett Anti-aliasing renderer létrehozása
  createRenderer() {
    // Enhanced anti-aliasing beállítások
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
    
    const gl = this.renderer.getContext();
    if (gl) {
      const maxSamples = gl.getParameter(gl.MAX_SAMPLES);
      console.log(`🎯 Maximum MSAA samples: ${maxSamples}`);
      
      const contextAttributes = gl.getContextAttributes();
      console.log(`✅ WebGL anti-aliasing: ${contextAttributes.antialias}`);
    }
    
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

  // CSS2D Renderer létrehozása koordináta címkékhez
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

  // PBR kompatibilis világítás létrehozása
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

  // Koordináta rendszer létrehozása
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

    // Mouse events
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
        this.panScene(deltaMove);
      } else {
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
    this.scene.position.y += -deltaMove.y * panSpeed;
  }

  // ÚJ v1.5.0: Optimalizált zoom funkció
  zoomCamera(deltaY) {
    const zoomSpeed = 0.08; // Finomabb zoom
    const zoomFactor = 1 + deltaY * zoomSpeed * 0.01;

    // ÚJ: Target az offset pontja
    const target = new THREE.Vector3(0, 0, 0);
    const direction = this.camera.position.clone().sub(target);
    const newDistance = direction.length() * zoomFactor;

    // ÚJ: Zoom távolság korlátok optimalizálása
    const clampedDistance = Math.max(60, Math.min(500, newDistance)); // Szélesebb tartomány

    direction.normalize();
    this.camera.position.copy(
      target.clone().add(direction.multiplyScalar(clampedDistance))
    );

    this.camera.lookAt(target);
    
    // Debug zoom távolság
    if (Math.abs(deltaY) > 0) {
      console.log(`🔍 Zoom távolság: ${clampedDistance.toFixed(1)}`);
    }
  }

  // Kamera pozíció váltása előre definiált nézetekre
  setViewPreset(viewName, animate = false) {
    const preset = this.viewPresets[viewName];
    if (!preset) {
      console.warn(`Ismeretlen nézet: ${viewName}`);
      return;
    }

    // Scene pozíció és forgatás nullázása
    this.scene.position.set(0, 0, 0);
    this.scene.rotation.set(0, 0, 0);

    // ÚJ v1.5.0: Alapértelmezett zoom távolság használata
    let newPosition;

    if (viewName === "default") {
      newPosition = new THREE.Vector3(
        preset.direction.x,
        preset.direction.y,
        preset.direction.z
      );
    } else {
      const direction = new THREE.Vector3(
        preset.direction.x,
        preset.direction.y,
        preset.direction.z
      ).normalize();

      // ÚJ: Alapértelmezett zoom távolság használata nézet váltásnál
      newPosition = direction.multiplyScalar(this.defaultZoomDistance);
    }

    this.camera.position.set(newPosition.x, newPosition.y, newPosition.z);
    this.camera.lookAt(preset.target.x, preset.target.y, preset.target.z);
    
    console.log(`📷 Nézet váltás: ${viewName}`);
  }

  // Kamera animáció egy pozícióba
  animateCameraToPosition(targetPosition, targetLookAt, duration = 800) {
    const startPosition = this.camera.position.clone();
    const startLookAt = new THREE.Vector3(0, 0, 0);

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = 1 - Math.pow(1 - progress, 3);

      this.camera.position.x =
        startPosition.x + (targetPosition.x - startPosition.x) * easedProgress;
      this.camera.position.y =
        startPosition.y + (targetPosition.y - startPosition.y) * easedProgress;
      this.camera.position.z =
        startPosition.z + (targetPosition.z - startPosition.z) * easedProgress;

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

  // Gyors nézet váltó gombok funkciói
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

  // ÚJ v1.5.0: Optimalizált nézet visszaállítása
  resetView() {
    this.setViewPreset("default");
    console.log("🏠 Nézet visszaállítva alaphelyzetbe");
  }

  // Animáció loop
  startAnimationLoop() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
      
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

    if (this.css2DRenderer) {
      this.css2DRenderer.setSize(width, height);
    }

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
    
    console.log(`🖥️ Resize: ${width}x${height}, pixel ratio: ${pixelRatio}`);
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

  // ÚJ v1.5.0: Zoom és kamera beállítások módosítása futásidőben
  setCameraSettings(settings = {}) {
    if (settings.lookAtOffset !== undefined) {      
      // View presets frissítése
      Object.keys(this.viewPresets).forEach(viewName => {
        this.viewPresets[viewName].target.y = settings.lookAtOffset;
      });
      
      // Aktuális kamera target frissítése
      this.camera.lookAt(0, settings.lookAtOffset, 0);
      console.log(`📷 Kamera lookAt offset frissítve: ${settings.lookAtOffset}`);
    }
    
    if (settings.defaultZoomDistance !== undefined) {
      this.defaultZoomDistance = settings.defaultZoomDistance;
      
      // ÚJ v1.5.1: defaultCameraPosition újraszámolása konzisztencia miatt
      const direction = new THREE.Vector3(-200, 120, 180).normalize();
      this.defaultCameraPosition = {
        x: direction.x * this.defaultZoomDistance,
        y: direction.y * this.defaultZoomDistance,
        z: direction.z * this.defaultZoomDistance
      };
      
      console.log(`🔍 Alapértelmezett zoom távolság frissítve: ${settings.defaultZoomDistance}`);
      console.log(`📷 Kamera pozíció újraszámolva:`, this.defaultCameraPosition);
    }
    
    if (settings.cameraPosition !== undefined) {
      this.defaultCameraPosition = settings.cameraPosition;
      console.log(`📷 Alapértelmezett kamera pozíció frissítve:`, settings.cameraPosition);
    }
  }

  // Debug info
  getSceneInfo() {
    const gl = this.renderer.getContext();
    const contextAttributes = gl ? gl.getContextAttributes() : {};
    
    return {
      meshCount: this.meshes.size,
      sceneChildren: this.scene.children.length,
      cameraPosition: this.camera.position,
      scenePosition: this.scene.position,
      sceneRotation: this.scene.rotation,
      defaultZoomDistance: this.defaultZoomDistance, // ÚJ v1.5.0
      coordinateSystemVisible: this.coordinateSystemVisible,
      antiAliasing: {
        enabled: contextAttributes.antialias || false,
        pixelRatio: this.renderer.getPixelRatio(),
        devicePixelRatio: window.devicePixelRatio,
        maxSamples: gl ? gl.getParameter(gl.MAX_SAMPLES) : 'unknown',
        contextAttributes: contextAttributes,
      },
      pbrSettings: {
        toneMapping: this.renderer.toneMapping,
        toneMappingExposure: this.renderer.toneMappingExposure,
        physicallyCorrectLights: this.renderer.physicallyCorrectLights,
        outputEncoding: this.renderer.outputEncoding,
      },
      version: "1.5.1",
    };
  }

  // Cleanup
  destroy() {
    this.stopAnimationLoop();

    this.meshes.forEach((mesh, elementId) => {
      this.removeMesh(elementId);
    });

    if (this.css2DRenderer && this.css2DRenderer.domElement) {
      this.container.removeChild(this.css2DRenderer.domElement);
    }

    if (this.renderer) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }

    console.log("Scene Manager v1.5.0 destroyed");
  }
}