/**
 * Wireframe Manager
 * Wireframe réteg kezelése tervrajz nézethez
 * v1.0.0 - ViewModeManager-ből kiszervezve
 */

class WireframeManager {
  constructor(sceneManager, csgWireframeHelper) {
    this.sceneManager = sceneManager;
    this.csgWireframeHelper = csgWireframeHelper;
    this.wireframeLayer = new Map(); // elementId -> wireframe mesh
    this.wireframeMaterial = this.createWireframeMaterial();
    
    console.log("WireframeManager v1.0.0 inicializálva");
  }

  // Wireframe anyag létrehozása
  createWireframeMaterial() {
    return new THREE.LineBasicMaterial({
      color: 0x333333,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    });
  }

  // Wireframe layer létrehozása
  createWireframeLayer(meshes, elements) {
    console.log("🔧 Wireframe layer létrehozása...");

    elements.forEach((element) => {
      const mesh = meshes.get(element.id);
      if (!mesh) return;

      // GROUP esetén nem készítünk wireframe-et
      if (mesh.userData && mesh.userData.isGroup) {
        console.log(`🚫 GROUP elem ${element.id} - wireframe kihagyva`);
        return;
      }

      // Hagyományos elem wireframe
      const wireframeGeometry = this.createWireframeGeometry(mesh);

      if (wireframeGeometry) {
        const wireframeMesh = new THREE.LineSegments(
          wireframeGeometry,
          this.wireframeMaterial
        );

        wireframeMesh.position.copy(mesh.position);
        wireframeMesh.rotation.copy(mesh.rotation);
        wireframeMesh.scale.copy(mesh.scale);

        wireframeMesh.userData = {
          isWireframe: true,
          parentId: element.id,
          elementType: element.type,
        };

        this.sceneManager.scene.add(wireframeMesh);
        this.wireframeLayer.set(element.id, wireframeMesh);
      }

      // CSG lyukak körvonalai
      this.addHoleOutlines(element, mesh);
    });

    console.log(`🎯 Wireframe layer kész: ${this.wireframeLayer.size} elem`);
  }

  // Wireframe geometria létrehozása
  createWireframeGeometry(mesh) {
    try {
      let geometry;

      if (mesh.userData.hasCSGOperations) {
        geometry = this.createSimplifiedBoundingGeometry(mesh);
      } else {
        geometry = mesh.geometry.clone();
      }

      const edgesGeometry = new THREE.EdgesGeometry(geometry, 15);
      return edgesGeometry;
    } catch (error) {
      console.error(
        `Wireframe geometria hiba (${mesh.userData.elementId}):`,
        error
      );
      return null;
    }
  }

  // Egyszerűsített befoglaló geometria készítése
  createSimplifiedBoundingGeometry(mesh) {
    const userData = mesh.userData;
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());

    switch (userData.elementType) {
      case "plate":
      case "covering":
      case "frame":
      case "wall":
        return new THREE.BoxGeometry(size.x, size.y, size.z);

      case "leg":
        const radius = Math.max(size.x, size.z) / 2;
        return new THREE.CylinderGeometry(radius, radius, size.y, 16);

      case "ball":
        const sphereRadius = Math.max(size.x, size.y, size.z) / 2;
        return new THREE.SphereGeometry(sphereRadius, 16, 12);

      default:
        return new THREE.BoxGeometry(size.x, size.y, size.z);
    }
  }

  // Lyukak körvonalainak hozzáadása
  addHoleOutlines(element, mesh, childRotation = null) {
    const csgOperations = element.geometry.csgOperations;
    let holeCount = 0;

    if (csgOperations && csgOperations.length > 0) {
      csgOperations.forEach((operation, index) => {
        if (operation.type === "subtract") {
          const holeOutlines = this.csgWireframeHelper.createHoleOutlineGeometry(
            operation, 
            mesh, 
            childRotation
          );
          
          if (holeOutlines && holeOutlines.length > 0) {
            holeOutlines.forEach((holeOutline, outlineIndex) => {
              this.addHoleOutlineToScene(
                holeOutline,
                mesh,
                element.id,
                `csg_${index}_${holeOutline.type}`,
                childRotation
              );
              holeCount++;
            });
          }
        }
      });
    }

    if (holeCount > 0) {
      console.log(`🔵 ${holeCount} lyuk körvonal hozzáadva: ${element.id}`);
    }
  }

  // Lyuk körvonal hozzáadása a scene-hez
  addHoleOutlineToScene(holeOutline, parentMesh, elementId, holeId, childRotation = null) {
    try {
      const holeWireframe = new THREE.LineSegments(
        holeOutline.geometry,
        this.wireframeMaterial
      );

      let finalHolePosition = {
        x: holeOutline.position.x,
        y: holeOutline.position.y,
        z: holeOutline.position.z,
      };

      // Gyerek rotáció transzformáció
      if (childRotation && (childRotation.x !== 0 || childRotation.y !== 0 || childRotation.z !== 0)) {
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationFromEuler(
          new THREE.Euler(childRotation.x, childRotation.y, childRotation.z)
        );
        
        const positionVector = new THREE.Vector3(
          finalHolePosition.x,
          finalHolePosition.y,
          finalHolePosition.z
        );
        
        positionVector.applyMatrix4(rotationMatrix);
        
        finalHolePosition = {
          x: positionVector.x,
          y: positionVector.y,
          z: positionVector.z,
        };
      }

      // Pozíció beállítása
      holeWireframe.position.set(
        parentMesh.position.x + finalHolePosition.x,
        parentMesh.position.y + finalHolePosition.y,
        parentMesh.position.z + finalHolePosition.z
      );

      // Kombinált rotáció
      let finalRotation = {
        x: parentMesh.rotation.x,
        y: parentMesh.rotation.y,
        z: parentMesh.rotation.z
      };

      if (childRotation) {
        finalRotation.x += childRotation.x;
        finalRotation.y += childRotation.y;
        finalRotation.z += childRotation.z;
      }

      holeWireframe.rotation.set(
        finalRotation.x,
        finalRotation.y,
        finalRotation.z
      );

      holeWireframe.userData = {
        isHoleOutline: true,
        parentId: elementId,
        holeId: holeId,
        originalHolePosition: holeOutline.position,
        transformedHolePosition: finalHolePosition,
        hasChildRotation: !!childRotation,
        finalRotation: finalRotation,
      };

      this.sceneManager.scene.add(holeWireframe);

      const combinedKey = `${elementId}_hole_${holeId}`;
      this.wireframeLayer.set(combinedKey, holeWireframe);
    } catch (error) {
      console.error("Lyuk körvonal scene hozzáadás hiba:", error);
    }
  }

  // Wireframe pozíciók frissítése (explode esetén)
  updateWireframePositions(meshes) {
    this.wireframeLayer.forEach((wireframeMesh, key) => {
      if (!key.includes("_hole_")) {
        // Sima elem wireframe
        const originalMesh = meshes.get(key);
        if (originalMesh && wireframeMesh) {
          wireframeMesh.position.copy(originalMesh.position);
          wireframeMesh.rotation.copy(originalMesh.rotation);
          wireframeMesh.scale.copy(originalMesh.scale);
        }
      } else {
        // Lyuk wireframe
        const elementId = key.split("_hole_")[0];
        const originalMesh = meshes.get(elementId);

        if (
          originalMesh &&
          wireframeMesh &&
          wireframeMesh.userData.isHoleOutline
        ) {
          const holePosition = wireframeMesh.userData.originalHolePosition || {
            x: 0,
            y: 0,
            z: 0,
          };

          wireframeMesh.position.set(
            originalMesh.position.x + holePosition.x,
            originalMesh.position.y + holePosition.y,
            originalMesh.position.z + holePosition.z
          );

          wireframeMesh.rotation.copy(originalMesh.rotation);
        }
      }
    });
  }

  // Wireframe layer eltávolítása
  removeWireframeLayer() {
    console.log("🧹 Wireframe layer eltávolítása...");

    this.wireframeLayer.forEach((wireframeMesh, elementId) => {
      this.sceneManager.scene.remove(wireframeMesh);
      if (wireframeMesh.geometry && wireframeMesh.geometry.dispose) {
        wireframeMesh.geometry.dispose();
      }
    });

    this.wireframeLayer.clear();
    console.log("✅ Wireframe layer törölve");
  }

  // Wireframe láthatóság beállítása
  setWireframeVisibility(visible) {
    this.wireframeLayer.forEach((wireframeMesh) => {
      wireframeMesh.visible = visible;
    });
  }

  // Elem wireframe láthatósága
  setElementWireframeVisibility(elementId, visible) {
    const wireframeMesh = this.wireframeLayer.get(elementId);
    if (wireframeMesh) {
      wireframeMesh.visible = visible;
    }

    // Lyuk wireframe-ek is
    this.wireframeLayer.forEach((wireframe, key) => {
      if (key.startsWith(`${elementId}_hole_`)) {
        wireframe.visible = visible;
      }
    });
  }

  // Debug info
  getWireframeInfo() {
    return {
      layerSize: this.wireframeLayer.size,
      elements: Array.from(this.wireframeLayer.keys()),
      hasCSGHelper: !!this.csgWireframeHelper,
    };
  }

  // Cleanup
  destroy() {
    this.removeWireframeLayer();
    
    if (this.wireframeMaterial && this.wireframeMaterial.dispose) {
      this.wireframeMaterial.dispose();
    }
    
    console.log("WireframeManager v1.0.0 cleanup kész");
  }
}

// Globális hozzáférhetőség
window.WireframeManager = WireframeManager;