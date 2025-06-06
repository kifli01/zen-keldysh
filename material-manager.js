/**
 * Material Manager
 * Anyagok kezelése és váltása (blueprint/realistic) + PBR anyagok
 * v2.0.0 - PBR materials integráció és fejlett anyagkezelés
 */

class MaterialManager {
  constructor(textureManager) {
    this.textureManager = textureManager;
    this.originalMaterials = new Map();
    this.toonMaterials = null;
    this.realisticMaterials = null;
    this.pbrMaterials = null; // ÚJ v2.0.0
    this.currentMaterialMode = 'realistic'; // ÚJ v2.0.0: 'realistic', 'pbr', 'toon'
    this.initialized = false;

    console.log("MaterialManager v2.0.0 inicializálva - PBR támogatással");
  }

  // Inicializálás - BŐVÍTETT PBR támogatással
  initialize() {
    if (this.initialized) {
      console.log("MaterialManager már inicializálva");
      return;
    }

    // Textúrák és anyagok betöltése
    this.realisticMaterials = this.textureManager.getRealisticMaterials();
    this.pbrMaterials = this.textureManager.getPBRMaterials(); // ÚJ v2.0.0
    
    console.log("✅ MaterialManager v2.0.0 inicializálva");
    console.log(`   - Realistic materials: ${Object.keys(this.realisticMaterials || {}).length}`);
    console.log(`   - PBR materials: ${Object.keys(this.pbrMaterials || {}).length}`);
    
    this.initialized = true;
  }

  // ÚJ v2.0.0: Material mód váltás
  setMaterialMode(mode) {
    const validModes = ['realistic', 'pbr', 'toon'];
    if (!validModes.includes(mode)) {
      console.warn(`Érvénytelen material mód: ${mode}`);
      return false;
    }

    this.currentMaterialMode = mode;
    console.log(`🎨 Material mód váltás: ${mode}`);
    return true;
  }

  // ÚJ v2.0.0: Aktuális material mód lekérése
  getCurrentMaterialMode() {
    return this.currentMaterialMode;
  }

  // Shader támogatás beállítása - VÁLTOZATLAN
  setShadersAvailable(available) {
    if (available) {
      this.createToonShaderMaterials();
      console.log("✅ Toon shader anyagok engedélyezve");
      return true;
    } else {
      console.log("❌ Shader támogatás nem elérhető, fallback anyagok");
      this.createFallbackToonMaterials();
      return false;
    }
  }

  // Toon shader anyagok létrehozása - VÁLTOZATLAN
  createToonShaderMaterials() {
    try {
      const vertexShader = document.getElementById("toonVertexShader")?.textContent;
      const fragmentShader = document.getElementById("toonFragmentShader")?.textContent;

      if (!vertexShader || !fragmentShader) {
        console.warn("❌ Toon shader kódok nem találhatóak");
        this.createFallbackToonMaterials();
        return false;
      }

      const textures = this.textureManager.getAllTextures();

      const commonUniforms = {
        lightDirection: { value: new THREE.Vector3(3, 1, 1).normalize() },
        paperStrength: { value: 0.0 },
        paperTexture: { value: textures.paper },
      };

      this.toonMaterials = {
        default: new THREE.ShaderMaterial({
          uniforms: {
            ...commonUniforms,
            color: { value: new THREE.Color(0xffffff) },
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          side: THREE.DoubleSide,
        }),
        group: new THREE.ShaderMaterial({
          uniforms: {
            ...commonUniforms,
            color: { value: new THREE.Color(0x9e9e9e) },
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          side: THREE.DoubleSide,
        }),
      };

      console.log("✅ Toon shader anyagok létrehozva");
      return true;
    } catch (error) {
      console.error("❌ Toon shader anyagok létrehozási hiba:", error);
      this.createFallbackToonMaterials();
      return false;
    }
  }

  // Fallback toon anyagok - VÁLTOZATLAN
  createFallbackToonMaterials() {
    this.toonMaterials = {
      default: new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      }),
      group: new THREE.MeshBasicMaterial({
        color: 0x9e9e9e,
        side: THREE.DoubleSide,
      }),
    };
    console.log("✅ Fallback toon anyagok létrehozva");
  }

  // Eredeti anyagok mentése - VÁLTOZATLAN
  saveOriginalMaterials(meshes) {
    if (!this.initialized) {
      this.initialize();
    }

    meshes.forEach((mesh, elementId) => {
      if (mesh.userData && mesh.userData.isGroup) {
        return;
      }
      
      if (mesh.material) {
        this.originalMaterials.set(elementId, mesh.material.clone());
      }
    });

    console.log(`💾 ${this.originalMaterials.size} eredeti anyag mentve`);
  }

  // ÚJ v2.0.0: PBR anyag kiválasztása elem típus és anyag szerint
  getPBRMaterial(elementMaterial, elementType) {
    if (!this.pbrMaterials) {
      console.warn("PBR anyagok nincsenek inicializálva");
      return this.getRealisticMaterial(elementMaterial);
    }

    // PBR anyag kiválasztás anyag típus szerint
    const material = this.textureManager.getPBRMaterialByType(elementMaterial);
    
    if (material) {
      // ÚJ: Anyag klónozás hogy minden elem egyedi legyen
      const clonedMaterial = material.clone();
      
      // ÚJ: Element-specifikus anyag finomhangolás
      this.applyElementSpecificPBRSettings(clonedMaterial, elementType, elementMaterial);
      
      return clonedMaterial;
    }

    console.warn(`PBR anyag nem található: ${elementMaterial}, fallback realistic-ra`);
    return this.getRealisticMaterial(elementMaterial);
  }

  // ÚJ v2.0.0: Element-specifikus PBR beállítások
  applyElementSpecificPBRSettings(material, elementType, elementMaterial) {
    switch (elementType) {
      case ELEMENT_TYPES.PLATE:
        // Alaplapok - kissé kopott fa
        if (elementMaterial === MATERIALS.PINE_PLYWOOD) {
          material.roughness = 0.75;
          material.clearcoat = 0.05;
          material.envMapIntensity = 0.2;
        }
        break;

      case ELEMENT_TYPES.FRAME:
        // Váz elemek - természetes fa
        if (elementMaterial === MATERIALS.PINE_SOLID) {
          material.roughness = 0.8;
          material.clearcoat = 0.1;
          material.envMapIntensity = 0.25;
        }
        break;

      case ELEMENT_TYPES.COVERING:
        // Műfű - természetes textúra
        if (elementMaterial === MATERIALS.ARTIFICIAL_GRASS) {
          material.roughness = 0.9;
          material.transmission = 0.1;
          material.envMapIntensity = 0.1;
        }
        break;

      case ELEMENT_TYPES.WALL:
        // Falak - fa anyag
        if (elementMaterial === MATERIALS.PINE_SOLID) {
          material.roughness = 0.85;
          material.clearcoat = 0.08;
          material.envMapIntensity = 0.2;
        }
        break;

      case ELEMENT_TYPES.LEG:
        // Lábak - sima fa
        if (elementMaterial === MATERIALS.PINE_SOLID) {
          material.roughness = 0.7;
          material.clearcoat = 0.15;
          material.envMapIntensity = 0.3;
        }
        break;

      case ELEMENT_TYPES.BALL:
        // Labda - fényes műanyag
        if (elementMaterial === MATERIALS.WHITE_PLASTIC) {
          material.roughness = 0.3;
          material.clearcoat = 0.4;
          material.clearcoatRoughness = 0.1;
          material.envMapIntensity = 0.9;
        }
        break;

      case ELEMENT_TYPES.PART:
        // Alkatrészek - fém anyagok
        if (elementMaterial === MATERIALS.GALVANIZED_STEEL) {
          material.roughness = 0.25;
          material.metalness = 0.95;
          material.clearcoat = 0.3;
          material.envMapIntensity = 1.2;
        }
        break;
    }

    // ÚJ: Környezeti reflexiók beállítása az anyag típusa szerint
    this.applyEnvironmentMapping(material, elementMaterial);
  }

  // ÚJ v2.0.0: Környezeti reflexiók beállítása
  applyEnvironmentMapping(material, elementMaterial) {
    // Csak PBR anyagoknál van environment mapping
    if (!material.envMapIntensity === undefined) return;

    switch (elementMaterial) {
      case MATERIALS.GALVANIZED_STEEL:
        // Fém - erős reflexiók
        material.envMapIntensity = 1.2;
        break;
      case MATERIALS.WHITE_PLASTIC:
        // Műanyag - közepes reflexiók
        material.envMapIntensity = 0.8;
        break;
      case MATERIALS.PINE_SOLID:
      case MATERIALS.PINE_PLYWOOD:
        // Fa - gyenge reflexiók
        material.envMapIntensity = 0.2;
        break;
      case MATERIALS.ARTIFICIAL_GRASS:
        // Műfű - minimális reflexiók
        material.envMapIntensity = 0.1;
        break;
    }
  }

  // Blueprint anyag kiválasztása - MÓDOSÍTOTT mód figyelembe vétele
  getBlueprintMaterial(elementType) {
    if (!this.toonMaterials) {
      console.warn("Toon anyagok nincsenek inicializálva");
      return this.createFallbackMaterial(0xffffff);
    }

    if (elementType === "part") {
      return this.toonMaterials.group;
    }
    return this.toonMaterials.default;
  }

  // Realistic anyag kiválasztása - MÓDOSÍTOTT mód figyelembe vétele
  getRealisticMaterial(elementMaterial) {
    // ÚJ v2.0.0: PBR mód esetén PBR anyagot ad vissza
    if (this.currentMaterialMode === 'pbr') {
      return this.getPBRMaterial(elementMaterial, null);
    }

    if (!this.realisticMaterials) {
      console.warn("Realistic anyagok nincsenek betöltve");
      return this.createFallbackMaterial(0x808080);
    }

    switch (elementMaterial) {
      case MATERIALS.PINE_PLYWOOD:
        return this.realisticMaterials.plate;
      case MATERIALS.PINE_SOLID:
        return this.realisticMaterials.frame;
      case MATERIALS.ARTIFICIAL_GRASS:
        return this.realisticMaterials.covering;
      case MATERIALS.WHITE_PLASTIC:
        return this.realisticMaterials.ball;
      case MATERIALS.GALVANIZED_STEEL:
        return this.realisticMaterials.galvanized;
      default:
        return this.realisticMaterials.frame;
    }
  }

  // Fallback anyag létrehozása - VÁLTOZATLAN
  createFallbackMaterial(color) {
    return new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
    });
  }

  // ÚJ v2.0.0: Anyag kiválasztás aktuális mód szerint
  getMaterialByMode(elementMaterial, elementType) {
    switch (this.currentMaterialMode) {
      case 'pbr':
        return this.getPBRMaterial(elementMaterial, elementType);
      case 'realistic':
        return this.getRealisticMaterial(elementMaterial);
      case 'toon':
        return this.getBlueprintMaterial(elementType);
      default:
        console.warn(`Ismeretlen material mód: ${this.currentMaterialMode}`);
        return this.getRealisticMaterial(elementMaterial);
    }
  }

  // Mesh anyagok váltása blueprint módra - VÁLTOZATLAN
  applyBlueprintMaterials(meshes, elements) {
    let changedCount = 0;

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      if (mesh.userData && mesh.userData.isGroup) {
        mesh.children.forEach((childMesh) => {
          if (childMesh.material) {
            const material = this.getBlueprintMaterial(element.type);
            childMesh.material = material;
            changedCount++;
          }
        });
        return;
      }

      if (mesh.material) {
        const material = this.getBlueprintMaterial(element.type);
        mesh.material = material;
        changedCount++;
      }
    });

    console.log(`🎨 Blueprint anyagok alkalmazva: ${changedCount} elem`);
  }

  // Mesh anyagok váltása realistic módra - MÓDOSÍTOTT PBR támogatással
  applyRealisticMaterials(meshes, elements) {
    let changedCount = 0;

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      if (mesh.userData && mesh.userData.isGroup) {
        mesh.children.forEach((childMesh) => {
          if (childMesh.material) {
            // ÚJ: Aktuális mód szerinti anyag kiválasztás
            const material = this.getMaterialByMode(element.material, element.type);
            childMesh.material = material;
            changedCount++;
          }
        });
        return;
      }

      if (mesh.material) {
        // ÚJ: Aktuális mód szerinti anyag kiválasztás
        const material = this.getMaterialByMode(element.material, element.type);
        mesh.material = material;
        changedCount++;
      }
    });

    const modeText = this.currentMaterialMode === 'pbr' ? 'PBR' : 'Realistic';
    console.log(`🎨 ${modeText} anyagok alkalmazva: ${changedCount} elem`);
  }

  // ÚJ v2.0.0: PBR anyagok alkalmazása (explicit PBR mód váltás)
  applyPBRMaterials(meshes, elements) {
    console.log("🌟 PBR anyagok alkalmazása...");
    
    // Mód váltás PBR-re
    const previousMode = this.currentMaterialMode;
    this.setMaterialMode('pbr');
    
    // Realistic materials alkalmazása (ami most PBR anyagokat fog használni)
    this.applyRealisticMaterials(meshes, elements);
    
    console.log(`✅ PBR anyagok alkalmazva (előző mód: ${previousMode})`);
  }

  // ÚJ v2.0.0: Anyag mód váltás meglévő mesh-eken
  switchMaterialMode(meshes, elements, newMode) {
    if (!this.setMaterialMode(newMode)) {
      return false;
    }

    // Újra alkalmazás az új móddal
    this.applyRealisticMaterials(meshes, elements);
    return true;
  }

  // Eredeti anyagok visszaállítása - VÁLTOZATLAN
  restoreOriginalMaterials(meshes) {
    let restoredCount = 0;

    this.originalMaterials.forEach((originalMaterial, elementId) => {
      const mesh = meshes.get(elementId);
      if (mesh && mesh.material) {
        mesh.material = originalMaterial.clone();
        restoredCount++;
      }
    });

    console.log(`🔄 Eredeti anyagok visszaállítva: ${restoredCount} elem`);
  }

  // Egy elem anyagának megváltoztatása - BŐVÍTETT
  setElementMaterial(mesh, material) {
    if (!mesh) return false;

    if (mesh.userData && mesh.userData.isGroup) {
      mesh.children.forEach((childMesh) => {
        if (childMesh.material) {
          childMesh.material = material;
        }
      });
      return true;
    } else if (mesh.material) {
      mesh.material = material;
      return true;
    }

    return false;
  }

  // ÚJ v2.0.0: Anyag tulajdonságok dinamikus módosítása
  updateMaterialProperty(meshes, elementId, property, value) {
    const mesh = meshes.get(elementId);
    if (!mesh || !mesh.material) return false;

    try {
      if (mesh.userData && mesh.userData.isGroup) {
        mesh.children.forEach((childMesh) => {
          if (childMesh.material && childMesh.material[property] !== undefined) {
            childMesh.material[property] = value;
            childMesh.material.needsUpdate = true;
          }
        });
      } else {
        if (mesh.material[property] !== undefined) {
          mesh.material[property] = value;
          mesh.material.needsUpdate = true;
        }
      }

      console.log(`🔧 ${elementId} anyag tulajdonság frissítve: ${property} = ${value}`);
      return true;
    } catch (error) {
      console.error(`Anyag tulajdonság frissítési hiba:`, error);
      return false;
    }
  }

  // ÚJ v2.0.0: Globális anyag tulajdonság beállítása (pl. roughness minden PBR anyagon)
  setGlobalPBRProperty(property, value) {
    if (!this.pbrMaterials) return;

    Object.values(this.pbrMaterials).forEach((material) => {
      if (material[property] !== undefined) {
        material[property] = value;
        material.needsUpdate = true;
      }
    });

    console.log(`🌍 Globális PBR tulajdonság beállítva: ${property} = ${value}`);
  }

  // Anyag információk lekérése - BŐVÍTETT
  getMaterialInfo() {
    return {
      initialized: this.initialized,
      currentMode: this.currentMaterialMode, // ÚJ
      hasToonMaterials: !!this.toonMaterials,
      hasRealisticMaterials: !!this.realisticMaterials,
      hasPBRMaterials: !!this.pbrMaterials, // ÚJ
      originalMaterialsCount: this.originalMaterials.size,
      toonMaterialTypes: this.toonMaterials ? Object.keys(this.toonMaterials) : [],
      realisticMaterialTypes: this.realisticMaterials ? Object.keys(this.realisticMaterials) : [],
      pbrMaterialTypes: this.pbrMaterials ? Object.keys(this.pbrMaterials) : [], // ÚJ
      pbrCapabilities: this.textureManager?.getPBRCapabilities(), // ÚJ
      version: "2.0.0", // ÚJ
    };
  }

  // ÚJ v2.0.0: PBR debugging
  logPBRMaterials() {
    if (!this.pbrMaterials) {
      console.log("❌ PBR anyagok nem elérhetőek");
      return;
    }

    console.log("=== PBR ANYAGOK DEBUG v2.0.0 ===");
    Object.entries(this.pbrMaterials).forEach(([name, material]) => {
      console.log(`${name}:`, {
        roughness: material.roughness,
        metalness: material.metalness,
        envMapIntensity: material.envMapIntensity,
        clearcoat: material.clearcoat,
        transmission: material.transmission,
      });
    });
    console.log("==============================");
  }

  // Cleanup - BŐVÍTETT
  destroy() {
    console.log("🧹 MaterialManager v2.0.0 cleanup...");

    // Toon anyagok cleanup
    if (this.toonMaterials) {
      Object.values(this.toonMaterials).forEach((material) => {
        if (material.dispose) material.dispose();
      });
      this.toonMaterials = null;
    }

    // ÚJ v2.0.0: PBR anyagok cleanup (TextureManager-ben vannak, csak referenciát nullázzuk)
    this.pbrMaterials = null;

    // Eredeti anyagok cleanup
    this.originalMaterials.forEach((material) => {
      if (material.dispose) material.dispose();
    });
    this.originalMaterials.clear();

    this.currentMaterialMode = 'realistic';
    this.initialized = false;
    console.log("MaterialManager v2.0.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.MaterialManager = MaterialManager;