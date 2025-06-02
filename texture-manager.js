/**
 * Texture Manager
 * Textúrák központi kezelése és létrehozása
 * v1.1.0 - Galvanizált fém textúra hozzáadva bigCorner-hez
 */

class TextureManager {
  constructor() {
    this.textures = new Map();
    this.realisticMaterials = null;
    this.wireframeMaterial = null;
    this.initialized = false;
    
    console.log("TextureManager v1.1.0 konstruktor");
  }

  // Összes textúra inicializálása
  initialize() {
    if (this.initialized) {
      console.log("TextureManager már inicializálva");
      return this.getAllTextures();
    }

    console.log("🎨 Textúrák és anyagok létrehozása...");
    
    this.textures.set('paper', this.createPaperTexture());
    this.textures.set('wood', this.createWoodTexture());
    this.textures.set('grass', this.createGrassTexture());
    this.textures.set('galvanized', this.createGalvanizedTexture());

    // Anyagok létrehozása textúrák alapján
    this.realisticMaterials = this.createRealisticMaterials();
    this.wireframeMaterial = this.createWireframeMaterial();

    this.initialized = true;
    console.log(`✅ ${this.textures.size} textúra és anyagok létrehozva`);
    
    return this.getAllTextures();
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

  // Papír textúra létrehozása (ViewModeManager-ből átvéve)
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

  // Galvanizált fém textúra létrehozása
  createGalvanizedTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    // Világosabb, sárgásabb alapszín - galvanizált felület
    const gradient = context.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, "#F5E6A3");    // Világos sárga-arany
    gradient.addColorStop(0.3, "#F0DC8E");  // Sárga-arany
    gradient.addColorStop(0.6, "#EDD179");  // Világos sárga
    gradient.addColorStop(1, "#E8C963");    // Arany sárga

    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    // Fém csíkok/egyenetlenségek hozzáadása - világosabb
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const width = 20 + Math.random() * 100;
      const height = 2 + Math.random() * 8;

      // Világosabb fém árnyalatok
      const metalShades = ["#FAF0B4", "#F7EA9E", "#F3E388", "#EFDC72"];
      context.fillStyle = metalShades[Math.floor(Math.random() * metalShades.length)];
      context.globalAlpha = 0.3 + Math.random() * 0.4;
      
      context.fillRect(x, y, width, height);
    }

    // Apró fém foltok/pöttyök - világosabb
    context.globalAlpha = 1;
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 1 + Math.random() * 3;

      // Világos fém pontok
      const lightSpots = ["#FFFCC8", "#FCF4A8", "#F8EC88"];
      context.fillStyle = lightSpots[Math.floor(Math.random() * lightSpots.length)];
      context.globalAlpha = 0.6 + Math.random() * 0.4;

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    // Minimális oxidációs foltok (kevesebb és halványabb)
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

  // Realistic anyagok létrehozása
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
        color: 0xf0dc8e, // Világos sárga-arany
        map: galvanizedTexture,
        shininess: 60,
        transparent: false,
      }),
    };
  }

  // Wireframe anyag létrehozása (ViewModeManager-ből átvéve)
  createWireframeMaterial() {
    return new THREE.LineBasicMaterial({
      color: 0x333333,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    });
  }

  // Fa textúra létrehozása (ViewModeManager-ből átvéve)
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

  // Műfű textúra létrehozása (ViewModeManager-ből átvéve)
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

  // Debug info
  getStatus() {
    return {
      initialized: this.initialized,
      textureCount: this.textures.size,
      availableTextures: Array.from(this.textures.keys()),
      hasRealisticMaterials: !!this.realisticMaterials,
      hasWireframeMaterial: !!this.wireframeMaterial,
    };
  }

  // Cleanup (későbbi használatra)
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
    console.log("TextureManager v1.1.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.TextureManager = TextureManager;