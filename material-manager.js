/**
 * Material Manager
 * Anyagok kezelése és váltása (blueprint/realistic)
 * v1.4.0 - Egyszerűsített, felesleges részek eltávolítva
 */

class MaterialManager {
  constructor(textureManager) {
    this.textureManager = textureManager;
    this.originalMaterials = new Map();
    this.blueprintMaterial = null;
    this.groupMaterial = null;
    this.initialized = false;

    console.log("MaterialManager v1.4.0 - egyszerűsített");
  }

  // Inicializálás
  initialize() {
    if (this.initialized) {
      console.log("MaterialManager már inicializálva");
      return;
    }

    this.createBlueprintMaterials();
    console.log("✅ MaterialManager inicializálva");
    this.initialized = true;
  }

  // Blueprint anyagok létrehozása - egyszerű fehér és szürke
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

  // Shader támogatás beállítása (egyszerűsített)
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

  // Toon shader anyagok létrehozása (egyszerűsített)
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

  // Eredeti anyagok mentése (csak ha szükséges)
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

  // Realistic anyag kiválasztása shade támogatással
  getRealisticMaterial(elementMaterial, shade = 5) {
    try {
      return this.textureManager.getMaterialWithShade(elementMaterial, shade);
    } catch (error) {
      console.warn(`Anyag lekérési hiba (${elementMaterial}, shade: ${shade}):`, error);
      
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

  // Realistic anyagok alkalmazása shade támogatással
  applyRealisticMaterials(meshes, elements) {
    let changedCount = 0;

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      const shade = element.shade || 5;
      const material = this.getRealisticMaterial(element.material, shade);

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

    console.log(`🎨 Realistic anyagok alkalmazva: ${changedCount} elem`);
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

  // Anyag információk lekérése
  getMaterialInfo() {
    return {
      initialized: this.initialized,
      hasBlueprintMaterials: !!(this.blueprintMaterial && this.groupMaterial),
      originalMaterialsCount: this.originalMaterials.size,
      supportsShade: true,
      shadeRange: [1, 10],
      version: '1.4.0'
    };
  }

  // Cleanup
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
    console.log("MaterialManager v1.4.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.MaterialManager = MaterialManager;