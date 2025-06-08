/**
 * HDR Environment Manager
 * HDR környezeti világítás és reflexiók kezelése
 * v1.1.0 - Meadow HDR integráció
 */

class HDREnvironmentManager {
  constructor(sceneManager, textureManager) {
    this.sceneManager = sceneManager;
    this.textureManager = textureManager;
    this.envMap = null;
    this.pmremGenerator = null;
    this.loader = null;
    this.isLoaded = false;
    this.currentHDRUrl = null;

    console.log("HDREnvironmentManager v1.1.0 - Meadow HDR");
  }

  // Inicializálás
  async initialize() {
    // PMREM Generator létrehozása (HDR processzing-hez)
    this.pmremGenerator = new THREE.PMREMGenerator(this.sceneManager.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    // RGBELoader dinamikus import
    try {
      const { RGBELoader } = await import('three/examples/jsm/loaders/RGBELoader.js');
      this.loader = new RGBELoader();
      console.log("✅ RGBELoader dinamikusan betöltve");
      return true;
    } catch (error) {
      console.warn("❌ RGBELoader nem elérhető - fallback módra váltás:", error);
      return false;
    }
  }

  // HDR környezet betöltése - MÓDOSÍTOTT meadow HDR-rel
  async loadHDREnvironment(hdrUrl = 'textures/meadow.hdr') {
    if (!this.loader) {
      console.warn("HDR Loader nem elérhető");
      return false;
    }

    console.log(`🌿 Meadow HDR környezet betöltése: ${hdrUrl}`);

    try {
      return new Promise((resolve, reject) => {
        this.loader.load(
          hdrUrl,
          (texture) => {
            console.log("✅ Meadow HDR textúra betöltve");
            
            // HDR textúra feldolgozása
            const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;
            
            // Scene environment beállítása - meadow specifikus
            this.sceneManager.scene.environment = envMap;
            this.sceneManager.scene.background = envMap;
            
            // Meadow környezet optimalizált beállítások
            this.sceneManager.scene.backgroundIntensity = 0.4; // Kicsit erősebb a rét miatt
            this.sceneManager.scene.environmentIntensity = 1.2; // Erősebb reflexiók
            
            // Cleanup
            texture.dispose();
            
            this.envMap = envMap;
            this.isLoaded = true;
            this.currentHDRUrl = hdrUrl;
            
            console.log("🌟 Meadow HDR Environment aktiválva - természetes rét környezet");
            resolve(true);
          },
          (progress) => {
            const percent = (progress.loaded / progress.total * 100).toFixed(1);
            console.log(`📡 Meadow HDR betöltés: ${percent}%`);
          },
          (error) => {
            console.error("❌ Meadow HDR betöltési hiba:", error);
            console.warn("🔄 Fallback környezet használata...");
            // Fallback környezet
            this.createFallbackEnvironment();
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error("Meadow HDR betöltés hiba:", error);
      this.createFallbackEnvironment();
      return false;
    }
  }

  // Fallback környezet létrehozása (ha nincs HDR) - JAVÍTOTT
  createFallbackEnvironment() {
    console.log("🔄 Meadow-inspirált fallback környezet létrehozása...");

    // Meadow-szerű zöld-kék gradient
    const gradientTexture = this.createMeadowGradientTexture();
    this.sceneManager.scene.background = gradientTexture;
    
    // Egyszerű environment map
    const pmremGenerator = new THREE.PMREMGenerator(this.sceneManager.renderer);
    const envMap = pmremGenerator.fromScene(this.sceneManager.scene).texture;
    this.sceneManager.scene.environment = envMap;
    
    // Meadow-szerű beállítások
    this.sceneManager.scene.backgroundIntensity = 0.5;
    this.sceneManager.scene.environmentIntensity = 0.8;
    
    this.envMap = envMap;
    this.isLoaded = true;
    
    console.log("✅ Meadow-szerű fallback környezet kész");
  }

  // MÓDOSÍTOTT: Meadow-szerű gradient textúra
  createMeadowGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    
    const context = canvas.getContext('2d');
    
    // Meadow-szerű gradient (zöld rét + kék ég)
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB'); // Világos kék ég (fent)
    gradient.addColorStop(0.3, '#98D8E8'); // Kékesebb átmenet
    gradient.addColorStop(0.7, '#90EE90'); // Világos zöld
    gradient.addColorStop(1, '#228B22'); // Sötétebb zöld rét (lent)
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    
    return texture;
  }

  // Környezet intenzitás beállítása - MEADOW optimalizált
  setEnvironmentIntensity(intensity = 1.2) { // Alapértelmezett magasabb meadow-hoz
    if (this.sceneManager.scene.environment) {
      this.sceneManager.scene.environmentIntensity = Math.max(0, Math.min(3, intensity));
      console.log(`🌟 Meadow Environment intenzitás: ${this.sceneManager.scene.environmentIntensity}`);
    }
  }

  // Háttér intenzitás beállítása - MEADOW optimalizált
  setBackgroundIntensity(intensity = 0.4) { // Magasabb alapértelmezett meadow-hoz
    if (this.sceneManager.scene.background) {
      this.sceneManager.scene.backgroundIntensity = Math.max(0, Math.min(2, intensity));
      console.log(`🖼️ Meadow háttér intenzitás: ${this.sceneManager.scene.backgroundIntensity}`);
    }
  }

  // Környezet forgatása
  rotateEnvironment(rotation = 0) {
    if (this.envMap) {
      this.envMap.rotation = rotation;
      console.log(`🔄 Environment forgatás: ${(rotation * 180 / Math.PI).toFixed(1)}°`);
    }
  }

  // Összes mesh environment map frissítése
  updateAllMeshesEnvironment() {
    const meshes = this.sceneManager.getAllMeshes();
    let updatedCount = 0;

    meshes.forEach((mesh) => {
      if (this.updateMeshEnvironment(mesh)) {
        updatedCount++;
      }
    });

    console.log(`♻️ Meadow Environment frissítve ${updatedCount} mesh-en`);
  }

  // Egyedi mesh environment frissítése
  updateMeshEnvironment(mesh) {
    if (!mesh || !this.envMap) return false;

    // Hagyományos mesh
    if (mesh.material && mesh.material.isMeshStandardMaterial) {
      mesh.material.envMap = this.envMap;
      mesh.material.needsUpdate = true;
      return true;
    }

    // GROUP mesh - gyerekek frissítése
    if (mesh.userData && mesh.userData.isGroup) {
      let updated = false;
      mesh.children.forEach((childMesh) => {
        if (childMesh.material && childMesh.material.isMeshStandardMaterial) {
          childMesh.material.envMap = this.envMap;
          childMesh.material.needsUpdate = true;
          updated = true;
        }
      });
      return updated;
    }

    return false;
  }

  // Különböző HDR környezetek közötti váltás - MEADOW preset-tel
  async switchEnvironment(environmentName) {
    const environments = {
      'meadow': 'textures/meadow.hdr',      // ÚJ: Alapértelmezett
      'studio': 'textures/studio_hdri.hdr',
      'outdoor': 'textures/outdoor_hdri.hdr', 
      'indoor': 'textures/indoor_hdri.hdr',
      'sunset': 'textures/sunset_hdri.hdr'
    };

    const hdrUrl = environments[environmentName];
    if (!hdrUrl) {
      console.warn(`Ismeretlen környezet: ${environmentName}`);
      return false;
    }

    console.log(`🔄 Környezet váltás: ${environmentName}`);
    return await this.loadHDREnvironment(hdrUrl);
  }

  // HDR előnézet képek generálása
  generatePreviewImages() {
    if (!this.envMap) return null;

    const previewSize = 128;
    const canvas = document.createElement('canvas');
    canvas.width = previewSize;
    canvas.height = previewSize;

    // Mini renderer az előnézethez
    const previewRenderer = new THREE.WebGLRenderer({ 
      canvas: canvas,
      preserveDrawingBuffer: true 
    });
    
    const previewCamera = new THREE.PerspectiveCamera(90, 1, 0.1, 100);
    const previewScene = new THREE.Scene();
    previewScene.background = this.envMap;

    previewRenderer.render(previewScene, previewCamera);
    
    const imageData = canvas.toDataURL();
    previewRenderer.dispose();
    
    return imageData;
  }

  // Status információk - MEADOW specifikus
  getStatus() {
    return {
      version: 'v1.1.0 - Meadow HDR',
      isLoaded: this.isLoaded,
      currentHDR: this.currentHDRUrl,
      expectedHDR: 'textures/meadow.hdr',
      hasEnvironment: !!this.sceneManager.scene.environment,
      hasBackground: !!this.sceneManager.scene.background,
      environmentIntensity: this.sceneManager.scene.environmentIntensity,
      backgroundIntensity: this.sceneManager.scene.backgroundIntensity,
      pmremAvailable: !!this.pmremGenerator,
      rgbeLoaderAvailable: !!this.loader,
    };
  }

  // Debug információ
  logStatus() {
    console.log("=== MEADOW HDR ENVIRONMENT STATUS ===");
    const status = this.getStatus();
    Object.entries(status).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.log("====================================");
  }

  // Cleanup
  destroy() {
    if (this.envMap) {
      this.envMap.dispose();
      this.envMap = null;
    }

    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
      this.pmremGenerator = null;
    }

    this.sceneManager.scene.environment = null;
    this.sceneManager.scene.background = new THREE.Color(0xf9f9f9);

    this.isLoaded = false;
    this.currentHDRUrl = null;

    console.log("HDREnvironmentManager v1.1.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.HDREnvironmentManager = HDREnvironmentManager;