/**
 * Geometry Builder
 * THREE.js geometriák és mesh-ek létrehozása elem definíciók alapján
 */

class GeometryBuilder {
  constructor() {
    this.materialCache = new Map();
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

  // Extrude geometria létrehozása (lyukakkal)
  createExtrudeGeometry(element) {
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
    };

    return mesh;
  }

  // Összes elem mesh-einek létrehozása
  createAllMeshes(elements) {
    const meshes = new Map();

    elements.forEach((element) => {
      const mesh = this.createMesh(element);
      meshes.set(element.id, mesh);
    });

    return meshes;
  }

  // Material cache ürítése
  clearCache() {
    this.materialCache.clear();
  }

  // Lyuk mesh létrehozása (vizuális célokra)
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

  // Debug info kiírása
  logElementInfo(element, mesh) {
    console.log(`Element: ${element.name} (${element.id})`);
    console.log(`- Type: ${element.type}`);
    console.log(`- Material: ${element.material.name}`);
    console.log(`- Geometry: ${element.geometry.type}`);
    console.log(`- Dimensions:`, element.geometry.dimensions);
    console.log(`- Position:`, mesh.position);
    console.log(`- Calculated:`, element.calculated);
    console.log("---");
  }
}
