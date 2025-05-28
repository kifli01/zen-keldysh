/**
 * Minigolf Pálya Viewer - Főalkalmazás
 * v1.8.0 - Moduláris struktúra
 */

// ES6 importok
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import * as ThreeMeshBVH from "three-mesh-bvh";
import * as ThreeBVHCSG from "three-bvh-csg";

// THREE.js globálisan elérhetővé tétele
window.THREE = THREE;
window.GLTFExporter = GLTFExporter;

// Globális változók
let elementManager;
let sceneManager;
let geometryBuilder;
let exploder;
let viewModeManager;
let csgManager;
let allMeshes;

// CSG inicializálás
function initializeCSG() {
  try {
    // Könyvtárak hozzáférhetősége ellenőrzése
    if (!ThreeMeshBVH || !ThreeBVHCSG) {
      console.warn("CSG könyvtárak nem töltődtek be, fallback módra váltás");
      return false;
    }

    // Globális objektumok létrehozása kompatibilitás miatt
    window.MeshBVH = ThreeMeshBVH.MeshBVH;
    window.CSGAPI = ThreeBVHCSG;

    // CSG wrapper objektum
    window.CSG = {
      // Alapvető osztályok
      Brush: ThreeBVHCSG.Brush,
      Evaluator: ThreeBVHCSG.Evaluator,

      // Operációk
      ADDITION: ThreeBVHCSG.ADDITION,
      SUBTRACTION: ThreeBVHCSG.SUBTRACTION,
      INTERSECTION: ThreeBVHCSG.INTERSECTION,
      DIFFERENCE: ThreeBVHCSG.DIFFERENCE,

      // Kompatibilitási funkciók
      fromMesh: (mesh) => {
        const brush = new ThreeBVHCSG.Brush(mesh.geometry, mesh.material);
        brush.position.copy(mesh.position);
        brush.rotation.copy(mesh.rotation);
        brush.scale.copy(mesh.scale);
        brush.updateMatrixWorld();
        return brush;
      },

      toMesh: (brush, matrix) => {
        const mesh = new THREE.Mesh(brush.geometry, brush.material);
        if (matrix) mesh.applyMatrix4(matrix);
        return mesh;
      },
    };

    console.log("CSG könyvtárak sikeresen inicializálva (ES6 modules)");
    return true;
  } catch (error) {
    console.error("CSG inicializálás hiba:", error);
    return false;
  }
}

// Shader elérhetőség ellenőrzése
function checkShaderAvailability() {
  const shaders = {
    toonVertex: document.getElementById("toonVertexShader"),
    toonFragment: document.getElementById("toonFragmentShader"),
  };

  const missing = Object.entries(shaders)
    .filter(([name, element]) => !element)
    .map(([name]) => name);

  if (missing.length === 0) {
    console.log("✅ Minden shader elérhető");
    return true;
  } else {
    console.warn("⚠️ Hiányzó shaderek:", missing);
    return false;
  }
}

// Főalkalmazás inicializálása
async function initialize() {
  try {
    console.log("Inicializálás kezdete v1.8.1...");

    // Könyvtárak ellenőrzése
    const csgAvailable = initializeCSG();
    const shadersAvailable = checkShaderAvailability();

    // Manager objektumok létrehozása
    elementManager = new ElementManager();
    sceneManager = new SceneManager(
      document.getElementById("viewer-container")
    );
    geometryBuilder = new GeometryBuilder();
    exploder = new Exploder();
    viewModeManager = new ViewModeManager(sceneManager, geometryBuilder);

    // Keresztreferenciák beállítása
    exploder.setViewModeManager(viewModeManager);
    viewModeManager.setExploder(exploder);
    console.log("✅ Keresztreferenciák beállítva");

    // Shader támogatás beállítása
    if (shadersAvailable) {
      viewModeManager.setShadersAvailable(true);
      console.log("Custom shader támogatás engedélyezve");
    }

    // CSG Manager létrehozása ha elérhető
    if (csgAvailable && typeof CSGManager !== "undefined") {
      csgManager = new CSGManager();
      geometryBuilder.setCSGManager(csgManager);
      console.log("CSG Manager inicializálva");
    } else {
      console.log("CSG Manager nem elérhető, hagyományos módban folytatás");
    }

    console.log("Manager objektumok létrehozva");

    // Scene setup
    sceneManager.setup();
    console.log("Scene setup kész");

    // Elemek betöltése
    minigolfElements.forEach((element) => {
      elementManager.addElement(element);
    });
    console.log(`${minigolfElements.length} elem betöltve`);

    // Mesh-ek létrehozása
    const elements = elementManager.getAllElements();
    allMeshes = geometryBuilder.createAllMeshes(elements);
    console.log(`${allMeshes.size} mesh létrehozva`);

    // Mesh-ek hozzáadása a scene-hez
    sceneManager.addAllMeshes(allMeshes);
    console.log("Mesh-ek hozzáadva a scene-hez");

    // ViewModeManager inicializálása
    viewModeManager.saveOriginalMaterials(allMeshes);
    console.log("Eredeti anyagok mentve");

    // Exploder inicializálása
    exploder.saveOriginalPositions(allMeshes);
    console.log("Eredeti pozíciók mentve");

    // Alapértelmezett tervrajz nézet beállítása
    viewModeManager.switchToBlueprint(
      allMeshes,
      elementManager.getAllElements(),
      true
    );
    console.log("Tervrajz nézet beállítva alapértelmezettként");

    // Summary generálása
    const summary = elementManager.generateSummary();
    const summaryPanel = document.getElementById("summary-panel");
    summaryGenerator.renderFullSummary(
      summaryPanel,
      summary,
      elementManager.version
    );
    console.log("Summary generálva");

    // Event listener-ek beállítása (külső modulból)
    if (typeof setupEventListeners === "function") {
      setupEventListeners({
        exploder,
        viewModeManager,
        sceneManager,
        elementManager,
        allMeshes,
      });
      console.log("Event listener-ek beállítva");
    }

    console.log("Inicializálás sikeres v1.8.1!");
  } catch (error) {
    console.error("Hiba az inicializálás során:", error);
  }
}

// Globális hozzáférés debug-hoz
window.debugInfo = () => {
  console.log("=== DEBUG INFO v1.8.1 ===");
  console.log(
    "Element Manager:",
    elementManager?.getAllElements().length + " elem"
  );
  console.log("Scene Manager:", sceneManager?.getSceneInfo());
  console.log("Exploder:", exploder?.getState());
  console.log("View Mode Manager:", viewModeManager?.getCurrentMode());
  console.log("Mesh-ek:", allMeshes?.size);
  console.log("Súly:", elementManager?.getTotalWeight().toFixed(2) + " g");
  // CSG debug info
  if (csgManager) {
    console.log("CSG Manager:", csgManager.getDebugInfo());
  }
  console.log("Shaders:", checkShaderAvailability());
  console.log("==================");
};

window.elementManager = () => elementManager;
window.sceneManager = () => sceneManager;
window.csgManager = () => csgManager;
window.viewModeManager = () => viewModeManager;
window.exploder = () => exploder;

// Egyedi elem láthatóság kapcsoló funkció
window.toggleElementVisibility = function (elementId, isVisible) {
  console.log(`Elem láthatóság váltás: ${elementId} -> ${isVisible}`);

  // Elem keresése ID szerint
  const mesh = allMeshes.get(elementId);
  if (mesh) {
    mesh.visible = isVisible;

    // Ha blueprint módban vagyunk, az wireframe layer is kell frissíteni
    if (viewModeManager.getCurrentMode() === "blueprint") {
      const wireframeMesh = viewModeManager.wireframeLayer?.get(elementId);
      if (wireframeMesh) {
        wireframeMesh.visible = isVisible;
      }

      // Lyuk körvonalak is frissítése
      viewModeManager.wireframeLayer?.forEach((wireframe, key) => {
        if (key.startsWith(`${elementId}_hole_`)) {
          wireframe.visible = isVisible;
        }
      });
    }

    // Render frissítés
    sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
  } else {
    console.warn(`Elem nem található: ${elementId}`);
  }
};

// Inicializálás indítása az oldal betöltése után
document.addEventListener("DOMContentLoaded", initialize);

// Exportálás más modulok számára
export {
  elementManager,
  sceneManager,
  geometryBuilder,
  exploder,
  viewModeManager,
  csgManager,
  allMeshes,
};
