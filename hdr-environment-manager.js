/**
 * HDR Environment Manager
 * HDR környezeti világítás és reflexiók kezelése
 * v1.0.0 - Fotorealisztikus környezeti világítás
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

    console.log("HDREnvironmentManager v1.0.0 inicializálva");
  }

  // Inicializálás
  initialize() {
    // PMREM Generator létrehozása (HDR processzing-hez)
    this.pmremGenerator = new THREE.PMREMGenerator(this.sceneManager.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    // RGBELoader elérhetőség ellenőrzése
    try {
      this.loader = new THREE.RGBELoader();
      console.log("✅ RGBELoader elérhető");
      return true;
    } catch (error) {
      console.warn("❌ RGBELoader nem elérhető - fallback módra váltás:", error);
      return false;
    }
  }

  // HDR környezet betöltése
  async loadHDREnvironment(hdrUrl = 'textures/studio_hdri.hdr') {
    if (!this.loader) {
      console.warn("HDR Loader nem elérhető");
      return false;
    }

    console.log(`🌅 HDR környezet betöltése: ${hdrUrl}`);

    try {
      return new Promise((resolve, reject) => {
        this.loader.load(
          hdrUrl,
          (texture) => {
            console.log("✅ HDR textúra betöltve");
            
            // HDR textúra feldolgozása
            const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;
            
            // Scene environment beállítása
            this.sceneManager.scene.environment = envMap;
            this.sceneManager.scene.background = envMap;
            
            // Háttér gyengítése (nem túl erős)
            this.sceneManager.scene.backgroundIntensity = 0.3;
            this.sceneManager.scene.environmentIntensity = 1.0;
            
            // Cleanup
            texture.dispose();
            
            this.envMap = envMap;
            this.isLoaded = true;
            this.currentHDRUrl = hdrUrl;
            
            console.log("🌟 HDR Environment aktiválva");
            resolve(true);
          },
          (progress) => {
            const percent = (progress.loaded / progress.total * 100).toFixed(1);
            console.log(`📡 HDR betöltés: ${percent}%`);
          },
          (error) => {
            console.error("❌ HDR betöltési hiba:", error);
            // Fallback környezet
            this.createFallbackEnvironment();
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error("HDR betöltés hiba:", error);
      this.createFallbackEnvironment();
      return false;
    }
  }

  // Fallback környezet létrehozása (ha nincs HDR)
  createFallbackEnvironment() {
    console.log("🔄 Fallback környezet létrehozása...");

    // Egyszerű környezeti textúra
    const envTexture = new THREE.CubeTextureLoader().load([
      'textures/cube/px.jpg', 'textures/cube/nx.jpg', // +X, -X
      'textures/cube/py.jpg', 'textures/cube/ny.jpg', // +Y, -Y  
      'textures/cube/pz.jpg', 'textures/cube/nz.jpg'  // +Z, -Z
    ], 
    () => {
      console.log("✅ Fallback cube környezet betöltve");
      this.sceneManager.scene.environment = envTexture;
      this.sceneManager.scene.background = envTexture;
      this.isLoaded = true;
    },
    undefined,
    (error) => {
      console.warn("Fallback környezet hiba:", error);
      // Utolsó fallback: színes háttér
      this.createColorEnvironment();
    });
  }

  // Szín-alapú környezet (minimális fallback)
  createColorEnvironment() {
    console.log("🎨 Szín-alapú környezet létrehozása...");

    const scene = this.sceneManager.scene;
    
    // Gradient háttér létrehozása
    const gradientTexture = this.createGradientTexture();
    scene.background = gradientTexture;
    
    // Egyszerű environment map
    const pmremGenerator = new THREE.PMREMGenerator(this.sceneManager.renderer);
    const envMap = pmremGenerator.fromScene(scene).texture;
    scene.environment = envMap;
    
    this.envMap = envMap;
    this.isLoaded = true;
    
    console.log("✅ Szín-alapú környezet kész");
  }

  // Gradient textúra létrehozása
  createGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    
    const context = canvas.getContext('2d');
    
    // Gradient létrehozása (fentről lefele)
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue (fent)
    gradient.addColorStop(1, '#f0f8ff'); // Alice blue (lent)
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    
    return texture;
  }

  // Környezet intenzitás beállítása
  setEnvironmentIntensity(intensity = 1.0) {
    if (this.sceneManager.scene.environment) {
      this.sceneManager.scene.environmentIntensity = Math.max(0, Math.min(3, intensity));
      console.log(`🌟 Environment intenzitás: ${this.sceneManager.scene.environmentIntensity}`);
    }
  }

  // Háttér intenzitás beállítása
  setBackgroundIntensity(intensity = 0.3) {
    if (this.sceneManager.scene.background) {
      this.sceneManager.scene.backgroundIntensity = Math.max(0, Math.min(2, intensity));
      console.log(`🖼️ Háttér intenzitás: ${this.sceneManager.scene.backgroundIntensity}`);
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

    console.log(`♻️ Environment frissítve ${updatedCount} mesh-en`);
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

  // Különböző HDR környezetek közötti váltás
  async switchEnvironment(environmentName) {
    const environments = {
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

  // Status információk
  getStatus() {
    return {
      isLoaded: this.isLoaded,
      currentHDR: this.currentHDRUrl,
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
    console.log("=== HDR ENVIRONMENT STATUS ===");
    const status = this.getStatus();
    Object.entries(status).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.log("=============================");
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

    console.log("HDREnvironmentManager cleanup kész");
  }
}

// Globális hozzáférhetőség
window.HDREnvironmentManager = HDREnvironmentManager;