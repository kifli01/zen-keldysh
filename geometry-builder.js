/**
 * Geometry Builder
 * THREE.js geometriák és mesh-ek létrehozása elem definíciók alapján
 * v1.9.0 - Async PBR Materials és Normal Maps integráció
 */

class GeometryBuilder {
  constructor() {
    this.csgManager = null; // CSG Manager referencia
    this.textureManager = null; // TextureManager referencia
    this.materialCache = new Map(); // Material cache async materials-hoz
  }

  // CSG Manager beállítása
  setCSGManager(csgManager) {
    this.csgManager = csgManager;
    console.log("CSG Manager beállítva a GeometryBuilder-ben");
  }

  // ÚJ v1.9.0: TextureManager beállítása
  setTextureManager(textureManager) {
    this.textureManager = textureManager;
    console.log("✅ TextureManager beállítva a GeometryBuilder-ben");
  }

  // ÚJ v1.9.0: Async PBR material létrehozása BIZTONSÁGOS cache-eléssel
  async createMaterial(materialDef, shade = 5, elementId = 'unknown') {
    // Null check
    if (!materialDef) {
      console.error(`❌ MaterialDef is null for element: ${elementId}`);
      return this.createEmergencyMaterial();
    }

    // Cache kulcs generálása
    const cacheKey = `${materialDef.name || 'unknown'}_shade_${shade}`;
    
    // Cache ellenőrzés
    if (this.materialCache.has(cacheKey)) {
      const cachedMaterial = this.materialCache.get(cacheKey);
      if (cachedMaterial) {
        console.log(`📦 Material cache hit: ${cacheKey}`);
        return cachedMaterial.clone();
      } else {
        console.warn(`⚠️ Cached material is null: ${cacheKey}`);
        this.materialCache.delete(cacheKey);
      }
    }

    // TextureManager használata ha elérhető
    if (this.textureManager && materialDef.enablePBR) {
      try {
        console.log(`🎨 Async PBR Material létrehozása: ${materialDef.name} (${elementId})`);
        
        const pbrMaterial = await this.textureManager.getMaterialWithShade(
          materialDef, 
          shade, 
          true // PBR enabled
        );
        
        // NULL CHECK!
        if (!pbrMaterial) {
          console.error(`❌ TextureManager returned null material for: ${materialDef.name}`);
          throw new Error('TextureManager returned null');
        }
        
        // Cache-be mentés
        this.materialCache.set(cacheKey, pbrMaterial);
        
        console.log(`✅ PBR Material kész: ${materialDef.name}, shade: ${shade}, maps: [${this.getPBRMapList(pbrMaterial)}]`);
        
        return pbrMaterial.clone();
      } catch (error) {
        console.warn(`⚠️ PBR Material hiba (${materialDef.name}), fallback:`, error);
        // Fallback legacy material-ra
      }
    }
    
    // Fallback: Régi rendszerű PBR material TextureManager nélkül
    console.log(`🔄 Fallback PBR Material: ${materialDef.name}`);
    const fallbackMaterial = this.createFallbackPBRMaterial(materialDef, shade);
    
    // NULL CHECK fallback-re is!
    if (!fallbackMaterial) {
      console.error(`❌ Fallback material is also null for: ${materialDef.name}`);
      return this.createEmergencyMaterial();
    }
    
    // Cache-be mentés
    this.materialCache.set(cacheKey, fallbackMaterial);
    
    return fallbackMaterial.clone();
  }

  // ÚJ: Emergency material null esetére
  createEmergencyMaterial() {
    console.log(`🚨 Emergency material létrehozása`);
    return new THREE.MeshStandardMaterial({
      color: 0xff0000, // Piros - hiba jelzéshez
      roughness: 0.5,
      metalness: 0.0,
    });
  }

  // ÚJ v1.9.0: PBR map lista debug-hoz
  getPBRMapList(material) {
    const maps = [];
    if (material.map) maps.push('diffuse');
    if (material.normalMap) maps.push('normal');
    if (material.roughnessMap) maps.push('roughness');
    if (material.metalnessMap) maps.push('metalness');
    if (material.aoMap) maps.push('ao');
    return maps.join(', ') || 'none';
  }

  // ÚJ v1.9.0: Fallback PBR material (TextureManager nélkül)
  createFallbackPBRMaterial(materialDef, shade = 5) {
    const normalizedShade = Math.max(1, Math.min(10, shade));
    
    // PBR értékek számítása shade alapján
    const brightness = 0.3 + (normalizedShade - 1) * (1.2 / 9);
    const roughness = (materialDef.roughnessBase || 0.5) + (10 - normalizedShade) * 0.05;
    const metalness = materialDef.metalnessBase || 0.0;
    
    // Színszámítás
    const baseColor = new THREE.Color(materialDef.baseColor || materialDef.color);
    baseColor.multiplyScalar(brightness);
    
    // Alapvető PBR Material
    const material = new THREE.MeshStandardMaterial({
      color: baseColor.getHex(),
      roughness: Math.max(0, Math.min(1, roughness)),
      metalness: Math.max(0, Math.min(1, metalness)),
      envMapIntensity: materialDef.envMapIntensity || 1.0,
    });
    
    console.log(`🎨 Fallback PBR: ${materialDef.name}, roughness: ${roughness.toFixed(2)}, metalness: ${metalness.toFixed(2)}`);
    
    return material;
  }

  // THREE.js geometria létrehozása elem alapján (változatlan)
  createGeometry(element) {
    const geom = element.geometry;

    // CSG műveletek ellenőrzése
    if (this.csgManager && (geom.holes || geom.csgOperations)) {
      return this.createCSGGeometry(element);
    }

    // Hagyományos geometria létrehozás
    return this.createStandardGeometry(element);
  }

  // CSG geometria létrehozása (változatlan)
  createCSGGeometry(element) {
    const geom = element.geometry;
    const baseGeometry = this.createStandardGeometry(element);

    let csgOperations = [];

    // Lyukak konvertálása CSG műveletekre
    if (geom.holes) {
      const holeOperations = this.csgManager.convertHolesToCSGOperations(geom.holes);
      csgOperations = csgOperations.concat(holeOperations);
    }

    // Direkt CSG műveletek
    if (geom.csgOperations) {
      csgOperations = csgOperations.concat(geom.csgOperations);
    }

    // CSG műveletek végrehajtása
    if (csgOperations.length > 0) {
      const positionedOperations = csgOperations.map((operation) => ({
        ...operation,
        params: {
          ...operation.params,
          position: operation.position,
        },
      }));

      return this.csgManager.createCSGGeometry(baseGeometry, positionedOperations);
    }

    return baseGeometry;
  }

  // Hagyományos geometria létrehozása (változatlan)
  createStandardGeometry(element) {
    const geom = element.geometry;
    const dim = geom.dimensions;

    switch (geom.type) {
      case GEOMETRY_TYPES.BOX:
        return new THREE.BoxGeometry(dim.length, dim.height, dim.width);

      case GEOMETRY_TYPES.CYLINDER:
        const radius = dim.radius || dim.diameter / 2;
        const segments = dim.segments || 16;
        
        if (dim.topRadius !== undefined && dim.bottomRadius !== undefined) {
          return new THREE.CylinderGeometry(dim.topRadius, dim.bottomRadius, dim.height, segments);
        } else {
          return new THREE.CylinderGeometry(radius, radius, dim.height, segments);
        }

      case GEOMETRY_TYPES.SPHERE:
        const sphereRadius = dim.radius || dim.diameter / 2;
        return new THREE.SphereGeometry(sphereRadius, 16, 12);

      case GEOMETRY_TYPES.GROUP:
        return this.createGroupGeometry(element);

      default:
        console.warn(`Ismeretlen geometria típus: ${geom.type}`);
        return new THREE.BoxGeometry(dim.length, dim.height, dim.width);
    }
  }

  // ÚJ v1.9.0: GROUP geometria létrehozása async materials-kal
  async createGroupGeometry(element) {
    const group = new THREE.Group();
    
    if (element.geometry.elements) {
      // Async material creation a gyerek elemekhez
      for (let i = 0; i < element.geometry.elements.length; i++) {
        const childElement = element.geometry.elements[i];
        
        const fullChildElement = {
          geometry: childElement.geometry,
          material: element.material,
          shade: element.shade || 5,
        };
        
        const childGeometry = this.createGeometry(fullChildElement);
        
        // ÚJ: Async PBR material gyerek elemekhez
        const childMaterial = await this.createMaterial(
          element.material, 
          element.shade || 5,
          `${element.id}_child_${i}`
        );
        
        const childMesh = new THREE.Mesh(childGeometry, childMaterial);
        
        // Bővített metadata
        childMesh.userData = {
          elementId: `${element.id}_child_${i}`,
          elementName: childElement.name || `Gyerek elem`,
          elementType: element.type,
          parentId: element.id,
          isChildElement: true,
          shade: element.shade || 5,
          materialType: childMaterial.isMeshStandardMaterial ? 'PBR' : 'Legacy',
          roughness: childMaterial.roughness,
          metalness: childMaterial.metalness,
          // ÚJ: PBR map metadata
          hasDiffuseMap: !!childMaterial.map,
          hasNormalMap: !!childMaterial.normalMap,
          hasRoughnessMap: !!childMaterial.roughnessMap,
          hasMetalnessMap: !!childMaterial.metalnessMap,
          hasAOMap: !!childMaterial.aoMap,
        };
        
        // Transform alkalmazása
        if (childElement.transform) {
          childMesh.position.set(
            childElement.transform.position.x,
            childElement.transform.position.y, 
            childElement.transform.position.z
          );
          
          if (childElement.transform.rotation) {
            childMesh.rotation.set(
              childElement.transform.rotation.x,
              childElement.transform.rotation.y,
              childElement.transform.rotation.z
            );
          }
        }
        
        group.add(childMesh);
      }
    }
    
    return group;
  }

  // ÚJ v1.9.0: Async komplett THREE.js mesh létrehozása
  async createMesh(element) {
    const shade = element.shade || 5;
    
    // GROUP esetén
    if (element.geometry.type === GEOMETRY_TYPES.GROUP) {
      const group = await this.createGroupGeometry(element); // Async!
      
      // Transform alkalmazása
      const transform = element.transform;
      group.position.set(
        transform.position.x,
        transform.position.y,
        transform.position.z
      );

      if (transform.rotation) {
        group.rotation.set(
          transform.rotation.x,
          transform.rotation.y,
          transform.rotation.z
        );
      }

      if (transform.scale) {
        group.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
      }

      // Display beállítások
      const display = element.display;
      group.visible = display.visible;

      // Bővített GROUP metadata
      group.userData = {
        elementId: element.id,
        elementName: element.name,
        elementType: element.type,
        isGroup: true,
        childCount: group.children.length,
        shade: shade,
        materialType: 'PBR',
        version: 'v1.9.0'
      };

      return group;
    }

    // ÚJ v1.9.0: Async PBR material hagyományos mesh-hez
    const geometry = this.createGeometry(element);
    const material = await this.createMaterial(element.material, shade, element.id);
    const mesh = new THREE.Mesh(geometry, material);

    // Transform alkalmazása
    const transform = element.transform;
    mesh.position.set(
      transform.position.x,
      transform.position.y,
      transform.position.z
    );

    if (transform.rotation) {
      mesh.rotation.set(
        transform.rotation.x,
        transform.rotation.y,
        transform.rotation.z
      );
    }

    if (transform.scale) {
      mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
    }

    // Display beállítások
    const display = element.display;
    mesh.visible = display.visible;
    mesh.material.transparent = display.opacity < 1;
    mesh.material.opacity = display.opacity;
    mesh.castShadow = display.castShadow;
    mesh.receiveShadow = display.receiveShadow;

    // Bővített metadata PBR adatokkal
    mesh.userData = {
      elementId: element.id,
      elementName: element.name,
      elementType: element.type,
      shade: shade,
      materialType: material.isMeshStandardMaterial ? 'PBR' : 'Legacy',
      roughness: material.roughness,
      metalness: material.metalness,
      envMapIntensity: material.envMapIntensity,
      hasCSGOperations: !!(element.geometry.holes || element.geometry.csgOperations),
      // ÚJ: PBR map metadata
      hasDiffuseMap: !!material.map,
      hasNormalMap: !!material.normalMap,
      hasRoughnessMap: !!material.roughnessMap,
      hasMetalnessMap: !!material.metalnessMap,
      hasAOMap: !!material.aoMap,
      version: 'v1.9.0'
    };

    return mesh;
  }

  // ÚJ v1.9.0: Async összes elem mesh-einek létrehozása
  async createAllMeshes(elements) {
    const meshes = new Map();
    let pbrCount = 0;
    let legacyCount = 0;
    let totalMaps = 0;

    console.log(`🏗️ Async mesh generation kezdése: ${elements.length} elem`);

    // Async mesh creation minden elemhez
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      
      try {
        console.log(`📦 Mesh létrehozása (${i + 1}/${elements.length}): ${element.id}`);
        
        const mesh = await this.createMesh(element); // Async!
        meshes.set(element.id, mesh);

        // PBR statisztika
        if (mesh.userData.materialType === 'PBR') {
          pbrCount++;
          
          // Map counting
          const mapCount = 
            (mesh.userData.hasDiffuseMap ? 1 : 0) +
            (mesh.userData.hasNormalMap ? 1 : 0) +
            (mesh.userData.hasRoughnessMap ? 1 : 0) +
            (mesh.userData.hasMetalnessMap ? 1 : 0) +
            (mesh.userData.hasAOMap ? 1 : 0);
          
          totalMaps += mapCount;
          
          // GROUP esetén gyerekek is számítanak
          if (mesh.userData.isGroup) {
            mesh.children.forEach(child => {
              const childMapCount = 
                (child.userData.hasDiffuseMap ? 1 : 0) +
                (child.userData.hasNormalMap ? 1 : 0) +
                (child.userData.hasRoughnessMap ? 1 : 0) +
                (child.userData.hasMetalnessMap ? 1 : 0) +
                (child.userData.hasAOMap ? 1 : 0);
              totalMaps += childMapCount;
            });
          }
        } else {
          legacyCount++;
        }

        // Debug log CSG műveletekhez
        if (mesh.userData.hasCSGOperations) {
          console.log(`🔧 CSG mesh: ${element.id} (${mesh.userData.materialType})`);
        }
      } catch (error) {
        console.error(`❌ Mesh létrehozás hiba (${element.id}):`, error);

        // Egyszerű fallback mesh
        const fallbackGeometry = new THREE.BoxGeometry(10, 10, 10);
        const fallbackMaterial = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          wireframe: true,
        });
        const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);

        fallbackMesh.userData = {
          elementId: element.id,
          elementName: element.name + " (HIBA)",
          hasError: true,
        };

        meshes.set(element.id, fallbackMesh);
        console.warn(`🔄 Fallback mesh: ${element.id}`);
        legacyCount++;
      }
    }

    console.log(`🎨 Mesh generálás kész: ${meshes.size} összesen`);
    console.log(`📊 PBR: ${pbrCount}, Legacy: ${legacyCount}, Maps: ${totalMaps}`);
    console.log(`💾 Material cache: ${this.materialCache.size} cached material`);
    
    return meshes;
  }

  // PBR tulajdonságok módosítása (bővített v1.9.0)
  updateMeshPBRProperties(mesh, properties = {}) {
    if (!mesh || !mesh.material) return false;

    // Hagyományos mesh
    if (mesh.material.isMeshStandardMaterial) {
      return this.updateSingleMaterialPBR(mesh.material, properties);
    }

    // GROUP mesh - gyerekek frissítése
    if (mesh.userData && mesh.userData.isGroup) {
      let updated = false;
      mesh.children.forEach((childMesh) => {
        if (childMesh.material && childMesh.material.isMeshStandardMaterial) {
          if (this.updateSingleMaterialPBR(childMesh.material, properties)) {
            updated = true;
          }
        }
      });
      return updated;
    }

    return false;
  }

  // Helper: Egyedi material PBR frissítés (változatlan)
  updateSingleMaterialPBR(material, properties) {
    let updated = false;

    if (properties.roughness !== undefined) {
      material.roughness = Math.max(0, Math.min(1, properties.roughness));
      updated = true;
    }
    if (properties.metalness !== undefined) {
      material.metalness = Math.max(0, Math.min(1, properties.metalness));
      updated = true;
    }
    if (properties.envMapIntensity !== undefined) {
      material.envMapIntensity = Math.max(0, properties.envMapIntensity);
      updated = true;
    }

    if (updated) {
      material.needsUpdate = true;
    }

    return updated;
  }

  // ÚJ v1.9.0: Material cache statisztikák
  getMaterialCacheStats() {
    return {
      cacheSize: this.materialCache.size,
      cachedMaterials: Array.from(this.materialCache.keys()),
    };
  }

  // CSG státusz lekérdezése (bővített v1.9.0)
  getCSGStatus() {
    return {
      csgManagerAvailable: !!this.csgManager,
      csgLibraryAvailable: this.csgManager?.isCSGAvailable || false,
      cacheSize: this.csgManager?.getCacheSize() || 0,
      textureManagerAvailable: !!this.textureManager,
      materialCacheSize: this.materialCache.size,
      pbrEnabled: true,
      materialType: 'MeshStandardMaterial',
      version: 'v1.9.0'
    };
  }

  // Debug info (bővített v1.9.0)
  getPBRStatus() {
    return {
      version: 'v1.9.0 - Async PBR Materials',
      materialsCreated: true,
      asyncMaterials: true,
      materialCache: this.getMaterialCacheStats(),
      defaultShadeRange: [1, 10],
      supportedProperties: ['roughness', 'metalness', 'envMapIntensity'],
      supportedMaps: ['diffuse', 'normal', 'roughness', 'metalness', 'ao'],
      textureManagerIntegration: !!this.textureManager,
    };
  }

  // Material cache tisztítása
  clearMaterialCache() {
    console.log("🧹 Material cache tisztítása...");
    
    this.materialCache.forEach((material) => {
      if (material.dispose) {
        material.dispose();
      }
    });
    
    this.materialCache.clear();
    console.log("Material cache törölve");
  }

  // Cleanup (bővített v1.9.0)
  destroy() {
    this.clearMaterialCache();
    
    if (this.csgManager) {
      this.csgManager.destroy();
    }
    
    this.textureManager = null;
    
    console.log("GeometryBuilder v1.9.0 destroyed");
  }
}

// Globális hozzáférhetőség
window.GeometryBuilder = GeometryBuilder;