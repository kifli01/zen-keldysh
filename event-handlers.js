/**
 * Event Handlers
 * UI interakciók kezelése
 * v1.0.0
 */

// Event listener-ek beállítása
function setupEventListeners({
  exploder,
  viewModeManager,
  sceneManager,
  elementManager,
  allMeshes,
}) {
  // Szétszedés gomb
  document
    .getElementById("toggle-explode")
    .addEventListener("click", function () {
      exploder.toggle(allMeshes, elementManager.getAllElements());

      // Gomb szöveg frissítése
      this.textContent = exploder.getState().isExploded
        ? "Összerakás"
        : "Szétszedés";
    });

  // Nézet váltás gomb
  document
    .getElementById("toggle-view-mode")
    .addEventListener("click", function () {
      viewModeManager.toggle(allMeshes, elementManager.getAllElements());

      // Gomb szöveg frissítése
      const newMode =
        viewModeManager.getCurrentMode() === "realistic"
          ? "Tervrajz"
          : "Színes";
      this.textContent = newMode;
    });

  // Alaphelyzet gomb
  document.getElementById("reset-view").addEventListener("click", function () {
    // Exploded állapot visszaállítása
    if (exploder.getState().isExploded) {
      exploder.reset(allMeshes);
      document.getElementById("toggle-explode").textContent = "Szétszedés";
    }

    // Nézet visszaállítása (kamera pozíció)
    sceneManager.resetView();
  });

  // Zoom In gomb
  document.getElementById("zoom-in").addEventListener("click", function () {
    sceneManager.zoomCamera(-50); // Negatív érték = közelebb
  });

  // Zoom Out gomb
  document.getElementById("zoom-out").addEventListener("click", function () {
    sceneManager.zoomCamera(50); // Pozitív érték = távolabb
  });

  // GLTF export gomb
  document.getElementById("export-gltf").addEventListener("click", function () {
    exportGLTF(false, { exploder, sceneManager, elementManager, allMeshes });
  });

  // Nézet váltó gombok
  document.getElementById("view-top").addEventListener("click", function () {
    sceneManager.setTopView();
  });

  document.getElementById("view-bottom").addEventListener("click", function () {
    sceneManager.setBottomView();
  });

  document.getElementById("view-front").addEventListener("click", function () {
    sceneManager.setFrontView();
  });

  document.getElementById("view-back").addEventListener("click", function () {
    sceneManager.setBackView();
  });

  document.getElementById("view-left").addEventListener("click", function () {
    sceneManager.setLeftView();
  });

  document.getElementById("view-right").addEventListener("click", function () {
    sceneManager.setRightView();
  });

  console.log("✅ Event listener-ek beállítva");
}

// GLTF exportálási funkció
async function exportGLTF(
  binary = false,
  { exploder, sceneManager, elementManager, allMeshes }
) {
  try {
    // Ha szétszedett állapotban van, átmenetileg állítsuk vissza
    const wasExploded = exploder.getState().isExploded;
    if (wasExploded) {
      exploder.setPositionImmediate(
        allMeshes,
        elementManager.getAllElements(),
        false
      );
    }

    // Export
    const result = await sceneManager.exportScene(binary);

    // Fájl mentése
    const filename = binary ? "minigolf_palya.glb" : "minigolf_palya.gltf";

    if (binary) {
      saveArrayBuffer(result, filename);
    } else {
      saveString(JSON.stringify(result, null, 2), filename);
    }

    // Ha szétszedett állapotban volt, állítsuk vissza
    if (wasExploded) {
      exploder.setPositionImmediate(
        allMeshes,
        elementManager.getAllElements(),
        true
      );
    }

    console.log(`Export sikeres: ${filename}`);
  } catch (error) {
    console.error("Export hiba:", error);
  }
}

// Segédfüggvények a fájlok mentéséhez
function saveString(text, filename) {
  const blob = new Blob([text], { type: "text/plain" });
  downloadBlob(blob, filename);
}

function saveArrayBuffer(buffer, filename) {
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();

  // Cleanup
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

// Globális hozzáférés
window.setupEventListeners = setupEventListeners;
window.exportGLTF = exportGLTF;
