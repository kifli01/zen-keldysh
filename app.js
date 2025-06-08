/**
 * Minigolf Pálya Viewer - Főalkalmazás
 * v1.11.0 - HDR Environment Meadow Integration
 */

// ES6 importok
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js"; // HDR loader
import * as ThreeMeshBVH from "three-mesh-bvh";
import * as ThreeBVHCSG from "three-bvh-csg";

// THREE.js globálisan elérhetővé tétele
window.THREE = THREE;
window.GLTFExporter = GLTFExporter;

// CSS2DRenderer külön globális változóként
window.CSS2DRenderer = CSS2DRenderer;
window.CSS2DObject = CSS2DObject;

// Globális változók
let elementManager;
let sceneManager;
let geometryBuilder;
let exploder;
let viewModeManager;
let csgManager;
let textureManager;
// ÚJ: Refaktorált manager objektumok elérhetősége
let wireframeManager;
let materialManager;
let lightingManager;
let hdrEnvironmentManager; // HDR Environment Manager
let postProcessingManager; // ÚJ: Post-Processing Manager
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

// CSS2DRenderer elérhetőség ellenőrzése
function checkCSS2DAvailability() {
  if (window.CSS2DRenderer && window.CSS2DObject) {
    console.log("✅ CSS2DRenderer elérhető");
    return true;
  } else {
    console.warn("⚠️ CSS2DRenderer nem elérhető, koordináta címkék nélkül");
    return false;
  }
}

// Főalkalmazás inicializálása
async function initialize() {
  try {
    console.log("Inicializálás kezdete v1.11.0 - Meadow HDR...");

    // Könyvtárak ellenőrzése
    const csgAvailable = initializeCSG();
    const shadersAvailable = checkShaderAvailability();
    const css2dAvailable = checkCSS2DAvailability();

    // Alapvető manager objektumok létrehozása
    textureManager = new TextureManager();
    textureManager.initialize();
    console.log("✅ TextureManager inicializálva");

    elementManager = new ElementManager();
    sceneManager = new SceneManager(
      document.getElementById("viewer-container")
    );
    geometryBuilder = new GeometryBuilder();
    exploder = new Exploder();
    
    // ÚJ: Refaktorált ViewModeManager három manager-rel
    viewModeManager = new ViewModeManager(sceneManager, geometryBuilder, textureManager);

    // ÚJ: HDR Environment Manager létrehozása
    hdrEnvironmentManager = new HDREnvironmentManager(sceneManager, textureManager);
    
    // ÚJ: Post-Processing Manager létrehozása
    postProcessingManager = new PostProcessingManager(sceneManager);
    
    // ÚJ: Specializált manager objektumok elérhetővé tétele
    wireframeManager = viewModeManager.getWireframeManager();
    materialManager = viewModeManager.getMaterialManager();
    lightingManager = viewModeManager.getLightingManager();

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
    minigolfElements = await window.loadModels();
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

    // MÓDOSÍTOTT: Alapértelmezett SZÍNES nézet beállítása
    viewModeManager.switchToRealistic(
      allMeshes,
      elementManager.getAllElements()
    );
    console.log("Színes nézet beállítva alapértelmezettként");

    // ÚJ: HDR Environment inicializálása - JAVÍTOTT ASYNC
    console.log("🌿 Meadow HDR Environment inicializálása...");
    try {
      const hdrInitialized = await hdrEnvironmentManager.initialize();
      
      if (hdrInitialized) {
        console.log("✅ HDR Manager inicializálva, meadow HDR betöltése...");
        
        // HDR betöltés megkísérlése
        try {
          await hdrEnvironmentManager.loadHDREnvironment();
          // Minden mesh environment frissítése
          hdrEnvironmentManager.updateAllMeshesEnvironment();
          console.log("🌟 Meadow HDR Environment sikeresen aktiválva!");
        } catch (hdrError) {
          console.warn("⚠️ Meadow HDR betöltés sikertelen, fallback használata:", hdrError);
        }
      } else {
        console.warn("❌ HDR Environment Manager nem inicializálható");
      }
    } catch (error) {
      console.error("HDR inicializálási hiba:", error);
    }

    // ÚJ: Post-Processing (Bloom) inicializálása
    console.log("✨ Post-Processing (Bloom) inicializálása...");
    try {
      const postProcessingInitialized = await postProcessingManager.initialize();
      
      if (postProcessingInitialized) {
        // Bloom bekapcsolása 'subtle' preset-tel (nem túl erős)
        postProcessingManager.setBloomPreset('subtle');
        postProcessingManager.setBloomEnabled(true);
        console.log("🌟 Bloom Effect aktiválva - subtle preset!");
      } else {
        console.warn("❌ Post-Processing nem inicializálható");
      }
    } catch (error) {
      console.error("Post-Processing inicializálási hiba:", error);
    }

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

    console.log("🎉 Inicializálás sikeres v1.11.0 - Meadow HDR!");
  } catch (error) {
    console.error("Hiba az inicializálás során:", error);
  }
}

// Globális hozzáférés debug-hoz
window.debugInfo = () => {
  console.log("=== DEBUG INFO v1.11.0 ===");
  console.log(
    "Element Manager:",
    elementManager?.getAllElements().length + " elem"
  );
  console.log("Scene Manager:", sceneManager?.getSceneInfo());
  console.log("Exploder:", exploder?.getState());
  console.log("View Mode Manager:", viewModeManager?.getViewModeInfo());
  console.log("Mesh-ek:", allMeshes?.size);
  console.log("Súly:", elementManager?.getTotalWeight().toFixed(2) + " g");
  
  // CSG debug info
  if (csgManager) {
    console.log("CSG Manager:", csgManager.getDebugInfo());
  }
  
  // ÚJ: Refaktorált manager debug info
  if (wireframeManager) {
    console.log("Wireframe Manager:", wireframeManager.getWireframeInfo());
  }
  if (materialManager) {
    console.log("Material Manager:", materialManager.getMaterialInfo());
  }
  if (lightingManager) {
    console.log("Lighting Manager:", lightingManager.getLightingInfo());
  }
  if (hdrEnvironmentManager) {
    console.log("HDR Environment Manager:", hdrEnvironmentManager.getStatus());
  }
  if (postProcessingManager) {
    console.log("Post-Processing Manager:", postProcessingManager.getStatus());
  }
  if (textureManager) {
    console.log("Texture Manager:", textureManager.getStatus());
  }
  
  console.log("Shaders:", checkShaderAvailability());
  console.log("CSS2D:", checkCSS2DAvailability());
  console.log("==================");
};

// ÚJ: Részletes ViewMode debug
window.viewModeDebug = () => {
  if (viewModeManager) {
    viewModeManager.logStatus();
  } else {
    console.warn("ViewModeManager nem elérhető");
  }
};

// Globális manager elérhetőség
window.elementManager = () => elementManager;
window.sceneManager = () => sceneManager;
window.csgManager = () => csgManager;
window.viewModeManager = () => viewModeManager;
window.exploder = () => exploder;
window.textureManager = () => textureManager;

// ÚJ: Refaktorált manager elérhetőség
window.wireframeManager = () => wireframeManager;
window.materialManager = () => materialManager;
window.lightingManager = () => lightingManager;
window.hdrEnvironmentManager = () => hdrEnvironmentManager; // HDR Manager hozzáadása
window.postProcessingManager = () => postProcessingManager; // ÚJ: Post-Processing Manager

// Egyedi elem láthatóság kapcsoló funkció
window.toggleElementVisibility = function (elementId, isVisible) {
  console.log(`Elem láthatóság váltás: ${elementId} -> ${isVisible}`);

  // Elem keresése ID szerint
  const mesh = allMeshes.get(elementId);
  if (mesh) {
    mesh.visible = isVisible;

    // ÚJ: Refaktorált wireframe kezelés
    if (viewModeManager.getCurrentMode() === "blueprint") {
      wireframeManager.setElementWireframeVisibility(elementId, isVisible);
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
  textureManager,
  // ÚJ: Refaktorált manager exportok
  wireframeManager,
  materialManager,
  lightingManager,
  hdrEnvironmentManager, // HDR Manager export
  allMeshes,
};