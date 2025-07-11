/**
 * Minigolf Constants
 * Közös konstansok és alapértékek a minigolf pálya elemekhez
 * v1.8.1 - Material objektumok javítása és konzisztencia
 */

// Geometria típusok
const GEOMETRY_TYPES = {
  BOX: "box",
  CYLINDER: "cylinder",
  EXTRUDE: "extrude",
  SPHERE: "sphere",
  TRIANGLE: "triangle",
  TRAPEZOID: "trapezoid", 
  GROUP: "group",
  SECTION: "section",
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
  FASTENER: "fastener",
};

// JAVÍTOTT v1.8.1: Anyag definíciók - konzisztens objektum struktúra
const MATERIALS = {
  PINE_PLYWOOD: {
    name: "Lucfenyő rétegelt lemez",
    density: 0.5, // g/cm³
    color: 0xd3e3ff,
    baseColor: 0xd3e3ff,
    shininess: 10,
    
    // LEGACY textúra (fallback)
    imagePath: 'textures/wood-3.jpg',
    repeat: { x: 2, y: 2 },
    useShade: true,
    
    // PBR Texture Pipeline
    diffusePath: 'textures/Wood017_1K-JPG_Color.jpg',
    normalPath: 'textures/Wood017_1K-JPG_NormalGL.jpg',
    roughnessPath: 'textures/Wood017_1K-JPG_Roughness.jpg',
    
    // Color Tinting Control
    enableColorTinting: true,
    colorTintStrength: 1.1,
    
    // PBR tulajdonságok
    roughnessBase: 0.5,
    metalnessBase: 0.0,
    envMapIntensity: 0,
    
    // Dynamic Normal Scale
    normalScale: 10.6,
    normalScaleRange: { min: 10.3, max: 10.9 },
    
    // Textúra beállítások
    pbrRepeat: { x: 1, y: 1 },
    enablePBR: true,
  },
  
  PINE_SOLID: {
    name: "Lucfenyő tömörfa",
    density: 0.45, // g/cm³
    color: 0xd3e3ff,
    baseColor: 0xd3e3ff,
    shininess: 0,
    
    // LEGACY textúra (fallback)
    imagePath: 'textures/wood-3.jpg',
    repeat: { x: 2, y: 2 },
    useShade: true,
    
    // PBR Texture Pipeline
    diffusePath: 'textures/Wood017_1K-JPG_Color.jpg',
    normalPath: 'textures/Wood017_1K-JPG_NormalGL.jpg',
    roughnessPath: 'textures/Wood017_1K-JPG_Roughness.jpg',
    
    // Color Tinting Control
    enableColorTinting: true,
    colorTintStrength: 1.2,
    
    // PBR tulajdonságok
    roughnessBase: 0.9,
    metalnessBase: 0.0,
    envMapIntensity: 0,
    
    // Dynamic Normal Scale
    normalScale: 0.7,
    normalScaleRange: { min: 0.4, max: 1.1 },
    
    // Textúra beállítások
    pbrRepeat: { x: 1.5, y: 1.5 },
    enablePBR: true,
  },
  
  ARTIFICIAL_GRASS: {
    name: "Namgrass Silva",
    density: 0.2, // g/cm³
    color: 0x95c5ff,
    baseColor: 0x95c5ff,
    shininess: 2,
    
    // LEGACY textúra (fallback)
    imagePath: 'textures/turf-1.jpg',
    repeat: { x: 8, y: 8 },
    useShade: true,
    
    // PBR Texture Pipeline
    diffusePath: 'textures/Grass008_1K-JPG_Color.jpg',
    normalPath: 'textures/Grass008_1K-JPG_NormalGL.jpg',
    roughnessPath: 'textures/Grass008_1K-JPG_Roughness.jpg',
    aoPath: 'textures/Grass008_1K-JPG_AmbientOcclusion.jpg',
    
    // Color Tinting Control
    enableColorTinting: true,
    colorTintStrength: 1.2,
    
    // PBR tulajdonságok
    roughnessBase: 0.95,
    metalnessBase: 0.0,
    envMapIntensity: 0,
    
    // Dynamic Normal Scale
    normalScale: 0.8,
    normalScaleRange: { min: 0.5, max: 1.2 },
    aoIntensity: 0.7,
    
    // Textúra beállítások
    pbrRepeat: { x: 4, y: 4 },
    enablePBR: true,
  },
  
  WHITE_PLASTIC: {
    name: "Fehér műanyag",
    density: 0.9, // g/cm³
    color: 0xffffff,
    baseColor: 0xb4aa8d,
    shininess: 30,
    
    // LEGACY textúra (fallback)
    imagePath: null,
    repeat: { x: 1, y: 1 },
    useShade: false,
    
    // PBR Texture Pipeline
    diffusePath: 'textures/Plastic013A_1K-JPG_Color.jpg',
    normalPath: 'textures/Plastic013A_1K-JPG_NormalGL.jpg',
    roughnessPath: 'textures/Plastic013A_1K-JPG_Roughness.jpg',
    
    // Color Tinting Control
    enableColorTinting: true,
    colorTintStrength: 1.5,
    
    // PBR tulajdonságok
    roughnessBase: 1.0,
    metalnessBase: 0.0,
    envMapIntensity: 0.8,
    
    // Dynamic Normal Scale
    normalScale: 0.3,
    normalScaleRange: { min: 0.1, max: 0.6 },
    
    // Textúra beállítások
    pbrRepeat: { x: 1, y: 1 },
    enablePBR: true,
  },
  
  GALVANIZED_STEEL: {
    name: "Galvanizált acél",
    density: 7.8, // g/cm³
    color: 0xffffff,
    baseColor: 0xc2c0c0,
    shininess: 60,
    
    // LEGACY textúra (fallback)
    imagePath: 'textures/steel.jpg',
    repeat: { x: 1, y: 1 },
    useShade: true,
    
    // PBR Texture Pipeline
    // diffusePath: 'textures/Metal011_1K-JPG_Color.jpg',
    normalPath: 'textures/Metal011_1K-JPG_NormalGL.jpg',
    roughnessPath: 'textures/Metal011_1K-JPG_Roughness.jpg',
    metalnessPath: 'textures/Metal011_1K-JPG_Metalness.jpg',
    
    // Color Tinting Control
    enableColorTinting: true,
    colorTintStrength: 1.5,
    
    // PBR tulajdonságok
    roughnessBase: 0.3,
    metalnessBase: 0.95,
    envMapIntensity: 1.0,
    
    // Dynamic Normal Scale
    normalScale: 0.5,
    normalScaleRange: { min: 0.2, max: 0.8 },
    metalnessIntensity: 1.0,
    
    // Textúra beállítások
    pbrRepeat: { x: 1, y: 1 },
    enablePBR: true,
  },
};

// PBR Pipeline beállítások
const PBR_PIPELINE = {
  enabled: true,
  fallbackToLegacy: true,
  textureFormat: 'jpg',
  mipmaps: true,
  anisotropy: 4,
  normalFormat: 'OpenGL',
  normalFlipY: false,
  maxTextureSize: 1024,
  enableCompression: false,
  logTextureLoading: true,
  showMissingTextures: true,
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

function calculateRightTriangleDimensions(legLength) {
  const width = 2 * legLength;  // Alap = 2 × szár
  const height = legLength;     // Magasság = szár
  return { width, height };
}

function calculate45DegreeTrapezoidWidth(topWidth, height) {
  const bottomWidth = topWidth + (2 * height);
  return bottomWidth;
}

// JAVÍTOTT: Minigolf pálya alapvető méretek
const COURSE_DIMENSIONS = {
  length: 150, // cm
  width: 80, // cm
  topPlateThickness: 1.2, // JAVÍTOTT: 12mm = 1.2cm (nem 0.9)
  turfThickness: 1.5, // JAVÍTOTT: 6mm = 0.6cm (nem 0.5)
  holeRadius: 5.4, // átmérő: 10.8 cm
  holePositionX: 50, // A lyuk pozíciója a pálya végétől (cm)
  frontWidth: 2, // 2cm első takaró léc
  frameWidth: 5, // 12 cm széles lécek
  frameHeight: 3, // 3 cm magas lécek
  frameDistEnd: 50,
  sideWidth: 4, // 5 cm széles oldallécek
  sideHeight: 14, // 16 cm magas oldallécek
  sideVerticalShift: 6.9, // 7 cm-re a borítástól felfelé
  legDiameter: 4, // 6 cm átmérőjű lábak
  legHeight: 6, // 12 cm magas lábak
  legInset: 8, // 3cm-rel bentebb
  crossBeamCount: 2, // belső keresztlécek száma
  crossBeamWidth: 5, // keresztlécek szélessége
  fastenerThickness: 3,
  triangleLegLength: 8,
  triangleShift: 0.4,
  trapezoidHeight: 10,
  trapezoidTopWidth: 20,
};

// JAVÍTOTT: Számított értékek
COURSE_DIMENSIONS.frontHeight =
  COURSE_DIMENSIONS.sideHeight -
  COURSE_DIMENSIONS.sideVerticalShift -
  COURSE_DIMENSIONS.turfThickness + 
  COURSE_DIMENSIONS.topPlateThickness / 2;

COURSE_DIMENSIONS.triangleDims = calculateRightTriangleDimensions(COURSE_DIMENSIONS.triangleLegLength);
COURSE_DIMENSIONS.trapezoidBottomWidth = calculate45DegreeTrapezoidWidth(COURSE_DIMENSIONS.trapezoidTopWidth, COURSE_DIMENSIONS.trapezoidHeight)
COURSE_DIMENSIONS.spacing = COURSE_DIMENSIONS.length / (COURSE_DIMENSIONS.crossBeamCount + 1);

// Lyuk pozíciók
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

// CSG beállítások
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
  cacheSize: 50,
};

const CSG_DEBUG = {
  logOperations: false,
  showTimings: false,
  validateGeometry: false,
  wireframeResults: false,
};

// PBR Render beállítások
const PBR_CONFIG = {
  enabled: true,
  useHDR: true,
  toneMapping: 4, // THREE.ACESFilmicToneMapping
  toneMappingExposure: 1.0,
  physicallyCorrectLights: true,
  outputEncoding: 3001, // THREE.sRGBEncoding
  shadowMapSize: 2048,
  shadowMapType: 2, // THREE.PCFSoftShadowMap
  normalMaps: true,
  roughnessMaps: true,
  metalnessMaps: true,
  ambientOcclusionMaps: true,
};