/**
 * Lighting Manager
 * Világítás kezelése és váltása (blueprint/realistic)
 * v1.0.0 - ViewModeManager-ből kiszervezve
 */

class LightingManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.currentLightingMode = null;
    this.realisticLights = [];
    this.blueprintLights = [];
    this.shadowsEnabled = true;

    console.log("LightingManager v1.0.0 inicializálva");
  }

  // Realistic világítás beállítása
  setRealisticLighting() {
    if (this.currentLightingMode === "realistic") {
      console.log("Realistic világítás már aktív");
      return;
    }

    console.log("🔆 Realistic világítás beállítása...");

    // Meglévő fények eltávolítása
    this.clearAllLights();

    // Árnyékok engedélyezése
    this.sceneManager.renderer.shadowMap.enabled = true;
    this.sceneManager.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Ambient light - általános megvilágítás
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.sceneManager.scene.add(ambientLight);
    this.realisticLights.push(ambientLight);

    // Directional light - fő világítás árnyékokkal
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(150, 100, 50);
    directionalLight.castShadow = true;

    // Árnyék beállítások
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;

    this.sceneManager.scene.add(directionalLight);
    this.realisticLights.push(directionalLight);

    // Oldalsó fény - lágyabb megvilágítás
    const sideLight = new THREE.DirectionalLight(0xffffff, 0.9);
    sideLight.position.set(-150, 80, -50);
    this.sceneManager.scene.add(sideLight);
    this.realisticLights.push(sideLight);

    // Fill light - árnyékok kitöltése
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(0, -50, 100);
    this.sceneManager.scene.add(fillLight);
    this.realisticLights.push(fillLight);

    this.currentLightingMode = "realistic";
    console.log(`✅ Realistic világítás beállítva (${this.realisticLights.length} fény)`);
  }

  // Blueprint világítás beállítása
  setBlueprintLighting() {
    if (this.currentLightingMode === "blueprint") {
      console.log("Blueprint világítás már aktív");
      return;
    }

    console.log("🔆 Blueprint világítás beállítása...");

    // Meglévő fények eltávolítása
    this.clearAllLights();

    // Árnyékok kikapcsolása
    this.sceneManager.renderer.shadowMap.enabled = false;

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

  // Összes fény eltávolítása
  clearAllLights() {
    console.log("🧹 Meglévő fények eltávolítása...");

    // Realistic fények eltávolítása
    this.realisticLights.forEach((light) => {
      this.sceneManager.scene.remove(light);
      if (light.dispose) {
        light.dispose();
      }
    });
    this.realisticLights = [];

    // Blueprint fények eltávolítása
    this.blueprintLights.forEach((light) => {
      this.sceneManager.scene.remove(light);
      if (light.dispose) {
        light.dispose();
      }
    });
    this.blueprintLights = [];

    // Scene-ben található összes fény eltávolítása (biztonsági)
    const lightsToRemove = [];
    this.sceneManager.scene.traverse((object) => {
      if (object.isLight) {
        lightsToRemove.push(object);
      }
    });
    lightsToRemove.forEach((light) => {
      this.sceneManager.scene.remove(light);
    });

    console.log(`🗑️ ${lightsToRemove.length} fény eltávolítva`);
    this.currentLightingMode = null;
  }

  // Árnyékok be/kikapcsolása
  toggleShadows(enabled) {
    this.shadowsEnabled = enabled;
    this.sceneManager.renderer.shadowMap.enabled = enabled;

    // Realistic fények árnyék beállítása
    this.realisticLights.forEach((light) => {
      if (light.castShadow !== undefined) {
        light.castShadow = enabled;
      }
    });

    console.log(`🌑 Árnyékok: ${enabled ? 'BE' : 'KI'}`);
  }

  // Világítás intenzitás beállítása
  setLightingIntensity(intensity) {
    const clampedIntensity = Math.max(0.1, Math.min(2.0, intensity));
    
    // Aktuális fények intenzitásának módosítása
    const currentLights = this.currentLightingMode === "realistic" 
      ? this.realisticLights 
      : this.blueprintLights;

    currentLights.forEach((light) => {
      if (light.intensity !== undefined) {
        // Eredeti intenzitás arányos módosítása
        const baseIntensity = light.userData?.baseIntensity || light.intensity;
        light.userData = { ...light.userData, baseIntensity };
        light.intensity = baseIntensity * clampedIntensity;
      }
    });

    console.log(`💡 Világítás intenzitás: ${clampedIntensity.toFixed(2)}`);
  }

  // Háttérszín beállítása világítási módhoz
  setBackgroundForMode(mode) {
    switch (mode) {
      case "realistic":
        this.sceneManager.scene.background = new THREE.Color(0xf9f9f9); // Világos szürke
        break;
      case "blueprint":
        this.sceneManager.scene.background = new THREE.Color(0xffffff); // Fehér
        break;
      default:
        console.warn(`Ismeretlen világítási mód: ${mode}`);
    }
  }

  // Speciális világítás hozzáadása
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

      // Árnyék beállítások
      if (lightConfig.castShadow && light.castShadow !== undefined) {
        light.castShadow = lightConfig.castShadow;
      }

      // Hozzáadás a scene-hez és megfelelő listához
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

  // Világítási információk lekérése
  getLightingInfo() {
    return {
      currentMode: this.currentLightingMode,
      realisticLightsCount: this.realisticLights.length,
      blueprintLightsCount: this.blueprintLights.length,
      shadowsEnabled: this.shadowsEnabled,
      backgroundColor: this.sceneManager.scene.background?.getHex(),
    };
  }

  // Debug - fények listázása
  listAllLights() {
    console.log("=== VILÁGÍTÁS DEBUG ===");
    console.log(`Jelenlegi mód: ${this.currentLightingMode}`);
    console.log(`Realistic fények (${this.realisticLights.length}):`);
    this.realisticLights.forEach((light, index) => {
      console.log(`  ${index + 1}. ${light.type} - intenzitás: ${light.intensity}`);
    });
    console.log(`Blueprint fények (${this.blueprintLights.length}):`);
    this.blueprintLights.forEach((light, index) => {
      console.log(`  ${index + 1}. ${light.type} - intenzitás: ${light.intensity}`);
    });
    console.log("=====================");
  }

  // Cleanup
  destroy() {
    console.log("🧹 LightingManager cleanup...");
    
    this.clearAllLights();
    this.currentLightingMode = null;
    this.shadowsEnabled = true;
    
    console.log("LightingManager v1.0.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.LightingManager = LightingManager;