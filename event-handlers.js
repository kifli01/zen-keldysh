/**
 * Event Handlers
 * UI interakciók kezelése
 * v1.15.0 - Explode slider támogatás hozzáadva
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

      // Slider szinkronizálása
      const explodeSlider = document.getElementById("explode-slider");
      if (explodeSlider) {
        explodeSlider.value = exploder.getState().isExploded ? 1000 : 0;
      }

      // Gomb ikon frissítése
      if (exploder.getState().isExploded) {
        explodeBtn.className = "icon-box";
      } else {
        explodeBtn.className = "icon-layers";
      }
    });
  }

  // ÚJ v1.15.0: Explode slider kezelése
  const explodeSlider = document.getElementById("explode-slider");
  if (explodeSlider) {
    explodeSlider.addEventListener("input", function () {
      const sliderValue = parseInt(this.value); // 0-1000
      const percentage = (sliderValue / 1000) * 100; // 0-100%

      // Exploder szint beállítása
      exploder.setExplodeLevel(percentage, allMeshes, elementManager.getAllElements());

      // Toggle gomb szinkronizálása
      const explodeBtn = document.getElementById("toggle-explode");
      if (explodeBtn) {
        if (percentage > 0) {
          explodeBtn.className = "icon-box";
        } else {
          explodeBtn.className = "icon-layers";
        }
      }

      console.log(`🎚️ Slider: ${sliderValue}/1000 (${percentage.toFixed(1)}%)`);
    });

    // Slider kezdeti értékének beállítása az exploder állapot alapján
    const currentLevel = exploder.getExplodeLevel();
    explodeSlider.value = (currentLevel / 100) * 1000;
  }

  // Nézet váltás gomb
  const viewModeBtn = document.getElementById("toggle-view-mode");
  viewModeBtn.className = viewModeManager.getCurrentMode() === "realistic" ? 'icon-codepen' : 'icon-palette'

  if (viewModeBtn) {
    viewModeBtn.addEventListener("click", function () {
      console.log("--- MYDEBUG", "viewModeBtn ", viewModeManager.getCurrentMode())
      viewModeManager.toggle(allMeshes, elementManager.getAllElements());
      viewModeBtn.className = viewModeManager.getCurrentMode() === "blueprint" ? 'icon-codepen' : 'icon-palette'
    });
  }

  // Koordináta rendszer toggle gomb
  const coordBtn = document.getElementById("toggle-coordinates");
  if (coordBtn) {
    coordBtn.addEventListener("click", function () {
      const isVisible = sceneManager.toggleCoordinateSystem();
      coordBtn.className = isVisible ? "icon-eye-closed" : "icon-axis-3d";
    });
  }

  // Bal oldali panel toggle gomb - ÚJ
  const leftPanelBtn = document.getElementById("toggle-left-panel");
  if (leftPanelBtn) {
    leftPanelBtn.addEventListener("click", function () {
      toggleLeftPanel();
    });
  }

  // Fa szín picker event listener - ÚJ
  const woodColorPicker = document.getElementById("wood-color-picker");
  if (woodColorPicker) {
    woodColorPicker.addEventListener("change", function () {
      const hexString = this.value; // pl. "#ff5722"
      const hexNumber = parseInt(hexString.substring(1), 16); // Eltávolítjuk a #-et és átalakítjuk számmá
      
      console.log(`🎨 Fa szín változás: ${hexString} -> 0x${hexNumber.toString(16)}`);
      
      if (window.changeWoodColor) {
        window.changeWoodColor(hexNumber);
      } else {
        console.warn("changeWoodColor függvény nem található");
      }
    });
  }

  // RGB slider event listener-ek - ÚJ
const redSlider = document.getElementById("red-slider");
const greenSlider = document.getElementById("green-slider");
const blueSlider = document.getElementById("blue-slider");

if (redSlider && greenSlider && blueSlider) {
  function updateColor() {
    const r = parseInt(redSlider.value);
    const g = parseInt(greenSlider.value);
    const b = parseInt(blueSlider.value);
    
    // Értékek frissítése
    document.getElementById("red-value").textContent = r;
    document.getElementById("green-value").textContent = g;
    document.getElementById("blue-value").textContent = b;
    
    // Hex érték számítása
    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    document.getElementById("hex-value").textContent = hex;
    
    // Color preview frissítése
    document.getElementById("color-preview").style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    
    // changeWoodColor hívása
    const hexNumber = (r << 16) + (g << 8) + b;
    if (window.changeWoodColor) {
      window.changeWoodColor(hexNumber);
    }
  }
  
  redSlider.addEventListener("input", updateColor);
  greenSlider.addEventListener("input", updateColor);
  blueSlider.addEventListener("input", updateColor);
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
        exploder.reset(allMeshes, elementManager.getAllElements());
        
        // UI elemek szinkronizálása
        const explodeBtn = document.getElementById("toggle-explode");
        const explodeSlider = document.getElementById("explode-slider");
        
        if (explodeBtn) {
          explodeBtn.className = "icon-layers";
        }
        if (explodeSlider) {
          explodeSlider.value = 0;
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

  console.log("✅ Event listener-ek beállítva v1.15.0 - Explode slider támogatással");
}


// Bal oldali panel toggle funkcionalitás
function toggleLeftPanel() {
  const leftPanel = document.getElementById("left-panel");
  const toggleBtn = document.getElementById("toggle-left-panel");
  
  if (!leftPanel || !toggleBtn) {
    console.warn("Bal oldali panel elemek nem találhatóak");
    return;
  }
  
  const isVisible = leftPanel.classList.contains("visible");
  
  if (isVisible) {
    // Panel elrejtése
    leftPanel.classList.remove("visible");
    leftPanel.classList.add("hidden");
    
    // Ikon váltás
    const icon = toggleBtn.querySelector('i[data-lucide]');
    if (icon) {
      icon.setAttribute('data-lucide', 'panel-left');
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
    
    console.log("📋 Bal oldali panel elrejtve");
  } else {
    // Panel megjelenítése
    leftPanel.classList.remove("hidden");
    leftPanel.classList.add("visible");
    
    // Ikon váltás
    const icon = toggleBtn.querySelector('i[data-lucide]');
    if (icon) {
      icon.setAttribute('data-lucide', 'x');
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
    
    console.log("📋 Bal oldali panel megjelenítve");
  }
}

// Event listener hozzáadása a setupEventListeners függvényhez
const leftPanelBtn = document.getElementById("toggle-left-panel");
if (leftPanelBtn) {
  leftPanelBtn.addEventListener("click", function () {
    toggleLeftPanel();
  });
}

// Globális hozzáférhetőség
window.toggleLeftPanel = toggleLeftPanel;

// Summary Panel Toggle funkcionalitás
function toggleSummaryPanel() {
  const summaryPanel = document.getElementById("summary-panel");
  const toggleBtn = document.getElementById("toggle-summary-panel");
  const rightSlider = document.getElementById("right-slider");
  
  if (!summaryPanel || !toggleBtn) {
    console.warn("Summary panel elemek nem találhatóak");
    return;
  }
  
  const isVisible = summaryPanel.classList.contains("visible");
  
  if (isVisible) {
    // Panel elrejtése
    summaryPanel.classList.remove("visible");
    summaryPanel.classList.add("hidden");
    
    // Slider visszacsúsztatása
    if (rightSlider) {
      rightSlider.style.right = "20px";
    }
    
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
    
    // Slider bentebb csúsztatása
    if (rightSlider) {
      rightSlider.style.right = "470px"; // 450px panel + 20px
    }
    
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
    const currentLevel = exploder.getExplodeLevel();
    
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
      exploder.setExplodeLevel(currentLevel, allMeshes, elementManager.getAllElements());
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