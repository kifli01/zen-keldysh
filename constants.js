/**
 * Minigolf Constants
 * Közös konstansok és alapértékek a minigolf pálya elemekhez
 * v1.8.0 - Dynamic Normal Scale rendszer hozzáadva
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
  BALL: "ball",
  PART: "part",
};

// ÚJ v1.7.0: Anyag definíciók teljes PBR pipeline-nal
const MATERIALS = {
  PINE_PLYWOOD: {
    name: "Lucfenyő rétegelt lemez",
    density: 0.5, // g/cm³
    color: 0xdccfb7,
    shininess: 10,
    
    // LEGACY textúra (fallback):
    imagePath: 'textures/wood-3.jpg',
    baseColor: 0xdccfb7,
    repeat: { x: 2, y: 2 },
    useShade: true,
    
    // PBR Texture Pipeline
    diffusePath: 'textures/Wood017_1K-JPG_Color.jpg',
    normalPath: 'textures/Wood017_1K-JPG_NormalGL.jpg',
    roughnessPath: 'textures/Wood017_1K-JPG_Roughness.jpg',
    
    // PBR tulajdonságok:
    roughnessBase: 0.8, // Fa - matt felület
    metalnessBase: 0.0, // Nem fém
    envMapIntensity: 0.3,
    
    // ÚJ v1.8.0: Dynamic Normal Scale
    normalScale: 0.6, // Alapértelmezett érték
    normalScaleRange: {
      min: 0.3,  // Shade 10 - fényes, kevés textúra
      max: 0.9   // Shade 1 - matt, erős textúra
    },
    
    // Textúra beállítások:
    pbrRepeat: { x: 1, y: 1 }, // PBR textúrák ismétlése
    enablePBR: true, // PBR pipeline használata
  },
  
  PINE_SOLID: {
    name: "Lucfenyő tömörfa",
    density: 0.45, // g/cm³
    color: 0xdccfb7,
    shininess: 10,
    
    // LEGACY textúra (fallback):
    imagePath: 'textures/wood-3.jpg',
    baseColor: 0xdccfb7,
    repeat: { x: 2, y: 2 },
    useShade: true,
    
    // PBR Texture Pipeline (azonos Wood017)
    diffusePath: 'textures/Wood017_1K-JPG_Color.jpg',
    normalPath: 'textures/Wood017_1K-JPG_NormalGL.jpg',
    roughnessPath: 'textures/Wood017_1K-JPG_Roughness.jpg',
    
    // PBR tulajdonságok:
    roughnessBase: 0.9, // Tömörfa - még mattabb
    metalnessBase: 0.0,
    envMapIntensity: 0.2,
    
    // ÚJ v1.8.0: Dynamic Normal Scale - erősebb tömörfánál
    normalScale: 0.7, // Alapértelmezett érték
    normalScaleRange: {
      min: 0.4,  // Shade 10 - fényes, simább
      max: 1.1   // Shade 1 - matt, durva fafelület
    },
    
    pbrRepeat: { x: 1.5, y: 1.5 }, // Kicsit sűrűbb ismétlés
    enablePBR: true,
  },
  
  ARTIFICIAL_GRASS: {
    name: "LazyLawn Meadow Twist műfű",
    density: 0.2, // g/cm³
    color: 0xa5bc49,
    shininess: 2,
    
    // LEGACY textúra (fallback):
    imagePath: 'textures/turf-1.jpg',
    baseColor: 0xa5bc49,
    repeat: { x: 8, y: 8 },
    useShade: true,
    
    // PBR Texture Pipeline - TELJES CSOMAG! 🌱
    diffusePath: 'textures/Grass008_1K-JPG_Color.jpg',
    normalPath: 'textures/Grass008_1K-JPG_NormalGL.jpg',
    roughnessPath: 'textures/Grass008_1K-JPG_Roughness.jpg',
    aoPath: 'textures/Grass008_1K-JPG_AmbientOcclusion.jpg', // ✅ VAN AO!
    
    // PBR tulajdonságok:
    roughnessBase: 0.95, // Műfű - nagyon matt
    metalnessBase: 0.0,
    envMapIntensity: 0.1,
    
    // ÚJ v1.8.0: Dynamic Normal Scale - természetes fű variáció
    normalScale: 0.8, // Alapértelmezett érték
    normalScaleRange: {
      min: 0.5,  // Shade 10 - kopott fű, kevés textúra
      max: 1.2   // Shade 1 - friss fű, erős fűszál relief
    },
    aoIntensity: 0.7, // AO map erősség
    
    pbrRepeat: { x: 4, y: 4 }, // Természetes fű ismétlés
    enablePBR: true,
  },
  
  WHITE_PLASTIC: {
    name: "Fehér műanyag",
    density: 0.9, // g/cm³
    color: 0xffffff,
    shininess: 30,
    
    // LEGACY textúra (fallback):
    imagePath: null, // Nincs textúra
    baseColor: 0xffffff,
    repeat: { x: 1, y: 1 },
    useShade: false, // Fix shininess
    
    // PBR Texture Pipeline
    diffusePath: 'textures/Plastic013A_1K-JPG_Color.jpg',
    normalPath: 'textures/Plastic013A_1K-JPG_NormalGL.jpg',
    roughnessPath: 'textures/Plastic013A_1K-JPG_Roughness.jpg',
    
    // PBR tulajdonságok:
    roughnessBase: 0.1, // Műanyag - sima felület
    metalnessBase: 0.0,
    envMapIntensity: 0.8,
    
    // ÚJ v1.8.0: Dynamic Normal Scale - műanyag felület variáció
    normalScale: 0.3, // Alapértelmezett érték (gyenge normal)
    normalScaleRange: {
      min: 0.1,  // Shade 10 - tükörfényes, sima
      max: 0.6   // Shade 1 - matt műanyag, textúrált
    },
    
    pbrRepeat: { x: 1, y: 1 }, // Egységes felület
    enablePBR: true,
  },
  
  GALVANIZED_STEEL: {
    name: "Galvanizált acél",
    density: 7.8, // g/cm³
    color: 0xffffff,
    shininess: 60,
    
    // LEGACY textúra (fallback):
    imagePath: 'textures/steel.jpg',
    baseColor: 0xffffff,
    repeat: { x: 1, y: 1 },
    useShade: true,
    
    // PBR Texture Pipeline - TELJES FÉMCSOMAG! 🔩
    diffusePath: 'textures/Metal011_1K-JPG_Color.jpg',
    normalPath: 'textures/Metal011_1K-JPG_NormalGL.jpg',
    roughnessPath: 'textures/Metal011_1K-JPG_Roughness.jpg',
    metalnessPath: 'textures/Metal011_1K-JPG_Metalness.jpg', // ✅ METALNESS MAP!
    
    // PBR tulajdonságok:
    roughnessBase: 0.3, // Fém - közepesen sima
    metalnessBase: 0.9, // Nagyon fémes
    envMapIntensity: 1.5, // Erős reflexió
    
    // ÚJ v1.8.0: Dynamic Normal Scale - fém felület finishing
    normalScale: 0.5, // Alapértelmezett érték
    normalScaleRange: {
      min: 0.2,  // Shade 10 - polírozott fém, sima
      max: 0.8   // Shade 1 - durva fém, karcolások
    },
    metalnessIntensity: 1.0, // Metalness map erősség
    
    pbrRepeat: { x: 1, y: 1 }, // Egységes fém felület
    enablePBR: true,
  },
};

// ÚJ v1.7.0: PBR Pipeline beállítások
const PBR_PIPELINE = {
  enabled: true, // Globális PBR pipeline
  fallbackToLegacy: true, // Ha PBR textúra nincs, legacy használata
  
  // Texture betöltési beállítások
  textureFormat: 'jpg', // jpg vagy png
  mipmaps: true, // Automatic mipmap generation
  anisotropy: 4, // Anisotropic filtering
  
  // Normal map beállítások
  normalFormat: 'OpenGL', // OpenGL vagy DirectX
  normalFlipY: false, // Y csatorna invertálása
  
  // Performance beállítások
  maxTextureSize: 1024, // 1K textúrák (1024x1024)
  enableCompression: false, // GPU texture compression
  
  // Debug beállítások
  logTextureLoading: true, // Textúra betöltés naplózása
  showMissingTextures: true, // Hiányzó textúrák jelzése
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

// Minigolf pálya alapvető méretek (VÁLTOZATLAN)
const COURSE_DIMENSIONS = {
  length: 250, // cm
  width: 80, // cm
  topPlateThickness: 0.9, // 9 mm
  turfThickness: 0.5, // 11.5mm
  holeRadius: 5.4, // átmérő: 10.8 cm
  holePositionX: 50, // A lyuk pozíciója a pálya végétől (cm)
  frontWidth: 2, // 2cm első takaró léc
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
  COURSE_DIMENSIONS.topPlateThickness / 2;

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

// CSG beállítások (VÁLTOZATLAN)
const CSG_CONFIG = {
  enabled: true,
  useWorker: false,
  maxOperations: 50,
  cacheSize: 100,
  enableProfiling: false,
};

const CSG_OPERATIONS = {
  SUBTRACT: "subtract",
  UNION: "union",
  INTERSECT: "intersect",
};

const CSG_PERFORMANCE = {
  enableCache: true,
  enableProfiling: false,
  warnThreshold: 100,
  maxCacheAge: 300000,
  batchSize: 10,
};

const CSG_DEBUG = {
  logOperations: false,
  showTimings: false,
  validateGeometry: false,
  wireframeResults: false,
};

// PBR Render beállítások (FRISSÍTETT v1.7.0)
const PBR_CONFIG = {
  enabled: true, // PBR renderelés engedélyezése
  useHDR: true, // HDR environment mapping ✅ BEKAPCSOLVA
  toneMapping: 4, // THREE.ACESFilmicToneMapping = 4
  toneMappingExposure: 1.0, // Expozíció
  physicallyCorrectLights: true, // Fizikailag helyes világítás
  outputEncoding: 3001, // THREE.sRGBEncoding = 3001
  shadowMapSize: 2048, // Shadow map felbontás
  shadowMapType: 2, // THREE.PCFSoftShadowMap = 2
  
  // ÚJ: Normal Maps specifikus beállítások
  normalMaps: true, // Normal map támogatás
  roughnessMaps: true, // Roughness map támogatás
  metalnessMaps: true, // Metalness map támogatás
  ambientOcclusionMaps: true, // AO map támogatás
};