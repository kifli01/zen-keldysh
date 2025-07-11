/**
 * Minigolf Pálya Viewer - Főalkalmazás
 * v1.13.3 - Post-processing világítás optimalizálás
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
let sectionExploder;

// ÚJ v1.13.1: localStorage Láthatóság Mentés
const VISIBILITY_STORAGE_KEY = 'minigolf_element_visibility';

// Láthatóság állapot betöltése localStorage-ból
function loadVisibilityState() {
  console.log("📂 Láthatóság állapot betöltése localStorage-ból...");
  
  try {
    const savedState = localStorage.getItem(VISIBILITY_STORAGE_KEY);
    if (savedState) {
      const visibilityMap = JSON.parse(savedState);
      console.log(`✅ ${Object.keys(visibilityMap).length} elem láthatóság betöltve`);
      return visibilityMap;
    }
  } catch (error) {
    console.warn("⚠️ Láthatóság betöltési hiba:", error);
  }
  
  console.log("Nincs mentett láthatóság állapot");
  return {};
}

// Láthatóság állapot mentése localStorage-ba
function saveVisibilityState() {
  if (!allMeshes) return;
  
  try {
    const visibilityMap = {};
    
    allMeshes.forEach((mesh, elementId) => {
      visibilityMap[elementId] = mesh.visible;
    });
    
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(visibilityMap));
    console.log(`💾 ${Object.keys(visibilityMap).length} elem láthatóság mentve`);
  } catch (error) {
    console.warn("⚠️ Láthatóság mentési hiba:", error);
  }
}

// Mentett láthatóság alkalmazása az elemekre
function applyVisibilityState(visibilityMap) {
  if (!allMeshes || Object.keys(visibilityMap).length === 0) return;
  
  let appliedCount = 0;
  
  allMeshes.forEach((mesh, elementId) => {
    if (visibilityMap.hasOwnProperty(elementId)) {
      const shouldBeVisible = visibilityMap[elementId];
      
      if (mesh.visible !== shouldBeVisible) {
        mesh.visible = shouldBeVisible;
        
        // Blueprint wireframe is frissítése
        if (viewModeManager && viewModeManager.getCurrentMode() === "blueprint") {
          wireframeManager.setElementWireframeVisibility(elementId, shouldBeVisible);
        }
        
        // UI checkbox szinkronizálása
        const checkbox = document.querySelector(`[data-element-id="${elementId}"]`);
        if (checkbox) {
          checkbox.checked = shouldBeVisible;
        }
        
        appliedCount++;
      }
    }
  });
  
  if (appliedCount > 0) {
    console.log(`🔄 ${appliedCount} elem láthatóság frissítve localStorage-ból`);
    sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
  }
}

// Láthatóság törlése (debug funkcióhoz)
function clearVisibilityState() {
  try {
    localStorage.removeItem(VISIBILITY_STORAGE_KEY);
    console.log("🧹 Láthatóság állapot törölve");
  } catch (error) {
    console.warn("⚠️ Láthatóság törlési hiba:", error);
  }
}

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

async function setRealisticPostProcesing() {
  if (postProcessingManager) {
      console.log("✨ Post-Processing (FXAA + Bloom + SSAO) inicializálása...");
      try {
        const postProcessingInitialized = await postProcessingManager.initialize();
        
        if (postProcessingInitialized) {
          // ELSŐ: FXAA Anti-aliasing aktiválása (alapvető minőségjavítás)
          postProcessingManager.setFXAAEnabled(true);
          postProcessingManager.setFXAAPreset('default');
          console.log("🎯 FXAA Anti-aliasing aktiválva!");
          
          // MÁSODIK: Bloom bekapcsolása 'subtle' preset-tel
          postProcessingManager.setBloomPreset('subtle');
          postProcessingManager.setBloomEnabled(true);
          
          // HARMADIK: SSAO bekapcsolása 'architectural' preset-tel
          postProcessingManager.setSSAOPreset('architectural');
          postProcessingManager.setSSAOEnabled(true);
          
          // ÚJ v1.13.3: Világítás optimalizálás post-processing-hez
          console.log("💡 Világítás optimalizálás post-processing pipeline-hoz...");
          
          // Tone mapping exposure növelése
          sceneManager.renderer.toneMappingExposure = 1.5;
          
          // Bloom beállítások finomhangolása
          postProcessingManager.bloomPass.threshold = 2.5;
          postProcessingManager.bloomPass.strength = 0.05;
          
          // Fények erősítése
          sceneManager.scene.traverse(function(object) {
            if (object.isLight && object.isAmbientLight) {
              object.intensity = 3.5;
            } else if (object.isLight) {
              object.intensity *= 3.2;
            }
          });
          
          console.log("✅ Világítás optimalizálva post-processing-hez");
          console.log("🌟 Teljes Post-Processing Pipeline aktiválva: FXAA + Bloom + SSAO!");
        } else {
          console.warn("❌ Post-Processing nem inicializálható");
        }
      } catch (error) {
        console.error("Post-Processing inicializálási hiba:", error);
      }
    } else {
      console.log("Post-Processing Manager nincs elérhető, folytatás nélküle");
    }
}

async function setBlueprintPostProcesing() {
  if (postProcessingManager) {
      console.log("✨ Post-Processing (FXAA + Bloom + SSAO) inicializálása...");
      try {
        const postProcessingInitialized = await postProcessingManager.initialize();
        
        if (postProcessingInitialized) {
          // ELSŐ: FXAA Anti-aliasing aktiválása (alapvető minőségjavítás)
          postProcessingManager.setFXAAEnabled(false);
          // postProcessingManager.setFXAAPreset('default');
          // console.log("🎯 FXAA Anti-aliasing aktiválva!");
          
          // // MÁSODIK: Bloom bekapcsolása 'subtle' preset-tel
          // postProcessingManager.setBloomPreset('subtle');
          postProcessingManager.setBloomEnabled(false);
          
          // HARMADIK: SSAO bekapcsolása 'architectural' preset-tel
          postProcessingManager.setSSAOPreset('architectural');
          postProcessingManager.setSSAOEnabled(true);
          
          // // ÚJ v1.13.3: Világítás optimalizálás post-processing-hez
          // console.log("💡 Világítás optimalizálás post-processing pipeline-hoz...");
          
          // // Tone mapping exposure növelése
          // sceneManager.renderer.toneMappingExposure = 1.5;
          
          // // Bloom beállítások finomhangolása
          // postProcessingManager.bloomPass.threshold = 2.5;
          // postProcessingManager.bloomPass.strength = 0.05;
          
          // // Fények erősítése
          // sceneManager.scene.traverse(function(object) {
          //   if (object.isLight && object.isAmbientLight) {
          //     object.intensity = 3.5;
          //   } else if (object.isLight) {
          //     object.intensity *= 3.2;
          //   }
          // });
          
          // console.log("✅ Világítás optimalizálva post-processing-hez");
          // console.log("🌟 Teljes Post-Processing Pipeline aktiválva: FXAA + Bloom + SSAO!");
        } else {
          console.warn("❌ Post-Processing nem inicializálható");
        }
      } catch (error) {
        console.error("Post-Processing inicializálási hiba:", error);
      }
    } else {
      console.log("Post-Processing Manager nincs elérhető, folytatás nélküle");
    }
}

// FRISSÍTETT v1.13.3: Egyszerűsített inicializálás Pure PBR pipeline-nal + localStorage + világítás optimalizálás
async function initialize() {
  try {
    console.log("🚀 Inicializálás kezdete v1.13.3 - Post-processing világítás optimalizálás...");

    // Könyvtárak ellenőrzése
    const csgAvailable = initializeCSG();
    const shadersAvailable = checkShaderAvailability();
    const css2dAvailable = checkCSS2DAvailability();

    // ELSŐ: TextureManager inicializálása
    console.log("🎨 TextureManager Pure PBR inicializálása...");
    textureManager = new TextureManager();
    textureManager.initialize();
    console.log("✅ TextureManager v1.7.0 Pure PBR inicializálva");

    // Alapvető manager objektumok létrehozása
    elementManager = new ElementManager();
    sceneManager = new SceneManager(
      document.getElementById("viewer-container")
    );
    
    // GeometryBuilder + TextureManager integráció
    console.log("🔧 GeometryBuilder v2.0.0 + TextureManager integráció...");
    geometryBuilder = new GeometryBuilder();
    geometryBuilder.setTextureManager(textureManager);
    
    exploder = new Exploder();

    sectionExploder = new SectionExploder();
    sectionExploder.setViewModeManager(viewModeManager);

    // Szekció konfigurációk regisztrálása
    try {
      const frontSection = await import("./models/front/index.js");
      sectionExploder.registerSectionConfig(frontSection.sectionConfig);
      
      const backSection = await import("./models/back/index.js");
      sectionExploder.registerSectionConfig(backSection.sectionConfig);

      const joinerSection = await import("./models/joiner/index.js");
      sectionExploder.registerSectionConfig(joinerSection.sectionConfig);
    } catch (error) {
      console.warn("Szekció konfigurációk regisztrálási hiba:", error);
    }
    
    // FRISSÍTETT: ViewModeManager v5.0.0 - Pure PBR
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

    // KULCS v1.13.1: Pure PBR Mesh-ek létrehozása
    console.log("🎨 Pure PBR Mesh-ek létrehozása...");
    const elements = elementManager.getAllElements();
    
    // ASYNC PBR mesh creation
    allMeshes = await geometryBuilder.createAllMeshes(elements);
    console.log(`✅ ${allMeshes.size} Pure PBR mesh létrehozva`);

    // PBR Statistics logging
    logPBRStatistics(allMeshes);

    // Mesh-ek hozzáadása a scene-hez
    sceneManager.addAllMeshes(allMeshes);
    console.log("Mesh-ek hozzáadva a scene-hez");

    // KULCS v1.13.1: ViewModeManager v5.0.0 inicializálása - színes az alapértelmezett
    console.log("🌟 ViewModeManager v5.0.0 - színes PBR alapértelmezett...");
    
    // ELSŐ: PBR material-ok mentése (GeometryBuilder készítette őket)
    viewModeManager.switchToRealistic(allMeshes, elementManager.getAllElements());
    console.log("✅ Színes PBR nézet beállítva alapértelmezettként + PBR material-ok mentve");

    // Exploder inicializálása
    exploder.saveOriginalPositions(allMeshes);
    console.log("Eredeti pozíciók mentve");

    sectionExploder.saveOriginalPositions(allMeshes);

    // HDR Environment inicializálása
    console.log("🌿 Meadow HDR Environment inicializálása...");
    try {
      const hdrInitialized = await hdrEnvironmentManager.initialize();
      
      if (hdrInitialized) {
        console.log("✅ HDR Manager inicializálva, meadow HDR betöltése...");
        
        try {
          await hdrEnvironmentManager.loadHDREnvironment();
          // Minden mesh environment frissítése
          hdrEnvironmentManager.updateAllMeshesEnvironment();
          console.log("🌟 Meadow HDR Environment aktiválva!");
        } catch (hdrError) {
          console.warn("⚠️ Meadow HDR betöltés sikertelen, fallback használata:", hdrError);
        }
      } else {
        console.warn("❌ HDR Environment Manager nem inicializálható");
      }
    } catch (error) {
      console.error("HDR inicializálási hiba:", error);
    }

    // Post-Processing (FXAA + Bloom + SSAO) inicializálása
    // await setRealisticPostProcesing();

    // Event listener-ek beállítása
    if (typeof setupEventListeners === "function") {
      setupEventListeners({
        exploder,
        viewModeManager,
        sceneManager,
        elementManager,
        allMeshes,
        sectionExploder,
      });
      console.log("Event listener-ek beállítva");
    }

    // Summary generálása - már localStorage-aware
    const summary = elementManager.generateSummary();
    const summaryPanel = document.getElementById("summary-panel");
    summaryGenerator.renderFullSummary(
      summaryPanel,
      summary,
      elementManager.version
    );
    console.log("Summary generálva localStorage állapottal");

    // ÚJ v1.13.1: Mentett láthatóság alkalmazása csak a 3D mesh-ekre
    console.log("📂 localStorage állapot alkalmazása 3D mesh-ekre...");
    const savedVisibility = loadVisibilityState();
    if (Object.keys(savedVisibility).length > 0) {
      setTimeout(() => {
        // Csak a 3D mesh láthatóság, UI már helyes a summary generáláskor
        allMeshes.forEach((mesh, elementId) => {
          if (savedVisibility.hasOwnProperty(elementId)) {
            mesh.visible = savedVisibility[elementId];
            
            // Blueprint wireframe frissítése
            if (viewModeManager && viewModeManager.getCurrentMode() === "blueprint") {
              wireframeManager.setElementWireframeVisibility(elementId, savedVisibility[elementId]);
            }
          }
        });
        sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
        console.log("3D mesh láthatóság szinkronizálva localStorage-ból");
      }, 100);
    }

    console.log("🎉 Inicializálás sikeres v1.13.3 - Post-processing világítás optimalizálással!");
    
    // Teljes rendszer status
    logSystemStatus();
    
  } catch (error) {
    console.error("❌ Hiba az inicializálás során:", error);
    
    // Error recovery - egyszerűsített fallback
    console.log("🔄 Error recovery...");
    await initializeFallback();
  }
}

// PBR Statistics logging (változatlan)
function logPBRStatistics(meshes) {
  let pbrCount = 0;
  let totalMaps = {
    diffuse: 0,
    normal: 0,
    roughness: 0,
    metalness: 0,
    ao: 0
  };

  meshes.forEach((mesh, elementId) => {
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
  });

  console.log("📊 PURE PBR STATISTICS v1.13.3:");
  console.log(`   Materials: ${pbrCount} Pure PBR (100%)`);
  console.log(`   Diffuse Maps: ${totalMaps.diffuse}`);
  console.log(`   Normal Maps: ${totalMaps.normal} ✨`);
  console.log(`   Roughness Maps: ${totalMaps.roughness}`);
  console.log(`   Metalness Maps: ${totalMaps.metalness}`);
  console.log(`   AO Maps: ${totalMaps.ao}`);
  console.log(`   Total Texture Maps: ${Object.values(totalMaps).reduce((a, b) => a + b, 0)}`);
}

// Teljes rendszer status (frissített)
function logSystemStatus() {
  console.log("🎯 SYSTEM STATUS v1.13.3:");
  console.log(`   TextureManager: ${textureManager.getStatus().version} (Pure PBR)`);
  console.log(`   GeometryBuilder: ${geometryBuilder.getPBRStatus().version} (Pure PBR)`);
  console.log(`   ViewModeManager: ${viewModeManager.getViewModeInfo().version} (Pure PBR)`);
  console.log(`   MaterialManager: ${materialManager.getMaterialInfo().version} (Pure PBR)`);
  console.log(`   HDR Environment: ${hdrEnvironmentManager.getStatus().isLoaded ? '✅' : '❌'}`);
  console.log(`   Post-Processing: ${postProcessingManager ? postProcessingManager.getStatus().version : '❌'}`);
  console.log(`   FXAA Anti-aliasing: ${postProcessingManager?.getStatus().fxaaEnabled ? '✅' : '❌'}`);
  console.log(`   Világítás optimalizálva: ✅ (exposure: 2.5, bloom: optimális)`);
  console.log(`   localStorage Láthatóság: ✅`);
  console.log(`   Legacy Support: ❌ (Pure PBR only)`);
}

// Egyszerűsített fallback inicializálás
async function initializeFallback() {
  try {
    console.log("🔄 Fallback inicializálás...");
    
    // Egyszerű emergency mesh-ek létrehozása
    const elements = elementManager.getAllElements();
    
    allMeshes = new Map();
    elements.forEach(element => {
      const fallbackGeometry = new THREE.BoxGeometry(10, 10, 10);
      const fallbackMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
      });
      const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
      
      fallbackMesh.userData = {
        elementId: element.id,
        elementName: element.name + " (FALLBACK)",
        hasError: true,
      };
      
      allMeshes.set(element.id, fallbackMesh);
    });
    
    sceneManager.addAllMeshes(allMeshes);
    
    console.log("✅ Fallback inicializálás sikeres");
    
  } catch (fallbackError) {
    console.error("❌ Fallback inicializálás is sikertelen:", fallbackError);
  }
}

// ÚJ v1.13.1: localStorage Láthatóság debug funkciók
window.visibilityDebug = () => {
  console.log("=== LÁTHATÓSÁG DEBUG v1.13.3 ===");
  
  const saved = loadVisibilityState();
  console.log(`LocalStorage elemek: ${Object.keys(saved).length}`);
  
  if (allMeshes) {
    let visibleCount = 0;
    allMeshes.forEach((mesh, elementId) => {
      if (mesh.visible) visibleCount++;
    });
    console.log(`Aktuálisan látható: ${visibleCount}/${allMeshes.size}`);
    
    // Eltérések keresése
    const differences = [];
    allMeshes.forEach((mesh, elementId) => {
      if (saved.hasOwnProperty(elementId) && saved[elementId] !== mesh.visible) {
        differences.push(`${elementId}: saved=${saved[elementId]} vs actual=${mesh.visible}`);
      }
    });
    
    if (differences.length > 0) {
      console.log("Eltérések:", differences);
    } else {
      console.log("✅ Nincs eltérés localStorage és aktuális állapot között");
    }
  }
  console.log("===============================");
};

window.clearVisibility = () => {
  clearVisibilityState();
  console.log("🧹 Láthatóság törölve, oldal újratöltése ajánlott");
};

// Globális hozzáférés localStorage funkciókhoz
window.saveVisibilityState = saveVisibilityState;
window.loadVisibilityState = loadVisibilityState;

// Globális hozzáférés debug-hoz (frissített v1.13.3)
window.debugInfo = () => {
  console.log("=== DEBUG INFO v1.13.3 - Pure PBR + localStorage + Világítás ===");
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
  
  // Pure PBR manager debug info
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
    
    // ÚJ: FXAA Anti-aliasing debug info
    const antiAliasingInfo = postProcessingManager.getAntiAliasingInfo();
    console.log("FXAA Anti-aliasing:", antiAliasingInfo);
  }
  
  // Pure PBR Debug info
  if (textureManager) {
    console.log("Texture Manager:", textureManager.getStatus());
    textureManager.listLoadedTextures();
  }
  if (geometryBuilder) {
    console.log("Geometry Builder:", geometryBuilder.getPBRStatus());
  }
  
  console.log("==================");
};

// ÚJ v1.13.3: Világítás debug
window.lightingDebug = () => {
  if (!postProcessingManager) {
    console.log("❌ PostProcessingManager nem elérhető");
    return;
  }
  
  console.log("=== VILÁGÍTÁS DEBUG v1.13.3 ===");
  
  console.log(`Tone Mapping Exposure: ${sceneManager.renderer.toneMappingExposure}`);
  console.log(`Bloom Threshold: ${postProcessingManager.bloomPass.threshold}`);
  console.log(`Bloom Strength: ${postProcessingManager.bloomPass.strength}`);
  
  // Fények listázása
  let lightCount = 0;
  sceneManager.scene.traverse(function(object) {
    if (object.isLight) {
      lightCount++;
      console.log(`Fény ${lightCount}: ${object.type}, intensity: ${object.intensity}`);
    }
  });
  
  console.log("===============================");
};

// ÚJ v1.13.1: FXAA Anti-aliasing debug
window.fxaaDebug = () => {
  if (!postProcessingManager) {
    console.log("❌ PostProcessingManager nem elérhető");
    return;
  }
  
  console.log("=== FXAA ANTI-ALIASING DEBUG ===");
  
  const status = postProcessingManager.getStatus();
  const aaInfo = postProcessingManager.getAntiAliasingInfo();
  
  console.log(`FXAA Enabled: ${status.fxaaEnabled}`);
  console.log(`FXAA Pass Available: ${status.hasFXAAPass}`);
  console.log(`Renderer Anti-aliasing: ${aaInfo.rendererAntialias}`);
  console.log(`Pixel Ratio: ${aaInfo.pixelRatio} (device: ${window.devicePixelRatio})`);
  console.log(`FXAA Resolution:`, aaInfo.resolution);
  console.log(`FXAA Settings:`, aaInfo.fxaaSettings);
  
  console.log("===============================");
};

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

// ViewMode debug (változatlan)
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
window.sectionExploder = () => sectionExploder;
window.textureManager = () => textureManager;

// Pure PBR manager elérhetőség
window.wireframeManager = () => wireframeManager;
window.materialManager = () => materialManager;
window.lightingManager = () => lightingManager;
window.hdrEnvironmentManager = () => hdrEnvironmentManager;
window.postProcessingManager = () => postProcessingManager;

// Egyedi elem láthatóság kapcsoló funkció - ÚJ: localStorage mentéssel + állapot frissítés
window.toggleElementVisibility = function (elementId, isVisible) {
  console.log(`Elem láthatóság váltás: ${elementId} -> ${isVisible}`);

  const mesh = allMeshes.get(elementId);
  if (mesh) {
    mesh.visible = isVisible;

    if (viewModeManager.getCurrentMode() === "blueprint") {
      wireframeManager.setElementWireframeVisibility(elementId, isVisible);
    }

    // ÚJ v1.13.1: Automatikus mentés localStorage-ba
    saveVisibilityState();

    // ÚJ: Toggle All állapot frissítése
    if (window.updateToggleAllStatus) {
      setTimeout(() => {
        window.updateToggleAllStatus();
      }, 10);
    }

    sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
  } else {
    console.warn(`Elem nem található: ${elementId}`);
  }
};

// Inicializálás indítása az oldal betöltése után
document.addEventListener("DOMContentLoaded", initialize);

window.setRealisticPostProcesing = setRealisticPostProcesing;
window.setBlueprintPostProcesing = setBlueprintPostProcesing;

// Exportálás más modulok számára (frissített v1.13.3)
export {
  elementManager,
  sceneManager,
  geometryBuilder,
  exploder,
  viewModeManager,
  csgManager,
  textureManager,
  // Pure PBR manager exportok
  wireframeManager,
  materialManager,
  lightingManager,
  hdrEnvironmentManager,
  allMeshes,
};