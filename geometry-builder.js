/**
 * Geometry Builder
 * THREE.js geometriák és mesh-ek létrehozása elem definíciók alapján
 * v1.7.0 - Egyszerűsített, felesleges részek eltávolítva
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

  // THREE.js material létrehozása (egyszerűsített)
  createMaterial(materialDef, shade = 5) {
    // Galvanizált acél TextureManager-rel
    if (materialDef === MATERIALS.GALVANIZED_STEEL && window.textureManager) {
      try {
        const textureManager = window.textureManager();
        return textureManager.getGalvanizedMaterial(shade);
      } catch (error) {
        console.warn("TextureManager nem elérhető, fallback material:", error);
      }
    }
    
    // Fallback: alapértelmezett material
    return new THREE.MeshPhongMaterial({
      color: materialDef.color,
      shininess: materialDef.shininess,
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

  // GROUP geometria létrehozása
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
        const childMaterial = this.createMaterial(element.material, element.shade || 5);
        const childMesh = new THREE.Mesh(childGeometry, childMaterial);
        
        // Egyszerű metadata
        childMesh.userData = {
          elementId: `${element.id}_child_${element.geometry.elements.indexOf(childElement)}`,
          elementName: childElement.name || `Gyerek elem`,
          elementType: element.type,
          parentId: element.id,
          isChildElement: true,
          shade: element.shade || 5,
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

  // Komplett THREE.js mesh létrehozása
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

      // Egyszerű GROUP metadata
      group.userData = {
        elementId: element.id,
        elementName: element.name,
        elementType: element.type,
        isGroup: true,
        childCount: group.children.length,
        shade: shade,
      };

      return group;
    }

    // Hagyományos mesh létrehozás
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
    mesh.material.wireframe = display.wireframe;
    mesh.castShadow = display.castShadow;
    mesh.receiveShadow = display.receiveShadow;

    // Egyszerű metadata
    mesh.userData = {
      elementId: element.id,
      elementName: element.name,
      elementType: element.type,
      shade: shade,
      hasCSGOperations: !!(element.geometry.holes || element.geometry.csgOperations),
    };

    return mesh;
  }

  // Összes elem mesh-einek létrehozása
  createAllMeshes(elements) {
    const meshes = new Map();

    elements.forEach((element) => {
      try {
        const mesh = this.createMesh(element);
        meshes.set(element.id, mesh);

        // Debug log CSG műveletekhez
        if (mesh.userData.hasCSGOperations) {
          console.log(`CSG mesh létrehozva: ${element.id} (shade: ${mesh.userData.shade})`);
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
      }
    });

    return meshes;
  }

  // CSG státusz lekérdezése
  getCSGStatus() {
    return {
      csgManagerAvailable: !!this.csgManager,
      csgLibraryAvailable: this.csgManager?.isCSGAvailable || false,
      cacheSize: this.csgManager?.getCacheSize() || 0,
    };
  }

  // Cleanup
  destroy() {
    if (this.csgManager) {
      this.csgManager.destroy();
    }
    console.log("GeometryBuilder v1.7.0 destroyed");
  }
}

// Globális hozzáférhetőség
window.GeometryBuilder = GeometryBuilder;