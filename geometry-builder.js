/**
 * Geometry Builder
 * THREE.js geometriák és mesh-ek létrehozása elem definíciók alapján
 * v2.0.0 - Pure PBR Simplified - Legacy support eltávolítva
 */

class GeometryBuilder {
  constructor() {
    this.csgManager = null; // CSG Manager referencia
    this.textureManager = null; // TextureManager referencia
  }

  // CSG Manager beállítása
  setCSGManager(csgManager) {
    this.csgManager = csgManager;
    console.log("CSG Manager beállítva a GeometryBuilder-ben");
  }

  // TextureManager beállítása
  setTextureManager(textureManager) {
    this.textureManager = textureManager;
    console.log("✅ TextureManager beállítva a GeometryBuilder-ben");
  }

  // Pure PBR material létrehozása - egyszerűsített
  async createMaterial(materialDef, shade = 5, elementId = 'unknown') {
    // Null check
    if (!materialDef) {
      console.error(`❌ MaterialDef is null for element: ${elementId}`);
      return this.createEmergencyMaterial();
    }

    // TextureManager kötelező PBR esetén
    if (!this.textureManager) {
      console.error(`❌ TextureManager not available for element: ${elementId}`);
      return this.createEmergencyMaterial();
    }

    try {
      console.log(`🎨 PBR Material létrehozása: ${materialDef.name} (${elementId}), shade: ${shade}`);
      
      const pbrMaterial = await this.textureManager.getMaterialWithShade(
        materialDef, 
        shade
      );
      
      // NULL CHECK
      if (!pbrMaterial) {
        console.error(`❌ TextureManager returned null material for: ${materialDef.name}`);
        return this.createEmergencyMaterial();
      }
      
      console.log(`✅ PBR Material kész: ${materialDef.name}, maps: [${this.getPBRMapList(pbrMaterial)}]`);
      
      return pbrMaterial;
      
    } catch (error) {
      console.error(`❌ PBR Material hiba (${materialDef.name}):`, error);
      return this.createEmergencyMaterial();
    }
  }

  // Emergency material
  createEmergencyMaterial() {
    console.log(`🚨 Emergency material létrehozása`);
    return new THREE.MeshStandardMaterial({
      color: 0xff0000, // Piros - hiba jelzéshez
      roughness: 0.5,
      metalness: 0.0,
    });
  }

  // PBR map lista debug-hoz
  getPBRMapList(material) {
    const maps = [];
    if (material.map) maps.push('diffuse');
    if (material.normalMap) maps.push('normal');
    if (material.roughnessMap) maps.push('roughness');
    if (material.metalnessMap) maps.push('metalness');
    if (material.aoMap) maps.push('ao');
    return maps.join(', ') || 'none';
  }

  // THREE.js geometria létrehozása elem alapján
  createGeometry(element) {
    const geom = element.geometry;

    // CSG műveletek ellenőrzése
    if (this.csgManager && (geom.holes || geom.csgOperations)) {
      return this.createCSGGeometry(element);
    }

    // Hagyományos geometria létrehozás
    return this.createStandardGeometry(element);
  }

  // CSG geometria létrehozása
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

  // Hagyományos geometria létrehozása
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
      
      case GEOMETRY_TYPES.TRIANGLE:
        return this.createTriangleGeometry(dim);

      case GEOMETRY_TYPES.TRAPEZOID:
        return this.createTrapezoidGeometry(dim);
      
      case GEOMETRY_TYPES.GROUP:
        return this.createGroupGeometry(element);

      default:
        console.warn(`Ismeretlen geometria típus: ${geom.type}`);
        return new THREE.BoxGeometry(dim.length, dim.height, dim.width);
    }
  }

  // GROUP geometria létrehozása async materials-kal
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
        
        // Async PBR material gyerek elemekhez
        const childMaterial = await this.createMaterial(
          element.material, 
          element.shade || 5,
          `${element.id}_child_${i}`
        );
        
        const childMesh = new THREE.Mesh(childGeometry, childMaterial);
        
        // Egyszerűsített metadata
        childMesh.userData = {
          elementId: `${element.id}_child_${i}`,
          elementName: childElement.name || `Gyerek elem`,
          elementType: element.type,
          parentId: element.id,
          isChildElement: true,
          shade: element.shade || 5,
          // PBR map metadata
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

  // Async komplett THREE.js mesh létrehozása
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

      // Egyszerűsített GROUP metadata
      group.userData = {
        elementId: element.id,
        elementName: element.name,
        elementType: element.type,
        isGroup: true,
        childCount: group.children.length,
        shade: shade,
        version: 'v2.0.0'
      };

      return group;
    }

    // Async PBR material hagyományos mesh-hez
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

    // Egyszerűsített metadata
    mesh.userData = {
      elementId: element.id,
      elementName: element.name,
      elementType: element.type,
      shade: shade,
      hasCSGOperations: !!(element.geometry.holes || element.geometry.csgOperations),
      // PBR map metadata
      hasDiffuseMap: !!material.map,
      hasNormalMap: !!material.normalMap,
      hasRoughnessMap: !!material.roughnessMap,
      hasMetalnessMap: !!material.metalnessMap,
      hasAOMap: !!material.aoMap,
      version: 'v2.0.0'
    };

    return mesh;
  }

  // Async összes elem mesh-einek létrehozása
  async createAllMeshes(elements) {
    const meshes = new Map();
    let pbrCount = 0;
    let errorCount = 0;
    let totalMaps = 0;

    console.log(`🏗️ Pure PBR mesh generation kezdése: ${elements.length} elem`);

    // Async mesh creation minden elemhez
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      
      try {
        console.log(`📦 Mesh létrehozása (${i + 1}/${elements.length}): ${element.id}`);
        
        const mesh = await this.createMesh(element); // Async!
        meshes.set(element.id, mesh);

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

        // Debug log CSG műveletekhez
        if (mesh.userData.hasCSGOperations) {
          console.log(`🔧 CSG mesh: ${element.id}`);
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
        errorCount++;
      }
    }

    console.log(`✅ Pure PBR mesh generálás kész: ${meshes.size} összesen`);
    console.log(`📊 PBR: ${pbrCount}, Errors: ${errorCount}, Total Maps: ${totalMaps}`);
    
    return meshes;
  }

  // PBR tulajdonságok módosítása
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

  // Helper: Egyedi material PBR frissítés
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

  // CSG státusz lekérdezése
  getCSGStatus() {
    return {
      csgManagerAvailable: !!this.csgManager,
      csgLibraryAvailable: this.csgManager?.isCSGAvailable || false,
      cacheSize: this.csgManager?.getCacheSize() || 0,
      textureManagerAvailable: !!this.textureManager,
      pbrEnabled: true,
      materialType: 'MeshStandardMaterial (only)',
      version: 'v2.0.0'
    };
  }

  // Debug info
  getPBRStatus() {
    return {
      version: 'v2.0.0 - Pure PBR Simplified',
      purePBROnly: true,
      legacySupport: false,
      asyncMaterials: true,
      defaultShadeRange: [1, 10],
      supportedProperties: ['roughness', 'metalness', 'envMapIntensity'],
      supportedMaps: ['diffuse', 'normal', 'roughness', 'metalness', 'ao'],
      textureManagerRequired: true,
    };
  }

  // Háromszög geometria létrehozása
  createTriangleGeometry(dimensions) {
    const { width, height, thickness } = dimensions;
    
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(0, 0);
    triangleShape.lineTo(width, 0);
    triangleShape.lineTo(width/2, height);
    triangleShape.lineTo(0, 0);

    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: false
    };

    const geometry = new THREE.ExtrudeGeometry(triangleShape, extrudeSettings);
    geometry.translate(-width/2, -height/3, -thickness/2);
    
    return geometry;
  }

  // Trapéz geometria létrehozása
  createTrapezoidGeometry(dimensions) {
    const { topWidth, bottomWidth, height, thickness } = dimensions;
    
    const trapezoidShape = new THREE.Shape();
    const offset = (bottomWidth - topWidth) / 2;
    
    trapezoidShape.moveTo(0, 0);
    trapezoidShape.lineTo(bottomWidth, 0);
    trapezoidShape.lineTo(bottomWidth - offset, height);
    trapezoidShape.lineTo(offset, height);
    trapezoidShape.lineTo(0, 0);

    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: false
    };

    const geometry = new THREE.ExtrudeGeometry(trapezoidShape, extrudeSettings);
    geometry.translate(-bottomWidth/2, -height/2, -thickness/2);
    
    return geometry;
  }

  // Cleanup
  destroy() {
    if (this.csgManager) {
      this.csgManager.destroy();
    }
    
    this.textureManager = null;
    
    console.log("GeometryBuilder v2.0.0 destroyed");
  }
}

// Globális hozzáférhetőség
window.GeometryBuilder = GeometryBuilder;