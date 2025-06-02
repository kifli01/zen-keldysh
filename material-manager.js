/**
 * Material Manager
 * Anyagok kezelése és váltása (blueprint/realistic)
 * v1.1.0 - Galvanizált fém anyag hozzáadva bigCorner-hez
 */

class MaterialManager {
  constructor(textureManager) {
    this.textureManager = textureManager;
    this.originalMaterials = new Map();
    this.toonMaterials = null;
    this.realisticMaterials = null;
    this.initialized = false;

    console.log("MaterialManager v1.1.0 inicializálva");
  }

  // Inicializálás - anyagok előkészítése
  initialize() {
    if (this.initialized) {
      console.log("MaterialManager már inicializálva");
      return;
    }

    // Realistic anyagok betöltése TextureManager-ből
    this.realisticMaterials = this.textureManager.getRealisticMaterials();
    
    console.log("✅ MaterialManager inicializálva");
    this.initialized = true;
  }

  // Shader támogatás beállítása és toon anyagok létrehozása
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

  // Toon shader anyagok létrehozása
  createToonShaderMaterials() {
    try {
      // Shader kódok lekérése DOM-ból
      const vertexShader = document.getElementById("toonVertexShader")?.textContent;
      const fragmentShader = document.getElementById("toonFragmentShader")?.textContent;

      if (!vertexShader || !fragmentShader) {
        console.warn("❌ Toon shader kódok nem találhatóak");
        this.createFallbackToonMaterials();
        return false;
      }

      // Textúrák lekérése
      const textures = this.textureManager.getAllTextures();

      // Közös shader uniforms
      const commonUniforms = {
        lightDirection: { value: new THREE.Vector3(3, 1, 1).normalize() },
        paperStrength: { value: 0.0 },
        paperTexture: { value: textures.paper },
      };

      // Toon anyagok létrehozása
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
        // Szürke anyag GROUP elemekhez
        group: new THREE.ShaderMaterial({
          uniforms: {
            ...commonUniforms,
            color: { value: new THREE.Color(0x9e9e9e) }, // Világos szürke
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          side: THREE.DoubleSide,
        }),
      };

      console.log("✅ Toon shader anyagok létrehozva (fehér + szürke GROUP)");
      return true;
    } catch (error) {
      console.error("❌ Toon shader anyagok létrehozási hiba:", error);
      this.createFallbackToonMaterials();
      return false;
    }
  }

  // Fallback toon anyagok (ha nincs shader támogatás)
  createFallbackToonMaterials() {
    this.toonMaterials = {
      default: new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      }),
      group: new THREE.MeshBasicMaterial({
        color: 0x9e9e9e, // Világos szürke
        side: THREE.DoubleSide,
      }),
    };
    console.log("✅ Fallback toon anyagok létrehozva");
  }

  // Eredeti anyagok mentése
  saveOriginalMaterials(meshes) {
    if (!this.initialized) {
      this.initialize();
    }

    meshes.forEach((mesh, elementId) => {
      // GROUP esetén nem mentünk material-t (nincs is)
      if (mesh.userData && mesh.userData.isGroup) {
        return;
      }
      
      // Csak ha van material
      if (mesh.material) {
        this.originalMaterials.set(elementId, mesh.material.clone());
      }
    });

    console.log(`💾 ${this.originalMaterials.size} eredeti anyag mentve`);
  }

  // Blueprint anyag kiválasztása elem típus szerint
  getBlueprintMaterial(elementType) {
    if (!this.toonMaterials) {
      console.warn("Toon anyagok nincsenek inicializálva");
      return this.createFallbackMaterial(0xffffff);
    }

    if (elementType === "part") {
      return this.toonMaterials.group; // Szürke GROUP elemekhez
    }
    return this.toonMaterials.default; // Fehér minden máshoz
  }

  // Realistic anyag kiválasztása elem típus szerint
  getRealisticMaterial(elementMaterial) {
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
        return this.realisticMaterials.galvanized; // Galvanizált fém bigCorner-hez
      default:
        return this.realisticMaterials.frame; // Fallback
    }
  }

  // Fallback anyag létrehozása
  createFallbackMaterial(color) {
    return new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
    });
  }

  // Mesh anyagok váltása blueprint módra
  applyBlueprintMaterials(meshes, elements) {
    let changedCount = 0;

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      // GROUP esetén a gyerek elemeket is át kell állítani
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

      // Hagyományos elem
      if (mesh.material) {
        const material = this.getBlueprintMaterial(element.type);
        mesh.material = material;
        changedCount++;
      }
    });

    console.log(`🎨 Blueprint anyagok alkalmazva: ${changedCount} elem`);
  }

  // Mesh anyagok váltása realistic módra
  applyRealisticMaterials(meshes, elements) {
    let changedCount = 0;

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      // GROUP esetén a gyerek elemeket is át kell állítani
      if (mesh.userData && mesh.userData.isGroup) {
        mesh.children.forEach((childMesh) => {
          if (childMesh.material) {
            const material = this.getRealisticMaterial(element.material);
            childMesh.material = material;
            changedCount++;
          }
        });
        return;
      }

      // Hagyományos elem
      if (mesh.material) {
        const material = this.getRealisticMaterial(element.material);
        mesh.material = material;
        changedCount++;
      }
    });

    console.log(`🎨 Realistic anyagok alkalmazva: ${changedCount} elem`);
  }

  // Eredeti anyagok visszaállítása
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

  // Egy elem anyagának megváltoztatása
  setElementMaterial(mesh, material) {
    if (!mesh) return false;

    if (mesh.userData && mesh.userData.isGroup) {
      // GROUP gyerekek anyagának változtatása
      mesh.children.forEach((childMesh) => {
        if (childMesh.material) {
          childMesh.material = material;
        }
      });
      return true;
    } else if (mesh.material) {
      // Hagyományos elem
      mesh.material = material;
      return true;
    }

    return false;
  }

  // Anyag információk lekérése debug célra
  getMaterialInfo() {
    return {
      initialized: this.initialized,
      hasToonMaterials: !!this.toonMaterials,
      hasRealisticMaterials: !!this.realisticMaterials,
      originalMaterialsCount: this.originalMaterials.size,
      toonMaterialTypes: this.toonMaterials ? Object.keys(this.toonMaterials) : [],
      realisticMaterialTypes: this.realisticMaterials ? Object.keys(this.realisticMaterials) : [],
    };
  }

  // Cleanup
  destroy() {
    // Toon anyagok cleanup
    if (this.toonMaterials) {
      Object.values(this.toonMaterials).forEach((material) => {
        if (material.dispose) {
          material.dispose();
        }
      });
      this.toonMaterials = null;
    }

    // Eredeti anyagok cleanup
    this.originalMaterials.forEach((material) => {
      if (material.dispose) {
        material.dispose();
      }
    });
    this.originalMaterials.clear();

    this.initialized = false;
    console.log("MaterialManager v1.1.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.MaterialManager = MaterialManager;