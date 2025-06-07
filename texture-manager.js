/**
 * Texture Manager
 * Textúrák központi kezelése és létrehozása
 * v1.4.0 - Egyszerűsített, duplikációk eltávolítva
 */

class TextureManager {
  constructor() {
    this.textures = new Map();
    this.realisticMaterials = null;
    this.wireframeMaterial = null;
    this.initialized = false;
    
    console.log("TextureManager v1.4.0 - egyszerűsített");
  }

  // Inicializálás
  initialize() {
    if (this.initialized) {
      console.log("TextureManager már inicializálva");
      return this.getAllTextures();
    }

    console.log("🎨 Textúrák és anyagok létrehozása...");
    
    // Anyagok létrehozása
    this.realisticMaterials = this.createRealisticMaterials();
    this.wireframeMaterial = this.createWireframeMaterial();

    this.initialized = true;
    console.log(`✅ TextureManager inicializálva`);
    
    return this.getAllTextures();
  }

  // UNIVERZÁLIS textúra betöltés - egyetlen függvény minden anyaghoz
  createTextureFromImage(imagePath, repeatSettings = { x: 1, y: 1 }) {
    const texture = new THREE.TextureLoader().load(
      imagePath,
      (loadedTexture) => {
        console.log(`✅ Textúra betöltve: ${imagePath}`);
      },
      undefined,
      (error) => {
        console.warn(`⚠️ Kép nem található: ${imagePath}`);
      }
    );
    
    // Textúra beállítások
    if (repeatSettings.x === 1 && repeatSettings.y === 1) {
      // Egyszer - galvanizált acélhoz
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
    } else {
      // Ismétlődő - fa és műfű
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    }
    
    texture.repeat.set(repeatSettings.x, repeatSettings.y);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    return texture;
  }

  // UNIVERZÁLIS anyag létrehozás shade-del
  createMaterialWithShade(materialDef, shade = 5) {
    const normalizedShade = Math.max(1, Math.min(10, shade));
    
    // Brightness és shininess számítás
    const brightness = 0.1 + (normalizedShade - 1) * (1.4 / 9); // 0.1-1.5
    const shininess = 5 + (normalizedShade - 1) * (95 / 9);     // 5-100
    
    // Textúra betöltése ha van
    let texture = null;
    if (materialDef.imagePath) {
      texture = this.createTextureFromImage(materialDef.imagePath, materialDef.repeat);
    }
    
    // Színszámítás
    const baseColor = new THREE.Color(materialDef.baseColor);
    baseColor.multiplyScalar(brightness);
    
    return new THREE.MeshPhongMaterial({
      color: baseColor.getHex(),
      map: texture,
      shininess: materialDef.useShade ? shininess : materialDef.shininess,
      transparent: false,
    });
  }



  // Realistic anyagok létrehozása alapértelmezett shade-del
  createRealisticMaterials() {
    return {
      plate: this.createMaterialWithShade(MATERIALS.PINE_PLYWOOD, 5),
      frame: this.createMaterialWithShade(MATERIALS.PINE_SOLID, 5),
      covering: this.createMaterialWithShade(MATERIALS.ARTIFICIAL_GRASS, 5),
      wall: this.createMaterialWithShade(MATERIALS.PINE_SOLID, 5),
      leg: this.createMaterialWithShade(MATERIALS.PINE_SOLID, 5),
      ball: this.createMaterialWithShade(MATERIALS.WHITE_PLASTIC, 5),
      galvanized: this.createMaterialWithShade(MATERIALS.GALVANIZED_STEEL, 5),
    };
  }

  // Wireframe anyag
  createWireframeMaterial() {
    return new THREE.LineBasicMaterial({
      color: 0x333333,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    });
  }

  // Univerzális anyag lekérése anyag típus és shade szerint
  getMaterialWithShade(materialType, shade = 5) {
    if (!this.initialized) {
      this.initialize();
    }

    return this.createMaterialWithShade(materialType, shade);
  }

  // Getter függvények kompatibilitáshoz
  getGalvanizedMaterial(shade = 5) {
    return this.createMaterialWithShade(MATERIALS.GALVANIZED_STEEL, shade);
  }

  // Textúra lekérése (ha szükséges)
  getTexture(name) {
    return this.textures.get(name);
  }

  // Realistic anyagok lekérése
  getRealisticMaterials() {
    if (!this.initialized) {
      this.initialize();
    }
    return this.realisticMaterials;
  }

  // Wireframe anyag lekérése
  getWireframeMaterial() {
    if (!this.initialized) {
      this.initialize();
    }
    return this.wireframeMaterial;
  }

  // Összes textúra objektumként
  getAllTextures() {
    const textureObj = {};
    this.textures.forEach((texture, name) => {
      textureObj[name] = texture;
    });
    return textureObj;
  }

  // Debug info
  getStatus() {
    return {
      initialized: this.initialized,
      hasRealisticMaterials: !!this.realisticMaterials,
      supportedMaterials: ['galvanized', 'wood', 'turf', 'plastic', 'plywood'],
      shadeRange: '1-10',
      version: '1.4.0'
    };
  }

  // Cleanup
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
      });
      this.realisticMaterials = null;
    }

    if (this.wireframeMaterial && this.wireframeMaterial.dispose) {
      this.wireframeMaterial.dispose();
      this.wireframeMaterial = null;
    }

    this.initialized = false;
    console.log("TextureManager v1.4.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.TextureManager = TextureManager;