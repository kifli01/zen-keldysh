/**
 * Event Handlers
 * UI interakciók kezelése
 * v1.14.0 - Summary Panel Toggle hozzáadva
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
  const explodeBtn = document.getElementById("toggle-explode");
  if (explodeBtn) {
    explodeBtn.addEventListener("click", function () {
      exploder.toggle(allMeshes, elementManager.getAllElements());

      // Gomb ikon frissítése
      const icon = this.querySelector('i[data-lucide]');
      if (icon) {
        if (exploder.getState().isExploded) {
          icon.setAttribute('data-lucide', 'boxes');
        } else {
          icon.setAttribute('data-lucide', 'box');
        }
        // Lucide újrarenderelés
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }
    });
  }

  // Nézet váltás gomb
  const viewModeBtn = document.getElementById("toggle-view-mode");
  if (viewModeBtn) {
    viewModeBtn.addEventListener("click", function () {
      viewModeManager.toggle(allMeshes, elementManager.getAllElements());

      // Gomb ikon frissítése
      const icon = this.querySelector('i[data-lucide]');
      if (icon) {
        const newIcon = viewModeManager.getCurrentMode() === "realistic" 
          ? "ruler-dimension-line" 
          : "palette";
        icon.setAttribute('data-lucide', newIcon);
        // Lucide újrarenderelés
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }
    });
  }

  // Koordináta rendszer toggle gomb
  const coordBtn = document.getElementById("toggle-coordinates");
  if (coordBtn) {
    coordBtn.addEventListener("click", function () {
      const isVisible = sceneManager.toggleCoordinateSystem();

      // Gomb szöveg frissítése
      this.textContent = "📐";
    });
  }

  // Summary panel toggle gomb
  const summaryBtn = document.getElementById("toggle-summary-panel");
  if (summaryBtn) {
    summaryBtn.addEventListener("click", function () {
      toggleSummaryPanel();
    });
  }

  // Koordináta gomb kezdeti állapot KÉNYSZERÍTETT beállítása
  if (coordBtn) {
    // KÉNYSZERÍTETT kikapcsolt állapot - ikon már a HTML-ben van
    console.log("Koordináta gomb KÉNYSZERÍTVE kikapcsolt állapotra állítva");
  }

  // Alaphelyzet gomb
  const resetBtn = document.getElementById("reset-view");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      // Exploded állapot visszaállítása
      if (exploder.getState().isExploded) {
        exploder.reset(allMeshes);
        const explodeBtn = document.getElementById("toggle-explode");
        if (explodeBtn) {
          const icon = explodeBtn.querySelector('i[data-lucide]');
          if (icon) {
            icon.setAttribute('data-lucide', 'box');
            if (typeof lucide !== 'undefined') {
              lucide.createIcons();
            }
          }
        }
      }

      // Nézet visszaállítása (kamera pozíció)
      sceneManager.resetView();
    });
  }

  // Zoom In gomb
  const zoomInBtn = document.getElementById("zoom-in");
  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", function () {
      sceneManager.zoomCamera(-50); // Negatív érték = közelebb
    });
  }

  // Zoom Out gomb
  const zoomOutBtn = document.getElementById("zoom-out");
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", function () {
      sceneManager.zoomCamera(50); // Pozitív érték = távolabb
    });
  }

  // GLTF export gomb
  const exportBtn = document.getElementById("export-gltf");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      exportGLTF(false, { exploder, sceneManager, elementManager, allMeshes });
    });
  }

  // Nézet váltó gombok
  const viewTopBtn = document.getElementById("view-top");
  if (viewTopBtn) {
    viewTopBtn.addEventListener("click", function () {
      sceneManager.setTopView();
    });
  }

  const viewBottomBtn = document.getElementById("view-bottom");
  if (viewBottomBtn) {
    viewBottomBtn.addEventListener("click", function () {
      sceneManager.setBottomView();
    });
  }

  const viewFrontBtn = document.getElementById("view-front");
  if (viewFrontBtn) {
    viewFrontBtn.addEventListener("click", function () {
      sceneManager.setFrontView();
    });
  }

  const viewBackBtn = document.getElementById("view-back");
  if (viewBackBtn) {
    viewBackBtn.addEventListener("click", function () {
      sceneManager.setBackView();
    });
  }

  const viewLeftBtn = document.getElementById("view-left");
  if (viewLeftBtn) {
    viewLeftBtn.addEventListener("click", function () {
      sceneManager.setLeftView();
    });
  }

  const viewRightBtn = document.getElementById("view-right");
  if (viewRightBtn) {
    viewRightBtn.addEventListener("click", function () {
      sceneManager.setRightView();
    });
  }

  console.log("✅ Event listener-ek beállítva v1.14.0 - Summary Panel Toggle");
}

// Summary Panel Toggle funkcionalitás
function toggleSummaryPanel() {
  const summaryPanel = document.getElementById("summary-panel");
  const toggleBtn = document.getElementById("toggle-summary-panel");
  
  if (!summaryPanel || !toggleBtn) {
    console.warn("Summary panel elemek nem találhatóak");
    return;
  }
  
  const isVisible = summaryPanel.classList.contains("visible");
  
  if (isVisible) {
    // Panel elrejtése
    summaryPanel.classList.remove("visible");
    summaryPanel.classList.add("hidden");
    
    // Ikon váltás
    const icon = toggleBtn.querySelector('i[data-lucide]');
    if (icon) {
      icon.setAttribute('data-lucide', 'panel-right');
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
    
    console.log("📋 Summary panel elrejtve");
  } else {
    // Panel megjelenítése
    summaryPanel.classList.remove("hidden");
    summaryPanel.classList.add("visible");
    
    // Ikon váltás
    const icon = toggleBtn.querySelector('i[data-lucide]');
    if (icon) {
      icon.setAttribute('data-lucide', 'x');
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
    
    console.log("📋 Summary panel megjelenítve");
  }
}

// Globális hozzáférhetőség
window.toggleSummaryPanel = toggleSummaryPanel;

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