/**
 * Minigolf Pálya Viewer - Főalkalmazás
 * v1.12.0 - Async Normal Maps Integration
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
// Refaktorált manager objektumok elérhetősége
let wireframeManager;
let materialManager;
let lightingManager;
let hdrEnvironmentManager;
let postProcessingManager;
let allMeshes;

// CSG inicializálás (változatlan)
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

// Shader elérhetőség ellenőrzése (változatlan)
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

// CSS2DRenderer elérhetőség ellenőrzése (változatlan)
function checkCSS2DAvailability() {
  if (window.CSS2DRenderer && window.CSS2DObject) {
    console.log("✅ CSS2DRenderer elérhető");
    return true;
  } else {
    console.warn("⚠️ CSS2DRenderer nem elérhető, koordináta címkék nélkül");
    return false;
  }
}

// ÚJ v1.12.0: Főalkalmazás inicializálása async normal maps-ekkel
async function initialize() {
  try {
    console.log("🚀 Inicializálás kezdete v1.12.0 - Normal Maps Integration...");

    // Könyvtárak ellenőrzése
    const csgAvailable = initializeCSG();
    const shadersAvailable = checkShaderAvailability();
    const css2dAvailable = checkCSS2DAvailability();

    // ÚJ v1.12.0: TextureManager első inicializálása
    console.log("🎨 TextureManager inicializálása...");
    textureManager = new TextureManager();
    textureManager.initialize();
    console.log("✅ TextureManager v1.6.0 inicializálva");

    // Alapvető manager objektumok létrehozása
    elementManager = new ElementManager();
    sceneManager = new SceneManager(
      document.getElementById("viewer-container")
    );
    
    // ÚJ v1.12.0: GeometryBuilder + TextureManager integráció
    console.log("🔧 GeometryBuilder + TextureManager integráció...");
    geometryBuilder = new GeometryBuilder();
    geometryBuilder.setTextureManager(textureManager); // ← ÚJ!
    
    exploder = new Exploder();
    
    // Refaktorált ViewModeManager
    viewModeManager = new ViewModeManager(sceneManager, geometryBuilder, textureManager);

    // HDR Environment Manager létrehozása
    hdrEnvironmentManager = new HDREnvironmentManager(sceneManager, textureManager);
    
    // Post-Processing Manager létrehozása (ha elérhető)
    if (typeof PostProcessingManager !== 'undefined') {
      postProcessingManager = new PostProcessingManager(sceneManager);
    } else {
      console.warn("PostProcessingManager nem elérhető");
    }
    
    // Specializált manager objektumok elérhetővé tétele
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
    console.log("📦 Minigolf elemek betöltése...");
    minigolfElements = await window.loadModels();
    minigolfElements.forEach((element) => {
      elementManager.addElement(element);
    });
    console.log(`✅ ${minigolfElements.length} elem betöltve`);

    // ÚJ v1.12.0: Async Mesh-ek létrehozása Normal Maps-ekkel
    console.log("🎨 Async PBR Mesh-ek létrehozása Normal Maps-ekkel...");
    const elements = elementManager.getAllElements();
    
    // KRITIKUS: Async hívás!
    allMeshes = await geometryBuilder.createAllMeshes(elements);
    console.log(`✅ ${allMeshes.size} PBR mesh létrehozva Normal Maps-ekkel`);

    // ÚJ v1.12.0: PBR Statistics logging
    logPBRStatistics(allMeshes);

    // Mesh-ek hozzáadása a scene-hez
    sceneManager.addAllMeshes(allMeshes);
    console.log("Mesh-ek hozzáadva a scene-hez");

    // ViewModeManager inicializálása
    viewModeManager.saveOriginalMaterials(allMeshes);
    console.log("Eredeti anyagok mentve");

    // Exploder inicializálása
    exploder.saveOriginalPositions(allMeshes);
    console.log("Eredeti pozíciók mentve");

    // ALAPÉRTELMEZETT: Színes nézet beállítása (PBR Normal Maps-ekkel)
    console.log("🌟 Színes PBR nézet aktiválása Normal Maps-ekkel...");
    viewModeManager.switchToRealistic(
      allMeshes,
      elementManager.getAllElements()
    );
    console.log("✅ Színes PBR nézet beállítva alapértelmezettként");

    // HDR Environment inicializálása
    console.log("🌿 Meadow HDR Environment inicializálása...");
    try {
      const hdrInitialized = await hdrEnvironmentManager.initialize();
      
      if (hdrInitialized) {
        console.log("✅ HDR Manager inicializálva, meadow HDR betöltése...");
        
        try {
          await hdrEnvironmentManager.loadHDREnvironment();
          // Minden mesh environment frissítése (most már Normal Maps-ekkel!)
          hdrEnvironmentManager.updateAllMeshesEnvironment();
          console.log("🌟 Meadow HDR Environment + Normal Maps aktiválva!");
        } catch (hdrError) {
          console.warn("⚠️ Meadow HDR betöltés sikertelen, fallback használata:", hdrError);
        }
      } else {
        console.warn("❌ HDR Environment Manager nem inicializálható");
      }
    } catch (error) {
      console.error("HDR inicializálási hiba:", error);
    }

    // Post-Processing (Bloom + SSAO) inicializálása
    if (postProcessingManager) {
      console.log("✨ Post-Processing (Bloom + SSAO) inicializálása...");
      try {
        const postProcessingInitialized = await postProcessingManager.initialize();
        
        if (postProcessingInitialized) {
          // Bloom bekapcsolása 'subtle' preset-tel
          postProcessingManager.setBloomPreset('subtle');
          postProcessingManager.setBloomEnabled(true);
          
          // SSAO bekapcsolása 'architectural' preset-tel
          postProcessingManager.setSSAOPreset('architectural');
          postProcessingManager.setSSAOEnabled(true);
          
          console.log("🌟 Bloom + SSAO Effect aktiválva Normal Maps-ekkel!");
        } else {
          console.warn("❌ Post-Processing nem inicializálható");
        }
      } catch (error) {
        console.error("Post-Processing inicializálási hiba:", error);
      }
    } else {
      console.log("Post-Processing Manager nincs elérhető, folytatás nélküle");
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

    // Event listener-ek beállítása
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

    console.log("🎉 Inicializálás sikeres v1.12.0 - Normal Maps Integration!");
    
    // ÚJ v1.12.0: Teljes rendszer status
    logSystemStatus();
    
  } catch (error) {
    console.error("❌ Hiba az inicializálás során:", error);
    
    // ÚJ v1.12.0: Error recovery - fallback inicializálás Normal Maps nélkül
    console.log("🔄 Error recovery - fallback inicializálás...");
    await initializeFallback();
  }
}

// ÚJ v1.12.0: PBR Statistics logging
function logPBRStatistics(meshes) {
  let pbrCount = 0;
  let legacyCount = 0;
  let totalMaps = {
    diffuse: 0,
    normal: 0,
    roughness: 0,
    metalness: 0,
    ao: 0
  };

  meshes.forEach((mesh, elementId) => {
    if (mesh.userData.materialType === 'PBR') {
      pbrCount++;
      
      // Map statistics
      if (mesh.userData.hasDiffuseMap) totalMaps.diffuse++;
      if (mesh.userData.hasNormalMap) totalMaps.normal++;
      if (mesh.userData.hasRoughnessMap) totalMaps.roughness++;
      if (mesh.userData.hasMetalnessMap) totalMaps.metalness++;
      if (mesh.userData.hasAOMap) totalMaps.ao++;
      
      // GROUP gyerekek számítása
      if (mesh.userData.isGroup) {
        mesh.children.forEach(child => {
          if (child.userData.hasNormalMap) totalMaps.normal++;
          if (child.userData.hasRoughnessMap) totalMaps.roughness++;
          if (child.userData.hasMetalnessMap) totalMaps.metalness++;
          if (child.userData.hasAOMap) totalMaps.ao++;
        });
      }
    } else {
      legacyCount++;
    }
  });

  console.log("📊 PBR STATISTICS v1.12.0:");
  console.log(`   Materials: ${pbrCount} PBR, ${legacyCount} Legacy`);
  console.log(`   Diffuse Maps: ${totalMaps.diffuse}`);
  console.log(`   Normal Maps: ${totalMaps.normal} ✨`);
  console.log(`   Roughness Maps: ${totalMaps.roughness}`);
  console.log(`   Metalness Maps: ${totalMaps.metalness}`);
  console.log(`   AO Maps: ${totalMaps.ao}`);
  console.log(`   Total Texture Maps: ${Object.values(totalMaps).reduce((a, b) => a + b, 0)}`);
}

// ÚJ v1.12.0: Teljes rendszer status
function logSystemStatus() {
  console.log("🎯 SYSTEM STATUS v1.12.0:");
  console.log(`   TextureManager: ${textureManager.getStatus().version}`);
  console.log(`   GeometryBuilder: ${geometryBuilder.getPBRStatus().version}`);
  console.log(`   Material Cache: ${geometryBuilder.getMaterialCacheStats().cacheSize} items`);
  console.log(`   HDR Environment: ${hdrEnvironmentManager.getStatus().isLoaded ? '✅' : '❌'}`);
  console.log(`   Post-Processing: ${postProcessingManager ? '✅' : '❌'}`);
}

// ÚJ v1.12.0: Fallback inicializálás Normal Maps hibák esetén
async function initializeFallback() {
  try {
    console.log("🔄 Fallback inicializálás Normal Maps nélkül...");
    
    // Egyszerű mesh-ek létrehozása legacy módban
    const elements = elementManager.getAllElements();
    
    // Disable PBR minden material-ban
    elements.forEach(element => {
      if (element.material && element.material.enablePBR) {
        element.material.enablePBR = false;
        console.log(`🔄 PBR disabled: ${element.id}`);
      }
    });
    
    // Fallback mesh creation
    allMeshes = await geometryBuilder.createAllMeshes(elements);
    sceneManager.addAllMeshes(allMeshes);
    
    console.log("✅ Fallback inicializálás sikeres");
    
  } catch (fallbackError) {
    console.error("❌ Fallback inicializálás is sikertelen:", fallbackError);
  }
}

// Globális hozzáférés debug-hoz (bővített v1.12.0)
window.debugInfo = () => {
  console.log("=== DEBUG INFO v1.12.0 ===");
  console.log("Element Manager:", elementManager?.getAllElements().length + " elem");
  console.log("Scene Manager:", sceneManager?.getSceneInfo());
  console.log("Exploder:", exploder?.getState());
  console.log("View Mode Manager:", viewModeManager?.getViewModeInfo());
  console.log("Mesh-ek:", allMeshes?.size);
  console.log("Súly:", elementManager?.getTotalWeight().toFixed(2) + " g");
  
  // CSG debug info
  if (csgManager) {
    console.log("CSG Manager:", csgManager.getDebugInfo());
  }
  
  // Refaktorált manager debug info
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
  
  // ÚJ v1.12.0: PBR Debug info
  if (textureManager) {
    console.log("Texture Manager:", textureManager.getStatus());
    textureManager.listLoadedTextures();
  }
  if (geometryBuilder) {
    console.log("Geometry Builder:", geometryBuilder.getPBRStatus());
    console.log("Material Cache:", geometryBuilder.getMaterialCacheStats());
  }
  
  console.log("Shaders:", checkShaderAvailability());
  console.log("CSS2D:", checkCSS2DAvailability());
  console.log("==================");
};

// ÚJ v1.12.0: Normal Maps specifikus debug
window.normalMapsDebug = () => {
  if (!allMeshes) {
    console.log("❌ Nincs mesh adat");
    return;
  }
  
  console.log("=== NORMAL MAPS DEBUG ===");
  
  allMeshes.forEach((mesh, elementId) => {
    if (mesh.userData.hasNormalMap) {
      console.log(`✅ ${elementId}: Normal Map aktív`);
      
      // Material részletek
      if (mesh.material && mesh.material.normalMap) {
        const normalMap = mesh.material.normalMap;
        console.log(`   Textúra: ${normalMap.image?.currentSrc || 'ismeretlen'}`);
        console.log(`   Méret: ${normalMap.image?.width}x${normalMap.image?.height}`);
        console.log(`   Normal Scale: ${mesh.material.normalScale.x}`);
      }
    }
  });
  
  console.log("========================");
};

// Részletes ViewMode debug (változatlan)
window.viewModeDebug = () => {
  if (viewModeManager) {
    viewModeManager.logStatus();
  } else {
    console.warn("ViewModeManager nem elérhető");
  }
};

// Globális manager elérhetőség (változatlan)
window.elementManager = () => elementManager;
window.sceneManager = () => sceneManager;
window.csgManager = () => csgManager;
window.viewModeManager = () => viewModeManager;
window.exploder = () => exploder;
window.textureManager = () => textureManager;

// Refaktorált manager elérhetőség
window.wireframeManager = () => wireframeManager;
window.materialManager = () => materialManager;
window.lightingManager = () => lightingManager;
window.hdrEnvironmentManager = () => hdrEnvironmentManager;
window.postProcessingManager = () => postProcessingManager;

// Egyedi elem láthatóság kapcsoló funkció (változatlan)
window.toggleElementVisibility = function (elementId, isVisible) {
  console.log(`Elem láthatóság váltás: ${elementId} -> ${isVisible}`);

  const mesh = allMeshes.get(elementId);
  if (mesh) {
    mesh.visible = isVisible;

    if (viewModeManager.getCurrentMode() === "blueprint") {
      wireframeManager.setElementWireframeVisibility(elementId, isVisible);
    }

    sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
  } else {
    console.warn(`Elem nem található: ${elementId}`);
  }
};

// Inicializálás indítása az oldal betöltése után
document.addEventListener("DOMContentLoaded", initialize);

// Exportálás más modulok számára (bővített v1.12.0)
export {
  elementManager,
  sceneManager,
  geometryBuilder,
  exploder,
  viewModeManager,
  csgManager,
  textureManager, // TextureManager export
  // Refaktorált manager exportok
  wireframeManager,
  materialManager,
  lightingManager,
  hdrEnvironmentManager,
  allMeshes,
};