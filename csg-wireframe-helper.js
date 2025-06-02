/**
 * CSG Wireframe Helper
 * CSG specifikus wireframe logika kezelése
 * v1.0.0 - ViewModeManager-ből kiszervezve
 */

class CSGWireframeHelper {
  constructor() {
    console.log("CSGWireframeHelper v1.0.0 inicializálva");
  }

  // CSG művelet alapján lyuk körvonal készítése
  createHoleOutlineGeometry(csgOperation, parentMesh, childRotation = null) {
    try {
      const position = csgOperation.position || { x: 0, y: 0, z: 0 };
      const depth = csgOperation.params.height || 10;

      let outlines = [];

      // Kombinált rotáció figyelembevétele
      let effectiveRotation = csgOperation.rotation || { x: 0, y: 0, z: 0 };
      
      // Ha van gyerek elem rotáció, kombináljuk a CSG rotációval
      if (childRotation) {
        effectiveRotation = {
          x: effectiveRotation.x + childRotation.x,
          y: effectiveRotation.y + childRotation.y,
          z: effectiveRotation.z + childRotation.z,
        };
      }

      // Lyuk tengely meghatározása kombinált rotáció alapján
      const holeAxis = this.determineHoleAxis(effectiveRotation);
      const depthOffsets = this.calculateDepthOffsets(depth, holeAxis);

      switch (csgOperation.geometry) {
        case "cylinder":
          const radius = csgOperation.params.radius;
          const segments = csgOperation.params.segments || 32;

          // Felső körvonal
          const topCircleGeometry = new THREE.CircleGeometry(radius, segments);
          const topEdgesGeometry = new THREE.EdgesGeometry(topCircleGeometry);

          this.applyCSGRotationToGeometry(topEdgesGeometry, effectiveRotation);

          outlines.push({
            geometry: topEdgesGeometry,
            position: {
              x: position.x + depthOffsets.top.x,
              y: position.y + depthOffsets.top.y,
              z: position.z + depthOffsets.top.z,
            },
            type: "top",
          });

          // Alsó körvonal
          const bottomCircleGeometry = new THREE.CircleGeometry(radius, segments);
          const bottomEdgesGeometry = new THREE.EdgesGeometry(bottomCircleGeometry);

          this.applyCSGRotationToGeometry(bottomEdgesGeometry, effectiveRotation);

          outlines.push({
            geometry: bottomEdgesGeometry,
            position: {
              x: position.x + depthOffsets.bottom.x,
              y: position.y + depthOffsets.bottom.y,
              z: position.z + depthOffsets.bottom.z,
            },
            type: "bottom",
          });
          break;

        case "box":
          const width = csgOperation.params.width;
          const length = csgOperation.params.length || csgOperation.params.height;

          // Felső téglalap
          const topPlaneGeometry = new THREE.PlaneGeometry(width, length);
          const topPlaneEdges = new THREE.EdgesGeometry(topPlaneGeometry);

          this.applyCSGRotationToGeometry(topPlaneEdges, effectiveRotation);

          outlines.push({
            geometry: topPlaneEdges,
            position: {
              x: position.x + depthOffsets.top.x,
              y: position.y + depthOffsets.top.y,
              z: position.z + depthOffsets.top.z,
            },
            type: "top",
          });

          // Alsó téglalap
          const bottomPlaneGeometry = new THREE.PlaneGeometry(width, length);
          const bottomPlaneEdges = new THREE.EdgesGeometry(bottomPlaneGeometry);

          this.applyCSGRotationToGeometry(bottomPlaneEdges, effectiveRotation);

          outlines.push({
            geometry: bottomPlaneEdges,
            position: {
              x: position.x + depthOffsets.bottom.x,
              y: position.y + depthOffsets.bottom.y,
              z: position.z + depthOffsets.bottom.z,
            },
            type: "bottom",
          });
          break;

        default:
          console.warn(`Nem támogatott lyuk geometria: ${csgOperation.geometry}`);
          return [];
      }

      return outlines;
    } catch (error) {
      console.error("CSG lyuk körvonal hiba:", error);
      return [];
    }
  }

  // Lyuk tengely meghatározása CSG rotáció alapján
  determineHoleAxis(csgRotation) {
    if (!csgRotation) {
      return "y"; // Alapértelmezett: Y tengely (függőleges)
    }

    // Rotáció detektálás az új direction rendszerhez
    // hole-generator.js v3.1.0 rotáció mapping:
    // Y tengely: x: 0 vagy Math.PI (up esetén)
    // X tengely: y: ±Math.PI/2
    // Z tengely: x: ±Math.PI/2

    const threshold = 0.1; // Kis tolerancia a floating point hibákhoz

    // Z tengely detektálás: X tengely körül ±90° rotáció
    if (Math.abs(Math.abs(csgRotation.x) - Math.PI / 2) < threshold) {
      return "z"; // Z tengely irányú lyuk (right/left)
    }
    // X tengely detektálás: Y tengely körül ±90° rotáció
    else if (Math.abs(Math.abs(csgRotation.y) - Math.PI / 2) < threshold) {
      return "x"; // X tengely irányú lyuk (forward/backward)
    }
    // Y tengely detektálás: nincs jelentős rotáció VAGY 180° X körül (up)
    else {
      return "y"; // Y tengely irányú lyuk (down/up)
    }
  }

  // Mélység offsetek számítása tengely szerint
  calculateDepthOffsets(depth, axis) {
    const halfDepth = depth / 2;

    switch (axis) {
      case "x":
        // X tengely: forward/backward (hosszanti irány)
        return {
          top: { x: halfDepth, y: 0, z: 0 }, // Forward irány
          bottom: { x: -halfDepth, y: 0, z: 0 }, // Backward irány
        };
      case "z":
        // Z tengely: right/left (szélességi irány)
        return {
          top: { x: 0, y: 0, z: halfDepth }, // Right irány
          bottom: { x: 0, y: 0, z: -halfDepth }, // Left irány
        };
      case "y":
      default:
        // Y tengely: down/up (magassági irány)
        return {
          top: { x: 0, y: halfDepth, z: 0 }, // Down irány (felül)
          bottom: { x: 0, y: -halfDepth, z: 0 }, // Up irány (alul)
        };
    }
  }

  // CSG rotáció alkalmazása wireframe geometrián
  applyCSGRotationToGeometry(geometry, csgRotation) {
    // Alapértelmezett orientáció: XY sík -> XZ síkra forgatás (vízszintes)
    geometry.rotateX(Math.PI / 2);

    // Ha van CSG rotáció, alkalmazzuk azt is
    if (
      csgRotation &&
      (csgRotation.x !== 0 || csgRotation.y !== 0 || csgRotation.z !== 0)
    ) {
      const rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeRotationFromEuler(
        new THREE.Euler(csgRotation.x, csgRotation.y, csgRotation.z)
      );
      geometry.applyMatrix4(rotationMatrix);

      // Debug info a tengely meghatározásához
      const axis = this.determineHoleAxis(csgRotation);
      console.log(
        `🔄 CSG wireframe: ${axis} tengely, kombinált rotáció: x:${(
          (csgRotation.x * 180) / Math.PI
        ).toFixed(1)}° y:${((csgRotation.y * 180) / Math.PI).toFixed(1)}° z:${(
          (csgRotation.z * 180) / Math.PI
        ).toFixed(1)}°`
      );
    }
  }

  // Rotáció kombináció segédfüggvény
  combineRotations(baseRotation, additionalRotation) {
    return {
      x: (baseRotation.x || 0) + (additionalRotation.x || 0),
      y: (baseRotation.y || 0) + (additionalRotation.y || 0),
      z: (baseRotation.z || 0) + (additionalRotation.z || 0),
    };
  }

  // Rotáció normalizálás (-π és π között)
  normalizeRotation(rotation) {
    const normalize = (angle) => {
      while (angle > Math.PI) angle -= 2 * Math.PI;
      while (angle < -Math.PI) angle += 2 * Math.PI;
      return angle;
    };

    return {
      x: normalize(rotation.x || 0),
      y: normalize(rotation.y || 0),
      z: normalize(rotation.z || 0),
    };
  }

  // Rotáció összehasonlítás (threshold-dal)
  rotationsEqual(rot1, rot2, threshold = 0.01) {
    const norm1 = this.normalizeRotation(rot1);
    const norm2 = this.normalizeRotation(rot2);

    return (
      Math.abs(norm1.x - norm2.x) < threshold &&
      Math.abs(norm1.y - norm2.y) < threshold &&
      Math.abs(norm1.z - norm2.z) < threshold
    );
  }

  // Debug info
  getRotationDebugInfo(rotation) {
    const degrees = {
      x: ((rotation.x || 0) * 180) / Math.PI,
      y: ((rotation.y || 0) * 180) / Math.PI,
      z: ((rotation.z || 0) * 180) / Math.PI,
    };

    return {
      radians: rotation,
      degrees: degrees,
      axis: this.determineHoleAxis(rotation),
      normalized: this.normalizeRotation(rotation),
    };
  }

  // Wireframe optimalizálás - egyszerűsített geometria LOD szerint
  createOptimizedWireframeGeometry(csgOperation, distance = 50) {
    const baseGeometry = this.createHoleOutlineGeometry(csgOperation);
    
    // Ha távol van, kevesebb szegmenssel
    if (distance > 100 && csgOperation.geometry === "cylinder") {
      const simplifiedOperation = {
        ...csgOperation,
        params: {
          ...csgOperation.params,
          segments: Math.max(8, csgOperation.params.segments / 2)
        }
      };
      return this.createHoleOutlineGeometry(simplifiedOperation);
    }

    return baseGeometry;
  }

  // Cleanup
  destroy() {
    console.log("CSGWireframeHelper v1.0.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.CSGWireframeHelper = CSGWireframeHelper;