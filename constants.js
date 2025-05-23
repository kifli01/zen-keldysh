/**
 * Minigolf Constants
 * Közös konstansok és alapértékek a minigolf pálya elemekhez
 */

// Geometria típusok
const GEOMETRY_TYPES = {
  BOX: "box",
  CYLINDER: "cylinder",
  EXTRUDE: "extrude",
};

// Elem típusok
const ELEMENT_TYPES = {
  PLATE: "plate",
  COVERING: "covering",
  FRAME: "frame",
  LEG: "leg",
  WALL: "wall",
};

// Anyag definíciók
const MATERIALS = {
  PINE_PLYWOOD: {
    name: "Lucfenyő rétegelt lemez",
    density: 0.5, // g/cm³
    color: 0xf5e0c3,
    shininess: 15,
  },
  PINE_PLYWOOD_DARK: {
    name: "Lucfenyő rétegelt lemez",
    density: 0.5, // g/cm³
    color: 0xecd9bd, // Kicsit sötétebb árnyalat
    shininess: 15,
  },
  PINE_SOLID: {
    name: "Lucfenyő tömörfa",
    density: 0.45, // g/cm³
    color: 0xecd9bd,
    shininess: 10,
  },
  ARTIFICIAL_GRASS: {
    name: "LazyLawn Meadow Twist műfű",
    density: 0.2, // g/cm³
    color: 0x7bbf69,
    shininess: 3,
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
  turfThickness: 0.6, // 6 mm
  holeRadius: 5.4, // átmérő: 10.8 cm
  holePositionX: 40, // A lyuk pozíciója a pálya végétől (cm)
  frameWidth: 6, // 6 cm széles lécek
  frameHeight: 4, // 4 cm magas lécek
  sideWidth: 6, // 6 cm széles oldallécek
  sideHeight: 12, // 12 cm magas oldallécek
  legDiameter: 6, // 6 cm átmérőjű lábak
  legHeight: 12, // 12 cm magas lábak
  crossBeamCount: 2, // belső keresztlécek száma (+ 2 szélső = összesen 4)
  crossBeamWidth: 12, // keresztlécek szélessége (2x6cm)
};
