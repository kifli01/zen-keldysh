/**
 * Texture Manager
 * Textúrák központi kezelése PBR materials támogatással
 * v1.5.0 - PBR Materials (MeshStandardMaterial)
 */

class TextureManager {
  constructor() {
    this.textures = new Map();
    this.realisticMaterials = null;
    this.wireframeMaterial = null;
    this.initialized = false;
    
    console.log("TextureManager v1.5.0 - PBR Materials");
  }

  // Inicializálás
  initialize() {
    if (this.initialized) {
      console.log("TextureManager már inicializálva");
      return this.getAllTextures();
    }

    console.log("🎨 PBR Textúrák és anyagok létrehozása...");
    
    // Anyagok létrehozása
    this.realisticMaterials = this.createRealisticMaterials();
    this.wireframeMaterial = this.createWireframeMaterial();

    this.initialized = true;
    console.log(`✅ TextureManager PBR inicializálva`);
    
    return this.getAllTextures();
  }

  // UNIVERZÁLIS textúra betöltés - PBR kompatibilis
  createTextureFromImage(imagePath, repeatSettings = { x: 1, y: 1 }) {
    const texture = new THREE.TextureLoader().load(
      imagePath,
      (loadedTexture) => {
        console.log(`✅ PBR Textúra betöltve: ${imagePath}`);
      },
      undefined,
      (error) => {
        console.warn(`⚠️ Kép nem található: ${imagePath}`);
      }
    );
    
    // PBR kompatibilis textúra beállítások
    if (repeatSettings.x === 1 && repeatSettings.y === 1) {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
    } else {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    }
    
    texture.repeat.set(repeatSettings.x, repeatSettings.y);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    
    return texture;
  }

  // ÚJ: PBR anyag létrehozás shade-del
  createPBRMaterialWithShade(materialDef, shade = 5) {
    const normalizedShade = Math.max(1, Math.min(10, shade));
    
    // PBR értékek számítása shade alapján
    const brightness = 0.3 + (normalizedShade - 1) * (1.2 / 9); // 0.3-1.5
    const roughness = materialDef.roughnessBase + (10 - normalizedShade) * 0.05; // simább = fényesebb
    const metalness = materialDef.metalnessBase || 0.0;
    
    // Textúra betöltése ha van
    let diffuseTexture = null;
    if (materialDef.imagePath) {
      diffuseTexture = this.createTextureFromImage(materialDef.imagePath, materialDef.repeat);
    }
    
    // Színszámítás
    const baseColor = new THREE.Color(materialDef.baseColor);
    baseColor.multiplyScalar(brightness);
    
    // PBR Material létrehozása
    const material = new THREE.MeshStandardMaterial({
      // Alap tulajdonságok
      color: baseColor.getHex(),
      map: diffuseTexture,
      
      // PBR tulajdonságok
      roughness: roughness,
      metalness: metalness,
      
      // Fejlett beállítások
      transparent: false,
      side: THREE.FrontSide,
      flatShading: false,
      
      // Környezeti világítás erősség
      envMapIntensity: materialDef.envMapIntensity || 1.0,
    });
    
    console.log(`🎨 PBR Material: ${materialDef.name}, shade: ${normalizedShade}, roughness: ${roughness.toFixed(2)}, metalness: ${metalness.toFixed(2)}`);
    
    return material;
  }

  // Fallback - régi Phong anyag shade-del (blueprint módhoz)
  createPhongMaterialWithShade(materialDef, shade = 5) {
    const normalizedShade = Math.max(1, Math.min(10, shade));
    
    const brightness = 0.1 + (normalizedShade - 1) * (1.4 / 9);
    const shininess = 5 + (normalizedShade - 1) * (95 / 9);
    
    let texture = null;
    if (materialDef.imagePath) {
      texture = this.createTextureFromImage(materialDef.imagePath, materialDef.repeat);
    }
    
    const baseColor = new THREE.Color(materialDef.baseColor);
    baseColor.multiplyScalar(brightness);
    
    return new THREE.MeshPhongMaterial({
      color: baseColor.getHex(),
      map: texture,
      shininess: materialDef.useShade ? shininess : materialDef.shininess,
      transparent: false,
    });
  }

  // PBR Realistic anyagok létrehozása
  createRealisticMaterials() {
    return {
      plate: this.createPBRMaterialWithShade({
        ...MATERIALS.PINE_PLYWOOD,
        roughnessBase: 0.8, // Fa - matt felület
        metalnessBase: 0.0, // Nem fém
        envMapIntensity: 0.3,
      }, 5),
      
      frame: this.createPBRMaterialWithShade({
        ...MATERIALS.PINE_SOLID,
        roughnessBase: 0.9, // Tömörfa - még mattabb
        metalnessBase: 0.0,
        envMapIntensity: 0.2,
      }, 5),
      
      covering: this.createPBRMaterialWithShade({
        ...MATERIALS.ARTIFICIAL_GRASS,
        roughnessBase: 0.95, // Műfű - nagyon matt
        metalnessBase: 0.0,
        envMapIntensity: 0.1,
      }, 5),
      
      wall: this.createPBRMaterialWithShade({
        ...MATERIALS.PINE_SOLID,
        roughnessBase: 0.85,
        metalnessBase: 0.0,
        envMapIntensity: 0.25,
      }, 5),
      
      leg: this.createPBRMaterialWithShade({
        ...MATERIALS.PINE_SOLID,
        roughnessBase: 0.9,
        metalnessBase: 0.0,
        envMapIntensity: 0.2,
      }, 5),
      
      ball: this.createPBRMaterialWithShade({
        ...MATERIALS.WHITE_PLASTIC,
        roughnessBase: 0.1, // Műanyag - sima felület
        metalnessBase: 0.0,
        envMapIntensity: 0.8,
      }, 5),
      
      galvanized: this.createPBRMaterialWithShade({
        ...MATERIALS.GALVANIZED_STEEL,
        roughnessBase: 0.3, // Fém - közepesen sima
        metalnessBase: 0.9, // Nagyon fémes
        envMapIntensity: 1.5, // Erős reflexió
      }, 5),
    };
  }

  // Wireframe anyag (változatlan)
  createWireframeMaterial() {
    return new THREE.LineBasicMaterial({
      color: 0x333333,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    });
  }

  // Univerzális anyag lekérése (PBR vagy Phong)
  getMaterialWithShade(materialType, shade = 5, usePBR = true) {
    if (!this.initialized) {
      this.initialize();
    }

    if (usePBR) {
      return this.createPBRMaterialWithShade(materialType, shade);
    } else {
      return this.createPhongMaterialWithShade(materialType, shade);
    }
  }

  // Galvanizált anyag (PBR verzió)
  getGalvanizedMaterial(shade = 5) {
    return this.createPBRMaterialWithShade({
      ...MATERIALS.GALVANIZED_STEEL,
      roughnessBase: 0.3,
      metalnessBase: 0.9,
      envMapIntensity: 1.5,
    }, shade);
  }

  // Getter függvények (változatlan)
  getTexture(name) {
    return this.textures.get(name);
  }

  getRealisticMaterials() {
    if (!this.initialized) {
      this.initialize();
    }
    return this.realisticMaterials;
  }

  getWireframeMaterial() {
    if (!this.initialized) {
      this.initialize();
    }
    return this.wireframeMaterial;
  }

  getAllTextures() {
    const textureObj = {};
    this.textures.forEach((texture, name) => {
      textureObj[name] = texture;
    });
    return textureObj;
  }

  // ÚJ: PBR debug info
  getStatus() {
    return {
      initialized: this.initialized,
      hasRealisticMaterials: !!this.realisticMaterials,
      materialType: 'PBR (MeshStandardMaterial)',
      supportedMaterials: ['galvanized', 'wood', 'turf', 'plastic', 'plywood'],
      shadeRange: '1-10',
      pbrFeatures: ['roughness', 'metalness', 'envMapIntensity'],
      version: '1.5.0'
    };
  }

  // Cleanup (bővített)
  destroy() {
    this.textures.forEach((texture) => {
      if (texture.dispose) {
        texture.dispose();
      }
    });
    this.textures.clear();

    if (this.realisticMaterials) {
      Object.values(this.realisticMaterials).forEach((material) => {
        if (material.dispose) {
          material.dispose();
        }
        if (material.map && material.map.dispose) {
          material.map.dispose();
        }
      });
      this.realisticMaterials = null;
    }

    if (this.wireframeMaterial && this.wireframeMaterial.dispose) {
      this.wireframeMaterial.dispose();
      this.wireframeMaterial = null;
    }

    this.initialized = false;
    console.log("TextureManager v1.5.0 PBR cleanup kész");
  }
}

// Globális hozzáférhetőség
window.TextureManager = TextureManager;