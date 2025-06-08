/**
 * Material Manager
 * Anyagok kezelése - Pure PBR Pipeline
 * v2.0.0 - Legacy support eltávolítva, egyszerűsített blueprint/realistic váltás
 */

class MaterialManager {
  constructor(textureManager) {
    this.textureManager = textureManager;
    this.originalPBRMaterials = new Map(); // Eredeti PBR material-ok mentése
    this.blueprintMaterial = null;
    this.groupMaterial = null;
    this.initialized = false;

    console.log("MaterialManager v2.0.0 - Pure PBR Simplified");
  }

  // Inicializálás
  initialize() {
    if (this.initialized) {
      console.log("MaterialManager már inicializálva");
      return;
    }

    this.createBlueprintMaterials();
    console.log("✅ MaterialManager Pure PBR inicializálva");
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

  // Shader támogatás beállítása (toon shader blueprint módhoz)
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

  // Toon shader anyagok létrehozása
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

  // Eredeti PBR anyagok mentése - JAVÍTOTT LOGIKA
  saveOriginalPBRMaterials(meshes) {
    if (!this.initialized) {
      this.initialize();
    }

    let savedCount = 0;

    meshes.forEach((mesh, elementId) => {
      // GROUP elemek kezelése
      if (mesh.userData && mesh.userData.isGroup) {
        // GROUP gyerekek material-jainak mentése
        mesh.children.forEach((childMesh, index) => {
          if (childMesh.material && childMesh.material.isMeshStandardMaterial) {
            const childKey = `${elementId}_child_${index}`;
            this.originalPBRMaterials.set(childKey, childMesh.material);
            savedCount++;
          }
        });
      } 
      // Hagyományos elemek
      else if (mesh.material && mesh.material.isMeshStandardMaterial) {
        this.originalPBRMaterials.set(elementId, mesh.material);
        savedCount++;
      }
    });

    console.log(`💾 ${savedCount} eredeti PBR anyag mentve`);
  }

  // Blueprint anyag kiválasztása elem típus szerint
  getBlueprintMaterial(elementType) {
    if (elementType === "part") {
      return this.groupMaterial; // Szürke GROUP elemekhez
    }
    return this.blueprintMaterial; // Fehér minden máshoz
  }

  // Blueprint anyagok alkalmazása
  applyBlueprintMaterials(meshes, elements) {
    let changedCount = 0;

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      const blueprintMaterial = this.getBlueprintMaterial(element.type);

      if (mesh.userData && mesh.userData.isGroup) {
        // GROUP gyerekek
        mesh.children.forEach((childMesh) => {
          if (childMesh.material) {
            childMesh.material = blueprintMaterial;
            changedCount++;
          }
        });
      } else if (mesh.material) {
        // Hagyományos elem
        mesh.material = blueprintMaterial;
        changedCount++;
      }
    });

    console.log(`🎨 Blueprint anyagok alkalmazva: ${changedCount} elem`);
  }

  // Realistic anyagok visszaállítása - EGYSZERŰSÍTETT
  restoreRealisticMaterials(meshes, elements) {
    let restoredCount = 0;
    let missingCount = 0;

    console.log("🎨 Eredeti PBR anyagok visszaállítása...");

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      if (mesh.userData && mesh.userData.isGroup) {
        // GROUP gyerekek visszaállítása
        mesh.children.forEach((childMesh, index) => {
          const childKey = `${element.id}_child_${index}`;
          const originalMaterial = this.originalPBRMaterials.get(childKey);
          
          if (originalMaterial && childMesh.material) {
            childMesh.material = originalMaterial;
            restoredCount++;
          } else {
            missingCount++;
            console.warn(`⚠️ Hiányzó eredeti material: ${childKey}`);
          }
        });
      } else {
        // Hagyományos elem visszaállítása
        const originalMaterial = this.originalPBRMaterials.get(element.id);
        
        if (originalMaterial && mesh.material) {
          mesh.material = originalMaterial;
          restoredCount++;
        } else {
          missingCount++;
          console.warn(`⚠️ Hiányzó eredeti material: ${element.id}`);
        }
      }
    });

    console.log(`✅ PBR anyagok visszaállítva: ${restoredCount} elem`);
    if (missingCount > 0) {
      console.warn(`⚠️ ${missingCount} material nem volt mentve`);
    }
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
      purePBR: true,
      legacySupport: false,
      hasBlueprintMaterials: !!(this.blueprintMaterial && this.groupMaterial),
      originalPBRMaterialsCount: this.originalPBRMaterials.size,
      supportsShade: true,
      shadeRange: [1, 10],
      materialType: 'MeshStandardMaterial (only)',
      version: '2.0.0'
    };
  }

  // PBR anyag tulajdonságok módosítása
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

  // Debug - mentett material-ok listája
  listSavedMaterials() {
    console.log("=== MENTETT PBR MATERIAL-OK ===");
    console.log(`Mentett anyagok: ${this.originalPBRMaterials.size}`);
    
    this.originalPBRMaterials.forEach((material, elementId) => {
      const maps = [];
      if (material.map) maps.push('diffuse');
      if (material.normalMap) maps.push('normal');
      if (material.roughnessMap) maps.push('roughness');
      if (material.metalnessMap) maps.push('metalness');
      if (material.aoMap) maps.push('ao');
      
      console.log(`📄 ${elementId}: [${maps.join(', ')}]`);
    });
    console.log("==============================");
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

    // Eredeti anyagok nem kell dispose-olni, mert még használhatóak
    this.originalPBRMaterials.clear();

    this.initialized = false;
    console.log("MaterialManager v2.0.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.MaterialManager = MaterialManager;