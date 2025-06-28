/**
 * Event Handlers
 * UI interakciók kezelése
 * v1.17.0 - iro.js Color Picker integráció
 */

// Globális iro.js color picker változó
let colorPicker = null;

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

  // Explode slider kezelése
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

  // Bal oldali panel toggle gomb
  const leftPanelBtn = document.getElementById("toggle-left-panel");
  if (leftPanelBtn) {
    leftPanelBtn.addEventListener("click", function () {
      toggleLeftPanel();
    });
  }

  // iro.js Color Picker inicializálása
  initializeColorPicker();

  // Szín mentés gomb
  const saveColorBtn = document.getElementById("save-color-btn");
  if (saveColorBtn) {
    saveColorBtn.addEventListener("click", function () {
      saveCurrentColor();
    });
  }

  // Szín reset gomb
  const resetColorBtn = document.getElementById("reset-color-btn");
  if (resetColorBtn) {
    resetColorBtn.addEventListener("click", function () {
      resetToDefaultColor();
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
      sceneManager.resetView();
    });
  }

  // Zoom gombok
  const zoomInBtn = document.getElementById("zoom-in");
  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", function () {
      sceneManager.zoomIn();
    });
  }

  const zoomOutBtn = document.getElementById("zoom-out");
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", function () {
      sceneManager.zoomOut();
    });
  }

  // GLTF Export gomb
  const exportBtn = document.getElementById("export-gltf");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      exportGLTF(false, { exploder, sceneManager, elementManager, allMeshes });
    });
  }

  // Nézet beállítás gombok
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

  console.log("✅ Event listener-ek beállítva v1.17.0 - iro.js Color Picker integrációval");
}

// iro.js Color Picker inicializálása
function initializeColorPicker() {
  // Ellenőrizzük, hogy az iro.js betöltődött-e
  if (typeof iro === 'undefined') {
    console.error("❌ iro.js nem töltődött be! Ellenőrizd a CDN-t.");
    return;
  }

  const pickerContainer = document.getElementById("iro-color-picker");
  if (!pickerContainer) {
    console.error("❌ iro-color-picker container nem található!");
    return;
  }

  try {
    // SliderPicker létrehozása (3 slider: hue, saturation, value - teljes szélességűek)
    colorPicker = new iro.ColorPicker("#iro-color-picker", {
      width: 410, // Teljes panel szélesség mínusz padding
      color: "#d3e3ff", // Alapértelmezett fa szín
      borderWidth: 0, // Nincs border
      layout: [
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'hue'
          }
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'saturation'
          }
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'value'
          }
        }
      ]
    });

    // Color change event listener
    colorPicker.on('color:change', function(color) {
      const hexString = color.hexString; // pl. "#ff5722"
      const hexNumber = parseInt(hexString.substring(1), 16); // 0xff5722
      
      console.log(`🎨 iro.js színváltozás: ${hexString} -> 0x${hexNumber.toString(16)}`);
      
      // UI frissítése
      updateColorPreview(color);
      
      // Fa szín változtatása
      if (window.changeWoodColor) {
        window.changeWoodColor(hexNumber);
      } else {
        console.warn("changeWoodColor függvény nem található");
      }
    });

    // Kezdeti color preview beállítása
    updateColorPreview(colorPicker.color);
    
    console.log("✅ iro.js Color Picker inicializálva (sliderPicker layout)");
    
  } catch (error) {
    console.error("❌ iro.js Color Picker inicializálási hiba:", error);
  }
}

// Color preview és hex érték frissítése
function updateColorPreview(color) {
  // Color preview frissítése
  const colorPreview = document.getElementById("color-preview");
  if (colorPreview) {
    colorPreview.style.backgroundColor = color.rgbaString;
  }
  
  // Hex érték frissítése
  const hexValue = document.getElementById("hex-value");
  if (hexValue) {
    hexValue.textContent = color.hexString.split("#").join("0x");
  }
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
window.toggleLeftPanel = toggleLeftPanel;
window.toggleSummaryPanel = toggleSummaryPanel;
window.initializeColorPicker = initializeColorPicker;
window.saveCurrentColor = saveCurrentColor;
window.resetToDefaultColor = resetToDefaultColor;

// Eredeti színre visszaállítás
function resetToDefaultColor() {
  console.log("🔄 Szín visszaállítása alapértelmezettre...");
  
  // resetWoodColor használata (color-manager.js)
  if (window.resetWoodColor) {
    const success = window.resetWoodColor();
    
    if (success) {
      // iro.js picker frissítése az eredeti színre
      if (colorPicker) {
        colorPicker.color.set("#d3e3ff"); // Alapértelmezett fa szín
        console.log("✅ iro.js picker frissítve az alapértelmezettre");
      }
      
      // Vizuális visszajelzés - gomb animáció
      const resetBtn = document.getElementById("reset-color-btn");
      if (resetBtn) {
        const originalText = resetBtn.innerHTML;
        resetBtn.innerHTML = '<i data-lucide="check"></i>!';
        resetBtn.disabled = true;
        
        // Lucide ikon frissítése
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
        
        // 2 másodperc után visszaállítás
        setTimeout(() => {
          resetBtn.innerHTML = originalText;
          resetBtn.disabled = false;
          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          }
        }, 2000);
      }
      
      console.log("✅ Szín visszaállítva alapértelmezettre");
    } else {
      console.error("❌ Szín reset sikertelen");
    }
  } else {
    console.error("❌ resetWoodColor függvény nem található");
  }
}

// Aktuális szín mentése
function saveCurrentColor() {
  if (!colorPicker) {
    console.warn("⚠️ Color picker nincs inicializálva");
    return;
  }
  
  const currentColor = colorPicker.color;
  const hexString = currentColor.hexString;
  const hexNumber = parseInt(hexString.substring(1), 16);
  
  // saveWoodColor használata (color-manager.js)
  if (window.saveWoodColor) {
    const success = window.saveWoodColor(hexNumber);
    
    if (success) {
      console.log(`💾 Szín mentve: ${hexString} (0x${hexNumber.toString(16)})`);
      
      // Vizuális visszajelzés - gomb animáció
      const saveBtn = document.getElementById("save-color-btn");
      if (saveBtn) {
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i data-lucide="check"></i>';
        saveBtn.disabled = true;
        
        // Lucide ikon frissítése
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
        
        // 2 másodperc után visszaállítás
        setTimeout(() => {
          saveBtn.innerHTML = originalText;
          saveBtn.disabled = false;
          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          }
        }, 2000);
      }
    } else {
      console.error("❌ Szín mentése sikertelen");
    }
  } else {
    console.error("❌ saveWoodColor függvény nem található");
  }
}