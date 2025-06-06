/**
 * Scene Manager
 * THREE.js scene, kamera, fények és kontrolok kezelése
 * v1.3.0 - HDR kompatibilis inicializálás + color management
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
    
    console.log("SceneManager konstruktor v1.3.0 - koordináta rendszer állapot:", this.coordinateSystemVisible);

    // Kontroll változók
    this.controls = {
      isDragging: false,
      spaceDown: false,
      previousMousePosition: { x: 0, y: 0 },
    };

    // Alapértelmezett kamera pozíció
    this.defaultCameraPosition = { x: -250, y: 100, z: 200 };

    // Előre definiált nézetek
    this.viewPresets = {
      default: {
        direction: this.defaultCameraPosition,
        target: { x: 0, y: 0, z: 0 },
      },
      top: { direction: { x: 0, y: 1, z: 0 }, target: { x: 0, y: 0, z: 0 } },
      bottom: { direction: { x: 0, y: -1, z: 0 }, target: { x: 0, y: 0, z: 0 } },
      front: { direction: { x: -1, y: 0, z: 0 }, target: { x: 0, y: 0, z: 0 } },
      back: { direction: { x: 1, y: 0, z: 0 }, target: { x: 0, y: 0, z: 0 } },
      left: { direction: { x: 0, y: 0, z: -1 }, target: { x: 0, y: 0, z: 0 } },
      right: { direction: { x: 0, y: 0, z: 1 }, target: { x: 0, y: 0, z: 0 } },
    };

    // Animáció loop
    this.animationId = null;
  }

  // Scene inicializálása - MÓDOSÍTOTT sorrend
  setup() {
    console.log("🚀 SceneManager v1.3.0 setup kezdése...");
    
    this.createScene();
    this.createCamera();
    this.createRenderer(); // ← Ez most hamarabb történik
    this.createCSS2DRenderer();
    this.createCoordinateSystem();
    this.setupEventListeners();
    this.startAnimationLoop();

    console.log("✅ Scene Manager v1.3.0 initialized - HDR ready");
  }

  // Scene létrehozása - VÁLTOZATLAN
  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf9f9f9);
    console.log("✅ Scene létrehozva");
  }

  // Kamera létrehozása - VÁLTOZATLAN
  createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000);

    this.camera.position.set(
      this.defaultCameraPosition.x,
      this.defaultCameraPosition.y,
      this.defaultCameraPosition.z
    );

    this.camera.lookAt(0, 0, 0);
    console.log("✅ Kamera létrehozva");
  }

  // Renderer létrehozása - BŐVÍTETT HDR támogatással
  createRenderer() {
    console.log("🎨 Renderer létrehozása HDR támogatással...");
    
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance", // ÚJ: GPU preferencia
      stencil: false, // ÚJ: Optimalizálás
      depth: true,
    });
    
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    
    // ÚJ v1.3.0: HDR és color management beállítások
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.LinearToneMapping; // Alapértelmezett
    this.renderer.toneMappingExposure = 1.0;
    
    // Árnyék beállítások - fejlett
    this.renderer.shadowMap.enabled = false; // Kezdetben ki, LightingManager kapcsolja be
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = true;
    
    // ÚJ: Fizikai világítás támogatás - JAVÍTOTT verzió kompatibilitás
    // Three.js r155+ verzióban useLegacyLights lett
    if (this.renderer.useLegacyLights !== undefined) {
      this.renderer.useLegacyLights = false; // Új API
      console.log("   - Fizikai világítás: useLegacyLights = false");
    } else if (this.renderer.physicallyCorrectLights !== undefined) {
      this.renderer.physicallyCorrectLights = true; // Régi API
      console.log("   - Fizikai világítás: physicallyCorrectLights = true");
    }
    
    // ÚJ: További rendering optimalizálások
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Max 2x DPI
    this.renderer.localClippingEnabled = false; // Optimalizálás
    
    // DOM hozzáadás
    this.container.appendChild(this.renderer.domElement);
    
    console.log("✅ WebGL Renderer létrehozva HDR támogatással");
    console.log(`   - Output Color Space: ${this.renderer.outputColorSpace}`);
    console.log(`   - Tone Mapping: ${this.renderer.toneMapping}`);
    console.log(`   - Pixel Ratio: ${this.renderer.getPixelRatio()}`);
    console.log(`   - Shadow Map: ${this.renderer.shadowMap.type}`);
  }

  // CSS2D Renderer létrehozása - VÁLTOZATLAN
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
      console.log("✅ CSS2DRenderer inicializálva");
    } else {
      console.warn("⚠️ CSS2DRenderer nem elérhető, címkék nélkül folytatás");
    }
  }

  // Koordináta rendszer létrehozása - VÁLTOZATLAN
  createCoordinateSystem() {
    this.coordinateSystem = new THREE.Group();
    this.coordinateLabels = [];

    const arrowLength = 200;
    const arrowColor = {
      x: 0xff0000, // Piros - X tengely
      y: 0x00ff00, // Zöld - Y tengely  
      z: 0x0000ff  // Kék - Z tengely
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

    // Címkék létrehozása
    if (this.css2DRenderer && window.CSS2DObject) {
      this.createCoordinateLabels(arrowLength);
    }

    this.scene.add(this.coordinateSystem);
    
    // Alapértelmezett láthatóság
    this.coordinateSystem.visible = this.coordinateSystemVisible;
    this.coordinateLabels.forEach(label => {
      label.visible = this.coordinateSystemVisible;
    });

    console.log("✅ Koordináta rendszer létrehozva");
  }

  // Koordináta címkék létrehozása - VÁLTOZATLAN
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

    console.log("✅ Koordináta címkék létrehozva");
  }

  // ÚJ v1.3.0: Renderer capabilities lekérdezés
  getRendererCapabilities() {
    if (!this.renderer) return null;
    
    const gl = this.renderer.getContext();
    const capabilities = this.renderer.capabilities;
    
    return {
      maxTextureSize: capabilities.maxTextureSize,
      maxCubemapSize: capabilities.maxCubemapSize,
      maxAnisotropy: capabilities.getMaxAnisotropy(),
      floatTextures: capabilities.isWebGL2,
      hdrSupport: capabilities.isWebGL2,
      shadowMapSupport: true,
      extensions: {
        derivatives: !!gl.getExtension('OES_standard_derivatives'),
        fragDepth: !!gl.getExtension('EXT_frag_depth'),
        drawBuffers: !!gl.getExtension('WEBGL_draw_buffers'),
      }
    };
  }

  // ÚJ v1.3.0: HDR readiness check
  isHDRReady() {
    if (!this.renderer) return false;
    
    const caps = this.getRendererCapabilities();
    return caps && caps.hdrSupport && caps.floatTextures;
  }

  // Koordináta rendszer ki/be kapcsolása - VÁLTOZATLAN
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

  // Event listener-ek beállítása - VÁLTOZATLAN
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

    // Zoom
    this.renderer.domElement.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.zoomCamera(e.deltaY);
    });

    // Window resize
    window.addEventListener("resize", () => {
      this.handleResize();
    });

    console.log("✅ Event listener-ek beállítva");
  }

  // Scene forgatása - VÁLTOZATLAN
  rotateScene(deltaMove) {
    const rotationSpeed = 0.01;
    this.scene.rotation.y += deltaMove.x * rotationSpeed;
    this.scene.rotation.x += deltaMove.y * rotationSpeed;
  }

  // Scene mozgatása - VÁLTOZATLAN
  panScene(deltaMove) {
    const panSpeed = 0.5;
    this.scene.position.x += deltaMove.x * panSpeed;
    this.scene.position.y -= deltaMove.y * panSpeed;
  }

  // Kamera zoom - VÁLTOZATLAN
  zoomCamera(deltaY) {
    const zoomSpeed = 0.1;
    const zoomFactor = 1 + deltaY * zoomSpeed * 0.01;

    const target = new THREE.Vector3(0, 0, 0);
    const direction = this.camera.position.clone().sub(target);
    const newDistance = direction.length() * zoomFactor;

    const clampedDistance = Math.max(50, Math.min(400, newDistance));

    direction.normalize();
    this.camera.position.copy(
      target.clone().add(direction.multiplyScalar(clampedDistance))
    );

    this.camera.lookAt(target);
  }

  // Kamera pozíció váltása - VÁLTOZATLAN
  setViewPreset(viewName, animate = false) {
    const preset = this.viewPresets[viewName];
    if (!preset) {
      console.warn(`Ismeretlen nézet: ${viewName}`);
      return;
    }

    this.scene.position.set(0, 0, 0);
    this.scene.rotation.set(0, 0, 0);

    const currentDistance = this.camera.position.length();

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

      newPosition = direction.multiplyScalar(currentDistance);
    }

    this.camera.position.set(newPosition.x, newPosition.y, newPosition.z);
    this.camera.lookAt(preset.target.x, preset.target.y, preset.target.z);
  }

  // Nézet váltó funkciók - VÁLTOZATLAN
  setTopView() { this.setViewPreset("top"); }
  setBottomView() { this.setViewPreset("bottom"); }
  setFrontView() { this.setViewPreset("front"); }
  setBackView() { this.setViewPreset("back"); }
  setLeftView() { this.setViewPreset("left"); }
  setRightView() { this.setViewPreset("right"); }

  // Mesh kezelés - VÁLTOZATLAN
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

  // Nézet visszaállítása - VÁLTOZATLAN
  resetView() {
    this.setViewPreset("default");
  }

  // Animáció loop - VÁLTOZATLAN
  startAnimationLoop() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
      
      if (this.css2DRenderer) {
        this.css2DRenderer.render(this.scene, this.camera);
      }
    };
    animate();
    console.log("✅ Animáció loop elindítva");
  }

  stopAnimationLoop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Ablak átméretezés kezelése - VÁLTOZATLAN
  handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    if (this.css2DRenderer) {
      this.css2DRenderer.setSize(width, height);
    }
  }

  // Elem keresése pozíció alapján - VÁLTOZATLAN
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

  // Scene export - VÁLTOZATLAN
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

  // Debug info - BŐVÍTETT
  getSceneInfo() {
    return {
      meshCount: this.meshes.size,
      sceneChildren: this.scene.children.length,
      cameraPosition: this.camera.position,
      scenePosition: this.scene.position,
      sceneRotation: this.scene.rotation,
      coordinateSystemVisible: this.coordinateSystemVisible,
      renderer: {
        outputColorSpace: this.renderer?.outputColorSpace,
        toneMapping: this.renderer?.toneMapping,
        toneMappingExposure: this.renderer?.toneMappingExposure,
        shadowMapEnabled: this.renderer?.shadowMap.enabled,
        pixelRatio: this.renderer?.getPixelRatio(),
      },
      hdrReady: this.isHDRReady(), // ÚJ
      capabilities: this.getRendererCapabilities(), // ÚJ
      version: "1.3.0",
    };
  }

  // Cleanup - BŐVÍTETT
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

    console.log("Scene Manager v1.3.0 destroyed");
  }
}