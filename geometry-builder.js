/**
 * Geometry Builder
 * THREE.js geometriák és mesh-ek létrehozása elem definíciók alapján
 * v1.6.0 - Shade támogatás hozzáadva
 */

class GeometryBuilder {
  constructor() {
    this.materialCache = new Map();
    this.csgManager = null; // CSG Manager referencia
  }

  // CSG Manager beállítása
  setCSGManager(csgManager) {
    this.csgManager = csgManager;
    console.log("CSG Manager beállítva a GeometryBuilder-ben");
  }

  // FRISSÍTETT: THREE.js material létrehozása anyag definíció és shade alapján
  createMaterial(materialDef, shade = 5) {
    // Cache kulcs shade-del kibővítve
    const cacheKey = `${JSON.stringify(materialDef)}_shade_${shade}`;

    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey);
    }

    let material;

    // Ha galvanizált acél és van TextureManager, akkor shade-alapú material
    if (materialDef === MATERIALS.GALVANIZED_STEEL && window.textureManager) {
      try {
        const textureManager = window.textureManager();
        material = textureManager.getGalvanizedMaterial(shade);
        console.log(`🔧 Galvanizált material létrehozva shade ${shade}-del`);
      } catch (error) {
        console.warn("TextureManager nem elérhető, fallback material:", error);
        material = new THREE.MeshPhongMaterial({
          color: materialDef.color,
          shininess: materialDef.shininess,
        });
      }
    } else {
      // Hagyományos material (más anyagok esetén a shade később lesz implementálva)
      material = new THREE.MeshPhongMaterial({
        color: materialDef.color,
        shininess: materialDef.shininess,
      });
    }

    this.materialCache.set(cacheKey, material);
    return material;
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

    // Alap geometria létrehozása
    const baseGeometry = this.createStandardGeometry(element);

    let csgOperations = [];

    // Lyukak konvertálása CSG műveletekre (kompatibilitás)
    if (geom.holes) {
      const holeOperations = this.csgManager.convertHolesToCSGOperations(
        geom.holes
      );
      csgOperations = csgOperations.concat(holeOperations);
    }

    // Direkt CSG műveletek hozzáadása
    if (geom.csgOperations) {
      csgOperations = csgOperations.concat(geom.csgOperations);
    }

    // CSG műveletek végrehajtása
    if (csgOperations.length > 0) {
      // Pozíció alapú CSG műveletek alkalmazása
      const positionedOperations = csgOperations.map((operation) => {
        const positioned = { ...operation };

        // Ha van pozíció megadva, alkalmazzuk
        if (operation.position) {
          positioned.params = {
            ...positioned.params,
            position: operation.position,
          };
        }

        return positioned;
      });

      return this.csgManager.createCSGGeometry(
        baseGeometry,
        positionedOperations
      );
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
        const segments = dim.segments || 16; // segments paraméter támogatása
        
        // Kúp alakú geometria támogatása (topRadius/bottomRadius)
        if (dim.topRadius !== undefined && dim.bottomRadius !== undefined) {
          // Kúp: különböző felső és alsó sugár
          return new THREE.CylinderGeometry(dim.topRadius, dim.bottomRadius, dim.height, segments);
        } else {
          // Hagyományos henger: azonos sugár felül és alul
          return new THREE.CylinderGeometry(radius, radius, dim.height, segments);
        }

      case GEOMETRY_TYPES.SPHERE:
        const sphereRadius = dim.radius || dim.diameter / 2;
        return new THREE.SphereGeometry(sphereRadius, 16, 12); // 16 szegmens, 12 gyűrű

      case GEOMETRY_TYPES.EXTRUDE:
        return this.createExtrudeGeometry(element);

      case GEOMETRY_TYPES.GROUP:
        return this.createGroupGeometry(element);

      default:
        console.warn(`Ismeretlen geometria típus: ${geom.type}`);
        return new THREE.BoxGeometry(dim.length, dim.height, dim.width);
    }
  }

  // FRISSÍTETT: GROUP geometria létrehozása - shade továbbítással
  createGroupGeometry(element) {
    const group = new THREE.Group();
    
    if (element.geometry.elements) {
      element.geometry.elements.forEach((childElement) => {
        // Gyerek elem teljes definíció létrehozása
        const fullChildElement = {
          geometry: childElement.geometry,
          material: element.material, // Szülő anyaga
          shade: element.shade || 5, // ÚJ: Szülő shade-je
        };
        
        const childGeometry = this.createGeometry(fullChildElement);
        const childMaterial = this.createMaterial(element.material, element.shade || 5); // ÚJ: Shade továbbítása
        const childMesh = new THREE.Mesh(childGeometry, childMaterial);
        
        // CSG metadata beállítása a gyerek mesh-hez is
        childMesh.userData = {
          elementId: `${element.id}_child_${element.geometry.elements.indexOf(childElement)}`,
          elementName: childElement.name || `Gyerek elem`,
          elementType: element.type,
          parentId: element.id,
          isChildElement: true,
          shade: element.shade || 5, // ÚJ: Shade metadata
          hasCSGOperations: !!(childElement.geometry.holes || childElement.geometry.csgOperations),
          csgOperationCount: (childElement.geometry.holes?.length || 0) + (childElement.geometry.csgOperations?.length || 0),
        };
        
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

  // Extrude geometria létrehozása - CSG nélküli fallback
  createExtrudeGeometry(element) {
    const dim = element.geometry.dimensions;
    const holes = element.geometry.holes || [];

    // Ha van CSG Manager és lyukak, próbáljuk CSG-vel
    if (this.csgManager && holes.length > 0) {
      // Alap box geometria
      const baseGeometry = new THREE.BoxGeometry(
        dim.length,
        dim.height,
        dim.width
      );

      // Lyukak konvertálása CSG műveletekre
      const csgOperations = this.csgManager.convertHolesToCSGOperations(holes);

      if (csgOperations.length > 0) {
        try {
          return this.csgManager.createCSGGeometry(baseGeometry, csgOperations);
        } catch (error) {
          console.warn(
            "CSG extrude hiba, fallback THREE.ExtrudeGeometry-ra:",
            error
          );
        }
      }
    }

    // Fallback: hagyományos THREE.ExtrudeGeometry
    return this.createLegacyExtrudeGeometry(element);
  }

  // Legacy ExtrudeGeometry (eredeti implementáció)
  createLegacyExtrudeGeometry(element) {
    const dim = element.geometry.dimensions;
    const holes = element.geometry.holes || [];

    // Alap shape létrehozása
    const shape = new THREE.Shape();
    shape.moveTo(-dim.length / 2, -dim.width / 2);
    shape.lineTo(dim.length / 2, -dim.width / 2);
    shape.lineTo(dim.length / 2, dim.width / 2);
    shape.lineTo(-dim.length / 2, dim.width / 2);
    shape.lineTo(-dim.length / 2, -dim.width / 2);

    // Lyukak hozzáadása
    holes.forEach((hole) => {
      if (hole.type === "circle") {
        const holePath = new THREE.Path();
        holePath.absarc(
          hole.position.x,
          hole.position.z, // Z koordináta lesz a Y a shape-ben
          hole.radius,
          0,
          Math.PI * 2,
          true // óramutató járása ellen
        );
        shape.holes.push(holePath);
      }
    });

    // Extrude beállítások
    const extrudeSettings = {
      steps: 1,
      depth: dim.height,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Elforgatás hogy a megfelelő irányba nézzen
    geometry.rotateX(Math.PI / 2);

    return geometry;
  }

  // FRISSÍTETT: Komplett THREE.js mesh létrehozása - shade támogatással
  createMesh(element) {
    const geometry = this.createGeometry(element);
    const shade = element.shade || 5; // Shade kinyerése az elemből
    
    // GROUP esetén a geometry már egy THREE.Group
    if (element.geometry.type === GEOMETRY_TYPES.GROUP) {
      const group = geometry;
      
      // Transform alkalmazása a GROUP-ra
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

      // Display beállítások alkalmazása a GROUP-ra
      const display = element.display;
      group.visible = display.visible;

      // GROUP metadata - ÚJ: shade hozzáadva
      group.userData = {
        elementId: element.id,
        elementName: element.name,
        elementType: element.type,
        isGroup: true,
        childCount: group.children.length,
        shade: shade, // ÚJ: Shade metadata
      };

      return group;
    }

    // Hagyományos mesh létrehozás - ÚJ: shade alapú material
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

    // Display beállítások alkalmazása
    const display = element.display;
    mesh.visible = display.visible;
    mesh.material.transparent = display.opacity < 1;
    mesh.material.opacity = display.opacity;
    mesh.material.wireframe = display.wireframe;
    mesh.castShadow = display.castShadow;
    mesh.receiveShadow = display.receiveShadow;

    // Elem ID mentése a mesh-hez - ÚJ: shade hozzáadva
    mesh.userData = {
      elementId: element.id,
      elementName: element.name,
      elementType: element.type,
      shade: shade, // ÚJ: Shade metadata
      hasCSGOperations: !!(
        element.geometry.holes || element.geometry.csgOperations
      ),
      csgOperationCount:
        (element.geometry.holes?.length || 0) +
        (element.geometry.csgOperations?.length || 0),
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

        // CSG műveletek naplózása
        if (mesh.userData.hasCSGOperations && CSG_DEBUG.logOperations) {
          console.log(
            `CSG mesh létrehozva: ${element.id} (${mesh.userData.csgOperationCount} művelet, shade: ${mesh.userData.shade})`
          );
        }

        // ÚJ: Shade naplózása debug módban
        if (element.shade && element.shade !== 5) {
          console.log(`🎨 Egyedi shade mesh: ${element.id} - shade: ${element.shade}`);
        }
      } catch (error) {
        console.error(`Mesh létrehozás hiba (${element.id}):`, error);

        // Fallback: egyszerű box mesh
        const fallbackGeometry = new THREE.BoxGeometry(10, 10, 10);
        const fallbackMaterial = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          wireframe: true,
        });
        const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);

        fallbackMesh.userData = {
          elementId: element.id,
          elementName: element.name + " (HIBA)",
          elementType: element.type,
          shade: element.shade || 5,
          hasError: true,
        };

        meshes.set(element.id, fallbackMesh);
        console.warn(`Fallback mesh használata: ${element.id}`);
      }
    });

    return meshes;
  }

  // FRISSÍTETT: Material cache ürítése - shade figyelembevételével
  clearCache() {
    console.log(`🧹 Material cache tisztítása: ${this.materialCache.size} elem`);
    this.materialCache.clear();

    // CSG cache is törlése
    if (this.csgManager) {
      this.csgManager.clearCache();
    }
  }

  // Lyuk mesh létrehozása (vizuális célokra) - LEGACY
  createHoleMesh(element) {
    const holes = element.geometry.holes || [];
    const holeMeshes = [];

    holes.forEach((hole, index) => {
      if (hole.type === "circle") {
        // Sötét cylinder a lyuk jelölésére
        const holeGeometry = new THREE.CylinderGeometry(
          hole.radius,
          hole.radius,
          element.geometry.dimensions.height + 0.1, // Kicsit vastagabb
          16
        );

        const holeMaterial = new THREE.MeshPhongMaterial({
          color: 0x333333,
          shininess: 0,
        });

        const holeMesh = new THREE.Mesh(holeGeometry, holeMaterial);

        // Pozíció beállítása
        holeMesh.position.set(
          element.transform.position.x + hole.position.x,
          element.transform.position.y,
          element.transform.position.z + hole.position.z
        );

        holeMesh.userData = {
          elementId: `${element.id}_hole_${index}`,
          elementName: `${element.name} - Lyuk`,
          elementType: "hole",
          parentElement: element.id,
          shade: element.shade || 5, // ÚJ: Shade a lyuknál is
        };

        holeMeshes.push(holeMesh);
      }
    });

    return holeMeshes;
  }

  // CSG státusz lekérdezése
  getCSGStatus() {
    return {
      csgManagerAvailable: !!this.csgManager,
      csgLibraryAvailable: this.csgManager?.isCSGAvailable || false,
      cacheSize: this.csgManager?.getCacheSize() || 0,
    };
  }

  // ÚJ: Shade statisztikák a material cache-ből
  getShadeStats() {
    const shadeUsage = {};
    let totalCachedMaterials = 0;

    this.materialCache.forEach((material, key) => {
      if (key.includes('shade_')) {
        const shadeMatch = key.match(/shade_(\d+)/);
        if (shadeMatch) {
          const shade = parseInt(shadeMatch[1]);
          shadeUsage[shade] = (shadeUsage[shade] || 0) + 1;
          totalCachedMaterials++;
        }
      }
    });

    return {
      totalCachedMaterials,
      shadeUsage,
      uniqueShades: Object.keys(shadeUsage).length,
    };
  }

  // Debug info kiírása - ÚJ: shade info-val
  logElementInfo(element, mesh) {
    console.log(`Element: ${element.name} (${element.id})`);
    console.log(`- Type: ${element.type}`);
    console.log(`- Material: ${element.material.name}`);
    console.log(`- Shade: ${element.shade || 5}`); // ÚJ: Shade info
    console.log(`- Geometry: ${element.geometry.type}`);
    console.log(`- Dimensions:`, element.geometry.dimensions);
    console.log(`- Position:`, mesh.position);
    console.log(`- Calculated:`, element.calculated);

    // CSG info
    if (mesh.userData.hasCSGOperations) {
      console.log(`- CSG Operations: ${mesh.userData.csgOperationCount}`);
    }

    console.log("---");
  }

  // Cleanup
  destroy() {
    this.clearCache();

    if (this.csgManager) {
      this.csgManager.destroy();
    }

    console.log("GeometryBuilder v1.6.0 destroyed");
  }
}

// Globális hozzáférhetőség
window.GeometryBuilder = GeometryBuilder;