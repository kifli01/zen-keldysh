/**
 * Texture Manager
 * Textúrák központi kezelése és létrehozása
 * v1.3.0 - Minden anyag shade támogatás (steel, wood, turf)
 */

class TextureManager {
  constructor() {
    this.textures = new Map();
    this.realisticMaterials = null;
    this.wireframeMaterial = null;
    this.initialized = false;
    
    console.log("TextureManager v1.3.0 konstruktor - minden anyag shade támogatással");
  }

  // Összes textúra inicializálása
  initialize() {
    if (this.initialized) {
      console.log("TextureManager már inicializálva");
      return this.getAllTextures();
    }

    console.log("🎨 Textúrák és anyagok létrehozása...");
    
    // Csak a papír textúra marad procedurális
    this.textures.set('paper', this.createPaperTexture());

    // Anyagok létrehozása textúrák alapján
    this.realisticMaterials = this.createRealisticMaterials();
    this.wireframeMaterial = this.createWireframeMaterial();

    this.initialized = true;
    console.log(`✅ TextureManager inicializálva`);
    
    return this.getAllTextures();
  }

  // FRISSÍTETT: Galvanizált textúra betöltése képből - 1-10 árnyalat skála
  createGalvanizedTexture(shade = 5) {
    const normalizedShade = Math.max(1, Math.min(10, shade));
    const imagePath = `textures/steel.jpg`;
    
    const texture = new THREE.TextureLoader().load(
      imagePath,
      (loadedTexture) => {
        console.log(`✅ Galvanizált textúra betöltve: árnyalat ${normalizedShade}`);
      },
      undefined,
      (error) => {
        console.warn(`⚠️ Steel kép nem található: ${imagePath}, fallback színre`);
      }
    );
    
    // Széthúzott textúra beállítások
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    return texture;
  }

  // ÚJ: Fa textúra betöltése képből - 1-10 árnyalat skála
  createWoodTexture(shade = 9) {
    const normalizedShade = Math.max(1, Math.min(10, shade));
    const imagePath = `textures/wood-1.jpg`;
    
    const texture = new THREE.TextureLoader().load(
      imagePath,
      (loadedTexture) => {
        console.log(`✅ Fa textúra betöltve: árnyalat ${normalizedShade}`);
      },
      undefined,
      (error) => {
        console.warn(`⚠️ Wood kép nem található: ${imagePath}, fallback színre`);
      }
    );
    
    // Ismétlődő textúra beállítások (fa esetén jobb az ismétlés)
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    return texture;
  }

  // ÚJ: Műfű textúra betöltése képből - 1-10 árnyalat skála
  createTurfTexture(shade = 5) {
    const normalizedShade = Math.max(1, Math.min(10, shade));
    const imagePath = `textures/turf-1.jpg`;
    
    const texture = new THREE.TextureLoader().load(
      imagePath,
      (loadedTexture) => {
        console.log(`✅ Műfű textúra betöltve: árnyalat ${normalizedShade}`);
      },
      undefined,
      (error) => {
        console.warn(`⚠️ Turf kép nem található: ${imagePath}, fallback színre`);
      }
    );
    
    // Ismétlődő textúra beállítások (műfű esetén sok ismétlés)
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    return texture;
  }

  // ÚJ: Galvanizált anyag létrehozása shade-del - EXTRÉM KONTRASZT
  createGalvanizedMaterialWithShade(shade = 5) {
    const texture = this.createGalvanizedTexture(shade);
    
    // EXTRÉM kontraszt - 0.1-1.5 között
    const brightness = 0.1 + (shade - 1) * (1.4 / 9); // 0.1-1.5 között (EXTRÉM tartomány)
    const shininess = 5 + (shade - 1) * (95 / 9);     // 5-100 között (maximum fényesség)
    
    // Alapszín: fehér, brightness-szel szorozva
    const baseColor = new THREE.Color(0xffffff);
    baseColor.multiplyScalar(brightness);
    
    return new THREE.MeshPhongMaterial({
      color: baseColor.getHex(),
      map: texture,
      shininess: shininess,
      transparent: false,
    });
  }

  // ÚJ: Fa anyag létrehozása shade-del - EXTRÉM KONTRASZT
  createWoodMaterialWithShade(shade = 5) {
    const texture = this.createWoodTexture(shade);
    
    // EXTRÉM kontraszt - 0.15-1.3 között
    const brightness = 0.15 + (shade - 1) * (1.15 / 9); // 0.15-1.3 között (EXTRÉM tartomány)
    const shininess = 1 + (shade - 1) * (60 / 9);       // 1-61 között (fa is lehet fényes)
    
    // Alapszín: barna árnyalat
    const baseColor = new THREE.Color(0xecc5a9); // Eredeti fa szín
    baseColor.multiplyScalar(brightness);
    
    return new THREE.MeshPhongMaterial({
      color: baseColor.getHex(),
      map: texture,
      shininess: shininess,
      transparent: false,
    });
  }

  // ÚJ: Műfű anyag létrehozása shade-del - EXTRÉM KONTRASZT
  createTurfMaterialWithShade(shade = 5) {
    const texture = this.createTurfTexture(shade);
    
    // EXTRÉM kontraszt - 0.2-1.4 között
    const brightness = 0.2 + (shade - 1) * (1.2 / 9); // 0.2-1.4 között (EXTRÉM tartomány)
    const shininess = 1 + (shade - 1) * (25 / 9);     // 1-26 között (fű is lehet fényesebb)
    
    // Alapszín: zöld árnyalat
    const baseColor = new THREE.Color(0xa5bc49); // Eredeti fű szín
    baseColor.multiplyScalar(brightness);
    
    return new THREE.MeshPhongMaterial({
      color: baseColor.getHex(),
      map: texture,
      shininess: shininess,
      transparent: false,
    });
  }

  // ÚJ: Univerzális anyag lekérése shade-del
  getGalvanizedMaterial(shade = 5) {
    if (!this.initialized) {
      this.initialize();
    }
    return this.createGalvanizedMaterialWithShade(shade);
  }

  getWoodMaterial(shade = 5) {
    if (!this.initialized) {
      this.initialize();
    }
    return this.createWoodMaterialWithShade(shade);
  }

  getTurfMaterial(shade = 5) {
    if (!this.initialized) {
      this.initialize();
    }
    return this.createTurfMaterialWithShade(shade);
  }

  // FRISSÍTETT: Realistic anyagok létrehozása - alapértelmezett shade 5-tel
  createRealisticMaterials() {
    return {
      plate: new THREE.MeshPhongMaterial({
        color: 0xb99379,
        shininess: 10,
        transparent: false,
      }),
      frame: this.createWoodMaterialWithShade(5),      // Fa shade 5
      covering: this.createTurfMaterialWithShade(5),   // Műfű shade 5
      wall: this.createWoodMaterialWithShade(5),       // Fa shade 5
      leg: this.createWoodMaterialWithShade(5),        // Fa shade 5
      ball: new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 30,
        transparent: false,
      }),
      galvanized: this.createGalvanizedMaterialWithShade(5), // Galvanizált shade 5
    };
  }

  // Wireframe anyag létrehozása
  createWireframeMaterial() {
    return new THREE.LineBasicMaterial({
      color: 0x333333,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    });
  }

  // Papír textúra létrehozása (VÁLTOZATLAN - procedurális)
  createPaperTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 512, 512);

    const imageData = context.getImageData(0, 0, 512, 512);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 1;
      data[i] = Math.max(0, Math.min(255, 255 + noise));
      data[i + 1] = Math.max(0, Math.min(255, 255 + noise));
      data[i + 2] = Math.max(0, Math.min(255, 255 + noise));
      data[i + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    return texture;
  }

  // Egy textúra lekérése
  getTexture(name) {
    if (!this.initialized) {
      console.warn("TextureManager nincs inicializálva, auto-init...");
      this.initialize();
    }
    return this.textures.get(name);
  }

  // Realistic anyagok lekérése
  getRealisticMaterials() {
    if (!this.initialized) {
      console.warn("TextureManager nincs inicializálva, auto-init...");
      this.initialize();
    }
    return this.realisticMaterials;
  }

  // Wireframe anyag lekérése
  getWireframeMaterial() {
    if (!this.initialized) {
      console.warn("TextureManager nincs inicializálva, auto-init...");
      this.initialize();
    }
    return this.wireframeMaterial;
  }

  // Összes textúra objektumként (ViewModeManager kompatibilitás)
  getAllTextures() {
    const textureObj = {};
    this.textures.forEach((texture, name) => {
      textureObj[name] = texture;
    });
    return textureObj;
  }

  // ÚJ: Univerzális anyag lekérése anyag típus és shade szerint
  getMaterialWithShade(materialType, shade = 5) {
    if (!this.initialized) {
      this.initialize();
    }

    switch (materialType) {
      case MATERIALS.GALVANIZED_STEEL:
        return this.getGalvanizedMaterial(shade);
      case MATERIALS.PINE_SOLID:
        return this.getWoodMaterial(shade);
      case MATERIALS.ARTIFICIAL_GRASS:
        return this.getTurfMaterial(shade);
      case MATERIALS.PINE_PLYWOOD:
        // Rétegelt lemez is fa alapú, de világosabb alapszínnel
        const woodMaterial = this.getWoodMaterial(shade);
        const lighterWood = woodMaterial.clone();
        lighterWood.color.multiplyScalar(1.1); // 10%-kal világosabb
        return lighterWood;
      case MATERIALS.WHITE_PLASTIC:
        // Műanyag nem változik shade-del
        return new THREE.MeshPhongMaterial({
          color: 0xffffff,
          shininess: 30,
          transparent: false,
        });
      default:
        console.warn(`Ismeretlen anyag típus: ${materialType}, fallback fa anyag`);
        return this.getWoodMaterial(shade);
    }
  }

  // Debug info
  getStatus() {
    return {
      initialized: this.initialized,
      textureCount: this.textures.size,
      availableTextures: Array.from(this.textures.keys()),
      hasRealisticMaterials: !!this.realisticMaterials,
      hasWireframeMaterial: !!this.wireframeMaterial,
      supportedMaterials: ['galvanized', 'wood', 'turf'],
      shadeRange: '1-10',
      imageBasedTextures: ['steel.jpg', 'wood-1.jpg', 'turf-1.jpg'],
    };
  }

  // Cleanup
  destroy() {
    // Textúrák cleanup
    this.textures.forEach((texture) => {
      if (texture.dispose) {
        texture.dispose();
      }
    });
    this.textures.clear();

    // Anyagok cleanup
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
    console.log("TextureManager v1.3.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.TextureManager = TextureManager;