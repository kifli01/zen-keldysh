/**
 * Scene Manager
 * THREE.js scene, kamera, fények és kontrolok kezelése
 */

class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.meshes = new Map();

    // Kontroll változók
    this.controls = {
      isDragging: false,
      spaceDown: false,
      previousMousePosition: { x: 0, y: 0 },
    };

    // Alapértelmezett kamera pozíció
    this.defaultCameraPosition = { x: -200, y: 100, z: 150 };

    // Animáció loop
    this.animationId = null;
  }

  // Scene inicializálása
  setup() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createLights();
    this.setupEventListeners();
    this.startAnimationLoop();

    console.log("Scene Manager initialized");
  }

  // Scene létrehozása
  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf9f9f9);
  }

  // Kamera létrehozása
  createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

    this.camera.position.set(
      this.defaultCameraPosition.x,
      this.defaultCameraPosition.y,
      this.defaultCameraPosition.z
    );

    this.camera.lookAt(0, 0, 0);
  }

  // Renderer létrehozása
  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  // Fények hozzáadása
  createLights() {
    // Ambient light - erősebb általános megvilágítás
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // 0.5 -> 0.7
    this.scene.add(ambientLight);

    // Directional light - gyengébb irányított fény
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2); // 0.6 -> 0.4
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;

    // Árnyék beállítások - lágyabb árnyékok
    directionalLight.shadow.mapSize.width = 1024; // 2048 -> 1024
    directionalLight.shadow.mapSize.height = 1024; // 2048 -> 1024
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;

    this.scene.add(directionalLight);

    // További lágyabb fény oldalt - erősebb
    const sideLight = new THREE.DirectionalLight(0xffffff, 0.4); // 0.3 -> 0.4
    sideLight.position.set(-50, 50, -50);
    this.scene.add(sideLight);
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
    // Scene pozíció és forgatás nullázása
    this.scene.position.set(0, 0, 0);
    this.scene.rotation.set(0, 0, 0);

    // Kamera eredeti pozícióba
    this.camera.position.set(
      this.defaultCameraPosition.x,
      this.defaultCameraPosition.y,
      this.defaultCameraPosition.z
    );
    this.camera.lookAt(0, 0, 0);
  }

  // Animáció loop
  startAnimationLoop() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
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

  // Debug info
  getSceneInfo() {
    return {
      meshCount: this.meshes.size,
      sceneChildren: this.scene.children.length,
      cameraPosition: this.camera.position,
      scenePosition: this.scene.position,
      sceneRotation: this.scene.rotation,
    };
  }

  // Cleanup
  destroy() {
    this.stopAnimationLoop();

    // Meshek tisztítása
    this.meshes.forEach((mesh, elementId) => {
      this.removeMesh(elementId);
    });

    // Renderer cleanup
    if (this.renderer) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }

    // Event listeners eltávolítása
    // (Ez bonyolultabb lenne, mert névtelen függvényeket használunk)
    console.log("Scene Manager destroyed");
  }
}
