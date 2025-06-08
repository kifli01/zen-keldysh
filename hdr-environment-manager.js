/**
 * HDR Environment Manager
 * HDR környezeti világítás és reflexiók kezelése
 * v1.3.0 - Tiszta verzió fehér háttérrel
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

    console.log("HDREnvironmentManager v1.3.0 - Tiszta verzió");
  }

  // Inicializálás
  async initialize() {
    // PMREM Generator létrehozása
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

  // HDR környezet betöltése - fehér háttérrel
  async loadHDREnvironment(hdrUrl = 'textures/meadow.hdr') {
    if (!this.loader) {
      console.warn("HDR Loader nem elérhető");
      return false;
    }

    console.log(`🌿 Meadow HDR betöltése fehér háttérrel: ${hdrUrl}`);

    try {
      return new Promise((resolve, reject) => {
        this.loader.load(
          hdrUrl,
          (texture) => {
            console.log("✅ Meadow HDR textúra betöltve");
            
            // HDR textúra feldolgozása
            const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;
            
            // Environment map beállítása (reflexiókhoz)
            this.envMap = envMap;
            this.sceneManager.scene.environment = envMap;
            
            // FEHÉR HÁTTÉR beállítása
            this.sceneManager.scene.background = new THREE.Color(0xffffff);
            
            // Optimalizált beállítások - SCENE SZINTŰ ELTÁVOLÍTVA
            // Nincs scene.environmentIntensity - csak mesh szintű
            
            // Cleanup
            texture.dispose();
            
            this.isLoaded = true;
            this.currentHDRUrl = hdrUrl;
            
            console.log("🌟 HDR Environment aktiválva - fehér háttérrel");
            
            // Alapértelmezett environment intenzitás beállítása
            this.setEnvironmentIntensity(0.6);
            
            resolve(true);
          },
          (progress) => {
            const percent = (progress.loaded / progress.total * 100).toFixed(1);
            console.log(`📡 HDR betöltés: ${percent}%`);
          },
          (error) => {
            console.error("❌ HDR betöltési hiba:", error);
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

  // Fallback környezet fehér háttérrel
  createFallbackEnvironment() {
    console.log("🔄 Fallback környezet fehér háttérrel...");

    // Fehér háttér
    this.sceneManager.scene.background = new THREE.Color(0xffffff);
    
    // Alapvető environment
    const pmremGenerator = new THREE.PMREMGenerator(this.sceneManager.renderer);
    const envMap = pmremGenerator.fromScene(this.sceneManager.scene).texture;
    this.sceneManager.scene.environment = envMap;
    
    this.sceneManager.scene.backgroundIntensity = 1.0;
    // Nincs scene.environmentIntensity - csak mesh szintű
    
    this.envMap = envMap;
    this.isLoaded = true;
    
    console.log("✅ Fallback környezet kész - fehér háttér");
  }

  // Környezet intenzitás beállítása - JAVÍTOTT: mesh szintű
  setEnvironmentIntensity(intensity = 0.6) { // Alapértelmezett 0.6
    const clampedIntensity = Math.max(0, Math.min(5, intensity));
    
    console.log(`🌟 Environment intenzitás beállítása: ${clampedIntensity}`);
    
    // Alkalmazás minden mesh-re
    const meshes = this.sceneManager.getAllMeshes();
    let updatedCount = 0;
    
    meshes.forEach((mesh, elementId) => {
      if (this.setMeshEnvironmentIntensity(mesh, clampedIntensity)) {
        updatedCount++;
      }
    });
    
    console.log(`♻️ Environment intenzitás frissítve ${updatedCount} mesh-en: ${clampedIntensity}`);
    
    // Force render
    this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
  }

  // ÚJ: Mesh environment intenzitás beállítása
  setMeshEnvironmentIntensity(mesh, intensity) {
    if (!mesh) return false;

    let updated = false;

    // Hagyományos mesh
    if (mesh.material && mesh.material.isMeshStandardMaterial) {
      mesh.material.envMapIntensity = intensity;
      mesh.material.needsUpdate = true;
      updated = true;
    }

    // GROUP mesh - gyerekek frissítése
    if (mesh.userData && mesh.userData.isGroup) {
      mesh.children.forEach((childMesh) => {
        if (childMesh.material && childMesh.material.isMeshStandardMaterial) {
          childMesh.material.envMapIntensity = intensity;
          childMesh.material.needsUpdate = true;
          updated = true;
        }
      });
    }

    return updated;
  }

  // Háttér szín beállítása
  setBackgroundColor(color = 0xffffff) {
    this.sceneManager.scene.background = new THREE.Color(color);
    console.log(`🎨 Háttér szín: #${color.toString(16).padStart(6, '0')}`);
  }

  // Környezet forgatása
  rotateEnvironment(rotation = 0) {
    if (this.envMap) {
      this.envMap.rotation = rotation;
      console.log(`🔄 Environment forgatás: ${(rotation * 180 / Math.PI).toFixed(1)}°`);
    }
  }

  // Összes mesh environment map frissítése - JAVÍTOTT verzió
  updateAllMeshesEnvironment() {
    const meshes = this.sceneManager.getAllMeshes();
    let updatedCount = 0;

    console.log(`🔄 Environment map alkalmazása ${meshes.size} mesh-re...`);

    meshes.forEach((mesh, elementId) => {
      if (this.updateMeshEnvironment(mesh)) {
        updatedCount++;
        console.log(`✅ Environment alkalmazva: ${elementId}`);
      }
    });

    console.log(`♻️ Environment frissítve ${updatedCount}/${meshes.size} mesh-en`);
    
    // Force render frissítés
    this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
  }

  // Egyedi mesh environment frissítése - BŐVÍTETT debugging-gel
  updateMeshEnvironment(mesh) {
    if (!mesh || !this.envMap) {
      console.warn("Mesh vagy envMap hiányzik:", mesh?.userData?.elementId);
      return false;
    }

    let updated = false;

    // Hagyományos mesh
    if (mesh.material && mesh.material.isMeshStandardMaterial) {
      mesh.material.envMap = this.envMap;
      mesh.material.envMapIntensity = mesh.material.envMapIntensity || 1.0;
      mesh.material.needsUpdate = true;
      console.log(`🌟 Env map -> ${mesh.userData?.elementId}: metalness=${mesh.material.metalness}, envMapIntensity=${mesh.material.envMapIntensity}`);
      updated = true;
    }

    // GROUP mesh - gyerekek frissítése
    if (mesh.userData && mesh.userData.isGroup) {
      mesh.children.forEach((childMesh, index) => {
        if (childMesh.material && childMesh.material.isMeshStandardMaterial) {
          childMesh.material.envMap = this.envMap;
          childMesh.material.envMapIntensity = childMesh.material.envMapIntensity || 1.0;
          childMesh.material.needsUpdate = true;
          console.log(`🌟 Env map -> ${mesh.userData?.elementId}_child_${index}: metalness=${childMesh.material.metalness}`);
          updated = true;
        }
      });
    }

    return updated;
  }

  // Status információk
  getStatus() {
    return {
      version: 'v1.3.0 - Tiszta verzió',
      isLoaded: this.isLoaded,
      currentHDR: this.currentHDRUrl,
      hasEnvironment: !!this.sceneManager.scene.environment,
      hasBackground: !!this.sceneManager.scene.background,
      backgroundType: 'Fehér szín',
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
    this.sceneManager.scene.background = new THREE.Color(0xffffff);

    this.isLoaded = false;
    this.currentHDRUrl = null;

    console.log("HDREnvironmentManager v1.3.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.HDREnvironmentManager = HDREnvironmentManager;