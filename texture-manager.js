/**
 * Texture Manager
 * Textúrák központi kezelése és létrehozása + PBR anyagok
 * v2.0.0 - Fotoreális PBR materials + normal maps + roughness maps
 */

class TextureManager {
  constructor() {
    this.textures = new Map();
    this.normalMaps = new Map(); // ÚJ v2.0.0
    this.roughnessMaps = new Map(); // ÚJ v2.0.0
    this.realisticMaterials = null;
    this.pbrMaterials = null; // ÚJ v2.0.0 - Fizikai anyagok
    this.wireframeMaterial = null;
    this.initialized = false;
    
    console.log("TextureManager v2.0.0 konstruktor - PBR támogatással");
  }

  // Összes textúra inicializálása - BŐVÍTETT
  initialize() {
    if (this.initialized) {
      console.log("TextureManager már inicializálva");
      return this.getAllTextures();
    }

    console.log("🎨 PBR textúrák és anyagok létrehozása...");
    
    // Alapvető textúrák (albedo/diffuse)
    this.textures.set('paper', this.createPaperTexture());
    this.textures.set('wood', this.createWoodTexture());
    this.textures.set('woodAdvanced', this.createAdvancedWoodTexture()); // ÚJ
    this.textures.set('grass', this.createGrassTexture());
    this.textures.set('grassAdvanced', this.createAdvancedGrassTexture()); // ÚJ
    this.textures.set('galvanized', this.createGalvanizedTexture());
    this.textures.set('galvanizedAdvanced', this.createAdvancedMetalTexture()); // ÚJ

    // ÚJ v2.0.0: Normal maps
    this.normalMaps.set('wood', this.createWoodNormalMap());
    this.normalMaps.set('grass', this.createGrassNormalMap());
    this.normalMaps.set('metal', this.createMetalNormalMap());
    this.normalMaps.set('paper', this.createPaperNormalMap());

    // ÚJ v2.0.0: Roughness maps
    this.roughnessMaps.set('wood', this.createWoodRoughnessMap());
    this.roughnessMaps.set('grass', this.createGrassRoughnessMap());
    this.roughnessMaps.set('metal', this.createMetalRoughnessMap());
    this.roughnessMaps.set('plastic', this.createPlasticRoughnessMap());

    // Anyagok létrehozása
    this.realisticMaterials = this.createRealisticMaterials();
    this.pbrMaterials = this.createPBRMaterials(); // ÚJ
    this.wireframeMaterial = this.createWireframeMaterial();

    this.initialized = true;
    console.log(`✅ ${this.textures.size} textúra + ${this.normalMaps.size} normal map + ${this.roughnessMaps.size} roughness map létrehozva`);
    
    return this.getAllTextures();
  }

  // ÚJ v2.0.0: Fejlett fa textúra (részletesebb)
  createAdvancedWoodTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024; // Nagyobb felbontás
    canvas.height = 1024;
    const context = canvas.getContext("2d");

    // Alapszín gradiens
    const gradient = context.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, "#D2B48C"); // Tan
    gradient.addColorStop(0.3, "#CD853F"); // Peru
    gradient.addColorStop(0.6, "#A0522D"); // Sienna
    gradient.addColorStop(1, "#8B4513"); // SaddleBrown

    context.fillStyle = gradient;
    context.fillRect(0, 0, 1024, 1024);

    // Fa erezetí minták
    for (let i = 0; i < 30; i++) {
      const opacity = 0.1 + Math.random() * 0.4;
      context.globalAlpha = opacity;
      
      context.strokeStyle = `rgba(139, 69, 19, ${opacity})`;
      context.lineWidth = 2 + Math.random() * 6;
      
      context.beginPath();
      context.moveTo(0, Math.random() * 1024);
      
      // Bezier görbék az erezet számára
      const cp1x = 256 + Math.random() * 256;
      const cp1y = Math.random() * 1024;
      const cp2x = 512 + Math.random() * 256;
      const cp2y = Math.random() * 1024;
      const endX = 1024;
      const endY = Math.random() * 1024;
      
      context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
      context.stroke();
    }

    // Fa csomók
    context.globalAlpha = 0.3;
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = 20 + Math.random() * 40;
      
      const knotGradient = context.createRadialGradient(x, y, 0, x, y, radius);
      knotGradient.addColorStop(0, "#654321");
      knotGradient.addColorStop(1, "#8B4513");
      
      context.fillStyle = knotGradient;
      context.beginPath();
      context.ellipse(x, y, radius, radius * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.flipY = false; // PBR kompatibilitás
    return texture;
  }

  // ÚJ v2.0.0: Fejlett műfű textúra
  createAdvancedGrassTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    // Gradiens alapszín - természetesebb zöld
    const baseGradient = context.createLinearGradient(0, 0, 512, 512);
    baseGradient.addColorStop(0, "#6B8E23"); // OliveDrab
    baseGradient.addColorStop(0.5, "#9ACD32"); // YellowGreen
    baseGradient.addColorStop(1, "#228B22"); // ForestGreen

    context.fillStyle = baseGradient;
    context.fillRect(0, 0, 512, 512);

    // Műfű szálak - realisztikusabb
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const length = 8 + Math.random() * 20;
      const width = 0.5 + Math.random() * 1.5;
      
      // Különböző zöld árnyalatok
      const grassColors = [
        `rgba(34, 139, 34, ${0.4 + Math.random() * 0.6})`, // ForestGreen
        `rgba(107, 142, 35, ${0.4 + Math.random() * 0.6})`, // OliveDrab  
        `rgba(154, 205, 50, ${0.3 + Math.random() * 0.5})`, // YellowGreen
        `rgba(50, 205, 50, ${0.3 + Math.random() * 0.4})`, // LimeGreen
      ];
      
      context.strokeStyle = grassColors[Math.floor(Math.random() * grassColors.length)];
      context.lineWidth = width;
      context.lineCap = 'round';
      
      context.beginPath();
      context.moveTo(x, y);
      
      // Műfű szál görbülete
      const curvature = (Math.random() - 0.5) * 8;
      context.lineTo(x + curvature, y - length);
      context.stroke();
    }

    // Fű csomók/sűrűbb területek
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 5 + Math.random() * 15;
      
      context.fillStyle = `rgba(34, 139, 34, ${0.2 + Math.random() * 0.3})`;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.flipY = false;
    return texture;
  }

  // ÚJ v2.0.0: Fejlett fém textúra
  createAdvancedMetalTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    // Fém alapszín - galvanizált acél
    const metalGradient = context.createLinearGradient(0, 0, 512, 512);
    metalGradient.addColorStop(0, "#E8E8E8"); // Világos szürke
    metalGradient.addColorStop(0.3, "#DCDCDC"); // Gainsboro
    metalGradient.addColorStop(0.7, "#C0C0C0"); // Silver
    metalGradient.addColorStop(1, "#A9A9A9"); // DarkGray

    context.fillStyle = metalGradient;
    context.fillRect(0, 0, 512, 512);

    // Fém struktúra - csiszolt felület
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const length = 20 + Math.random() * 80;
      const angle = Math.random() * Math.PI * 2;
      
      context.globalAlpha = 0.1 + Math.random() * 0.2;
      context.strokeStyle = "#F5F5F5"; // WhiteSmoke
      context.lineWidth = 1 + Math.random() * 2;
      
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      context.stroke();
    }

    // Fém reflexiók/foltok
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 3 + Math.random() * 10;
      
      const reflectionGradient = context.createRadialGradient(x, y, 0, x, y, radius);
      reflectionGradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
      reflectionGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      
      context.fillStyle = reflectionGradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.flipY = false;
    return texture;
  }

  // ÚJ v2.0.0: Fa normal map
  createWoodNormalMap() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    // Normal map alapszín (semleges normal)
    context.fillStyle = "#8080FF"; // RGB(128, 128, 255) = neutral normal
    context.fillRect(0, 0, 512, 512);

    // Fa erezet normal detailok
    for (let i = 0; i < 20; i++) {
      context.globalAlpha = 0.3 + Math.random() * 0.4;
      
      // Normal map gradiens (Y irányú erezet)
      const gradient = context.createLinearGradient(0, Math.random() * 512, 512, Math.random() * 512);
      gradient.addColorStop(0, "#7070FF"); // Mélyebb
      gradient.addColorStop(0.5, "#9090FF"); // Magasabb
      gradient.addColorStop(1, "#7070FF"); // Mélyebb
      
      context.fillStyle = gradient;
      context.fillRect(0, i * 25, 512, 8 + Math.random() * 10);
    }

    context.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.flipY = false;
    return texture;
  }

  // ÚJ v2.0.0: Műfű normal map
  createGrassNormalMap() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    context.fillStyle = "#8080FF";
    context.fillRect(0, 0, 512, 512);

    // Fű szálak normal információ
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = 2 + Math.random() * 4;
      
      // Véletlenszerű normal irány
      const normalValue = 128 + (Math.random() - 0.5) * 60;
      context.fillStyle = `rgb(${normalValue}, ${normalValue}, 255)`;
      
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.flipY = false;
    return texture;
  }

  // ÚJ v2.0.0: Fém normal map
  createMetalNormalMap() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    context.fillStyle = "#8080FF";
    context.fillRect(0, 0, 512, 512);

    // Csiszolt fém felület normal
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512;
      const y = 0;
      const width = 2 + Math.random() * 4;
      const height = 512;
      
      const intensity = 120 + Math.random() * 16;
      context.fillStyle = `rgba(${intensity}, ${intensity}, 255, 0.3)`;
      context.fillRect(x, y, width, height);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.flipY = false;
    return texture;
  }

  // ÚJ v2.0.0: Papír normal map
  createPaperNormalMap() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    context.fillStyle = "#8080FF";
    context.fillRect(0, 0, 512, 512);

    // Papír textúra - finom szemcsés felület
    const imageData = context.getImageData(0, 0, 512, 512);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 20;
      data[i] = 128 + noise;     // R
      data[i + 1] = 128 + noise; // G
      data[i + 2] = 255;         // B (Z up)
      data[i + 3] = 255;         // A
    }

    context.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    texture.flipY = false;
    return texture;
  }

  // ÚJ v2.0.0: Fa roughness map
  createWoodRoughnessMap() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    // Fa alapvetően matt, de változó
    context.fillStyle = "#B0B0B0"; // Közepes roughness
    context.fillRect(0, 0, 512, 512);

    // Fa erezet - simább részek
    for (let i = 0; i < 15; i++) {
      context.globalAlpha = 0.4;
      context.fillStyle = "#909090"; // Simább
      context.fillRect(0, i * 34, 512, 8 + Math.random() * 12);
    }

    context.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.flipY = false;
    return texture;
  }

  // ÚJ v2.0.0: Műfű roughness map
  createGrassRoughnessMap() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    // Műfű változó roughness
    context.fillStyle = "#A0A0A0"; // Kissé matt
    context.fillRect(0, 0, 512, 512);

    // Véletlenszerű roughness variáció
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = 3 + Math.random() * 8;
      const roughness = 0.7 + Math.random() * 0.3;
      
      context.fillStyle = `rgba(${roughness * 255}, ${roughness * 255}, ${roughness * 255}, 0.5)`;
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.flipY = false;
    return texture;
  }

  // ÚJ v2.0.0: Fém roughness map
  createMetalRoughnessMap() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    // Fém - alacsony roughness (fényes)
    context.fillStyle = "#404040"; // Alacsony roughness
    context.fillRect(0, 0, 512, 512);

    // Apró karcolások - magasabb roughness
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const length = 10 + Math.random() * 30;
      const angle = Math.random() * Math.PI * 2;
      
      context.strokeStyle = "#808080"; // Magasabb roughness
      context.lineWidth = 1 + Math.random() * 2;
      
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.flipY = false;
    return texture;
  }

  // ÚJ v2.0.0: Műanyag roughness map
  createPlasticRoughnessMap() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");

    // Műanyag - egyenletes, alacsony roughness
    context.fillStyle = "#606060"; // Műanyag jellegű
    context.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.flipY = false;
    return texture;
  }

  // ÚJ v2.0.0: PBR anyagok létrehozása
  createPBRMaterials() {
    console.log("🌟 PBR anyagok létrehozása...");

    return {
      // Fa PBR anyag
      wood: new THREE.MeshPhysicalMaterial({
        color: 0xCD853F,
        map: this.textures.get('woodAdvanced'),
        normalMap: this.normalMaps.get('wood'),
        normalScale: new THREE.Vector2(0.5, 0.5),
        roughnessMap: this.roughnessMaps.get('wood'),
        roughness: 0.8,
        metalness: 0.0,
        envMapIntensity: 0.2,
        clearcoat: 0.1, // Enyhe fényezés
        clearcoatRoughness: 0.3,
      }),

      // Műfű PBR anyag
      grass: new THREE.MeshPhysicalMaterial({
        color: 0x6B8E23,
        map: this.textures.get('grassAdvanced'),
        normalMap: this.normalMaps.get('grass'),
        normalScale: new THREE.Vector2(0.3, 0.3),
        roughnessMap: this.roughnessMaps.get('grass'),
        roughness: 0.9,
        metalness: 0.0,
        envMapIntensity: 0.1,
        transmission: 0.1, // Enyhe átlátszóság
      }),

      // Galvanizált fém PBR anyag
      metal: new THREE.MeshPhysicalMaterial({
        color: 0xE8E8E8,
        map: this.textures.get('galvanizedAdvanced'),
        normalMap: this.normalMaps.get('metal'),
        normalScale: new THREE.Vector2(0.2, 0.2),
        roughnessMap: this.roughnessMaps.get('metal'),
        roughness: 0.3,
        metalness: 0.9,
        envMapIntensity: 1.0,
        clearcoat: 0.2,
        clearcoatRoughness: 0.1,
      }),

      // Műanyag PBR anyag (labda)
      plastic: new THREE.MeshPhysicalMaterial({
        color: 0xFFFFFF,
        roughnessMap: this.roughnessMaps.get('plastic'),
        roughness: 0.4,
        metalness: 0.0,
        envMapIntensity: 0.8,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
      }),

      // Rétegelt lemez PBR anyag
      plywood: new THREE.MeshPhysicalMaterial({
        color: 0xB99379,
        map: this.textures.get('woodAdvanced'),
        normalMap: this.normalMaps.get('wood'),
        normalScale: new THREE.Vector2(0.3, 0.3),
        roughnessMap: this.roughnessMaps.get('wood'),
        roughness: 0.7,
        metalness: 0.0,
        envMapIntensity: 0.3,
        clearcoat: 0.15,
        clearcoatRoughness: 0.4,
      }),
    };
  }

  // Realistic anyagok létrehozása - VÁLTOZATLAN (kompatibilitás)
  createRealisticMaterials() {
    const woodTexture = this.textures.get('wood');
    const grassTexture = this.textures.get('grass');
    const galvanizedTexture = this.textures.get('galvanized');

    return {
      plate: new THREE.MeshPhongMaterial({
        color: 0xb99379,
        shininess: 10,
        transparent: false,
      }),
      frame: new THREE.MeshPhongMaterial({
        color: 0xecc5a9,
        map: woodTexture,
        shininess: 10,
        transparent: false,
      }),
      covering: new THREE.MeshPhongMaterial({
        color: 0xa5bc49,
        map: grassTexture,
        shininess: 2,
        transparent: false,
      }),
      wall: new THREE.MeshPhongMaterial({
        color: 0xecc5a9,
        map: woodTexture,
        shininess: 10,
        transparent: false,
      }),
      leg: new THREE.MeshPhongMaterial({
        color: 0xecc5a9,
        map: woodTexture,
        shininess: 10,
        transparent: false,
      }),
      ball: new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 30,
        transparent: false,
      }),
      galvanized: new THREE.MeshPhongMaterial({
        color: 0xf0dc8e,
        map: galvanizedTexture,
        shininess: 60,
        transparent: false,
      }),
    };
  }

  // ÚJ v2.0.0: PBR anyagok lekérése
  getPBRMaterials() {
    if (!this.initialized) {
      console.warn("TextureManager nincs inicializálva, auto-init...");
      this.initialize();
    }
    return this.pbrMaterials;
  }

  // ÚJ v2.0.0: Normal map lekérése
  getNormalMap(name) {
    return this.normalMaps.get(name);
  }

  // ÚJ v2.0.0: Roughness map lekérése
  getRoughnessMap(name) {
    return this.roughnessMaps.get(name);
  }

  // Meglévő metódusok - VÁLTOZATLAN
  getTexture(name) {
    if (!this.initialized) {
      console.warn("TextureManager nincs inicializálva, auto-init...");
      this.initialize();
    }
    return this.textures.get(name);
  }

  getRealisticMaterials() {
    if (!this.initialized) {
      console.warn("TextureManager nincs inicializálva, auto-init...");
      this.initialize();
    }
    return this.realisticMaterials;
  }

  getWireframeMaterial() {
    if (!this.initialized) {
      console.warn("TextureManager nincs inicializálva, auto-init...");
      this.initialize();
    }
    return this.wireframeMaterial;
  }

  // Összes textúra objektumként - BŐVÍTETT
  getAllTextures() {
    const textureObj = {};
    this.textures.forEach((texture, name) => {
      textureObj[name] = texture;
    });
    
    // ÚJ v2.0.0: Normal és roughness maps is
    textureObj.normalMaps = {};
    this.normalMaps.forEach((texture, name) => {
      textureObj.normalMaps[name] = texture;
    });
    
    textureObj.roughnessMaps = {};
    this.roughnessMaps.forEach((texture, name) => {
      textureObj.roughnessMaps[name] = texture;
    });
    
    return textureObj;
  }

  // Wireframe anyag létrehozása - VÁLTOZATLAN
  createWireframeMaterial() {
    return new THREE.LineBasicMaterial({
      color: 0x333333,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    });
  }

  // Meglévő textúra létrehozó metódusok - VÁLTOZATLAN kompatibilitásért

  // Papír textúra létrehozása
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

  // Galvanizált textúra létrehozása - VÁLTOZATLAN
  createGalvanizedTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    const gradient = context.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, "#F5E6A3");
    gradient.addColorStop(0.3, "#F0DC8E");
    gradient.addColorStop(0.6, "#EDD179");
    gradient.addColorStop(1, "#E8C963");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const width = 20 + Math.random() * 100;
      const height = 2 + Math.random() * 8;

      const metalShades = ["#FAF0B4", "#F7EA9E", "#F3E388", "#EFDC72"];
      context.fillStyle = metalShades[Math.floor(Math.random() * metalShades.length)];
      context.globalAlpha = 0.3 + Math.random() * 0.4;
      
      context.fillRect(x, y, width, height);
    }

    context.globalAlpha = 1;
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 1 + Math.random() * 3;

      const lightSpots = ["#FFFCC8", "#FCF4A8", "#F8EC88"];
      context.fillStyle = lightSpots[Math.floor(Math.random() * lightSpots.length)];
      context.globalAlpha = 0.6 + Math.random() * 0.4;

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = 1;
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 3 + Math.random() * 8;

      context.fillStyle = `rgba(180, 190, 140, ${0.05 + Math.random() * 0.1})`;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  // Fa textúra létrehozása - VÁLTOZATLAN
  createWoodTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    context.fillStyle = "#AF815F";
    context.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 20; i++) {
      context.strokeStyle = `rgba(139, 69, 19, ${0.1 + Math.random() * 0.3})`;
      context.lineWidth = 2 + Math.random() * 4;
      context.beginPath();
      context.moveTo(0, Math.random() * 512);
      context.bezierCurveTo(
        128,
        Math.random() * 512,
        384,
        Math.random() * 512,
        512,
        Math.random() * 512
      );
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  // Műfű textúra létrehozása - VÁLTOZATLAN
  createGrassTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    context.fillStyle = "#A5BC49";
    context.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const length = 5 + Math.random() * 15;

      context.strokeStyle = `rgba(34, 139, 34, ${0.3 + Math.random() * 0.7})`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + (Math.random() - 0.5) * 4, y - length);
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
  }

  // ÚJ v2.0.0: Anyag típus alapján PBR anyag visszaadása
  getPBRMaterialByType(materialType) {
    if (!this.pbrMaterials) {
      console.warn("PBR anyagok nincsenek inicializálva");
      return null;
    }

    switch (materialType) {
      case MATERIALS.PINE_PLYWOOD:
        return this.pbrMaterials.plywood;
      case MATERIALS.PINE_SOLID:
        return this.pbrMaterials.wood;
      case MATERIALS.ARTIFICIAL_GRASS:
        return this.pbrMaterials.grass;
      case MATERIALS.WHITE_PLASTIC:
        return this.pbrMaterials.plastic;
      case MATERIALS.GALVANIZED_STEEL:
        return this.pbrMaterials.metal;
      default:
        console.warn(`Ismeretlen anyag típus: ${materialType}`);
        return this.pbrMaterials.wood; // Fallback
    }
  }

  // ÚJ v2.0.0: Textúra minőség beállítása (performance optimalizálás)
  setTextureQuality(quality = 'high') {
    const qualities = {
      low: { repeat: [1, 1], anisotropy: 1 },
      medium: { repeat: [2, 2], anisotropy: 4 },
      high: { repeat: [4, 4], anisotropy: 8 },
      ultra: { repeat: [8, 8], anisotropy: 16 }
    };

    const settings = qualities[quality] || qualities.high;

    // Összes textúra frissítése
    this.textures.forEach((texture) => {
      texture.repeat.set(...settings.repeat);
      texture.anisotropy = Math.min(settings.anisotropy, 
        this.getMaxAnisotropy());
    });

    this.normalMaps.forEach((texture) => {
      texture.repeat.set(...settings.repeat);
      texture.anisotropy = Math.min(settings.anisotropy, 
        this.getMaxAnisotropy());
    });

    this.roughnessMaps.forEach((texture) => {
      texture.repeat.set(...settings.repeat);
      texture.anisotropy = Math.min(settings.anisotropy, 
        this.getMaxAnisotropy());
    });

    console.log(`🎨 Textúra minőség beállítva: ${quality}`);
  }

  // ÚJ v2.0.0: Max anisotropy lekérés
  getMaxAnisotropy() {
    // Fallback ha nincs renderer context
    return 16;
  }

  // Debug info - BŐVÍTETT
  getStatus() {
    return {
      initialized: this.initialized,
      textureCount: this.textures.size,
      normalMapCount: this.normalMaps.size, // ÚJ
      roughnessMapCount: this.roughnessMaps.size, // ÚJ
      availableTextures: Array.from(this.textures.keys()),
      availableNormalMaps: Array.from(this.normalMaps.keys()), // ÚJ
      availableRoughnessMaps: Array.from(this.roughnessMaps.keys()), // ÚJ
      hasRealisticMaterials: !!this.realisticMaterials,
      hasPBRMaterials: !!this.pbrMaterials, // ÚJ
      hasWireframeMaterial: !!this.wireframeMaterial,
      version: "2.0.0", // ÚJ
    };
  }

  // ÚJ v2.0.0: PBR képességek ellenőrzése
  getPBRCapabilities() {
    return {
      physicalMaterials: true,
      normalMapping: true,
      roughnessMapping: true,
      metallicWorkflow: true,
      environmentMapping: true,
      clearcoat: true,
      transmission: true,
    };
  }

  // Cleanup - BŐVÍTETT
  destroy() {
    console.log("🧹 TextureManager v2.0.0 cleanup...");

    // Textúrák cleanup
    this.textures.forEach((texture) => {
      if (texture.dispose) texture.dispose();
    });
    this.textures.clear();

    // ÚJ v2.0.0: Normal maps cleanup
    this.normalMaps.forEach((texture) => {
      if (texture.dispose) texture.dispose();
    });
    this.normalMaps.clear();

    // ÚJ v2.0.0: Roughness maps cleanup
    this.roughnessMaps.forEach((texture) => {
      if (texture.dispose) texture.dispose();
    });
    this.roughnessMaps.clear();

    // Anyagok cleanup
    if (this.realisticMaterials) {
      Object.values(this.realisticMaterials).forEach((material) => {
        if (material.dispose) material.dispose();
      });
      this.realisticMaterials = null;
    }

    // ÚJ v2.0.0: PBR anyagok cleanup
    if (this.pbrMaterials) {
      Object.values(this.pbrMaterials).forEach((material) => {
        if (material.dispose) material.dispose();
      });
      this.pbrMaterials = null;
    }

    if (this.wireframeMaterial && this.wireframeMaterial.dispose) {
      this.wireframeMaterial.dispose();
      this.wireframeMaterial = null;
    }

    this.initialized = false;
    console.log("TextureManager v2.0.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.TextureManager = TextureManager;