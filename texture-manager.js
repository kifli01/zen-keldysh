/**
 * Texture Manager
 * Textúrák központi kezelése - Pure PBR Pipeline
 * v1.7.0 - Legacy Phong támogatás eltávolítva, csak async PBR
 */

class TextureManager {
  constructor() {
    this.textures = new Map(); // Összes textúra cache
    this.initialized = false;
    this.loader = new THREE.TextureLoader();
    
    // Multi-texture cache
    this.pbrTextureCache = new Map(); // PBR texture set-ek
    this.loadingPromises = new Map(); // Async loading tracking
    
    console.log("TextureManager v1.7.0 - Pure PBR Pipeline");
  }

  // Inicializálás
  initialize() {
    if (this.initialized) {
      console.log("TextureManager már inicializálva");
      return;
    }

    console.log("🎨 Pure PBR Pipeline inicializálása...");
    this.initialized = true;
    console.log(`✅ TextureManager v1.7.0 inicializálva`);
  }

  // Textúra betöltés hibakezeléssel
  async loadTextureAsync(texturePath, name = null) {
    if (!texturePath) {
      console.warn(`⚠️ Nincs textúra path: ${name || 'unknown'}`);
      return null;
    }

    // Cache ellenőrzés
    if (this.textures.has(texturePath)) {
      console.log(`📦 Cache-ből betöltve: ${name || texturePath}`);
      return this.textures.get(texturePath);
    }

    // Loading promise ellenőrzés (több request ugyanarra)
    if (this.loadingPromises.has(texturePath)) {
      console.log(`⏳ Várakozás betöltésre: ${name || texturePath}`);
      return await this.loadingPromises.get(texturePath);
    }

    // Új betöltés indítása
    const loadingPromise = new Promise((resolve, reject) => {
      this.loader.load(
        texturePath,
        (texture) => {
          // Textúra beállítások
          this.configureTexture(texture, texturePath);
          
          // Cache-be mentés
          this.textures.set(texturePath, texture);
          
          if (PBR_PIPELINE.logTextureLoading) {
            console.log(`✅ Textúra betöltve: ${name || texturePath}`);
          }
          
          resolve(texture);
        },
        (progress) => {
          // Loading progress (ha szükséges)
        },
        (error) => {
          console.warn(`❌ Textúra betöltési hiba: ${name || texturePath}`, error);
          resolve(null); // Null visszaadás hiba esetén (nem reject)
        }
      );
    });

    this.loadingPromises.set(texturePath, loadingPromise);
    const result = await loadingPromise;
    this.loadingPromises.delete(texturePath);
    
    return result;
  }

  // Textúra konfiguráció beállítása
  configureTexture(texture, texturePath) {
    // Alapvető beállítások
    texture.generateMipmaps = PBR_PIPELINE.mipmaps;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    // Anisotropic filtering
    const maxAnisotropy = Math.min(
      PBR_PIPELINE.anisotropy,
      this.getMaxAnisotropy()
    );
    texture.anisotropy = maxAnisotropy;

    // Wrapping mode automatikus detektálás
    if (texturePath.includes('Wood017') || texturePath.includes('Grass008')) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    } else {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
    }

    // Normal map specifikus beállítások
    if (texturePath.includes('Normal')) {
      texture.flipY = !PBR_PIPELINE.normalFlipY; // OpenGL convention
    }

    // Color space beállítás
    if (texturePath.includes('Color') || texturePath.includes('Diffuse')) {
      texture.encoding = THREE.sRGBEncoding;
    } else {
      texture.encoding = THREE.LinearEncoding; // Normal, Roughness, Metalness
    }
  }

  // Teljes PBR texture set betöltése
  async loadPBRTextureSet(materialDef, materialName) {
    console.log(`🎨 PBR Texture Set betöltése: ${materialName}`);
    
    const textureSet = {
      diffuse: null,
      normal: null,
      roughness: null,
      metalness: null,
      ao: null,
    };

    // Diffuse Map (kötelező)
    if (materialDef.diffusePath) {
      textureSet.diffuse = await this.loadTextureAsync(
        materialDef.diffusePath, 
        `${materialName}_Diffuse`
      );
    }

    // Normal Map
    if (materialDef.normalPath) {
      textureSet.normal = await this.loadTextureAsync(
        materialDef.normalPath, 
        `${materialName}_Normal`
      );
    }

    // Roughness Map
    if (materialDef.roughnessPath) {
      textureSet.roughness = await this.loadTextureAsync(
        materialDef.roughnessPath, 
        `${materialName}_Roughness`
      );
    }

    // Metalness Map (csak fémekhez)
    if (materialDef.metalnessPath) {
      textureSet.metalness = await this.loadTextureAsync(
        materialDef.metalnessPath, 
        `${materialName}_Metalness`
      );
    }

    // Ambient Occlusion Map
    if (materialDef.aoPath) {
      textureSet.ao = await this.loadTextureAsync(
        materialDef.aoPath, 
        `${materialName}_AO`
      );
    }

    // Cache-be mentés
    this.pbrTextureCache.set(materialName, textureSet);

    // Debug log
    const loadedMaps = Object.entries(textureSet)
      .filter(([key, texture]) => texture !== null)
      .map(([key]) => key);
    
    console.log(`✅ ${materialName}: ${loadedMaps.join(', ')} betöltve`);
    
    return textureSet;
  }

  // Pure PBR Material létrehozása - JAVÍTOTT brightness formula
  async createPBRMaterial(materialDef, shade = 5, materialName = 'Unknown') {
    // NULL CHECK
    if (!materialDef) {
      console.error(`❌ MaterialDef is null: ${materialName}`);
      return this.createEmergencyMaterial();
    }

    try {
      // Texture set betöltése
      const textureSet = await this.loadPBRTextureSet(materialDef, materialName);
      
      // NULL CHECK textureSet-re
      if (!textureSet) {
        console.error(`❌ TextureSet is null: ${materialName}`);
        throw new Error('TextureSet is null');
      }

      const normalizedShade = Math.max(1, Math.min(10, shade));
      
      // JAVÍTOTT brightness formula - világosabb
      const brightness = 0.8 + (normalizedShade - 1) * (0.8 / 9); // 0.8-1.6 tartomány
      const roughness = (materialDef.roughnessBase || 0.5) + (10 - normalizedShade) * 0.05;
      const metalness = materialDef.metalnessBase || 0.0;
      
      // Alapszín számítás - csökkentett color tinting
      const baseColor = new THREE.Color(materialDef.baseColor || materialDef.color || 0x808080);
      baseColor.multiplyScalar(brightness);
      
      // Csökkentett Color Tinting
      let finalColor = baseColor;
      let colorIntensity = 1.0; // Visszaállítva az alapértelmezett értékre
      
      if (textureSet.diffuse && materialDef.enableColorTinting !== false) {
        colorIntensity = materialDef.colorTintStrength || 1.0; // Alapértelmezett 1.0
        finalColor = baseColor.clone();
        finalColor.multiplyScalar(colorIntensity);
        
        console.log(`🎨 Color Tinting: ${materialName}, intensity: ${colorIntensity}, color: #${finalColor.getHexString()}`);
      }
      
      // Textúra repeat beállítása (BIZTONSÁGOSAN)
      const repeat = materialDef.pbrRepeat || materialDef.repeat || { x: 1, y: 1 };
      if (textureSet.diffuse) {
        textureSet.diffuse.repeat.set(repeat.x, repeat.y);
      }
      if (textureSet.normal) {
        textureSet.normal.repeat.set(repeat.x, repeat.y);
      }
      if (textureSet.roughness) {
        textureSet.roughness.repeat.set(repeat.x, repeat.y);
      }
      if (textureSet.metalness) {
        textureSet.metalness.repeat.set(repeat.x, repeat.y);
      }
      if (textureSet.ao) {
        textureSet.ao.repeat.set(repeat.x, repeat.y);
      }

      // Dynamic Normal Scale számítás
      let finalNormalScale = materialDef.normalScale || 1.0;
      
      if (materialDef.normalScaleRange && textureSet.normal) {
        const shadeProgress = (normalizedShade - 1) / 9; // 0-1 között
        const normalProgress = 1 - shadeProgress; // Fordított logika
        
        finalNormalScale = materialDef.normalScaleRange.min + 
          (materialDef.normalScaleRange.max - materialDef.normalScaleRange.min) * normalProgress;
        
        console.log(`🎛️ Dynamic Normal Scale: ${materialName}, shade: ${normalizedShade}, scale: ${finalNormalScale.toFixed(2)}`);
      }

      // PBR Material létrehozása
      const material = new THREE.MeshStandardMaterial({
        // Color dominál a textúra felett
        color: finalColor.getHex(),
        map: textureSet.diffuse,
        
        // Dynamic Normal Map
        normalMap: textureSet.normal,
        normalScale: new THREE.Vector2(finalNormalScale, finalNormalScale),
        
        // Roughness Map
        roughnessMap: textureSet.roughness,
        roughness: textureSet.roughness ? 1.0 : Math.max(0, Math.min(1, roughness)),
        
        // Metalness Map
        metalnessMap: textureSet.metalness,
        metalness: textureSet.metalness ? (materialDef.metalnessIntensity || 1.0) : Math.max(0, Math.min(1, metalness)),
        
        // Ambient Occlusion Map
        aoMap: textureSet.ao,
        aoMapIntensity: materialDef.aoIntensity || 1.0,
        
        // Fejlett beállítások
        transparent: false,
        side: THREE.FrontSide,
        flatShading: false,
        
        // Csökkentett környezeti világítás
        envMapIntensity: materialDef.envMapIntensity || 0.5, // 1.0 helyett 0.5
      });

      // Debug log
      const appliedMaps = [];
      if (textureSet.diffuse) appliedMaps.push('diffuse');
      if (textureSet.normal) appliedMaps.push('normal');
      if (textureSet.roughness) appliedMaps.push('roughness');
      if (textureSet.metalness) appliedMaps.push('metalness');
      if (textureSet.ao) appliedMaps.push('ao');
      
      console.log(`🎨 PBR Material: ${materialName}, shade: ${normalizedShade}, brightness: ${brightness.toFixed(2)}, maps: [${appliedMaps.join(', ')}]`);
      
      return material;
      
    } catch (error) {
      console.error(`❌ PBR Material létrehozási hiba (${materialName}):`, error);
      return this.createEmergencyMaterial();
    }
  }

  // Emergency material
  createEmergencyMaterial() {
    console.log(`🚨 Emergency material létrehozása`);
    return new THREE.MeshStandardMaterial({
      color: 0xff0000, // Piros - hiba jelzéshez
      roughness: 0.5,
      metalness: 0.0,
    });
  }

  // Univerzális anyag lekérése - csak PBR
  async getMaterialWithShade(materialType, shade = 5) {
    if (!this.initialized) {
      this.initialize();
    }

    // Material név meghatározása debug-hoz
    const materialName = materialType.name || 'Unknown';

    return await this.createPBRMaterial(materialType, shade, materialName);
  }

  // Getter függvények
  getTexture(name) {
    return this.textures.get(name);
  }

  getPBRTextureSet(materialName) {
    return this.pbrTextureCache.get(materialName);
  }

  getAllTextures() {
    const textureObj = {};
    this.textures.forEach((texture, name) => {
      textureObj[name] = texture;
    });
    return textureObj;
  }

  // Renderer capability ellenőrzés
  getMaxAnisotropy() {
    // Default értékre állítás ha nincs renderer
    return 4;
  }

  // PBR Pipeline status
  getStatus() {
    return {
      initialized: this.initialized,
      version: 'v1.7.0 - Pure PBR Pipeline',
      pbrPipelineEnabled: true,
      textureCache: this.textures.size,
      pbrCache: this.pbrTextureCache.size,
      loadingPromises: this.loadingPromises.size,
      supportedMaps: ['diffuse', 'normal', 'roughness', 'metalness', 'ao'],
      materialType: 'MeshStandardMaterial (only)',
      shadeRange: '1-10',
      maxTextureSize: PBR_PIPELINE.maxTextureSize,
      capabilities: {
        mipmaps: PBR_PIPELINE.mipmaps,
        anisotropy: PBR_PIPELINE.anisotropy,
        compression: PBR_PIPELINE.enableCompression,
      }
    };
  }

  // Debug - textúra lista
  listLoadedTextures() {
    console.log("=== BETÖLTÖTT TEXTÚRÁK ===");
    console.log(`Cache méret: ${this.textures.size}`);
    this.textures.forEach((texture, path) => {
      console.log(`📄 ${path} - ${texture.image?.width || '?'}x${texture.image?.height || '?'}`);
    });
    
    console.log("\n=== PBR TEXTURE SETS ===");
    console.log(`PBR cache méret: ${this.pbrTextureCache.size}`);
    this.pbrTextureCache.forEach((textureSet, materialName) => {
      const maps = Object.entries(textureSet)
        .filter(([key, texture]) => texture !== null)
        .map(([key]) => key);
      console.log(`🎨 ${materialName}: [${maps.join(', ')}]`);
    });
    console.log("========================");
  }

  // Memory cleanup
  dispose() {
    console.log("🧹 TextureManager cleanup...");
    
    // Összes textúra cleanup
    this.textures.forEach((texture) => {
      if (texture.dispose) {
        texture.dispose();
      }
    });
    this.textures.clear();

    // PBR cache cleanup
    this.pbrTextureCache.clear();
    this.loadingPromises.clear();

    this.initialized = false;
    console.log("TextureManager v1.7.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.TextureManager = TextureManager;