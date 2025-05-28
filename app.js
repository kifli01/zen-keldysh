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
let shaderLoader;

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
async function checkShaderAvailability() {
  try {
    // Ellenőrizzük hogy a ShaderLoader elérhető-e
    if (typeof ShaderLoader === "undefined") {
      console.warn("⚠️ ShaderLoader nem elérhető, DOM fallback használata");
      return checkEmbeddedShaders();
    }

    // ShaderLoader inicializálása
    shaderLoader = new ShaderLoader();

    // Shader betöltés külső fájlokból vagy DOM fallback
    const shaders = await shaderLoader.loadShadersWithFallback();

    if (shaders && shaders.vertex && shaders.fragment) {
      console.log("✅ Minden shader elérhető");

      // Shader kódok globálisan elérhetővé tétele ViewModeManager számára
      window.toonShaderCode = shaders;

      return true;
    } else {
      console.warn("⚠️ Shader kódok hiányoznak");
      return false;
    }
  } catch (error) {
    console.error("❌ Shader ellenőrzés hiba:", error);
    console.log("🔄 Fallback DOM shader ellenőrzésre váltás...");
    return checkEmbeddedShaders();
  }
}

// DOM-ból shader ellenőrzés (fallback)
function checkEmbeddedShaders() {
  // Hozzáadunk fallback DOM shader elemeket ha nincsenek
  if (!document.getElementById("toonVertexShader")) {
    const vertexScript = document.createElement("script");
    vertexScript.id = "toonVertexShader";
    vertexScript.type = "x-shader/x-vertex";
    vertexScript.textContent = `
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    document.head.appendChild(vertexScript);
  }

  if (!document.getElementById("toonFragmentShader")) {
    const fragmentScript = document.createElement("script");
    fragmentScript.id = "toonFragmentShader";
    fragmentScript.type = "x-shader/x-fragment";
    fragmentScript.textContent = `
      uniform vec3 color;
      uniform vec3 lightDirection;
      uniform float paperStrength;
      uniform sampler2D paperTexture;

      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying vec2 vUv;

      // Paper noise function
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      void main() {
        // EGYSZERŰSÍTETT világítás - mindig világos
        float NdotL = max(0.3, dot(normalize(vNormal), normalize(lightDirection)));

        // SOKKAL világosabb alapértelmezett lighting
        float lightLevel = mix(0.85, 1.0, NdotL); // 80%-100% közötti világítás

        // Minimális paper textúra
        vec2 paperUv = vUv * 20.0;
        float paperNoise = noise(paperUv) * 0.02; // Nagyon kis hatás

        // Tiszta színek, minimális árnyékolás
        vec3 finalColor = color * lightLevel;
        finalColor += vec3(paperNoise) * paperStrength;

        // Brightening - még világosabb
        finalColor = mix(finalColor, vec3(1.0), 0.1); // 10% fehér hozzáadása

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
    document.head.appendChild(fragmentScript);
  }

  const shaders = {
    toonVertex: document.getElementById("toonVertexShader"),
    toonFragment: document.getElementById("toonFragmentShader"),
  };

  const missing = Object.entries(shaders)
    .filter(([name, element]) => !element)
    .map(([name]) => name);

  if (missing.length === 0) {
    console.log("✅ Shader-ek elérhetőek DOM fallback-ből");
    return true;
  } else {
    console.warn("⚠️ Hiányzó shaderek:", missing);
    return false;
  }
}

// Főalkalmazás inicializálása
async function initialize() {
  try {
    console.log("Inicializálás kezdete v1.8.0...");

    // Könyvtárak ellenőrzése
    const csgAvailable = initializeCSG();
    const shadersAvailable = await checkShaderAvailability();

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

    console.log("Inicializálás sikeres v1.8.0!");
  } catch (error) {
    console.error("Hiba az inicializálás során:", error);
  }
}

// Globális hozzáférés debug-hoz
window.debugInfo = async () => {
  console.log("=== DEBUG INFO v1.8.0 ===");
  console.log(
    "Element Manager:",
    elementManager?.getAllElements().length + " elem"
  );
  console.log("Scene Manager:", sceneManager?.getSceneInfo());
  console.log("Exploder:", exploder?.getState());
  console.log("View Mode Manager:", viewModeManager?.getCapabilities());
  console.log("Mesh-ek:", allMeshes?.size);
  console.log("Súly:", elementManager?.getTotalWeight().toFixed(2) + " g");
  // CSG debug info
  if (csgManager) {
    console.log("CSG Manager:", csgManager.getDebugInfo());
  }
  console.log("Shaders:", await checkShaderAvailability());
  console.log("==================");
};

window.elementManager = () => elementManager;
window.sceneManager = () => sceneManager;
window.csgManager = () => csgManager;
window.viewModeManager = () => viewModeManager;
window.exploder = () => exploder;
window.shaderLoader = () => shaderLoader;

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
  shaderLoader,
};
