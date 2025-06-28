/**
 * Event Handlers
 * UI interakciók kezelése
 * v2.0.0 - Dual Color Picker (Fa + Műfű)
 */

// Globális iro.js color picker változók
let woodColorPicker = null;   // Fa színválasztó
let grassColorPicker = null;  // Műfű színválasztó

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

  // Dual Color Picker inicializálása
  initializeColorPickers();

  // FA SZÍN GOMBOK
  const saveWoodColorBtn = document.getElementById("save-color-btn");
  if (saveWoodColorBtn) {
    saveWoodColorBtn.addEventListener("click", function () {
      saveCurrentWoodColor();
    });
  }

  const resetWoodColorBtn = document.getElementById("reset-color-btn");
  if (resetWoodColorBtn) {
    resetWoodColorBtn.addEventListener("click", function () {
      resetWoodToDefaultColor();
    });
  }

  const saveWoodPresetBtn = document.getElementById("save-as-preset-btn");
  if (saveWoodPresetBtn) {
    saveWoodPresetBtn.addEventListener("click", saveCurrentWoodAsPreset);
  }

  // MŰFŰ SZÍN GOMBOK
  const saveGrassColorBtn = document.getElementById("save-grass-color-btn");
  if (saveGrassColorBtn) {
    saveGrassColorBtn.addEventListener("click", function () {
      saveCurrentGrassColor();
    });
  }

  const resetGrassColorBtn = document.getElementById("reset-grass-color-btn");
  if (resetGrassColorBtn) {
    resetGrassColorBtn.addEventListener("click", function () {
      resetGrassToDefaultColor();
    });
  }

  const saveGrassPresetBtn = document.getElementById("save-grass-preset-btn");
  if (saveGrassPresetBtn) {
    saveGrassPresetBtn.addEventListener("click", saveCurrentGrassAsPreset);
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

  console.log("✅ Event listener-ek beállítva v2.0.0 - Dual Color Picker integrációval");
}

// =============================================================================
// DUAL COLOR PICKER INICIALIZÁLÁS
// =============================================================================

function initializeColorPickers() {
  // Ellenőrizzük, hogy az iro.js betöltődött-e
  if (typeof iro === 'undefined') {
    console.error("❌ iro.js nem töltődött be! Ellenőrizd a CDN-t.");
    return;
  }

  // FA COLOR PICKER inicializálása
  initializeWoodColorPicker();
  
  // MŰFŰ COLOR PICKER inicializálása  
  initializeGrassColorPicker();
}

function initializeWoodColorPicker() {
  const pickerContainer = document.getElementById("iro-color-picker");
  if (!pickerContainer) {
    console.error("❌ iro-color-picker container nem található!");
    return;
  }

  try {
    // FA SliderPicker létrehozása
    woodColorPicker = new iro.ColorPicker("#iro-color-picker", {
      width: 390, // Teljes panel szélesség mínusz padding
      color: "#d3e3ff", // Alapértelmezett fa szín
      borderWidth: 0, // Nincs border
      layout: [
        {
          component: iro.ui.Box,
        },
        {
          component: iro.ui.Slider,
          options: {
            id: 'hue-slider',
            sliderType: 'hue'
          }
        }
      ]
    });

    // FA Color change event listener
    woodColorPicker.on('color:change', function(color) {
      const hexString = color.hexString; // pl. "#ff5722"
      const hexNumber = parseInt(hexString.substring(1), 16); // 0xff5722
      
      console.log(`🎨 FA színváltozás: ${hexString} -> 0x${hexNumber.toString(16)}`);
      
      // UI frissítése
      updateWoodColorPreview(color);
      
      // Fa szín változtatása
      if (window.changeWoodColor) {
        window.changeWoodColor(hexNumber);
      } else {
        console.warn("changeWoodColor függvény nem található");
      }
    });

    // Kezdeti fa color preview beállítása
    updateWoodColorPreview(woodColorPicker.color);
    loadWoodPresetsToUI();
    
    console.log("✅ FA iro.js Color Picker inicializálva");
    
  } catch (error) {
    console.error("❌ FA iro.js Color Picker inicializálási hiba:", error);
  }
}

function initializeGrassColorPicker() {
  const grassPickerContainer = document.getElementById("iro-grass-color-picker");
  if (!grassPickerContainer) {
    console.error("❌ iro-grass-color-picker container nem található!");
    return;
  }

  try {
    // MŰFŰ SliderPicker létrehozása
    grassColorPicker = new iro.ColorPicker("#iro-grass-color-picker", {
      width: 390, // Teljes panel szélesség mínusz padding
      color: "#95c5ff", // Alapértelmezett műfű szín
      borderWidth: 0, // Nincs border
      layout: [
        {
          component: iro.ui.Box,
        },
        {
          component: iro.ui.Slider,
          options: {
            id: 'hue-slider',
            sliderType: 'hue'
          }
        }
      ]
    });

    // MŰFŰ Color change event listener
    grassColorPicker.on('color:change', function(color) {
      const hexString = color.hexString; // pl. "#00ff00"
      const hexNumber = parseInt(hexString.substring(1), 16); // 0x00ff00
      
      console.log(`🌱 MŰFŰ színváltozás: ${hexString} -> 0x${hexNumber.toString(16)}`);
      
      // UI frissítése
      updateGrassColorPreview(color);
      
      // Műfű szín változtatása
      if (window.changeGrassColor) {
        window.changeGrassColor(hexNumber);
      } else {
        console.warn("changeGrassColor függvény nem található");
      }
    });

    // Kezdeti műfű color preview beállítása
    updateGrassColorPreview(grassColorPicker.color);
    loadGrassPresetsToUI();
    
    console.log("✅ MŰFŰ iro.js Color Picker inicializálva");
    
  } catch (error) {
    console.error("❌ MŰFŰ iro.js Color Picker inicializálási hiba:", error);
  }
}

// =============================================================================
// FA SZÍN KEZELÉS
// =============================================================================

// FA Color preview és hex érték frissítése
function updateWoodColorPreview(color) {
  // Color preview frissítése (ha van)
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

// FA Preset-ek betöltése UI-ba
async function loadWoodPresetsToUI() {
  if (!window.loadWoodPresetsFromFirebase) {
    console.warn("⚠️ loadWoodPresetsFromFirebase függvény nem található");
    return;
  }

  const presets = await window.loadWoodPresetsFromFirebase();
  const grid = document.getElementById("preset-grid");
  
  if (!grid) return;
  
  grid.innerHTML = "";
  
  if (presets.length === 0) {
    grid.innerHTML = '<div class="no-presets">Nincs mentett fa szín</div>';
    return;
  }
  
  presets.forEach(preset => {
    const presetElement = createWoodPresetElement(preset);
    grid.appendChild(presetElement);
  });
}

// FA Preset elem létrehozása
function createWoodPresetElement(preset) {
  const presetDiv = document.createElement('div');
  presetDiv.className = 'preset-item';
  presetDiv.style.backgroundColor = '#' + preset.color.toString(16).padStart(6, '0');
  presetDiv.title = preset.colorString;
  
  // Kattintás: szín alkalmazása
  presetDiv.addEventListener('click', async () => {
    if (window.changeWoodColor && woodColorPicker) {
      await window.changeWoodColor(preset.color);
      woodColorPicker.color.set('#' + preset.color.toString(16).padStart(6, '0'));
      console.log(`🎨 FA preset alkalmazva: ${preset.colorString}`);
    }
  });
  
  // Törlés gomb
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'preset-delete';
  deleteBtn.innerHTML = '×';
  deleteBtn.title = 'Preset törlése';
  
  deleteBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!confirm('Biztosan törölni szeretnéd ezt a fa színt?')) return;
    const success = await window.deleteWoodPresetFromFirebase(preset.id);
    if (success) await loadWoodPresetsToUI();
  });

  presetDiv.appendChild(deleteBtn);
  return presetDiv;
}

// FA Preset mentés
async function saveCurrentWoodAsPreset() {
  if (!woodColorPicker) return;
  
  const hexNumber = parseInt(woodColorPicker.color.hexString.substring(1), 16);
  const success = await window.saveWoodPresetToFirebase(hexNumber);
  
  if (success) {
    await loadWoodPresetsToUI();
    
    const saveBtn = document.getElementById("save-as-preset-btn");
    if (saveBtn) {
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = '<i data-lucide="check"></i>';
      saveBtn.disabled = true;
      
      if (typeof lucide !== 'undefined') lucide.createIcons();
      
      setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }, 2000);
    }
  }
}

// FA Eredeti színre visszaállítás
function resetWoodToDefaultColor() {
  console.log("🔄 FA szín visszaállítása alapértelmezettre...");
  
  // resetWoodColor használata (color-manager.js)
  if (window.resetWoodColor) {
    const success = window.resetWoodColor();
    
    if (success) {
      // iro.js picker frissítése az eredeti színre
      if (woodColorPicker) {
        woodColorPicker.color.set("#d3e3ff"); // Alapértelmezett fa szín
        console.log("✅ FA iro.js picker frissítve az alapértelmezettre");
      }
      
      // Vizuális visszajelzés - gomb animáció
      const resetBtn = document.getElementById("reset-color-btn");
      if (resetBtn) {
        const originalText = resetBtn.innerHTML;
        resetBtn.innerHTML = '<i data-lucide="check"></i>';
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
      
      console.log("✅ FA szín visszaállítva alapértelmezettre");
    } else {
      console.error("❌ FA szín reset sikertelen");
    }
  } else {
    console.error("❌ resetWoodColor függvény nem található");
  }
}

// FA Aktuális szín mentése
function saveCurrentWoodColor() {
  if (!woodColorPicker) {
    console.warn("⚠️ FA color picker nincs inicializálva");
    return;
  }
  
  const currentColor = woodColorPicker.color;
  const hexString = currentColor.hexString;
  const hexNumber = parseInt(hexString.substring(1), 16);
  
  // saveWoodColor használata (color-manager.js)
  if (window.saveWoodColor) {
    const success = window.saveWoodColor(hexNumber);
    
    if (success) {
      console.log(`💾 FA szín mentve: ${hexString} (0x${hexNumber.toString(16)})`);
      
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
      console.error("❌ FA szín mentése sikertelen");
    }
  } else {
    console.error("❌ saveWoodColor függvény nem található");
  }
}

// =============================================================================
// MŰFŰ SZÍN KEZELÉS
// =============================================================================

// MŰFŰ Color preview és hex érték frissítése
function updateGrassColorPreview(color) {
  // Color preview frissítése (ha van)
  const colorPreview = document.getElementById("grass-color-preview");
  if (colorPreview) {
    colorPreview.style.backgroundColor = color.rgbaString;
  }
  // Hex érték frissítése
  const hexValue = document.getElementById("grass-hex-value");
  if (hexValue) {
    hexValue.textContent = color.hexString.split("#").join("0x");
  }
}

// MŰFŰ Preset-ek betöltése UI-ba
async function loadGrassPresetsToUI() {
  if (!window.loadGrassPresetsFromFirebase) {
    console.warn("⚠️ loadGrassPresetsFromFirebase függvény nem található");
    return;
  }

  const presets = await window.loadGrassPresetsFromFirebase();
  const grid = document.getElementById("grass-preset-grid");
  
  if (!grid) return;
  
  grid.innerHTML = "";
  
  if (presets.length === 0) {
    grid.innerHTML = '<div class="no-presets">Nincs mentett műfű szín</div>';
    return;
  }
  
  presets.forEach(preset => {
    const presetElement = createGrassPresetElement(preset);
    grid.appendChild(presetElement);
  });
}

// MŰFŰ Preset elem létrehozása
function createGrassPresetElement(preset) {
  const presetDiv = document.createElement('div');
  presetDiv.className = 'preset-item';
  presetDiv.style.backgroundColor = '#' + preset.color.toString(16).padStart(6, '0');
  presetDiv.title = preset.colorString;
  
  // Kattintás: szín alkalmazása
  presetDiv.addEventListener('click', async () => {
    if (window.changeGrassColor && grassColorPicker) {
      await window.changeGrassColor(preset.color);
      grassColorPicker.color.set('#' + preset.color.toString(16).padStart(6, '0'));
      console.log(`🌱 MŰFŰ preset alkalmazva: ${preset.colorString}`);
    }
  });
  
  // Törlés gomb
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'preset-delete';
  deleteBtn.innerHTML = '×';
  deleteBtn.title = 'Műfű preset törlése';
  
  deleteBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!confirm('Biztosan törölni szeretnéd ezt a műfű színt?')) return;
    const success = await window.deleteGrassPresetFromFirebase(preset.id);
    if (success) await loadGrassPresetsToUI();
  });

  presetDiv.appendChild(deleteBtn);
  return presetDiv;
}

// MŰFŰ Preset mentés
async function saveCurrentGrassAsPreset() {
  if (!grassColorPicker) return;
  
  const hexNumber = parseInt(grassColorPicker.color.hexString.substring(1), 16);
  const success = await window.saveGrassPresetToFirebase(hexNumber);
  
  if (success) {
    await loadGrassPresetsToUI();
    
    const saveBtn = document.getElementById("save-grass-preset-btn");
    if (saveBtn) {
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = '<i data-lucide="check"></i>';
      saveBtn.disabled = true;
      
      if (typeof lucide !== 'undefined') lucide.createIcons();
      
      setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }, 2000);
    }
  }
}

// MŰFŰ Eredeti színre visszaállítás
function resetGrassToDefaultColor() {
  console.log("🔄 MŰFŰ szín visszaállítása alapértelmezettre...");
  
  // resetGrassColor használata (color-manager.js)
  if (window.resetGrassColor) {
    const success = window.resetGrassColor();
    
    if (success) {
      // iro.js picker frissítése az eredeti színre
      if (grassColorPicker) {
        grassColorPicker.color.set("#95c5ff"); // Alapértelmezett műfű szín
        console.log("✅ MŰFŰ iro.js picker frissítve az alapértelmezettre");
      }
      
      // Vizuális visszajelzés - gomb animáció
      const resetBtn = document.getElementById("reset-grass-color-btn");
      if (resetBtn) {
        const originalText = resetBtn.innerHTML;
        resetBtn.innerHTML = '<i data-lucide="check"></i>';
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
      
      console.log("✅ MŰFŰ szín visszaállítva alapértelmezettre");
    } else {
      console.error("❌ MŰFŰ szín reset sikertelen");
    }
  } else {
    console.error("❌ resetGrassColor függvény nem található");
  }
}

// MŰFŰ Aktuális szín mentése
function saveCurrentGrassColor() {
  if (!grassColorPicker) {
    console.warn("⚠️ MŰFŰ color picker nincs inicializálva");
    return;
  }
  
  const currentColor = grassColorPicker.color;
  const hexString = currentColor.hexString;
  const hexNumber = parseInt(hexString.substring(1), 16);
  
  // saveGrassColor használata (color-manager.js)
  if (window.saveGrassColor) {
    const success = window.saveGrassColor(hexNumber);
    
    if (success) {
      console.log(`💾 MŰFŰ szín mentve: ${hexString} (0x${hexNumber.toString(16)})`);
      
      // Vizuális visszajelzés - gomb animáció
      const saveBtn = document.getElementById("save-grass-color-btn");
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
      console.error("❌ MŰFŰ szín mentése sikertelen");
    }
  } else {
    console.error("❌ saveGrassColor függvény nem található");
  }
}

// =============================================================================
// EGYÉB UI FUNKCIÓK (VÁLTOZATLAN)
// =============================================================================

// Bal oldali panel toggle funkcionalitás
function toggleLeftPanel() {
  const leftPanel = document.getElementById("left-panel");
  const toggleBtn = document.getElementById("toggle-left-panel");
  
  if (!leftPanel || !toggleBtn) {
    console.warn("Bal oldali panel elemek nem találhatóak");
    return;
  }
  
  const isHidden = leftPanel.classList.contains("hidden");
  
  if (isHidden) {
    // Panel megjelenítése
    leftPanel.classList.remove("hidden");
    leftPanel.classList.add("visible");
    
    // Ikon váltás
    const icon = toggleBtn.querySelector('i[data-lucide]');
    if (icon) {
      icon.setAttribute('data-lucide', 'panel-left-close');
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
    
    console.log("📋 Bal oldali panel megjelenítve");
  } else {
    // Panel elrejtése
    leftPanel.classList.remove("visible");
    leftPanel.classList.add("hidden");
    
    // Ikon váltás
    const icon = toggleBtn.querySelector('i[data-lucide]');
    if (icon) {
      icon.setAttribute('data-lucide', 'panel-left-open');
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
    
    console.log("📋 Bal oldali panel elrejtve");
  }
}

// Summary panel toggle funkcionalitás
function toggleSummaryPanel() {
  const summaryPanel = document.getElementById("summary-panel");
  const toggleBtn = document.getElementById("toggle-summary-panel");
  const rightSlider = document.getElementById("right-slider");
  
  if (!summaryPanel || !toggleBtn) {
    console.warn("Summary panel elemek nem találhatóak");
    return;
  }
  
  const isHidden = summaryPanel.classList.contains("hidden");
  
  if (isHidden) {
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
  } else {
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
    const filename = binary ? "minigolf-palya.glb" : "minigolf-palya.gltf";
    const link = document.createElement("a");
    link.style.display = "none";
    document.body.appendChild(link);

    const blob = new Blob([result], {
      type: binary ? "application/octet-stream" : "application/json",
    });

    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.click();

    // Cleanup
    URL.revokeObjectURL(url);
    document.body.removeChild(link);

    // Visszaállítás eredeti állapotra
    if (wasExploded) {
      exploder.setExplodeLevel(
        currentLevel,
        allMeshes,
        elementManager.getAllElements()
      );
    }

    console.log(`✅ ${filename} sikeresen exportálva`);
  } catch (error) {
    console.error("❌ GLTF export hiba:", error);
    alert("Hiba történt az exportálás során. Lásd a konzolt a részletekért.");
  }
}

// =============================================================================
// GLOBÁLIS HOZZÁFÉRÉS ÉS BACKWARD COMPATIBILITY
// =============================================================================

// Globális hozzáférés
window.setupEventListeners = setupEventListeners;
window.exportGLTF = exportGLTF;
window.toggleLeftPanel = toggleLeftPanel;
window.toggleSummaryPanel = toggleSummaryPanel;

// DUAL COLOR PICKER FÜGGVÉNYEK
window.initializeColorPickers = initializeColorPickers;
window.initializeWoodColorPicker = initializeWoodColorPicker;
window.initializeGrassColorPicker = initializeGrassColorPicker;

// FA SZÍN FUNKCIÓK
window.saveCurrentWoodColor = saveCurrentWoodColor;
window.resetWoodToDefaultColor = resetWoodToDefaultColor;
window.saveCurrentWoodAsPreset = saveCurrentWoodAsPreset;
window.loadWoodPresetsToUI = loadWoodPresetsToUI;
window.updateWoodColorPreview = updateWoodColorPreview;

// MŰFŰ SZÍN FUNKCIÓK
window.saveCurrentGrassColor = saveCurrentGrassColor;
window.resetGrassToDefaultColor = resetGrassToDefaultColor;
window.saveCurrentGrassAsPreset = saveCurrentGrassAsPreset;
window.loadGrassPresetsToUI = loadGrassPresetsToUI;
window.updateGrassColorPreview = updateGrassColorPreview;

// BACKWARD COMPATIBILITY - régi függvények továbbra is elérhetőek
window.initializeColorPicker = initializeColorPickers; // régi név
window.saveCurrentColor = saveCurrentWoodColor; // régi név
window.resetToDefaultColor = resetWoodToDefaultColor; // régi név
window.saveCurrentColorAsPreset = saveCurrentWoodAsPreset; // régi név
window.updateColorPreview = updateWoodColorPreview; // régi név
window.loadPresetsToUI = loadWoodPresetsToUI; // régi név

console.log('✅ Event Handlers v2.0.0 - Dual Color Picker (Fa + Műfű) betöltve');