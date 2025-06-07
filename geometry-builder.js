/**
 * Geometry Builder
 * THREE.js geometriák és mesh-ek létrehozása elem definíciók alapján
 * v1.8.0 - PBR Materials integráció
 */

class GeometryBuilder {
  constructor() {
    this.csgManager = null; // CSG Manager referencia
  }

  // CSG Manager beállítása
  setCSGManager(csgManager) {
    this.csgManager = csgManager;
    console.log("CSG Manager beállítva a GeometryBuilder-ben");
  }

  // ÚJ: THREE.js PBR material létrehozása
  createMaterial(materialDef, shade = 5) {
    // TextureManager használata PBR anyagokhoz
    if (window.textureManager) {
      try {
        const textureManager = window.textureManager();
        
        // PBR anyag lekérése shade-del
        const pbrMaterial = textureManager.getMaterialWithShade(materialDef, shade, true);
        
        console.log(`🎨 PBR Material létrehozva: ${materialDef.name}, shade: ${shade}, roughness: ${pbrMaterial.roughness?.toFixed(2)}, metalness: ${pbrMaterial.metalness?.toFixed(2)}`);
        
        return pbrMaterial;
      } catch (error) {
        console.warn("PBR TextureManager hiba, fallback:", error);
      }
    }
    
    // Fallback: Alapértelmezett PBR material ha TextureManager nem elérhető
    const baseColor = new THREE.Color(materialDef.baseColor || materialDef.color);
    const brightness = 0.3 + (shade - 1) * (1.2 / 9); // 0.3-1.5
    baseColor.multiplyScalar(brightness);
    
    const roughness = (materialDef.roughnessBase || 0.5) + (10 - shade) * 0.05;
    const metalness = materialDef.metalnessBase || 0.0;
    
    console.log(`🎨 Fallback PBR Material: ${materialDef.name}, roughness: ${roughness.toFixed(2)}, metalness: ${metalness.toFixed(2)}`);
    
    return new THREE.MeshStandardMaterial({
      color: baseColor.getHex(),
      roughness: Math.max(0, Math.min(1, roughness)),
      metalness: Math.max(0, Math.min(1, metalness)),
      envMapIntensity: materialDef.envMapIntensity || 1.0,
    });
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

      case GEOMETRY_TYPES.GROUP:
        return this.createGroupGeometry(element);

      default:
        console.warn(`Ismeretlen geometria típus: ${geom.type}`);
        return new THREE.BoxGeometry(dim.length, dim.height, dim.width);
    }
  }

  // GROUP geometria létrehozása - PBR anyagokkal
  createGroupGeometry(element) {
    const group = new THREE.Group();
    
    if (element.geometry.elements) {
      element.geometry.elements.forEach((childElement) => {
        const fullChildElement = {
          geometry: childElement.geometry,
          material: element.material,
          shade: element.shade || 5,
        };
        
        const childGeometry = this.createGeometry(fullChildElement);
        
        // ÚJ: PBR material használata gyerek elemekhez is
        const childMaterial = this.createMaterial(element.material, element.shade || 5);
        const childMesh = new THREE.Mesh(childGeometry, childMaterial);
        
        // Bővített metadata
        childMesh.userData = {
          elementId: `${element.id}_child_${element.geometry.elements.indexOf(childElement)}`,
          elementName: childElement.name || `Gyerek elem`,
          elementType: element.type,
          parentId: element.id,
          isChildElement: true,
          shade: element.shade || 5,
          materialType: childMaterial.isMeshStandardMaterial ? 'PBR' : 'Legacy',
          roughness: childMaterial.roughness,
          metalness: childMaterial.metalness,
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
      });
    }
    
    return group;
  }

  // ÚJ: Komplett THREE.js mesh létrehozása PBR anyagokkal
  createMesh(element) {
    const geometry = this.createGeometry(element);
    const shade = element.shade || 5;
    
    // GROUP esetén
    if (element.geometry.type === GEOMETRY_TYPES.GROUP) {
      const group = geometry;
      
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
      };

      return group;
    }

    // ÚJ: PBR material használata hagyományos mesh-hez
    const material = this.createMaterial(element.material, shade);
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
    };

    return mesh;
  }

  // Összes elem mesh-einek létrehozása - PBR statisztikákkal
  createAllMeshes(elements) {
    const meshes = new Map();
    let pbrCount = 0;
    let legacyCount = 0;

    elements.forEach((element) => {
      try {
        const mesh = this.createMesh(element);
        meshes.set(element.id, mesh);

        // PBR statisztika
        if (mesh.userData.materialType === 'PBR') {
          pbrCount++;
        } else {
          legacyCount++;
        }

        // Debug log CSG műveletekhez
        if (mesh.userData.hasCSGOperations) {
          console.log(`CSG mesh létrehozva: ${element.id} (${mesh.userData.materialType}, shade: ${mesh.userData.shade})`);
        }
      } catch (error) {
        console.error(`Mesh létrehozás hiba (${element.id}):`, error);

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
        console.warn(`Fallback mesh használata: ${element.id}`);
        legacyCount++;
      }
    });

    console.log(`🎨 Mesh-ek létrehozva: ${meshes.size} összesen (PBR: ${pbrCount}, Legacy: ${legacyCount})`);
    
    return meshes;
  }

  // ÚJ: PBR tulajdonságok módosítása
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

  // CSG státusz lekérdezése - PBR adatokkal
  getCSGStatus() {
    return {
      csgManagerAvailable: !!this.csgManager,
      csgLibraryAvailable: this.csgManager?.isCSGAvailable || false,
      cacheSize: this.csgManager?.getCacheSize() || 0,
      pbrEnabled: true,
      materialType: 'MeshStandardMaterial',
    };
  }

  // ÚJ: PBR debug info
  getPBRStatus() {
    return {
      materialsCreated: true,
      defaultShadeRange: [1, 10],
      supportedProperties: ['roughness', 'metalness', 'envMapIntensity'],
      textureManagerAvailable: !!window.textureManager,
    };
  }

  // Cleanup
  destroy() {
    if (this.csgManager) {
      this.csgManager.destroy();
    }
    console.log("GeometryBuilder v1.8.0 PBR destroyed");
  }
}

// Globális hozzáférhetőség
window.GeometryBuilder = GeometryBuilder;