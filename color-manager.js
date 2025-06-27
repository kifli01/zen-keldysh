/**
 * Color Manager
 * Fa elemek színkezelése - egyszerűsített verzió
 * v2.0.0 - Valós idejű színváltás újragenerálással
 */

// localStorage kulcs
const WOOD_COLOR_STORAGE_KEY = 'minigolf_wood_color';

// Alapértelmezett fa szín
const DEFAULT_WOOD_COLOR = 0xb6c4de;

/**
 * Fa szín megváltoztatása valós időben
 * @param {number} hexColor - Hex szín (pl. 0xff5722)
 */
window.changeWoodColor = async function(hexColor) {
  console.log('🎨 Fa szín váltása...', '#' + hexColor.toString(16));
  
  try {
    // 1. Konstansok módosítása - egységes fa szín
    MATERIALS.PINE_SOLID.baseColor = hexColor;
    MATERIALS.PINE_PLYWOOD.baseColor = hexColor;
    
    // 2. localStorage mentés
    localStorage.setItem(WOOD_COLOR_STORAGE_KEY, hexColor.toString(16));
    console.log(`💾 Fa szín mentve localStorage-ba: #${hexColor.toString(16)}`);
    
    // 3. Fa elemek újragenerálása
    const meshes = sceneManager().getAllMeshes();
    let updatedCount = 0;
    
    for (const [elementId, mesh] of meshes) {
      // Fa elemek azonosítása
      if (isWoodElement(elementId)) {
        const element = elementManager().getAllElements().find(e => e.id === elementId);
        
        if (element) {
          const materialDef = MATERIALS[element.materialKey];
          const newMaterial = await textureManager().getMaterialWithShade(materialDef, element.shade || 5);
          
          // Material csere
          if (mesh.material) {
            // Régi material dispose
            if (mesh.material.dispose) {
              mesh.material.dispose();
            }
            mesh.material = newMaterial;
            updatedCount++;
          }
          
          // GROUP mesh-ek kezelése (ha vannak)
          if (mesh.children && mesh.children.length > 0) {
            mesh.children.forEach((child) => {
              if (child.material) {
                if (child.material.dispose) {
                  child.material.dispose();
                }
                child.material = newMaterial.clone();
              }
            });
          }
        }
      }
    }
    
    console.log(`✅ ${updatedCount} fa elem frissítve és mentve`);
    
    // 4. Renderelés triggere
    sceneManager().renderer.render(sceneManager().scene, sceneManager().camera);
    
    return true;
    
  } catch (error) {
    console.error('❌ Fa szín váltási hiba:', error);
    return false;
  }
};

/**
 * Mentett fa szín betöltése localStorage-ból
 */
window.loadSavedWoodColor = function() {
  try {
    const saved = localStorage.getItem(WOOD_COLOR_STORAGE_KEY);
    
    if (saved) {
      const color = parseInt(saved, 16);
      
      if (!isNaN(color)) {
        console.log('📂 Mentett fa szín betöltése:', '#' + saved);
        
        // Konstansok beállítása (renderelés nélkül)
        MATERIALS.PINE_SOLID.baseColor = color;
        MATERIALS.PINE_PLYWOOD.baseColor = color;
        
        console.log(`✅ Fa szín beállítva: #${saved}`);
        return color;
      }
    }
    
    console.log('📂 Nincs mentett fa szín, alapértelmezett használata');
    return DEFAULT_WOOD_COLOR;
    
  } catch (error) {
    console.warn('⚠️ Fa szín localStorage betöltési hiba:', error);
    return DEFAULT_WOOD_COLOR;
  }
};

/**
 * Fa szín visszaállítása alapértelmezettre
 */
window.resetWoodColor = function() {
  console.log('🔄 Fa szín visszaállítása alapértelmezettre');
  return changeWoodColor(DEFAULT_WOOD_COLOR);
};

/**
 * Aktuális fa szín lekérése
 */
window.getCurrentWoodColor = function() {
  return MATERIALS.PINE_SOLID.baseColor;
};

/**
 * Hex szín konvertálása színes stringgé (debug)
 */
window.hexToColorString = function(hexColor) {
  return '#' + hexColor.toString(16).padStart(6, '0');
};

/**
 * Fa elem azonosítása elementId alapján
 * @param {string} elementId - Elem azonosító
 * @returns {boolean} - Fa elem-e
 */
function isWoodElement(elementId) {
  const woodKeywords = [
    'frame', 'leg', 'wall', 'cross', 'beam', 
    'plate', 'dowel', 'tessauer', 'countersunk'
  ];
  
  return woodKeywords.some(keyword => elementId.includes(keyword));
}

/**
 * Fa elemek számának lekérése (debug)
 */
window.getWoodElementCount = function() {
  const meshes = sceneManager().getAllMeshes();
  let woodCount = 0;
  
  for (const [elementId] of meshes) {
    if (isWoodElement(elementId)) {
      woodCount++;
    }
  }
  
  return woodCount;
};

/**
 * Fa elemek listázása (debug)
 */
window.listWoodElements = function() {
  const meshes = sceneManager().getAllMeshes();
  const woodElements = [];
  
  for (const [elementId] of meshes) {
    if (isWoodElement(elementId)) {
      const element = elementManager().getAllElements().find(e => e.id === elementId);
      woodElements.push({
        id: elementId,
        materialKey: element?.materialKey || 'UNKNOWN'
      });
    }
  }
  
  console.log(`=== FA ELEMEK (${woodElements.length}) ===`);
  woodElements.forEach(item => {
    console.log(`${item.id} - ${item.materialKey}`);
  });
  console.log('================================');
  
  return woodElements;
};

/**
 * localStorage fa szín debug információk
 */
window.woodColorDebug = function() {
  console.log('=== FA SZÍN DEBUG ===');
  console.log('Aktuális fa szín:', hexToColorString(getCurrentWoodColor()));
  console.log('PINE_SOLID.baseColor:', hexToColorString(MATERIALS.PINE_SOLID.baseColor));
  console.log('PINE_PLYWOOD.baseColor:', hexToColorString(MATERIALS.PINE_PLYWOOD.baseColor));
  console.log('localStorage érték:', localStorage.getItem(WOOD_COLOR_STORAGE_KEY));
  console.log('Fa elemek száma:', getWoodElementCount());
  console.log('====================');
};

/**
 * localStorage fa szín törlése
 */
window.clearWoodColorStorage = function() {
  localStorage.removeItem(WOOD_COLOR_STORAGE_KEY);
  console.log('🧹 Fa szín localStorage törölve');
};

// Automatikus betöltés inicializáláskor (ha a DOM már kész)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Késleltetett betöltés - várjuk meg hogy minden manager kész legyen
    setTimeout(() => {
      if (typeof sceneManager === 'function' && sceneManager()) {
        loadSavedWoodColor();
      }
    }, 2000); // 2 másodperc késleltetés
  });
} else {
  // DOM már kész
  setTimeout(() => {
    if (typeof sceneManager === 'function' && sceneManager()) {
      loadSavedWoodColor();
    }
  }, 1000);
}

console.log('✅ Color Manager v2.0.0 - Egyszerűsített fa színkezelés betöltve');

// Globális hozzáférhetőség régi ColorManager objektum helyett
window.ColorManager = {
  changeWoodColor,
  loadSavedWoodColor,
  resetWoodColor,
  getCurrentWoodColor,
  getWoodElementCount,
  listWoodElements,
  woodColorDebug,
  clearWoodColorStorage,
  version: '2.0.0'
};