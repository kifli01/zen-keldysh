/**
 * Material Manager
 * Anyagok kezelése PBR támogatással (blueprint/realistic)
 * v1.5.0 - PBR Materials támogatás
 */

class MaterialManager {
  constructor(textureManager) {
    this.textureManager = textureManager;
    this.originalMaterials = new Map();
    this.blueprintMaterial = null;
    this.groupMaterial = null;
    this.initialized = false;
    this.usePBR = true; // ÚJ: PBR mód váltó

    console.log("MaterialManager v1.5.0 - PBR támogatással");
  }

  // Inicializálás
  initialize() {
    if (this.initialized) {
      console.log("MaterialManager már inicializálva");
      return;
    }

    this.createBlueprintMaterials();
    console.log("✅ MaterialManager PBR inicializálva");
    this.initialized = true;
  }

  // ÚJ: PBR mód váltás
  setPBRMode(enabled) {
    const oldMode = this.usePBR;
    this.usePBR = enabled;
    console.log(`PBR mód: ${enabled ? 'BE' : 'KI'} (előző: ${oldMode})`);
    return this.usePBR;
  }

  // Blueprint anyagok létrehozása - egyszerű fehér és szürke (Phong marad)
  createBlueprintMaterials() {
    this.blueprintMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });

    this.groupMaterial = new THREE.MeshBasicMaterial({
      color: 0x9e9e9e, // Világos szürke GROUP elemekhez
      side: THREE.DoubleSide,
    });

    console.log("✅ Blueprint anyagok létrehozva");
  }

  // Shader támogatás beállítása (megtartva blueprint módhoz)
  setShadersAvailable(available) {
    if (available) {
      this.createToonShaderMaterials();
      console.log("✅ Toon shader anyagok engedélyezve");
      return true;
    } else {
      console.log("❌ Shader támogatás nem elérhető");
      return false;
    }
  }

  // Toon shader anyagok létrehozása (blueprint módhoz)
  createToonShaderMaterials() {
    try {
      const vertexShader = document.getElementById("toonVertexShader")?.textContent;
      const fragmentShader = document.getElementById("toonFragmentShader")?.textContent;

      if (!vertexShader || !fragmentShader) {
        console.warn("❌ Toon shader kódok nem találhatóak");
        return false;
      }

      const commonUniforms = {
        lightDirection: { value: new THREE.Vector3(3, 1, 1).normalize() },
        paperStrength: { value: 0.0 },
      };

      this.blueprintMaterial = new THREE.ShaderMaterial({
        uniforms: {
          ...commonUniforms,
          color: { value: new THREE.Color(0xffffff) },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide,
      });

      this.groupMaterial = new THREE.ShaderMaterial({
        uniforms: {
          ...commonUniforms,
          color: { value: new THREE.Color(0x9e9e9e) },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide,
      });

      console.log("✅ Toon shader anyagok létrehozva");
      return true;
    } catch (error) {
      console.error("❌ Toon shader anyagok létrehozási hiba:", error);
      return false;
    }
  }

  // Eredeti anyagok mentése
  saveOriginalMaterials(meshes) {
    if (!this.initialized) {
      this.initialize();
    }

    meshes.forEach((mesh, elementId) => {
      if (mesh.userData && mesh.userData.isGroup) {
        return; // GROUP esetén nincs material
      }
      
      if (mesh.material) {
        this.originalMaterials.set(elementId, mesh.material.clone());
      }
    });

    console.log(`💾 ${this.originalMaterials.size} eredeti anyag mentve`);
  }

  // Blueprint anyag kiválasztása elem típus szerint
  getBlueprintMaterial(elementType) {
    if (elementType === "part") {
      return this.groupMaterial; // Szürke GROUP elemekhez
    }
    return this.blueprintMaterial; // Fehér minden máshoz
  }

  // ÚJ: Realistic anyag kiválasztása PBR támogatással
  getRealisticMaterial(elementMaterial, shade = 5) {
    try {
      // PBR anyag lekérése
      return this.textureManager.getMaterialWithShade(elementMaterial, shade, this.usePBR);
    } catch (error) {
      console.warn(`PBR anyag lekérési hiba (${elementMaterial}, shade: ${shade}):`, error);
      
      // Fallback: alapértelmezett anyagok
      const realisticMaterials = this.textureManager.getRealisticMaterials();
      switch (elementMaterial) {
        case MATERIALS.PINE_PLYWOOD:
          return realisticMaterials.plate;
        case MATERIALS.PINE_SOLID:
          return realisticMaterials.frame;
        case MATERIALS.ARTIFICIAL_GRASS:
          return realisticMaterials.covering;
        case MATERIALS.WHITE_PLASTIC:
          return realisticMaterials.ball;
        case MATERIALS.GALVANIZED_STEEL:
          return realisticMaterials.galvanized;
        default:
          return realisticMaterials.frame;
      }
    }
  }

  // Blueprint anyagok alkalmazása
  applyBlueprintMaterials(meshes, elements) {
    let changedCount = 0;

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      if (mesh.userData && mesh.userData.isGroup) {
        // GROUP gyerekek
        mesh.children.forEach((childMesh) => {
          if (childMesh.material) {
            childMesh.material = this.getBlueprintMaterial(element.type);
            changedCount++;
          }
        });
      } else if (mesh.material) {
        // Hagyományos elem
        mesh.material = this.getBlueprintMaterial(element.type);
        changedCount++;
      }
    });

    console.log(`🎨 Blueprint anyagok alkalmazva: ${changedCount} elem`);
  }

  // ÚJ: Realistic anyagok alkalmazása PBR támogatással
  applyRealisticMaterials(meshes, elements) {
    let changedCount = 0;
    let pbrCount = 0;

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      const shade = element.shade || 5;
      const material = this.getRealisticMaterial(element.material, shade);
      
      // PBR számláló
      if (material && material.isMeshStandardMaterial) {
        pbrCount++;
      }

      if (mesh.userData && mesh.userData.isGroup) {
        // GROUP gyerekek
        mesh.children.forEach((childMesh) => {
          if (childMesh.material) {
            childMesh.material = material;
            changedCount++;
          }
        });
      } else if (mesh.material) {
        // Hagyományos elem
        mesh.material = material;
        changedCount++;
      }
    });

    console.log(`🎨 Realistic anyagok alkalmazva: ${changedCount} elem (PBR: ${pbrCount}/${changedCount})`);
  }

  // Elem anyagának megváltoztatása
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

  // ÚJ: Anyag információk lekérése PBR adatokkal
  getMaterialInfo() {
    const realisticMaterials = this.textureManager.getRealisticMaterials();
    let pbrMaterialCount = 0;
    let phongMaterialCount = 0;

    if (realisticMaterials) {
      Object.values(realisticMaterials).forEach((material) => {
        if (material.isMeshStandardMaterial) {
          pbrMaterialCount++;
        } else if (material.isMeshPhongMaterial) {
          phongMaterialCount++;
        }
      });
    }

    return {
      initialized: this.initialized,
      usePBR: this.usePBR,
      hasBlueprintMaterials: !!(this.blueprintMaterial && this.groupMaterial),
      originalMaterialsCount: this.originalMaterials.size,
      pbrMaterialCount: pbrMaterialCount,
      phongMaterialCount: phongMaterialCount,
      supportsShade: true,
      shadeRange: [1, 10],
      version: '1.5.0'
    };
  }

  // ÚJ: PBR anyag tulajdonságok módosítása
  updatePBRProperties(mesh, properties = {}) {
    if (!mesh || !mesh.material || !mesh.material.isMeshStandardMaterial) {
      return false;
    }

    const material = mesh.material;
    
    if (properties.roughness !== undefined) {
      material.roughness = Math.max(0, Math.min(1, properties.roughness));
    }
    if (properties.metalness !== undefined) {
      material.metalness = Math.max(0, Math.min(1, properties.metalness));
    }
    if (properties.envMapIntensity !== undefined) {
      material.envMapIntensity = Math.max(0, properties.envMapIntensity);
    }
    
    material.needsUpdate = true;
    console.log(`🔧 PBR tulajdonságok frissítve: ${mesh.userData.elementId}`);
    return true;
  }

  // Cleanup (bővített)
  destroy() {
    // Blueprint anyagok cleanup
    if (this.blueprintMaterial && this.blueprintMaterial.dispose) {
      this.blueprintMaterial.dispose();
    }
    if (this.groupMaterial && this.groupMaterial.dispose) {
      this.groupMaterial.dispose();
    }

    // Eredeti anyagok cleanup
    this.originalMaterials.forEach((material) => {
      if (material.dispose) {
        material.dispose();
      }
    });
    this.originalMaterials.clear();

    this.initialized = false;
    console.log("MaterialManager v1.5.0 PBR cleanup kész");
  }
}

// Globális hozzáférhetőség
window.MaterialManager = MaterialManager;