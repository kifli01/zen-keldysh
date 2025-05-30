/**
 * CSG Manager
 * CSG műveletek központi kezelése és optimalizálása
 * v1.6.0 - Rotáció támogatás hozzáadva
 */

class CSGManager {
  constructor() {
    this.cache = new Map();
    this.isCSGAvailable = this.validateCSGSupport();
    this.profiler = new CSGProfiler();

    console.log(
      `CSG Manager inicializálva - CSG támogatás: ${this.isCSGAvailable}`
    );
  }

  // CSG támogatás ellenőrzése
  validateCSGSupport() {
    try {
      if (!window.CSG) {
        console.warn("window.CSG nem elérhető");
        return false;
      }

      if (!window.CSG.Brush) {
        console.warn("CSG.Brush nem elérhető");
        return false;
      }

      if (!window.CSG.Evaluator) {
        console.warn("CSG.Evaluator nem elérhető");
        return false;
      }

      // EGYSZERŰ TESZT - két kocka CSG művelet
      console.log("CSG teszt kezdése...");

      const testGeom1 = new THREE.BoxGeometry(10, 10, 10);
      const testGeom2 = new THREE.BoxGeometry(5, 5, 15);

      const brush1 = new window.CSG.Brush(testGeom1);
      brush1.updateMatrixWorld();

      const brush2 = new window.CSG.Brush(testGeom2);
      brush2.position.set(0, 0, 0);
      brush2.updateMatrixWorld();

      const evaluator = new window.CSG.Evaluator();
      const result = evaluator.evaluate(brush1, brush2, window.CSG.SUBTRACTION);

      if (!result || !result.geometry) {
        console.warn("CSG teszt sikertelen - nincs eredmény geometria");
        return false;
      }

      console.log("CSG teszt sikeres!");

      // Cleanup
      testGeom1.dispose();
      testGeom2.dispose();

      return true;
    } catch (error) {
      console.error("CSG támogatás teszt hiba:", error);
      return false;
    }
  }

  // ÚJ: Batch CSG műveletek - hasonló műveleteket csoportosítunk
  createCSGGeometry(baseGeometry, csgOperations) {
    if (!this.isCSGAvailable) {
      console.warn("CSG nem elérhető, eredeti geometria visszaadása");
      return baseGeometry;
    }

    if (!csgOperations || csgOperations.length === 0) {
      return baseGeometry;
    }

    console.log(`CSG művelet optimalizálás: ${csgOperations.length} művelet`);

    // Batch optimalizálás: csoportosítjuk a hasonló műveleteket
    const optimizedOperations = this.optimizeOperations(csgOperations);
    console.log(`Optimalizálás után: ${optimizedOperations.length} művelet`);

    const cacheKey = this.generateCacheKey(baseGeometry, optimizedOperations);

    // Cache ellenőrzés
    if (CSG_PERFORMANCE.enableCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CSG_PERFORMANCE.maxCacheAge) {
        if (CSG_DEBUG.logOperations) {
          console.log("CSG geometria cache-ből betöltve:", cacheKey);
        }
        return cached.geometry.clone();
      } else {
        this.cache.delete(cacheKey);
      }
    }

    // Performance mérés kezdése
    const operationStart = performance.now();

    try {
      // Alap brush létrehozása
      const baseMesh = new THREE.Mesh(baseGeometry);
      baseMesh.updateMatrixWorld();

      let resultBrush = new window.CSG.Brush(baseGeometry);
      resultBrush.updateMatrixWorld();

      // CSG Evaluator létrehozása
      const evaluator = new window.CSG.Evaluator();

      // Optimalizált műveletek végrehajtása
      for (let i = 0; i < optimizedOperations.length; i++) {
        const operation = optimizedOperations[i];
        console.log(
          `CSG batch művelet ${i + 1}/${optimizedOperations.length}: ${
            operation.type
          } (${operation.count || 1} elem)`
        );

        try {
          let operationBrush;

          if (operation.combined) {
            // Kombinált geometria (több lyuk egy műveletben)
            operationBrush = operation.combined;
          } else {
            // JAVÍTOTT: Egyedi művelet - csak pozíció, rotáció már a geometriában
            const operationGeometry = this.createOperationGeometry(operation);
            const operationMesh = new THREE.Mesh(operationGeometry);

            // Csak pozíció alkalmazása - rotáció már a geometriában van
            if (operation.position) {
              operationMesh.position.set(
                operation.position.x,
                operation.position.y,
                operation.position.z
              );
            }

            operationMesh.updateMatrixWorld();
            operationBrush = new window.CSG.Brush(operationGeometry);

            // Pozíció alkalmazása a brush-ra
            if (operation.position) {
              operationBrush.position.copy(operationMesh.position);
            }

            // ELTÁVOLÍTVA: Brush-ra rotáció alkalmazás, mert már a geometriában van
            operationBrush.updateMatrixWorld();
          }

          // CSG művelet típus
          let csgOpType;
          switch (operation.type) {
            case CSG_OPERATIONS.SUBTRACT:
              csgOpType = window.CSG.SUBTRACTION;
              break;
            case CSG_OPERATIONS.UNION:
              csgOpType = window.CSG.ADDITION;
              break;
            case CSG_OPERATIONS.INTERSECT:
              csgOpType = window.CSG.INTERSECTION;
              break;
            default:
              console.warn(`Ismeretlen CSG művelet: ${operation.type}`);
              continue;
          }

          // Evaluator.evaluate() használata
          const newResultBrush = evaluator.evaluate(
            resultBrush,
            operationBrush,
            csgOpType
          );
          resultBrush = newResultBrush;

          console.log(`CSG batch művelet ${i + 1} sikeres`);
        } catch (operationError) {
          console.error(`CSG művelet ${i + 1} hiba:`, operationError);
          continue;
        }
      }

      // Végeredmény geometria kinyerése
      let resultGeometry = resultBrush.geometry;

      // ÚJ: Geometria simplifikáció
      resultGeometry = this.simplifyGeometry(resultGeometry);

      // Performance mérés befejezése
      const operationTime = performance.now() - operationStart;
      this.profiler.recordOperation(
        cacheKey,
        operationTime,
        optimizedOperations.length
      );

      console.log(`CSG műveletek befejezve: ${operationTime.toFixed(2)}ms`);

      // Figyelmeztetés lassú műveletre
      if (operationTime > CSG_PERFORMANCE.warnThreshold) {
        console.warn(`Lassú CSG művelet: ${operationTime.toFixed(2)}ms`);
      }

      // Cache-be mentés
      if (CSG_PERFORMANCE.enableCache) {
        this.cache.set(cacheKey, {
          geometry: resultGeometry.clone(),
          timestamp: Date.now(),
          operationTime: operationTime,
        });
      }

      return resultGeometry;
    } catch (error) {
      console.error("CSG művelet hiba:", error);
      console.warn("Eredeti geometria visszaadása CSG hiba miatt");
      return baseGeometry;
    }
  }

  // ÚJ: Műveletek optimalizálása - hasonló lyukakat csoportosítjuk
  optimizeOperations(operations) {
    // Csoportosítás típus és paraméterek szerint
    const groups = new Map();

    operations.forEach((op) => {
      // ÚJ: Rotáció is része a csoportosítási kulcsnak
      const rotationKey = op.rotation
        ? `_${op.rotation.x.toFixed(2)}_${op.rotation.y.toFixed(
            2
          )}_${op.rotation.z.toFixed(2)}`
        : "_0_0_0";

      const key = `${op.type}_${op.geometry}_${JSON.stringify(
        op.params
      )}${rotationKey}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(op);
    });

    const optimizedOps = [];

    groups.forEach((groupOps, key) => {
      if (groupOps.length === 1) {
        // Egyedi művelet
        optimizedOps.push(groupOps[0]);
      } else if (groupOps.length <= 10) {
        // Kis csoport - kombináljuk
        console.log(
          `Kombinálás: ${groupOps.length} hasonló lyuk (rotáció: ${
            groupOps[0].rotation ? "van" : "nincs"
          })`
        );
        const combinedBrush = this.combineOperations(groupOps);
        if (combinedBrush) {
          optimizedOps.push({
            type: groupOps[0].type,
            combined: combinedBrush,
            count: groupOps.length,
          });
        } else {
          // Ha kombinálás sikertelen, egyenként
          optimizedOps.push(...groupOps);
        }
      } else {
        // Nagy csoport - batch-eljük
        console.log(`Batch feldolgozás: ${groupOps.length} lyuk`);
        const batches = this.createBatches(groupOps, 10);
        batches.forEach((batch) => {
          const combinedBrush = this.combineOperations(batch);
          if (combinedBrush) {
            optimizedOps.push({
              type: batch[0].type,
              combined: combinedBrush,
              count: batch.length,
            });
          } else {
            optimizedOps.push(...batch);
          }
        });
      }
    });

    return optimizedOps;
  }

  // ÚJ: Műveletek kombinálása egy brush-ba
  combineOperations(operations) {
    try {
      if (operations.length === 0) return null;

      // Első geometria
      const firstOp = operations[0];
      const firstGeometry = this.createOperationGeometry(firstOp);
      let combinedGeometry = firstGeometry;

      // További geometriák hozzáadása
      for (let i = 1; i < operations.length; i++) {
        const op = operations[i];
        const opGeometry = this.createOperationGeometry(op);

        // Pozíció alkalmazása
        if (op.position) {
          opGeometry.translate(op.position.x, op.position.y, op.position.z);
        }

        // ÚJ: Rotáció alkalmazása - külön kezelni kell
        if (op.rotation) {
          // Rotáció alkalmazása a geometriára
          const matrix = new THREE.Matrix4();
          matrix.makeRotationFromEuler(
            new THREE.Euler(op.rotation.x, op.rotation.y, op.rotation.z)
          );
          opGeometry.applyMatrix4(matrix);
        }

        // Geometriák merge-elése
        combinedGeometry = this.mergeGeometries([combinedGeometry, opGeometry]);
      }

      // Első pozíció alkalmazása a kombinált geometriára
      if (firstOp.position) {
        combinedGeometry.translate(
          firstOp.position.x,
          firstOp.position.y,
          firstOp.position.z
        );
      }

      // ÚJ: Első rotáció alkalmazása a kombinált geometriára
      if (firstOp.rotation) {
        const matrix = new THREE.Matrix4();
        matrix.makeRotationFromEuler(
          new THREE.Euler(
            firstOp.rotation.x,
            firstOp.rotation.y,
            firstOp.rotation.z
          )
        );
        combinedGeometry.applyMatrix4(matrix);
      }

      // Brush létrehozása
      const combinedMesh = new THREE.Mesh(combinedGeometry);
      combinedMesh.updateMatrixWorld();
      const combinedBrush = new window.CSG.Brush(combinedGeometry);
      combinedBrush.updateMatrixWorld();

      return combinedBrush;
    } catch (error) {
      console.error("Kombinálás hiba:", error);
      return null;
    }
  }

  // ÚJ: Geometriák merge-elése
  mergeGeometries(geometries) {
    // BufferGeometryUtils.mergeGeometries használata
    if (
      window.THREE.BufferGeometryUtils &&
      window.THREE.BufferGeometryUtils.mergeGeometries
    ) {
      return window.THREE.BufferGeometryUtils.mergeGeometries(geometries);
    } else {
      // Fallback: első geometria visszaadása
      console.warn("BufferGeometryUtils nem elérhető, fallback");
      return geometries[0];
    }
  }

  // ÚJ: Geometria simplifikáció
  simplifyGeometry(geometry) {
    try {
      // 1. Vertex merging - közeli pontok összevonása
      geometry.mergeVertices ? geometry.mergeVertices() : null;

      // 2. Buffer geometry optimalizálás
      if (geometry.index) {
        // Duplikált vertex-ek eltávolítása
        const vertices = geometry.attributes.position.array;
        const normals = geometry.attributes.normal
          ? geometry.attributes.normal.array
          : null;
        const indices = geometry.index.array;

        console.log(
          `Geometria simplifikáció előtt: ${indices.length / 3} háromszög`
        );

        // Alapvető cleanup
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        console.log(
          `Geometria simplifikáció után: ${indices.length / 3} háromszög`
        );
      }

      return geometry;
    } catch (error) {
      console.warn("Geometria simplifikáció hiba:", error);
      return geometry;
    }
  }

  // ÚJ: LOD (Level of Detail) geometria
  createLODGeometry(operation, distance = 50) {
    const params = operation.params;

    // Távolság alapján csökkentjük a részletességet
    let segments = 8; // Alapértelmezett

    if (distance < 20) {
      segments = 12; // Közel: több részlet
    } else if (distance > 100) {
      segments = 6; // Távol: kevesebb részlet
    }

    switch (operation.geometry) {
      case "cylinder":
        return new THREE.CylinderGeometry(
          params.radius,
          params.radius,
          params.height,
          segments
        );

      default:
        return this.createOperationGeometry(operation);
    }
  }

  // MÓDOSÍTOTT: Műveleti geometria létrehozása - rotáció figyelembe vétele
  createOperationGeometry(operation) {
    const params = operation.params;

    let geometry;
    switch (operation.geometry) {
      case "cylinder":
        geometry = new THREE.CylinderGeometry(
          params.radius,
          params.radius,
          params.height,
          16 // Visszaállítva 8-ról 16-ra - simább lyukak
        );
        break;

      case "box":
        geometry = new THREE.BoxGeometry(
          params.width,
          params.height,
          params.length
        );
        break;

      case "sphere":
        geometry = new THREE.SphereGeometry(
          params.radius,
          16, // Visszaállítva 8-ról 16-ra
          12 // Visszaállítva 6-ról 12-re
        );
        break;

      default:
        console.warn(`Ismeretlen geometria típus: ${operation.geometry}`);
        return new THREE.BoxGeometry(1, 1, 1);
    }

    // JAVÍTOTT: Rotáció alkalmazása közvetlenül a geometriára
    // Ez biztosítja hogy a geometria már elforgatva jön létre
    if (operation.rotation) {
      const matrix = new THREE.Matrix4();
      matrix.makeRotationFromEuler(
        new THREE.Euler(
          operation.rotation.x,
          operation.rotation.y,
          operation.rotation.z
        )
      );
      geometry.applyMatrix4(matrix);
    }

    return geometry;
  }

  // MÓDOSÍTOTT: Cache kulcs generálása - rotáció figyelembe vétele
  generateCacheKey(baseGeometry, operations) {
    const geometryKey = `${baseGeometry.type}_${
      baseGeometry.parameters
        ? JSON.stringify(baseGeometry.parameters)
        : "custom"
    }`;
    const operationsKey = operations
      .map((op) => {
        const rotationKey = op.rotation
          ? `_rot_${op.rotation.x.toFixed(2)}_${op.rotation.y.toFixed(
              2
            )}_${op.rotation.z.toFixed(2)}`
          : "";
        return `${op.type}_${op.geometry}_${JSON.stringify(
          op.params
        )}${rotationKey}`;
      })
      .join("_");

    return `${geometryKey}_${operationsKey}`;
  }

  // Lyukak CSG műveletté konvertálása (kompatibilitási réteg)
  convertHolesToCSGOperations(holes) {
    if (!holes || holes.length === 0) {
      return [];
    }

    return holes
      .map((hole) => {
        if (hole.type === "circle") {
          return {
            type: CSG_OPERATIONS.SUBTRACT,
            geometry: "cylinder",
            params: {
              radius: hole.radius,
              height: hole.depth || 10, // Alapértelmezett mélység
              segments: 16,
            },
            position: hole.position,
            // ÚJ: Rotáció támogatás legacy hole-okhoz is
            rotation: hole.rotation || { x: 0, y: 0, z: 0 },
          };
        }

        // További lyuk típusok támogatása a jövőben
        console.warn(`Nem támogatott lyuk típus: ${hole.type}`);
        return null;
      })
      .filter(Boolean);
  }

  // Batch létrehozás helper
  createBatches(operations, batchSize) {
    const batches = [];
    for (let i = 0; i < operations.length; i += batchSize) {
      batches.push(operations.slice(i, i + batchSize));
    }
    return batches;
  }

  // Cache tisztítása
  clearCache() {
    this.cache.clear();
    console.log("CSG cache törölve");
  }

  // Cache méret lekérdezése
  getCacheSize() {
    return this.cache.size;
  }

  // Debug információk
  getDebugInfo() {
    return {
      isCSGAvailable: this.isCSGAvailable,
      cacheSize: this.cache.size,
      totalOperations: this.profiler.getTotalOperations(),
      averageTime: this.profiler.getAverageTime(),
      slowOperations: this.profiler.getSlowOperations(),
    };
  }

  // Cleanup
  destroy() {
    this.clearCache();
    this.profiler.reset();
  }
}

// CSG Performance Profiler
class CSGProfiler {
  constructor() {
    this.operations = [];
    this.enabled = CSG_PERFORMANCE.enableProfiling;
  }

  recordOperation(cacheKey, time, operationCount) {
    if (!this.enabled) return;

    this.operations.push({
      cacheKey,
      time,
      operationCount,
      timestamp: Date.now(),
    });

    // Korlátozott méretű history
    if (this.operations.length > 1000) {
      this.operations = this.operations.slice(-500);
    }
  }

  getTotalOperations() {
    return this.operations.length;
  }

  getAverageTime() {
    if (this.operations.length === 0) return 0;

    const totalTime = this.operations.reduce((sum, op) => sum + op.time, 0);
    return totalTime / this.operations.length;
  }

  getSlowOperations() {
    return this.operations.filter(
      (op) => op.time > CSG_PERFORMANCE.warnThreshold
    );
  }

  reset() {
    this.operations = [];
  }
}

// CSG Cache Helper
class CSGCache {
  constructor(maxSize = CSG_PERFORMANCE.cacheSize) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < CSG_PERFORMANCE.maxCacheAge) {
      return item;
    }
    this.cache.delete(key);
    return null;
  }

  set(key, value) {
    // Cache size limit
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      ...value,
      timestamp: Date.now(),
    });
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}
