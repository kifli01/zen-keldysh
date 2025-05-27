/**
 * Geometry Builder
 * THREE.js geometriák és mesh-ek létrehozása elem definíciók alapján
 * v1.5.0 - CSG műveletek támogatása
 */

class GeometryBuilder {
  constructor() {
    this.materialCache = new Map();
    this.csgManager = null; // CSG Manager referencia
  }

  // ÚJ: CSG Manager beállítása
  setCSGManager(csgManager) {
    this.csgManager = csgManager;
    console.log("CSG Manager beállítva a GeometryBuilder-ben");
  }

  // THREE.js material létrehozása anyag definíció alapján
  createMaterial(materialDef) {
    const cacheKey = `${materialDef.color}_${materialDef.shininess}`;

    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey);
    }

    const material = new THREE.MeshPhongMaterial({
      color: materialDef.color,
      shininess: materialDef.shininess,
    });

    this.materialCache.set(cacheKey, material);
    return material;
  }

  // THREE.js geometria létrehozása elem alapján
  createGeometry(element) {
    const geom = element.geometry;

    // ÚJ: CSG műveletek ellenőrzése
    if (this.csgManager && (geom.holes || geom.csgOperations)) {
      return this.createCSGGeometry(element);
    }

    // Hagyományos geometria létrehozás
    return this.createStandardGeometry(element);
  }

  // ÚJ: CSG geometria létrehozása
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

  // ÁTNEVEZETT: Hagyományos geometria létrehozása (régi createGeometry logika)
  createStandardGeometry(element) {
    const geom = element.geometry;
    const dim = geom.dimensions;

    switch (geom.type) {
      case GEOMETRY_TYPES.BOX:
        return new THREE.BoxGeometry(dim.length, dim.height, dim.width);

      case GEOMETRY_TYPES.CYLINDER:
        const radius = dim.radius || dim.diameter / 2;
        return new THREE.CylinderGeometry(radius, radius, dim.height, 16);

      case GEOMETRY_TYPES.SPHERE:
        const sphereRadius = dim.radius || dim.diameter / 2;
        return new THREE.SphereGeometry(sphereRadius, 16, 12); // 16 szegmens, 12 gyűrű

      case GEOMETRY_TYPES.EXTRUDE:
        return this.createExtrudeGeometry(element);

      default:
        console.warn(`Ismeretlen geometria típus: ${geom.type}`);
        return new THREE.BoxGeometry(dim.length, dim.height, dim.width);
    }
  }

  // MÓDOSÍTOTT: Extrude geometria létrehozása - CSG nélküli fallback
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

  // ÚJ: Legacy ExtrudeGeometry (eredeti implementáció)
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

  // Komplett THREE.js mesh létrehozása
  createMesh(element) {
    const geometry = this.createGeometry(element);
    const material = this.createMaterial(element.material);
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

    // Elem ID mentése a mesh-hez
    mesh.userData = {
      elementId: element.id,
      elementName: element.name,
      elementType: element.type,
      // ÚJ: CSG metadata
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

        // ÚJ: CSG műveletek naplózása
        if (mesh.userData.hasCSGOperations && CSG_DEBUG.logOperations) {
          console.log(
            `CSG mesh létrehozva: ${element.id} (${mesh.userData.csgOperationCount} művelet)`
          );
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
          hasError: true,
        };

        meshes.set(element.id, fallbackMesh);
        console.warn(`Fallback mesh használata: ${element.id}`);
      }
    });

    return meshes;
  }

  // Material cache ürítése
  clearCache() {
    this.materialCache.clear();

    // ÚJ: CSG cache is törlése
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
        };

        holeMeshes.push(holeMesh);
      }
    });

    return holeMeshes;
  }

  // ÚJ: CSG státusz lekérdezése
  getCSGStatus() {
    return {
      csgManagerAvailable: !!this.csgManager,
      csgLibraryAvailable: this.csgManager?.isCSGAvailable || false,
      cacheSize: this.csgManager?.getCacheSize() || 0,
    };
  }

  // Debug info kiírása
  logElementInfo(element, mesh) {
    console.log(`Element: ${element.name} (${element.id})`);
    console.log(`- Type: ${element.type}`);
    console.log(`- Material: ${element.material.name}`);
    console.log(`- Geometry: ${element.geometry.type}`);
    console.log(`- Dimensions:`, element.geometry.dimensions);
    console.log(`- Position:`, mesh.position);
    console.log(`- Calculated:`, element.calculated);

    // ÚJ: CSG info
    if (mesh.userData.hasCSGOperations) {
      console.log(`- CSG Operations: ${mesh.userData.csgOperationCount}`);
    }

    console.log("---");
  }

  // ÚJ: Cleanup
  destroy() {
    this.clearCache();

    if (this.csgManager) {
      this.csgManager.destroy();
    }
  }
}
