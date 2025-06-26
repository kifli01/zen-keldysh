/**
 * Color Manager
 * Fa elemek színkezelése - egységes szín és colorTintStrength
 * v1.0.0 - Alapvető színváltoztatás és localStorage támogatás
 */

class ColorManager {
  constructor(textureManager, sceneManager) {
    this.textureManager = textureManager;
    this.sceneManager = sceneManager;
    
    // Alapértelmezett értékek (PINE_SOLID-ból)
    this.defaultWoodColor = 0xb6c4de;
    this.defaultColorTintStrength = 1.2;
    
    // localStorage kulcsok
    this.WOOD_COLOR_KEY = 'minigolf_wood_color';
    this.TINT_STRENGTH_KEY = 'minigolf_wood_tint_strength';
    
    // Aktuális értékek
    this.currentWoodColor = this.defaultWoodColor;
    this.currentTintStrength = this.defaultColorTintStrength;
    
    this.initialized = false;
    
    console.log("ColorManager v1.0.0 - Egységes fa színkezelés");
  }

  // Inicializálás - localStorage értékek betöltése és alkalmazása
  initialize() {
    if (this.initialized) {
      console.log("ColorManager már inicializálva");
      return;
    }

    console.log("🎨 ColorManager inicializálás...");
    
    // localStorage értékek betöltése
    const savedColor = this.loadWoodColor();
    const savedTintStrength = this.loadTintStrength();
    
    console.log(`📂 Betöltött értékek - szín: #${savedColor.toString(16)}, tint: ${savedTintStrength}`);
    
    // Értékek alkalmazása
    this.setWoodColor(savedColor, false); // false = ne mentse localStorage-ba újra
    this.setTintStrength(savedTintStrength, false);
    
    this.initialized = true;
    console.log("✅ ColorManager inicializálva");
  }

  // === FA SZÍN KEZELÉSE ===
  
  // Fa szín beállítása mindkét anyagra
  setWoodColor(hexColor, saveToStorage = true) {
    try {
      // Hex szín validálása
      const validatedColor = this.validateHexColor(hexColor);
      
      // MATERIALS objektum frissítése - mindkét fa anyag
      MATERIALS.PINE_SOLID.baseColor = validatedColor;
      MATERIALS.PINE_PLYWOOD.baseColor = validatedColor;
      
      this.currentWoodColor = validatedColor;
      
      console.log(`🎨 Fa szín beállítva: #${validatedColor.toString(16)}`);
      
      // localStorage mentés
      if (saveToStorage) {
        this.saveWoodColor(validatedColor);
      }
      
      // Mesh-ek frissítése
      this.updateAllWoodMeshes();
      
      return true;
    } catch (error) {
      console.error("❌ Fa szín beállítási hiba:", error);
      return false;
    }
  }
  
  // Aktuális fa szín lekérése
  getCurrentWoodColor() {
    return this.currentWoodColor;
  }
  
  // Fa szín visszaállítása alapértelmezettre
  resetWoodColor() {
    console.log("🔄 Fa szín visszaállítása alapértelmezettre");
    return this.setWoodColor(this.defaultWoodColor);
  }

  // === COLOR TINT STRENGTH KEZELÉSE ===
  
  // ColorTintStrength beállítása mindkét anyagra
  setTintStrength(strength, saveToStorage = true) {
    try {
      // Érték validálása (0.1 - 3.0 közötti tartomány)
      const validatedStrength = Math.max(0.1, Math.min(3.0, parseFloat(strength) || this.defaultColorTintStrength));
      
      // MATERIALS objektum frissítése - mindkét fa anyag
      MATERIALS.PINE_SOLID.colorTintStrength = validatedStrength;
      MATERIALS.PINE_PLYWOOD.colorTintStrength = validatedStrength;
      
      this.currentTintStrength = validatedStrength;
      
      console.log(`🎛️ ColorTintStrength beállítva: ${validatedStrength}`);
      
      // localStorage mentés
      if (saveToStorage) {
        this.saveTintStrength(validatedStrength);
      }
      
      // Mesh-ek frissítése
      this.updateAllWoodMeshes();
      
      return true;
    } catch (error) {
      console.error("❌ ColorTintStrength beállítási hiba:", error);
      return false;
    }
  }
  
  // Aktuális tint strength lekérése
  getCurrentTintStrength() {
    return this.currentTintStrength;
  }
  
  // Tint strength visszaállítása alapértelmezettre
  resetTintStrength() {
    console.log("🔄 ColorTintStrength visszaállítása alapértelmezettre");
    return this.setTintStrength(this.defaultColorTintStrength);
  }

  // === LOCALSTORAGE KEZELÉSE ===
  
  // Fa szín betöltése localStorage-ból
  loadWoodColor() {
    try {
      const saved = localStorage.getItem(this.WOOD_COLOR_KEY);
      if (saved) {
        const parsedColor = parseInt(saved, 16);
        if (!isNaN(parsedColor)) {
          console.log(`📂 Fa szín betöltve localStorage-ból: #${parsedColor.toString(16)}`);
          return parsedColor;
        }
      }
    } catch (error) {
      console.warn("⚠️ Fa szín localStorage betöltési hiba:", error);
    }
    
    console.log(`📂 Alapértelmezett fa szín használata: #${this.defaultWoodColor.toString(16)}`);
    return this.defaultWoodColor;
  }
  
  // Fa szín mentése localStorage-ba
  saveWoodColor(hexColor) {
    try {
      localStorage.setItem(this.WOOD_COLOR_KEY, hexColor.toString(16));
      console.log(`💾 Fa szín mentve localStorage-ba: #${hexColor.toString(16)}`);
    } catch (error) {
      console.warn("⚠️ Fa szín localStorage mentési hiba:", error);
    }
  }
  
  // ColorTintStrength betöltése localStorage-ból
  loadTintStrength() {
    try {
      const saved = localStorage.getItem(this.TINT_STRENGTH_KEY);
      if (saved) {
        const parsedStrength = parseFloat(saved);
        if (!isNaN(parsedStrength) && parsedStrength >= 0.1 && parsedStrength <= 3.0) {
          console.log(`📂 ColorTintStrength betöltve localStorage-ból: ${parsedStrength}`);
          return parsedStrength;
        }
      }
    } catch (error) {
      console.warn("⚠️ ColorTintStrength localStorage betöltési hiba:", error);
    }
    
    console.log(`📂 Alapértelmezett ColorTintStrength használata: ${this.defaultColorTintStrength}`);
    return this.defaultColorTintStrength;
  }
  
  // ColorTintStrength mentése localStorage-ba
  saveTintStrength(strength) {
    try {
      localStorage.setItem(this.TINT_STRENGTH_KEY, strength.toString());
      console.log(`💾 ColorTintStrength mentve localStorage-ba: ${strength}`);
    } catch (error) {
      console.warn("⚠️ ColorTintStrength localStorage mentési hiba:", error);
    }
  }

  // === MESH FRISSÍTÉSE ===
  
  // Összes fa mesh újragenerálása
  async updateAllWoodMeshes() {
    if (!this.sceneManager || !this.textureManager) {
      console.warn("⚠️ SceneManager vagy TextureManager nem elérhető");
      return;
    }

    console.log("🔄 Fa mesh-ek frissítése...");
    
    try {
      const meshes = this.sceneManager.getAllMeshes();
      let updatedCount = 0;
      
      for (const [elementId, mesh] of meshes) {
        // ElementManager helyett közvetlenül a mesh userData-ból szerezzük az információt
        const element = mesh.userData?.element;
        
        if (element && this.isWoodMaterial(element.materialKey)) {
          const success = await this.updateSingleWoodMesh(mesh, element);
          if (success) {
            updatedCount++;
          }
        }
      }
      
      console.log(`✅ ${updatedCount} fa mesh frissítve`);
      
      // Renderelés triggere
      if (this.sceneManager.renderer && this.sceneManager.camera) {
        this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
      }
      
    } catch (error) {
      console.error("❌ Fa mesh-ek frissítési hiba:", error);
    }
  }
  
  // Egyetlen fa mesh újragenerálása
  async updateSingleWoodMesh(mesh, element) {
    try {
      // Új material generálása frissített paraméterekkel
      const materialDef = MATERIALS[element.materialKey];
      const newMaterial = await this.textureManager.getMaterialWithShade(materialDef, element.shade);
      
      if (!newMaterial) {
        console.warn(`⚠️ Material generálás sikertelen: ${element.id}`);
        return false;
      }
      
      // GROUP elemek kezelése
      if (mesh.userData && mesh.userData.isGroup) {
        mesh.children.forEach((childMesh) => {
          if (childMesh.material) {
            // Régi material dispose
            if (childMesh.material.dispose) {
              childMesh.material.dispose();
            }
            childMesh.material = newMaterial.clone();
          }
        });
      } else {
        // Hagyományos mesh
        if (mesh.material) {
          // Régi material dispose
          if (mesh.material.dispose) {
            mesh.material.dispose();
          }
          mesh.material = newMaterial;
        }
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Mesh frissítési hiba (${element.id}):`, error);
      return false;
    }
  }

  // === SEGÉDFÜGGVÉNYEK ===
  
  // Fa anyag ellenőrzése
  isWoodMaterial(materialKey) {
    return materialKey === 'PINE_SOLID' || materialKey === 'PINE_PLYWOOD';
  }
  
  // Hex szín validálása
  validateHexColor(hexColor) {
    // Ha már szám, visszaadás
    if (typeof hexColor === 'number') {
      return Math.max(0, Math.min(0xFFFFFF, hexColor));
    }
    
    // String esetén konverzió
    if (typeof hexColor === 'string') {
      // # eltávolítása ha van
      const cleanHex = hexColor.replace('#', '');
      const parsed = parseInt(cleanHex, 16);
      
      if (!isNaN(parsed) && cleanHex.length === 6) {
        return parsed;
      }
    }
    
    // Hibás érték esetén alapértelmezett
    console.warn(`⚠️ Hibás hex szín: ${hexColor}, alapértelmezett használata`);
    return this.defaultWoodColor;
  }
  
  // Hex szín THREE.Color-rá konvertálása
  hexToThreeColor(hexColor) {
    return new THREE.Color(hexColor);
  }
  
  // THREE.Color hex string-gé konvertálása
  threeColorToHex(threeColor) {
    return parseInt(threeColor.getHexString(), 16);
  }

  // === KOMBINÁLT MŰVELETEK ===
  
  // Mindkét érték egyszerre beállítása
  setWoodProperties(hexColor, tintStrength) {
    console.log(`🎨 Fa tulajdonságok beállítása - szín: #${hexColor.toString(16)}, tint: ${tintStrength}`);
    
    const colorSuccess = this.setWoodColor(hexColor);
    const tintSuccess = this.setTintStrength(tintStrength);
    
    return colorSuccess && tintSuccess;
  }
  
  // Minden beállítás visszaállítása alapértelmezettre
  resetAllWoodProperties() {
    console.log("🔄 Összes fa tulajdonság visszaállítása");
    
    const colorSuccess = this.resetWoodColor();
    const tintSuccess = this.resetTintStrength();
    
    return colorSuccess && tintSuccess;
  }

  // === STATUS ÉS DEBUG ===
  
  // Aktuális állapot lekérése
  getStatus() {
    return {
      initialized: this.initialized,
      currentWoodColor: `#${this.currentWoodColor.toString(16)}`,
      currentTintStrength: this.currentTintStrength,
      defaultWoodColor: `#${this.defaultWoodColor.toString(16)}`,
      defaultTintStrength: this.defaultColorTintStrength,
      hasTextureManager: !!this.textureManager,
      hasSceneManager: !!this.sceneManager,
      version: '1.0.0'
    };
  }
  
  // Debug információ kiírása
  logStatus() {
    console.log("=== COLOR MANAGER STATUS ===");
    const status = this.getStatus();
    Object.entries(status).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.log("===========================");
  }
  
  // localStorage tartalom kiírása
  logStorageContents() {
    console.log("=== COLOR MANAGER LOCALSTORAGE ===");
    console.log(`${this.WOOD_COLOR_KEY}: ${localStorage.getItem(this.WOOD_COLOR_KEY)}`);
    console.log(`${this.TINT_STRENGTH_KEY}: ${localStorage.getItem(this.TINT_STRENGTH_KEY)}`);
    console.log("=================================");
  }

  // === CLEANUP ===
  
  // Cleanup és erőforrások felszabadítása
  destroy() {
    console.log("🧹 ColorManager cleanup...");
    
    this.textureManager = null;
    this.sceneManager = null;
    this.initialized = false;
    
    console.log("ColorManager v1.0.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.ColorManager = ColorManager;