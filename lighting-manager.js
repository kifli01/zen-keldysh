/**
 * Lighting Manager
 * Világítás kezelése és váltása (blueprint/realistic) + HDR környezet
 * v2.0.0 - HDR környezeti világítás és fejlett lighting
 */

class LightingManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.currentLightingMode = null;
    this.realisticLights = [];
    this.blueprintLights = [];
    this.shadowsEnabled = true;
    
    // ÚJ v2.0.0: HDR és környezeti világítás
    this.pmremGenerator = null;
    this.environmentMap = null;
    this.hdrLoaded = false;
    
    console.log("LightingManager v2.0.0 - HDR támogatással inicializálva");
    // PMREM Generator inicializálása ELTÁVOLÍTVA - lazy loading-ra váltás
  }

  // PMREM Generator inicializálása - JAVÍTOTT lazy loading
  initializePMREMGenerator() {
    // Várunk a renderer inicializálására
    if (!this.sceneManager.renderer) {
      console.log("⏳ Renderer még nem elérhető, PMREM Generator késleltetése...");
      return false;
    }

    this.pmremGenerator = new THREE.PMREMGenerator(this.sceneManager.renderer);
    this.pmremGenerator.compileEquirectangularShader();
    console.log("✅ PMREM Generator inicializálva");
    return true;
  }

  // ÚJ: Procedurális HDR sky létrehozása - JAVÍTOTT lazy loading
  createProceduralSky() {
    console.log("🌅 Procedurális HDR sky létrehozása...");
    
    // PMREM Generator ellenőrzése és inicializálása
    if (!this.pmremGenerator) {
      if (!this.initializePMREMGenerator()) {
        console.warn("❌ PMREM Generator nem inicializálható, HDR mellőzése");
        return null;
      }
    }
    const skyUniforms = {
      turbidity: { value: 2.0 },
      rayleigh: { value: 1.0 },
      mieCoefficient: { value: 0.005 },
      mieDirectionalG: { value: 0.8 },
      sunPosition: { value: new THREE.Vector3(100, 100, 50).normalize() },
      up: { value: new THREE.Vector3(0, 1, 0) }
    };

    // Sky geometry és material
    const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      vertexShader: this.getSkyVertexShader(),
      fragmentShader: this.getSkyFragmentShader(),
      side: THREE.BackSide
    });

    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    
    // Ideiglenes scene a sky rendereléshez
    const skyScene = new THREE.Scene();
    skyScene.add(skyMesh);
    
    // Environment map generálása
    this.environmentMap = this.pmremGenerator.fromScene(skyScene).texture;
    this.environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    
    // Cleanup
    skyGeometry.dispose();
    skyMaterial.dispose();
    
    this.hdrLoaded = true;
    console.log("✅ HDR environment map készen");
    
    return this.environmentMap;
  }

  // Sky vertex shader
  getSkyVertexShader() {
    return `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  // Sky fragment shader (egyszerűsített Rayleigh scattering)
  getSkyFragmentShader() {
    return `
      uniform float turbidity;
      uniform float rayleigh;
      uniform float mieCoefficient;
      uniform float mieDirectionalG;
      uniform vec3 sunPosition;
      uniform vec3 up;
      
      varying vec3 vWorldPosition;
      
      const float e = 2.71828182845904523536028747135266249775724709369995957;
      const float pi = 3.141592653589793238462643383279502884197169;
      
      // Rayleigh scattering coefficient
      const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);
      const vec3 totalRayleigh = vec3(5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5);
      
      float rayleighPhase(float cosTheta) {
        return (3.0 / (16.0 * pi)) * (1.0 + pow(cosTheta, 2.0));
      }
      
      vec3 totalMie(float T) {
        float c = (0.2 * T) * 10E-18;
        return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(0.84));
      }
      
      void main() {
        vec3 direction = normalize(vWorldPosition);
        
        // Sun direction
        vec3 sunDirection = normalize(sunPosition);
        float sunE = dot(direction, sunDirection);
        
        // Sky color calculation
        float rayleighCoefficient = rayleigh - (1.0 * (1.0 - sunE));
        vec3 betaR = totalRayleigh * rayleighCoefficient;
        
        vec3 betaM = totalMie(turbidity) * mieCoefficient;
        
        float zenithAngle = acos(max(0.0, dot(up, direction)));
        float inverse = 1.0 / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));
        float sR = rayleighCoefficient * inverse;
        float sM = mieCoefficient * inverse;
        
        vec3 Fex = exp(-(betaR * sR + betaM * sM));
        
        float cosTheta = dot(direction, sunDirection);
        float rPhase = rayleighPhase(cosTheta * 0.5 + 0.5);
        vec3 betaRTheta = betaR * rPhase;
        
        vec3 mPhase = vec3(1.0);
        vec3 betaMTheta = betaM * mPhase;
        
        vec3 Lin = pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex), vec3(1.5));
        Lin *= mix(vec3(1.0), pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * Fex, vec3(1.0 / 2.0)), clamp(pow(1.0 - dot(up, sunDirection), 5.0), 0.0, 1.0));
        
        // Tone mapping
        vec3 whiteScale = 1.0 / Fex;
        vec3 L0 = 0.1 * Fex;
        L0 = (Lin + L0) * whiteScale;
        
        // Simple tone mapping
        vec3 color = L0 * (1.0 + (L0 / (whiteScale * whiteScale))) / (1.0 + L0);
        
        // Gamma correction
        color = pow(color, vec3(1.0 / 2.2));
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;
  }

  // ÚJ: Egyszerű realistic világítás HDR nélkül (fallback)
  setSimpleRealisticLighting() {
    console.log("🔆 Egyszerű realistic világítás (HDR nélkül)...");

    // Árnyékok engedélyezése alapvető beállításokkal
    const renderer = this.sceneManager.renderer;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Egyszerű tone mapping
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Háttérszín
    this.sceneManager.scene.background = new THREE.Color(0xf0f0f0);
    this.sceneManager.scene.environment = null;

    // Főfény
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(100, 100, 50);
    sunLight.castShadow = true;
    
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -200;
    sunLight.shadow.camera.right = 200;
    sunLight.shadow.camera.top = 200;
    sunLight.shadow.camera.bottom = -200;
    
    this.sceneManager.scene.add(sunLight);
    this.realisticLights.push(sunLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.sceneManager.scene.add(ambientLight);
    this.realisticLights.push(ambientLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
    fillLight.position.set(-50, 30, -50);
    this.sceneManager.scene.add(fillLight);
    this.realisticLights.push(fillLight);

    this.currentLightingMode = "realistic";
    console.log(`✅ Egyszerű realistic világítás aktív (${this.realisticLights.length} fény)`);
  }

  // ÚJ: Fejlett realistic világítás HDR-rel - MÓDOSÍTOTT fallback-kel
  setRealisticLighting() {
    if (this.currentLightingMode === "realistic") {
      console.log("Realistic világítás már aktív");
      return;
    }

    console.log("🔆 Fejlett realistic világítás beállítása...");

    // Meglévő fények eltávolítása
    this.clearAllLights();

    // HDR környezet beállítása - JAVÍTOTT null check
    if (!this.hdrLoaded) {
      const envMap = this.createProceduralSky();
      if (!envMap) {
        console.warn("HDR sky nem hozható létre, fallback egyszerű lighting-ra");
        this.setSimpleRealisticLighting();
        return;
      }
    }
    
    // Environment map alkalmazása
    this.sceneManager.scene.environment = this.environmentMap;
    this.sceneManager.scene.background = this.environmentMap;

    // Árnyékok engedélyezése fejlett beállításokkal
    const renderer = this.sceneManager.renderer;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    
    // ÚJ: Tone mapping és color management
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Főfény - nap irányából
    const sunLight = new THREE.DirectionalLight(0xffffff, 3.0); // Erősebb intenzitás HDR-hez
    sunLight.position.set(100, 100, 50);
    sunLight.castShadow = true;
    
    // Fejlett árnyék beállítások
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 1000;
    sunLight.shadow.camera.left = -300;
    sunLight.shadow.camera.right = 300;
    sunLight.shadow.camera.top = 300;
    sunLight.shadow.camera.bottom = -300;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.normalBias = 0.02;
    
    this.sceneManager.scene.add(sunLight);
    this.realisticLights.push(sunLight);

    // Ambient light - környezeti világításhoz
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3); // Gyengébb ambient HDR mellett
    this.sceneManager.scene.add(ambientLight);
    this.realisticLights.push(ambientLight);

    // Fill light - árnyékok lágyítása
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.5); // Ég színű fill
    fillLight.position.set(-50, 30, -50);
    fillLight.castShadow = false;
    this.sceneManager.scene.add(fillLight);
    this.realisticLights.push(fillLight);

    // Rim light - kontúr világítás
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(-100, -20, 100);
    rimLight.castShadow = false;
    this.sceneManager.scene.add(rimLight);
    this.realisticLights.push(rimLight);

    this.currentLightingMode = "realistic";
    console.log(`✅ HDR realistic világítás aktív (${this.realisticLights.length} fény)`);
  }

  // Blueprint világítás beállítása - MÓDOSÍTOTT
  setBlueprintLighting() {
    if (this.currentLightingMode === "blueprint") {
      console.log("Blueprint világítás már aktív");
      return;
    }

    console.log("🔆 Blueprint világítás beállítása...");

    // Meglévő fények eltávolítása
    this.clearAllLights();

    // Environment map és background eltávolítása
    this.sceneManager.scene.environment = null;
    this.sceneManager.scene.background = new THREE.Color(0xffffff);

    // Árnyékok kikapcsolása
    this.sceneManager.renderer.shadowMap.enabled = false;
    
    // Tone mapping visszaállítása
    this.sceneManager.renderer.toneMapping = THREE.LinearToneMapping;
    this.sceneManager.renderer.toneMappingExposure = 1.0;

    // Erős ambient light - egyenletes megvilágítás
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.sceneManager.scene.add(ambientLight);
    this.blueprintLights.push(ambientLight);

    // Gyenge directional light - enyhe kontraszthoz
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight.position.set(100, 50, 50);
    directionalLight.castShadow = false;
    this.sceneManager.scene.add(directionalLight);
    this.blueprintLights.push(directionalLight);

    this.currentLightingMode = "blueprint";
    console.log(`✅ Blueprint világítás beállítva (${this.blueprintLights.length} fény)`);
  }

  // ÚJ: HDR exposure beállítása
  setExposure(exposure) {
    if (this.sceneManager.renderer.toneMapping !== THREE.LinearToneMapping) {
      this.sceneManager.renderer.toneMappingExposure = Math.max(0.1, Math.min(3.0, exposure));
      console.log(`💡 HDR exposure: ${this.sceneManager.renderer.toneMappingExposure.toFixed(2)}`);
    }
  }

  // Összes fény eltávolítása - VÁLTOZATLAN
  clearAllLights() {
    console.log("🧹 Meglévő fények eltávolítása...");

    this.realisticLights.forEach((light) => {
      this.sceneManager.scene.remove(light);
      if (light.dispose) light.dispose();
    });
    this.realisticLights = [];

    this.blueprintLights.forEach((light) => {
      this.sceneManager.scene.remove(light);
      if (light.dispose) light.dispose();
    });
    this.blueprintLights = [];

    const lightsToRemove = [];
    this.sceneManager.scene.traverse((object) => {
      if (object.isLight) lightsToRemove.push(object);
    });
    lightsToRemove.forEach((light) => {
      this.sceneManager.scene.remove(light);
    });

    console.log(`🗑️ ${lightsToRemove.length} fény eltávolítva`);
    this.currentLightingMode = null;
  }

  // Árnyékok be/kikapcsolása - VÁLTOZATLAN
  toggleShadows(enabled) {
    this.shadowsEnabled = enabled;
    this.sceneManager.renderer.shadowMap.enabled = enabled;

    this.realisticLights.forEach((light) => {
      if (light.castShadow !== undefined) {
        light.castShadow = enabled;
      }
    });

    console.log(`🌑 Árnyékok: ${enabled ? 'BE' : 'KI'}`);
  }

  // Világítás intenzitás beállítása - VÁLTOZATLAN
  setLightingIntensity(intensity) {
    const clampedIntensity = Math.max(0.1, Math.min(2.0, intensity));
    
    const currentLights = this.currentLightingMode === "realistic" 
      ? this.realisticLights 
      : this.blueprintLights;

    currentLights.forEach((light) => {
      if (light.intensity !== undefined) {
        const baseIntensity = light.userData?.baseIntensity || light.intensity;
        light.userData = { ...light.userData, baseIntensity };
        light.intensity = baseIntensity * clampedIntensity;
      }
    });

    console.log(`💡 Világítás intenzitás: ${clampedIntensity.toFixed(2)}`);
  }

  // Háttérszín beállítása világítási módhoz - MÓDOSÍTOTT
  setBackgroundForMode(mode) {
    switch (mode) {
      case "realistic":
        // HDR background vagy fallback szürke
        if (this.environmentMap) {
          this.sceneManager.scene.background = this.environmentMap;
        } else {
          this.sceneManager.scene.background = new THREE.Color(0xf0f0f0);
        }
        break;
      case "blueprint":
        this.sceneManager.scene.background = new THREE.Color(0xffffff);
        this.sceneManager.scene.environment = null;
        break;
      default:
        console.warn(`Ismeretlen világítási mód: ${mode}`);
    }
  }

  // ÚJ: HDR debug info
  getHDRInfo() {
    return {
      hdrLoaded: this.hdrLoaded,
      environmentMap: !!this.environmentMap,
      pmremGenerator: !!this.pmremGenerator,
      toneMapping: this.sceneManager.renderer.toneMapping,
      exposure: this.sceneManager.renderer.toneMappingExposure,
    };
  }

  // Világítási információk lekérése - BŐVÍTETT
  getLightingInfo() {
    return {
      currentMode: this.currentLightingMode,
      realisticLightsCount: this.realisticLights.length,
      blueprintLightsCount: this.blueprintLights.length,
      shadowsEnabled: this.shadowsEnabled,
      backgroundColor: this.sceneManager.scene.background?.getHex(),
      hdr: this.getHDRInfo(), // ÚJ
    };
  }

  // Speciális világítás hozzáadása - VÁLTOZATLAN
  addCustomLight(lightConfig) {
    try {
      let light;

      switch (lightConfig.type) {
        case "ambient":
          light = new THREE.AmbientLight(lightConfig.color, lightConfig.intensity);
          break;
        case "directional":
          light = new THREE.DirectionalLight(lightConfig.color, lightConfig.intensity);
          if (lightConfig.position) {
            light.position.set(lightConfig.position.x, lightConfig.position.y, lightConfig.position.z);
          }
          break;
        case "point":
          light = new THREE.PointLight(lightConfig.color, lightConfig.intensity, lightConfig.distance);
          if (lightConfig.position) {
            light.position.set(lightConfig.position.x, lightConfig.position.y, lightConfig.position.z);
          }
          break;
        case "spot":
          light = new THREE.SpotLight(lightConfig.color, lightConfig.intensity);
          if (lightConfig.position) {
            light.position.set(lightConfig.position.x, lightConfig.position.y, lightConfig.position.z);
          }
          break;
        default:
          console.warn(`Nem támogatott fény típus: ${lightConfig.type}`);
          return null;
      }

      if (lightConfig.castShadow && light.castShadow !== undefined) {
        light.castShadow = lightConfig.castShadow;
      }

      this.sceneManager.scene.add(light);
      
      if (this.currentLightingMode === "realistic") {
        this.realisticLights.push(light);
      } else if (this.currentLightingMode === "blueprint") {
        this.blueprintLights.push(light);
      }

      console.log(`➕ Egyedi fény hozzáadva: ${lightConfig.type}`);
      return light;
    } catch (error) {
      console.error("Egyedi fény hozzáadási hiba:", error);
      return null;
    }
  }

  // Debug - fények listázása - BŐVÍTETT
  listAllLights() {
    console.log("=== VILÁGÍTÁS DEBUG v2.0.0 ===");
    console.log(`Jelenlegi mód: ${this.currentLightingMode}`);
    console.log("HDR info:", this.getHDRInfo());
    console.log(`Realistic fények (${this.realisticLights.length}):`);
    this.realisticLights.forEach((light, index) => {
      console.log(`  ${index + 1}. ${light.type} - intenzitás: ${light.intensity}`);
    });
    console.log(`Blueprint fények (${this.blueprintLights.length}):`);
    this.blueprintLights.forEach((light, index) => {
      console.log(`  ${index + 1}. ${light.type} - intenzitás: ${light.intensity}`);
    });
    console.log("=============================");
  }

  // Cleanup - BŐVÍTETT
  destroy() {
    console.log("🧹 LightingManager v2.0.0 cleanup...");
    
    this.clearAllLights();
    
    // HDR cleanup
    if (this.environmentMap) {
      this.environmentMap.dispose();
      this.environmentMap = null;
    }
    
    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
      this.pmremGenerator = null;
    }
    
    this.currentLightingMode = null;
    this.shadowsEnabled = true;
    this.hdrLoaded = false;
    
    console.log("LightingManager v2.0.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.LightingManager = LightingManager;