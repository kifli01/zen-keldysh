/**
 * Color Manager
 * Fa és Műfű elemek színkezelése - v3.0.0 Dual Color System
 * v2.2.0 - Firebase Realtime Database (localStorage helyett)
 * v3.0.0 - Műfű színkezelés hozzáadása
 */

// Firebase útvonalak - kibővített struktúra
const FIREBASE_PATHS = {
  WOOD: {
    DEFAULT: 'colors/wood/default',
    PRESETS: 'colors/wood/presets'
  },
  GRASS: {
    DEFAULT: 'colors/grass/default',
    PRESETS: 'colors/grass/presets'
  }
};

// Alapértelmezett színek
const DEFAULT_WOOD_COLOR = 0xd3e3ff;
const DEFAULT_GRASS_COLOR = 0x95c5ff;

// =============================================================================
// FA SZÍNKEZELÉS (MEGLÉVŐ FUNKCIÓK)
// =============================================================================

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
 * Aktuális fa szín mentése Firebase-be
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
    const ref = window.firebaseRef(window.firebaseDb, FIREBASE_PATHS.WOOD.DEFAULT);
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
      console.warn('⚠️ Firebase nincs inicializálva, alapértelmezett fa szín');
      return DEFAULT_WOOD_COLOR;
    }
    
    const dbRef = window.firebaseRef(window.firebaseDb);
    const snapshot = await window.firebaseGet(window.firebaseChild(dbRef, FIREBASE_PATHS.WOOD.DEFAULT));
    
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
    console.warn('⚠️ Firebase fa szín betöltés hiba:', error);
    return DEFAULT_WOOD_COLOR;
  }
};

/**
 * Firebase - Fa preset szín mentése
 */
window.saveWoodPresetToFirebase = async function(color) {
  try {
    if (!window.firebaseDb || !window.firebasePush || !window.firebaseRef) {
      console.error('❌ Firebase nincs inicializálva');
      return false;
    }
    
    const colorString = `0x${color.toString(16)}`;
    
    // Firebase preset mentés (push automatikus ID-t generál)
    const presetsRef = window.firebaseRef(window.firebaseDb, FIREBASE_PATHS.WOOD.PRESETS);
    await window.firebasePush(presetsRef, colorString);
    
    console.log(`🔥 Fa preset szín mentve Firebase-be: ${colorString}`);
    return true;
    
  } catch (error) {
    console.error('❌ Firebase fa preset mentés hiba:', error);
    return false;
  }
};

/**
 * Firebase - Fa összes preset betöltése
 */
window.loadWoodPresetsFromFirebase = async function() {
  try {
    if (!window.firebaseDb || !window.firebaseGet || !window.firebaseChild || !window.firebaseRef) {
      console.warn('⚠️ Firebase nincs inicializálva');
      return [];
    }
    
    const dbRef = window.firebaseRef(window.firebaseDb);
    const snapshot = await window.firebaseGet(window.firebaseChild(dbRef, FIREBASE_PATHS.WOOD.PRESETS));
    
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
      
      console.log(`🔥 ${presets.length} fa preset betöltve Firebase-ből`);
      return presets;
    }
    
    console.log('🔥 Nincs fa preset Firebase-ben');
    return [];
    
  } catch (error) {
    console.warn('⚠️ Firebase fa preset betöltés hiba:', error);
    return [];
  }
};

/**
 * Firebase - Fa preset törlése
 */
window.deleteWoodPresetFromFirebase = async function(presetId) {
  try {
    if (!window.firebaseDb || !window.firebaseRemove || !window.firebaseRef) {
      console.error('❌ Firebase nincs inicializálva');
      return false;
    }
    
    const presetRef = window.firebaseRef(window.firebaseDb, `${FIREBASE_PATHS.WOOD.PRESETS}/${presetId}`);
    await window.firebaseRemove(presetRef);
    
    console.log(`🔥 Fa preset törölve Firebase-ből: ${presetId}`);
    return true;
    
  } catch (error) {
    console.error('❌ Firebase fa preset törlés hiba:', error);
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

// =============================================================================
// MŰFŰ SZÍNKEZELÉS (ÚJ FUNKCIÓK v3.0.0)
// =============================================================================

/**
 * Műfű szín megváltoztatása valós időben (NINCS mentés)
 * @param {number} hexColor - Hex szín (pl. 0x00ff00)
 */
window.changeGrassColor = async function(hexColor) {
  console.log('🌱 Műfű szín váltása...', '#' + hexColor.toString(16));
  
  try {
    // 1. Konstans módosítása - műfű szín
    MATERIALS.ARTIFICIAL_GRASS.baseColor = hexColor;
    
    // 2. Műfű elemek újragenerálása
    const meshes = sceneManager().getAllMeshes();
    let updatedCount = 0;
    
    for (const [elementId, mesh] of meshes) {
      // Műfű elemek azonosítása
      if (isGrassElement(elementId)) {
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
    
    console.log(`✅ ${updatedCount} műfű elem frissítve (NINCS mentés)`);
    
    // 3. Renderelés triggere
    sceneManager().renderer.render(sceneManager().scene, sceneManager().camera);
    
    return true;
    
  } catch (error) {
    console.error('❌ Műfű szín váltási hiba:', error);
    return false;
  }
};

/**
 * Aktuális műfű szín mentése Firebase-be
 * @param {number} hexColor - Opcionális hex szín, ha nincs megadva akkor az aktuálisat menti
 */
window.saveGrassColor = async function(hexColor = null) {
  try {
    // Firebase elérhetőség ellenőrzése
    if (!window.firebaseDb || !window.firebaseSet || !window.firebaseRef) {
      console.error('❌ Firebase nincs inicializálva');
      return false;
    }
    
    // Ha nincs szín megadva, aktuális szín használata
    const colorToSave = hexColor !== null ? hexColor : getCurrentGrassColor();
    const colorString = `0x${colorToSave.toString(16)}`;
    
    // Firebase mentés
    const ref = window.firebaseRef(window.firebaseDb, FIREBASE_PATHS.GRASS.DEFAULT);
    await window.firebaseSet(ref, colorString);
    
    console.log(`🔥 Műfű szín mentve Firebase-be: ${colorString}`);
    return true;
    
  } catch (error) {
    console.error('❌ Firebase műfű mentés hiba:', error);
    return false;
  }
};

/**
 * Mentett műfű szín betöltése Firebase-ből
 */
window.loadSavedGrassColor = async function() {
  try {
    // Firebase elérhetőség ellenőrzése
    if (!window.firebaseDb || !window.firebaseGet || !window.firebaseChild || !window.firebaseRef) {
      console.warn('⚠️ Firebase nincs inicializálva, alapértelmezett műfű szín');
      return DEFAULT_GRASS_COLOR;
    }
    
    const dbRef = window.firebaseRef(window.firebaseDb);
    const snapshot = await window.firebaseGet(window.firebaseChild(dbRef, FIREBASE_PATHS.GRASS.DEFAULT));
    
    if (snapshot.exists()) {
      const colorStr = snapshot.val().trim();
      const color = parseInt(colorStr, 16);
      
      if (!isNaN(color)) {
        console.log('🔥 Mentett műfű szín betöltve Firebase-ből:', colorStr);
        
        // Konstans beállítása (renderelés nélkül)
        MATERIALS.ARTIFICIAL_GRASS.baseColor = color;
        
        console.log(`✅ Műfű szín beállítva: ${colorStr}`);
        return color;
      }
    }
    
    console.log('🔥 Nincs mentett műfű szín Firebase-ben, alapértelmezett használata');
    return DEFAULT_GRASS_COLOR;
    
  } catch (error) {
    console.warn('⚠️ Firebase műfű szín betöltés hiba:', error);
    return DEFAULT_GRASS_COLOR;
  }
};

/**
 * Firebase - Műfű preset szín mentése
 */
window.saveGrassPresetToFirebase = async function(color) {
  try {
    if (!window.firebaseDb || !window.firebasePush || !window.firebaseRef) {
      console.error('❌ Firebase nincs inicializálva');
      return false;
    }
    
    const colorString = `0x${color.toString(16)}`;
    
    // Firebase preset mentés (push automatikus ID-t generál)
    const presetsRef = window.firebaseRef(window.firebaseDb, FIREBASE_PATHS.GRASS.PRESETS);
    await window.firebasePush(presetsRef, colorString);
    
    console.log(`🔥 Műfű preset szín mentve Firebase-be: ${colorString}`);
    return true;
    
  } catch (error) {
    console.error('❌ Firebase műfű preset mentés hiba:', error);
    return false;
  }
};

/**
 * Firebase - Műfű összes preset betöltése
 */
window.loadGrassPresetsFromFirebase = async function() {
  try {
    if (!window.firebaseDb || !window.firebaseGet || !window.firebaseChild || !window.firebaseRef) {
      console.warn('⚠️ Firebase nincs inicializálva');
      return [];
    }
    
    const dbRef = window.firebaseRef(window.firebaseDb);
    const snapshot = await window.firebaseGet(window.firebaseChild(dbRef, FIREBASE_PATHS.GRASS.PRESETS));
    
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
      
      console.log(`🔥 ${presets.length} műfű preset betöltve Firebase-ből`);
      return presets;
    }
    
    console.log('🔥 Nincs műfű preset Firebase-ben');
    return [];
    
  } catch (error) {
    console.warn('⚠️ Firebase műfű preset betöltés hiba:', error);
    return [];
  }
};

/**
 * Firebase - Műfű preset törlése
 */
window.deleteGrassPresetFromFirebase = async function(presetId) {
  try {
    if (!window.firebaseDb || !window.firebaseRemove || !window.firebaseRef) {
      console.error('❌ Firebase nincs inicializálva');
      return false;
    }
    
    const presetRef = window.firebaseRef(window.firebaseDb, `${FIREBASE_PATHS.GRASS.PRESETS}/${presetId}`);
    await window.firebaseRemove(presetRef);
    
    console.log(`🔥 Műfű preset törölve Firebase-ből: ${presetId}`);
    return true;
    
  } catch (error) {
    console.error('❌ Firebase műfű preset törlés hiba:', error);
    return false;
  }
};

/**
 * Műfű szín visszaállítása alapértelmezettre
 */
window.resetGrassColor = function() {
  console.log('🔄 Műfű szín visszaállítása alapértelmezettre');
  return changeGrassColor(DEFAULT_GRASS_COLOR);
};

/**
 * Aktuális műfű szín lekérése
 */
window.getCurrentGrassColor = function() {
  return MATERIALS.ARTIFICIAL_GRASS.baseColor;
};

// =============================================================================
// SEGÉDFUNKCIÓK ÉS ELEM AZONOSÍTÁS
// =============================================================================

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
    'plate', 'dowel', 'tessauer', 'countersunk', 'fastener'
  ];
  
  return woodKeywords.some(keyword => elementId.includes(keyword));
}

/**
 * Műfű elem azonosítása elementId alapján
 * @param {string} elementId - Elem azonosító
 * @returns {boolean} - Műfű elem-e
 */
function isGrassElement(elementId) {
  const grassKeywords = [
    'turf', 'covering', 'grass', 'artificial'
  ];
  
  return grassKeywords.some(keyword => elementId.includes(keyword));
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
 * Műfű elemek számának lekérése (debug)
 */
window.getGrassElementCount = function() {
  const meshes = sceneManager().getAllMeshes();
  let grassCount = 0;
  
  for (const [elementId] of meshes) {
    if (isGrassElement(elementId)) {
      grassCount++;
    }
  }
  
  return grassCount;
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
 * Műfű elemek listázása (debug)
 */
window.listGrassElements = function() {
  const meshes = sceneManager().getAllMeshes();
  const grassElements = [];
  
  for (const [elementId] of meshes) {
    if (isGrassElement(elementId)) {
      const element = elementManager().getAllElements().find(e => e.id === elementId);
      grassElements.push({
        id: elementId,
        materialKey: element?.materialKey || 'UNKNOWN'
      });
    }
  }
  
  console.log(`=== MŰFŰ ELEMEK (${grassElements.length}) ===`);
  grassElements.forEach(item => {
    console.log(`${item.id} - ${item.materialKey}`);
  });
  console.log('====================================');
  
  return grassElements;
};

/**
 * Színek debug információk
 */
window.colorDebug = function() {
  console.log('=== SZÍN DEBUG v3.0.0 ===');
  console.log('FA SZÍNEK:');
  console.log('  Aktuális fa szín:', hexToColorString(getCurrentWoodColor()));
  console.log('  PINE_SOLID.baseColor:', hexToColorString(MATERIALS.PINE_SOLID.baseColor));
  console.log('  PINE_PLYWOOD.baseColor:', hexToColorString(MATERIALS.PINE_PLYWOOD.baseColor));
  console.log('  Fa elemek száma:', getWoodElementCount());
  console.log('');
  console.log('MŰFŰ SZÍNEK:');
  console.log('  Aktuális műfű szín:', hexToColorString(getCurrentGrassColor()));
  console.log('  ARTIFICIAL_GRASS.baseColor:', hexToColorString(MATERIALS.ARTIFICIAL_GRASS.baseColor));
  console.log('  Műfű elemek száma:', getGrassElementCount());
  console.log('========================');
};

// =============================================================================
// INICIALIZÁLÁS ÉS BETÖLTÉS
// =============================================================================

// Automatikus betöltés inicializáláskor - FA ÉS MŰFŰ színek
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Késleltetett betöltés - várjuk meg hogy minden manager és Firebase kész legyen
    setTimeout(async () => {
      if (typeof sceneManager === 'function' && sceneManager()) {
        // Fa szín betöltése
        const woodColor = await loadSavedWoodColor();
        if (woodColor !== DEFAULT_WOOD_COLOR) {
          await changeWoodColor(woodColor);
        }
        
        // Műfű szín betöltése
        const grassColor = await loadSavedGrassColor();
        if (grassColor !== DEFAULT_GRASS_COLOR) {
          await changeGrassColor(grassColor);
        }
      }
    }, 3000); // 3 másodperc késleltetés Firebase számára
  });
} else {
  // DOM már kész
  setTimeout(async () => {
    if (typeof sceneManager === 'function' && sceneManager()) {
      // Fa szín betöltése
      const woodColor = await loadSavedWoodColor();
      if (woodColor !== DEFAULT_WOOD_COLOR) {
        await changeWoodColor(woodColor);
      }
      
      // Műfű szín betöltése
      const grassColor = await loadSavedGrassColor();
      if (grassColor !== DEFAULT_GRASS_COLOR) {
        await changeGrassColor(grassColor);
      }
    }
  }, 2000); // 2 másodperc késleltetés Firebase számára
}

console.log('✅ Color Manager v3.0.0 - Dual Color System (Fa + Műfű) betöltve');

// =============================================================================
// GLOBÁLIS HOZZÁFÉRHETŐSÉG
// =============================================================================

window.ColorManager = {
  // FA FUNKCIÓK
  changeWoodColor,
  saveWoodColor,
  loadSavedWoodColor,
  saveWoodPresetToFirebase,
  loadWoodPresetsFromFirebase,
  deleteWoodPresetFromFirebase,
  resetWoodColor,
  getCurrentWoodColor,
  getWoodElementCount,
  listWoodElements,
  
  // MŰFŰ FUNKCIÓK (v3.0.0)
  changeGrassColor,
  saveGrassColor,
  loadSavedGrassColor,
  saveGrassPresetToFirebase,
  loadGrassPresetsFromFirebase,
  deleteGrassPresetFromFirebase,
  resetGrassColor,
  getCurrentGrassColor,
  getGrassElementCount,
  listGrassElements,
  
  // SEGÉDFUNKCIÓK
  hexToColorString,
  colorDebug,
  
  // KONSTANSOK
  DEFAULT_WOOD_COLOR,
  DEFAULT_GRASS_COLOR,
  
  version: '3.0.0'
};

// Backward compatibility - régi függvények továbbra is elérhetőek
window.savePresetToFirebase = saveWoodPresetToFirebase; // régi név
window.loadPresetsFromFirebase = loadWoodPresetsFromFirebase; // régi név
window.deletePresetFromFirebase = deleteWoodPresetFromFirebase; // régi név
window.woodColorDebug = colorDebug; // régi név