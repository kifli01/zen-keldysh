/**
 * Color Manager
 * Fa elemek színkezelése - v2.2.0 Firebase Integration
 * v2.1.0 - Szétválasztott changeWoodColor és saveWoodColor
 * v2.2.0 - Firebase Realtime Database (localStorage helyett)
 */

// Firebase útvonalak
const FIREBASE_PATHS = {
  DEFAULT: 'colors/wood/default',
  PRESETS: 'colors/wood/presets'
};

// Alapértelmezett fa szín
const DEFAULT_WOOD_COLOR = 0xd3e3ff;

/**
 * Fa szín megváltoztatása valós időben (NINCS mentés)
 * @param {number} hexColor - Hex szín (pl. 0xff5722)
 */
window.changeWoodColor = async function(hexColor) {
  console.log('🎨 Fa szín váltása...', '#' + hexColor.toString(16));
  
  try {
    // 1. Konstansok módosítása - egységes fa szín
    MATERIALS.PINE_SOLID.baseColor = hexColor;
    MATERIALS.PINE_PLYWOOD.baseColor = hexColor;
    
    // 2. Fa elemek újragenerálása
    const meshes = sceneManager().getAllMeshes();
    let updatedCount = 0;
    
    for (const [elementId, mesh] of meshes) {
      // Fa elemek azonosítása
      if (isWoodElement(elementId)) {
        const element = elementManager().getAllElements().find(e => e.id === elementId);
        
        if (element) {
          const materialDef = MATERIALS[element.materialKey];
          const newMaterial = await textureManager().getMaterialWithShade(materialDef);
          
          // Material csere
          if (mesh.material) {
            mesh.material = newMaterial;
            updatedCount++;
          }
          
          // GROUP mesh-ek kezelése (ha vannak)
          if (mesh.children && mesh.children.length > 0) {
            mesh.children.forEach((child) => {
              if (child.material) {
                child.material = newMaterial.clone();
              }
            });
          }
        }
      }
    }
    
    console.log(`✅ ${updatedCount} fa elem frissítve (NINCS mentés)`);
    
    // 3. Renderelés triggere
    sceneManager().renderer.render(sceneManager().scene, sceneManager().camera);
    
    return true;
    
  } catch (error) {
    console.error('❌ Fa szín váltási hiba:', error);
    return false;
  }
};

/**
 * v2.2.0: Aktuális fa szín mentése Firebase-be
 * @param {number} hexColor - Opcionális hex szín, ha nincs megadva akkor az aktuálisat menti
 */
window.saveWoodColor = async function(hexColor = null) {
  try {
    // Firebase elérhetőség ellenőrzése
    if (!window.firebaseDb || !window.firebaseSet || !window.firebaseRef) {
      console.error('❌ Firebase nincs inicializálva');
      return false;
    }
    
    // Ha nincs szín megadva, aktuális szín használata
    const colorToSave = hexColor !== null ? hexColor : getCurrentWoodColor();
    const colorString = `0x${colorToSave.toString(16)}`;
    
    // Firebase mentés
    const ref = window.firebaseRef(window.firebaseDb, FIREBASE_PATHS.DEFAULT);
    await window.firebaseSet(ref, colorString);
    
    console.log(`🔥 Fa szín mentve Firebase-be: ${colorString}`);
    return true;
    
  } catch (error) {
    console.error('❌ Firebase mentés hiba:', error);
    return false;
  }
};

/**
 * Mentett fa szín betöltése Firebase-ből
 */
window.loadSavedWoodColor = async function() {
  try {
    // Firebase elérhetőség ellenőrzése
    if (!window.firebaseDb || !window.firebaseGet || !window.firebaseChild || !window.firebaseRef) {
      console.warn('⚠️ Firebase nincs inicializálva, alapértelmezett szín');
      return DEFAULT_WOOD_COLOR;
    }
    
    const dbRef = window.firebaseRef(window.firebaseDb);
    const snapshot = await window.firebaseGet(window.firebaseChild(dbRef, FIREBASE_PATHS.DEFAULT));
    
    if (snapshot.exists()) {
      const colorStr = snapshot.val().trim();
      const color = parseInt(colorStr, 16);
      
      if (!isNaN(color)) {
        console.log('🔥 Mentett fa szín betöltve Firebase-ből:', colorStr);
        
        // Konstansok beállítása (renderelés nélkül)
        MATERIALS.PINE_SOLID.baseColor = color;
        MATERIALS.PINE_PLYWOOD.baseColor = color;
        
        console.log(`✅ Fa szín beállítva: ${colorStr}`);
        return color;
      }
    }
    
    console.log('🔥 Nincs mentett fa szín Firebase-ben, alapértelmezett használata');
    return DEFAULT_WOOD_COLOR;
    
  } catch (error) {
    console.warn('⚠️ Firebase betöltés hiba:', error);
    return DEFAULT_WOOD_COLOR;
  }
};

/**
 * v2.2.0: Firebase - Preset szín mentése
 */
window.savePresetToFirebase = async function(color) {
  try {
    if (!window.firebaseDb || !window.firebasePush || !window.firebaseRef) {
      console.error('❌ Firebase nincs inicializálva');
      return false;
    }
    
    const colorString = `0x${color.toString(16)}`;
    
    // Firebase preset mentés (push automatikus ID-t generál)
    const presetsRef = window.firebaseRef(window.firebaseDb, FIREBASE_PATHS.PRESETS);
    await window.firebasePush(presetsRef, colorString);
    
    console.log(`🔥 Preset szín mentve Firebase-be: ${colorString}`);
    return true;
    
  } catch (error) {
    console.error('❌ Firebase preset mentés hiba:', error);
    return false;
  }
};

/**
 * v2.2.0: Firebase - Összes preset betöltése
 */
window.loadPresetsFromFirebase = async function() {
  try {
    if (!window.firebaseDb || !window.firebaseGet || !window.firebaseChild || !window.firebaseRef) {
      console.warn('⚠️ Firebase nincs inicializálva');
      return [];
    }
    
    const dbRef = window.firebaseRef(window.firebaseDb);
    const snapshot = await window.firebaseGet(window.firebaseChild(dbRef, FIREBASE_PATHS.PRESETS));
    
    if (snapshot.exists()) {
      const presetsData = snapshot.val();
      const presets = [];
      
      // Firebase objektum átalakítása tömbbé
      Object.entries(presetsData).forEach(([key, colorStr]) => {
        const color = parseInt(colorStr.trim(), 16);
        if (!isNaN(color)) {
          presets.push({
            id: key,
            color: color,
            colorString: colorStr.trim()
          });
        }
      });
      
      console.log(`🔥 ${presets.length} preset betöltve Firebase-ből`);
      return presets;
    }
    
    console.log('🔥 Nincs preset Firebase-ben');
    return [];
    
  } catch (error) {
    console.warn('⚠️ Firebase preset betöltés hiba:', error);
    return [];
  }
};

/**
 * v2.2.0: Firebase - Preset törlése
 */
window.deletePresetFromFirebase = async function(presetId) {
  try {
    if (!window.firebaseDb || !window.firebaseRemove || !window.firebaseRef) {
      console.error('❌ Firebase nincs inicializálva');
      return false;
    }
    
    const presetRef = window.firebaseRef(window.firebaseDb, `${FIREBASE_PATHS.PRESETS}/${presetId}`);
    await window.firebaseRemove(presetRef);
    
    console.log(`🔥 Preset törölve Firebase-ből: ${presetId}`);
    return true;
    
  } catch (error) {
    console.error('❌ Firebase preset törlés hiba:', error);
    return false;
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
  console.log('Fa elemek száma:', getWoodElementCount());
  console.log('====================');
};

// Automatikus betöltés inicializáláskor (ha a DOM már kész)
// v2.2.0: Firebase betöltés
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Késleltetett betöltés - várjuk meg hogy minden manager és Firebase kész legyen
    setTimeout(async () => {
      if (typeof sceneManager === 'function' && sceneManager()) {
        const color = await loadSavedWoodColor();
        if (color !== DEFAULT_WOOD_COLOR) {
          await changeWoodColor(color);
        }
      }
    }, 3000); // 3 másodperc késleltetés Firebase számára
  });
} else {
  // DOM már kész
  setTimeout(async () => {
    if (typeof sceneManager === 'function' && sceneManager()) {
      const color = await loadSavedWoodColor();
      if (color !== DEFAULT_WOOD_COLOR) {
        await changeWoodColor(color);
      }
    }
  }, 2000); // 2 másodperc késleltetés Firebase számára
}

console.log('✅ Color Manager v2.2.0 - Firebase Integration betöltve');

// Globális hozzáférhetőség - v2.2.0 Firebase
window.ColorManager = {
  changeWoodColor,
  saveWoodColor, // Firebase
  loadSavedWoodColor, // Firebase
  savePresetToFirebase,
  loadPresetsFromFirebase,
  deletePresetFromFirebase,
  resetWoodColor,
  getCurrentWoodColor,
  getWoodElementCount,
  listWoodElements,
  woodColorDebug,
  version: '2.2.0'
};