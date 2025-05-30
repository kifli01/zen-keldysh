/**
 * Element Manager
 * Minigolf elemek kezelése, számítások, összesítések
 * v1.4.0 - Element ID-k hozzáadása a summary-hoz
 */

class ElementManager {
  constructor() {
    this.elements = new Map();
    this.version = "1.4.0"; // Verzió a refaktorálás után
  }

  // Elem hozzáadása alapértékekkel
  addElement(element) {
    // Alapértékek hozzáadása
    const processedElement = {
      ...element,
      transform: { ...DEFAULT_TRANSFORM, ...element.transform },
      display: { ...DEFAULT_DISPLAY },
      material: MATERIALS[element.material], // String kulcs helyett objektum
    };

    this.elements.set(element.id, processedElement);
    this.calculateProperties(processedElement);
    return processedElement;
  }

  // Elem lekérése
  getElement(id) {
    return this.elements.get(id);
  }

  // Elemek szűrése típus szerint
  getElementsByType(type) {
    return Array.from(this.elements.values()).filter((el) => el.type === type);
  }

  // Elemek szűrése anyag szerint
  getElementsByMaterial(materialKey) {
    return Array.from(this.elements.values()).filter((el) =>
      Object.keys(MATERIALS).find(
        (key) => MATERIALS[key] === el.material && key === materialKey
      )
    );
  }

  // Térfogat és súly számítása
  calculateProperties(element) {
    const geom = element.geometry;
    let volume = 0;

    switch (geom.type) {
      case GEOMETRY_TYPES.BOX:
        volume =
          geom.dimensions.width *
          geom.dimensions.height *
          geom.dimensions.length;
        break;
      case GEOMETRY_TYPES.CYLINDER:
        const radius = geom.dimensions.radius || geom.dimensions.diameter / 2;
        volume = Math.PI * radius * radius * geom.dimensions.height;
        break;
      case GEOMETRY_TYPES.EXTRUDE:
        volume =
          geom.dimensions.width *
          geom.dimensions.height *
          geom.dimensions.length;
        break;
    }

    // Lyukak levonása
    if (geom.holes) {
      geom.holes.forEach((hole) => {
        if (hole.type === "circle") {
          const holeVolume =
            Math.PI * hole.radius * hole.radius * geom.dimensions.height;
          volume -= holeVolume;
        }
      });
    }

    const weight = volume * element.material.density;

    element.calculated = {
      volume: volume,
      weight: weight,
      weightKg: weight / 1000,
    };
  }

  // Összes elem listája
  getAllElements() {
    return Array.from(this.elements.values());
  }

  // Összesítések
  getTotalWeight() {
    return Array.from(this.elements.values()).reduce(
      (sum, el) => sum + el.calculated.weight,
      0
    );
  }

  getTotalVolume() {
    return Array.from(this.elements.values()).reduce(
      (sum, el) => sum + el.calculated.volume,
      0
    );
  }

  getWeightByMaterial() {
    const materialWeights = new Map();

    this.elements.forEach((element) => {
      const materialName = element.material.name;
      const currentWeight = materialWeights.get(materialName) || 0;
      materialWeights.set(
        materialName,
        currentWeight + element.calculated.weight
      );
    });

    return Array.from(materialWeights.entries()).map(([name, weight]) => ({
      name,
      weight,
      weightKg: weight / 1000,
    }));
  }

  getWeightByType() {
    const typeWeights = new Map();

    this.elements.forEach((element) => {
      const typeName = this.getTypeDisplayName(element.type);
      const currentWeight = typeWeights.get(typeName) || 0;
      typeWeights.set(typeName, currentWeight + element.calculated.weight);
    });

    return Array.from(typeWeights.entries()).map(([name, weight]) => ({
      name,
      weight,
      weightKg: weight / 1000,
    }));
  }

  // Segédfüggvény - típus megjelenítendő neve
  getTypeDisplayName(type) {
    const typeNames = {
      [ELEMENT_TYPES.PLATE]: "Alaplapok",
      [ELEMENT_TYPES.COVERING]: "Borítás",
      [ELEMENT_TYPES.FRAME]: "Váz",
      [ELEMENT_TYPES.LEG]: "Lábak",
      [ELEMENT_TYPES.WALL]: "Oldalfalak",
      [ELEMENT_TYPES.BALL]: "Labda",
      [ELEMENT_TYPES.PART]: "Alkatrész",
    };
    return typeNames[type] || type;
  }

  // Teljes méretek számítása (külső méretek)
  getTotalDimensions() {
    const elements = this.getAllElements();

    // Min/max pozíciók keresése minden elemhez
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;

    elements.forEach((element) => {
      const pos = element.transform.position;
      const dim = element.geometry.dimensions;

      // Elem határai
      const halfWidth = dim.width / 2;
      const halfHeight = dim.height / 2;
      const halfLength = dim.length / 2;

      minX = Math.min(minX, pos.x - halfLength);
      maxX = Math.max(maxX, pos.x + halfLength);
      minY = Math.min(minY, pos.y - halfHeight);
      maxY = Math.max(maxY, pos.y + halfHeight);
      minZ = Math.min(minZ, pos.z - halfWidth);
      maxZ = Math.max(maxZ, pos.z + halfWidth);
    });

    return {
      length: maxX - minX, // cm
      width: maxZ - minZ, // cm
      height: {
        withoutSides:
          COURSE_DIMENSIONS.topPlateThickness +
          COURSE_DIMENSIONS.turfThickness +
          COURSE_DIMENSIONS.frameHeight,
        withSides: COURSE_DIMENSIONS.sideHeight,
        withLegs:
          COURSE_DIMENSIONS.topPlateThickness +
          COURSE_DIMENSIONS.turfThickness +
          COURSE_DIMENSIONS.frameHeight +
          COURSE_DIMENSIONS.legHeight +
          COURSE_DIMENSIONS.bottomPlateThickness,
      },
      totalVolume: this.getTotalVolume(),
    };
  }

  // Summary objektum generálása (kompatibilis a summary.js-sel)
  generateSummary() {
    const totalDimensions = this.getTotalDimensions();
    const totalWeight = this.getTotalWeight();

    // Komponensek csoportosítása típus szerint
    const componentsByType = {};
    this.getAllElements().forEach((element) => {
      const typeName = this.getTypeDisplayName(element.type);
      if (!componentsByType[typeName]) {
        componentsByType[typeName] = [];
      }
      componentsByType[typeName].push(element);
    });

    // Komponensek összefoglaló készítése
    const components = Object.entries(componentsByType).map(
      ([typeName, elements]) => {
        const totalTypeVolume = elements.reduce(
          (sum, el) => sum + el.calculated.volume,
          0
        );
        const totalTypeWeight = elements.reduce(
          (sum, el) => sum + el.calculated.weight,
          0
        );

        return {
          name: typeName,
          material: elements[0].material.name, // Első elem anyaga (általában azonos típusban)
          elements: elements.map((el) => ({
            id: el.id, // Element ID hozzáadása
            name: el.name,
            count: 1,
            dimensions: el.geometry.dimensions,
            volume: el.calculated.volume,
            weight: el.calculated.weight,
            spacing: el.spacing || null,
          })),
          totalVolume: totalTypeVolume,
          totalWeight: totalTypeWeight,
        };
      }
    );

    return {
      totalDimensions: {
        ...totalDimensions,
        totalWeight: totalWeight,
      },
      components: components,
      weights: {
        total: {
          grams: totalWeight,
          kilograms: totalWeight / 1000,
        },
        byComponent: this.getWeightByType(),
        byMaterial: this.getWeightByMaterial(),
      },
    };
  }
}
