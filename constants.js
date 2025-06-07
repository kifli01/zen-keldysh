/**
 * Minigolf Constants
 * Közös konstansok és alapértékek a minigolf pálya elemekhez
 * v1.6.0 - PBR tulajdonságok hozzáadva
 */

// Geometria típusok
const GEOMETRY_TYPES = {
  BOX: "box",
  CYLINDER: "cylinder",
  EXTRUDE: "extrude",
  SPHERE: "sphere", 
  GROUP: "group",
};

// Elem típusok
const ELEMENT_TYPES = {
  PLATE: "plate",
  COVERING: "covering",
  FRAME: "frame",
  LEG: "leg",
  WALL: "wall",
  BALL: "ball", // Új típus a labdához
  PART: "part",
};

// Anyag definíciók (PBR properties hozzáadva)
const MATERIALS = {
  PINE_PLYWOOD: {
    name: "Lucfenyő rétegelt lemez",
    density: 0.5, // g/cm³
    color: 0xdccfb7,
    shininess: 10,
    // Textúra beállítások:
    imagePath: 'textures/wood-3.jpg',
    baseColor: 0xdccfb7, // Világosabb fa szín
    repeat: { x: 2, y: 2 },
    useShade: true,
    // PBR tulajdonságok:
    roughnessBase: 0.8, // Fa - matt felület
    metalnessBase: 0.0, // Nem fém
    envMapIntensity: 0.3,
  },
  PINE_SOLID: {
    name: "Lucfenyő tömörfa",
    density: 0.45, // g/cm³
    color: 0xdccfb7,
    shininess: 10,
    // Textúra beállítások:
    imagePath: 'textures/wood-3.jpg',
    baseColor: 0xdccfb7,
    repeat: { x: 2, y: 2 },
    useShade: true,
    // PBR tulajdonságok:
    roughnessBase: 0.9, // Tömörfa - még mattabb
    metalnessBase: 0.0,
    envMapIntensity: 0.2,
  },
  ARTIFICIAL_GRASS: {
    name: "LazyLawn Meadow Twist műfű",
    density: 0.2, // g/cm³
    color: 0xa5bc49,
    shininess: 2,
    // Textúra beállítások:
    imagePath: 'textures/turf-1.jpg',
    baseColor: 0xa5bc49,
    repeat: { x: 8, y: 8 },
    useShade: true,
    // PBR tulajdonságok:
    roughnessBase: 0.95, // Műfű - nagyon matt
    metalnessBase: 0.0,
    envMapIntensity: 0.1,
  },
  WHITE_PLASTIC: {
    name: "Fehér műanyag",
    density: 0.9, // g/cm³
    color: 0xffffff,
    shininess: 30,
    // Textúra beállítások:
    imagePath: null, // Nincs textúra
    baseColor: 0xffffff,
    repeat: { x: 1, y: 1 },
    useShade: false, // Fix shininess
    // PBR tulajdonságok:
    roughnessBase: 0.1, // Műanyag - sima felület
    metalnessBase: 0.0,
    envMapIntensity: 0.8,
  },
  GALVANIZED_STEEL: {
    name: "Galvanizált acél",
    density: 7.8, // g/cm³
    color: 0xffffff,
    shininess: 60,
    // Textúra beállítások:
    imagePath: 'textures/steel.jpg',
    baseColor: 0xffffff,
    repeat: { x: 1, y: 1 },
    useShade: true,
    // PBR tulajdonságok:
    roughnessBase: 0.3, // Fém - közepesen sima
    metalnessBase: 0.9, // Nagyon fémes
    envMapIntensity: 1.5, // Erős reflexió
  },
};

// Alapértelmezett megjelenítési beállítások
const DEFAULT_DISPLAY = {
  visible: true,
  opacity: 1,
  wireframe: false,
  castShadow: true,
  receiveShadow: true,
};

// Alapértelmezett transform
const DEFAULT_TRANSFORM = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};

// Minigolf pálya alapvető méretek
const COURSE_DIMENSIONS = {
  length: 250, // cm
  width: 80, // cm
  topPlateThickness: 0.9, // 9 mm
  turfThickness: 0.5, // 11.5mm
  holeRadius: 5.4, // átmérő: 10.8 cm
  holePositionX: 50, // A lyuk pozíciója a pálya végétől (cm)
  frontWidth: 2, // 2cm első takaró léc
  // frontHeight: 16 - 6 - 0.9, // sideHeight - sideVerticalShift - topPlateThickness
  frameWidth: 6, // 6 cm széles lécek
  frameHeight: 4, // 4 cm magas lécek
  sideWidth: 5, // 5 cm széles oldallécek
  sideHeight: 16, // 16 cm magas oldallécek
  sideVerticalShift: 7, // 6 cm-re a borítástól felfelé
  legDiameter: 6, // 6 cm átmérőjű lábak
  legHeight: 12, // 12 cm magas lábak
  legInset: 3, // 4cm-rel bentebb
  crossBeamCount: 2, // belső keresztlécek száma (+ 2 szélső = összesen 4)
  crossBeamWidth: 12, // keresztlécek szélessége (2x6cm)
};

COURSE_DIMENSIONS.frontHeight =
  COURSE_DIMENSIONS.sideHeight -
  COURSE_DIMENSIONS.sideVerticalShift -
  COURSE_DIMENSIONS.turfThickness + 
  COURSE_DIMENSIONS.topPlateThickness / 2
  ;

// Lyuk pozíciók (COURSE_DIMENSIONS után definiálva)
const HOLE_POSITION = {
  smallCorner: {
    x: [
      -COURSE_DIMENSIONS.length / 2 + 3 / 2,
      -COURSE_DIMENSIONS.length / 4,
      0,
      COURSE_DIMENSIONS.length / 4,
      COURSE_DIMENSIONS.length / 2 - 3 / 2,
    ],
    y: COURSE_DIMENSIONS.frameHeight,
    z: COURSE_DIMENSIONS.width / 2
  }
};

// ÚJ: CSG beállítások
const CSG_CONFIG = {
  enabled: true, // CSG műveletek engedélyezése
  useWorker: false, // Web Worker használata (jelenleg nem támogatott)
  maxOperations: 50, // Maximális batch műveletek száma
  cacheSize: 100, // Geometria cache méret
  enableProfiling: false, // Performance profiling
};

// ÚJ: CSG művelet típusok
const CSG_OPERATIONS = {
  SUBTRACT: "subtract",
  UNION: "union",
  INTERSECT: "intersect",
};

// ÚJ: CSG Performance beállítások
const CSG_PERFORMANCE = {
  enableCache: true, // Geometria cache engedélyezése
  enableProfiling: false, // Performance mérés (debug módban)
  warnThreshold: 100, // ms - figyelmeztetés ha lassú a művelet
  maxCacheAge: 300000, // 5 perc - cache lejárati idő
  batchSize: 10, // Batch műveletek mérete
};

// ÚJ: CSG Debug beállítások
const CSG_DEBUG = {
  logOperations: false, // CSG műveletek naplózása
  showTimings: false, // Időmérések megjelenítése
  validateGeometry: false, // Geometria validálás
  wireframeResults: false, // Eredmények wireframe módban
};

// ÚJ: PBR Render beállítások
const PBR_CONFIG = {
  enabled: true, // PBR renderelés engedélyezése
  useHDR: false, // HDR environment mapping (még nincs implementálva)
  toneMapping: THREE.ACESFilmicToneMapping, // Tone mapping típus
  toneMappingExposure: 1.0, // Expozíció
  physicallyCorrectLights: true, // Fizikailag helyes világítás
  outputEncoding: THREE.sRGBEncoding, // Kimeneti kódolás
  shadowMapSize: 2048, // Shadow map felbontás
  shadowMapType: THREE.PCFSoftShadowMap, // Árnyék típus
};