/**
 * Element Manager
 * Minigolf elemek kezelése, számítások, összesítések
 * v1.6.2 - TRAPEZOID geometria implementálás + súlyszámítás javítás
 */

class ElementManager {
  constructor() {
    this.elements = new Map();
    this.version = "1.6.2"; // Verzió frissítés TRAPEZOID implementációhoz
  }

  // Elem hozzáadása alapértékekkel
  addElement(element) {
    // Material objektum helyett material kulcs kezelése
    let materialObj = element.material;
    if (typeof element.material === 'string') {
      materialObj = MATERIALS[element.material];
    }

    // VÉDŐKÓD: Ha nincs material objektum
    if (!materialObj) {
      console.warn(`⚠️ Ismeretlen material: ${element.material} (elem: ${element.id})`);
      materialObj = MATERIALS.PINE_SOLID; // Fallback material
    }

    // Alapértékek hozzáadása
    const processedElement = {
      ...element,
      transform: { ...DEFAULT_TRANSFORM, ...element.transform },
      display: { ...DEFAULT_DISPLAY },
      material: materialObj,
      materialKey: typeof element.material === 'string' ? element.material : Object.keys(MATERIALS).find(key => MATERIALS[key] === materialObj),
      shade: element.shade || 5,
    };

    this.elements.set(element.id, processedElement);
    this.calculateProperties(processedElement);
    return processedElement;
  }

  // JAVÍTOTT: Védőkóddal ellátott térfogat számítás + TRAPEZOID implementáció
  calculateProperties(element) {
    const geom = element.geometry;
    let volume = 0;

    // VÉDŐKÓD: Geometry ellenőrzés
    if (!geom || !geom.dimensions) {
      console.warn(`⚠️ Hibás geometry: ${element.id}`);
      element.calculated = { volume: 1, weight: 1, weightKg: 0.001 };
      return;
    }

    const dim = geom.dimensions;

    try {
      switch (geom.type) {
        case GEOMETRY_TYPES.BOX:
          // VÉDŐKÓD: NaN ellenőrzés
          const boxW = Number(dim.width) || 1;
          const boxH = Number(dim.height) || 1;
          const boxL = Number(dim.length) || 1;
          volume = boxW * boxH * boxL;
          console.log(`📦 BOX ${element.id}: ${boxW} × ${boxH} × ${boxL} = ${volume} cm³`);
          break;

        case GEOMETRY_TYPES.CYLINDER:
          const radius = Number(dim.radius) || Number(dim.diameter) / 2 || 1;
          const height = Number(dim.height) || 1;
          volume = Math.PI * radius * radius * height;
          console.log(`🔵 CYLINDER ${element.id}: π × ${radius}² × ${height} = ${volume} cm³`);
          break;

        case GEOMETRY_TYPES.SPHERE:
          const sphereRadius = Number(dim.radius) || Number(dim.diameter) / 2 || 1;
          volume = (4/3) * Math.PI * sphereRadius * sphereRadius * sphereRadius;
          console.log(`⚪ SPHERE ${element.id}: (4/3)π × ${sphereRadius}³ = ${volume} cm³`);
          break;

        case GEOMETRY_TYPES.TRIANGLE:
          // Derékszögű háromszög térfogata = (1/2) × alap × magasság × vastagság
          const triWidth = Number(dim.width) || 1;
          const triHeight = Number(dim.height) || 1;
          const triThickness = Number(dim.thickness) || 1;
          volume = 0.5 * triWidth * triHeight * triThickness;
          console.log(`🔺 TRIANGLE ${element.id}: (1/2) × ${triWidth} × ${triHeight} × ${triThickness} = ${volume} cm³`);
          break;

        case GEOMETRY_TYPES.TRAPEZOID:
          // ÚJ: Trapéz térfogata = [(felső_szélesség + alsó_szélesség) / 2] × magasság × vastagság
          const topWidth = Number(dim.topWidth) || 1;
          const bottomWidth = Number(dim.bottomWidth) || 1;
          const trapHeight = Number(dim.height) || 1;
          const trapThickness = Number(dim.thickness) || 1;
          
          // Trapéz terület = (a + b) / 2 * h, ahol a=topWidth, b=bottomWidth, h=height
          const trapezoidArea = ((topWidth + bottomWidth) / 2) * trapHeight;
          volume = trapezoidArea * trapThickness;
          
          console.log(`🔷 TRAPEZOID ${element.id}: [(${topWidth} + ${bottomWidth}) / 2] × ${trapHeight} × ${trapThickness} = ${volume} cm³`);
          console.log(`   └─ Trapéz terület: ${trapezoidArea.toFixed(2)} cm², vastagság: ${trapThickness} cm`);
          break;

        case GEOMETRY_TYPES.EXTRUDE:
          // Extrude típus térfogata (ha van)
          const extrudeArea = Number(dim.area) || (Number(dim.width) * Number(dim.height)) || 1;
          const extrudeDepth = Number(dim.depth) || Number(dim.thickness) || 1;
          volume = extrudeArea * extrudeDepth;
          console.log(`📐 EXTRUDE ${element.id}: ${extrudeArea} × ${extrudeDepth} = ${volume} cm³`);
          break;

        case GEOMETRY_TYPES.GROUP:
          // Group típus becsült térfogata
          volume = 10; // Kis becsült érték group elemekhez
          console.log(`📂 GROUP ${element.id}: becsült térfogat = ${volume} cm³`);
          break;

        default:
          console.warn(`❌ Ismeretlen geometria típus: ${geom.type} (elem: ${element.id})`);
          volume = 1; // Fallback térfogat
          break;
      }
    } catch (error) {
      console.error(`❌ Térfogatszámítási hiba ${element.id}:`, error);
      volume = 1; // Fallback hiba esetén
    }

    // VÉDŐKÓD: Density ellenőrzése
    const density = element.material?.density || 0.5; // g/cm³ alapértelmezett
    const weight = volume * density;

    // VÉDŐKÓD: NaN és Infinity eredmények szűrése
    const finalVolume = isFinite(volume) && volume > 0 ? Math.max(0, volume) : 1.0;
    const finalWeight = isFinite(weight) && !isNaN(weight) ? weight : 0.5;

    element.calculated = {
      volume: finalVolume,
      weight: finalWeight,
      weightKg: finalWeight / 1000,
    };

    console.log(`✅ ${element.id}: V=${finalVolume.toFixed(2)} cm³, W=${finalWeight.toFixed(2)} g`);
  }

  // JAVÍTOTT: NaN védett méretek számítás
  getTotalDimensions() {
    const elements = this.getAllElements();

    if (elements.length === 0) {
      console.warn("⚠️ Nincs elem a méret számításhoz");
      return {
        length: 250, // Alapértelmezett pálya méret
        width: 80,
        height: {
          withoutSides: 6,
          withSides: 16,
          withLegs: 24,
        },
        totalVolume: 0,
      };
    }

    // Min/max pozíciók keresése VÉDŐKÓDDAL
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;

    elements.forEach((element) => {
      const pos = element.transform?.position;
      const geom = element.geometry;
      const dim = geom?.dimensions;

      // VÉDŐKÓD: Hiányzó adatok ellenőrzése
      if (!pos || !dim) {
        console.warn(`⚠️ Hiányzó pos/dim: ${element.id}`);
        return; // Skip ez az elem
      }

      // VÉDŐKÓD: NaN pozíciók ellenőrzése
      const posX = isFinite(pos.x) ? pos.x : 0;
      const posY = isFinite(pos.y) ? pos.y : 0;
      const posZ = isFinite(pos.z) ? pos.z : 0;

      let halfWidth = 1, halfHeight = 1, halfLength = 1;

      try {
        // GROUP típus esetén becsült méretek
        if (geom.type === GEOMETRY_TYPES.GROUP) {
          halfWidth = 1.5;
          halfHeight = 0.1;
          halfLength = 5.0;
        } else {
          // VÉDŐKÓD: NaN dimensions ellenőrzése
          halfWidth = isFinite(dim.width) ? dim.width / 2 : 1;
          halfHeight = isFinite(dim.height) ? dim.height / 2 : 1;
          halfLength = isFinite(dim.length) ? dim.length / 2 : 1;
        }

        // VÉDŐKÓD: Végső NaN ellenőrzés
        if (!isFinite(halfWidth)) halfWidth = 1;
        if (!isFinite(halfHeight)) halfHeight = 1;
        if (!isFinite(halfLength)) halfLength = 1;

        // Határok frissítése
        minX = Math.min(minX, posX - halfLength);
        maxX = Math.max(maxX, posX + halfLength);
        minY = Math.min(minY, posY - halfHeight);
        maxY = Math.max(maxY, posY + halfHeight);
        minZ = Math.min(minZ, posZ - halfWidth);
        maxZ = Math.max(maxZ, posZ + halfWidth);

        console.log(`📐 ${element.id}: pos(${posX},${posY},${posZ}) half(${halfWidth},${halfHeight},${halfLength})`);

      } catch (error) {
        console.error(`❌ Dimension számítási hiba ${element.id}:`, error);
      }
    });

    // VÉDŐKÓD: Infinite értékek ellenőrzése
    if (!isFinite(minX) || !isFinite(maxX)) {
      console.error("❌ Hibás X koordináták, fallback használata");
      minX = -125; maxX = 125; // Alapértelmezett pálya hossz
    }
    if (!isFinite(minY) || !isFinite(maxY)) {
      console.error("❌ Hibás Y koordináták, fallback használata");  
      minY = -10; maxY = 10;
    }
    if (!isFinite(minZ) || !isFinite(maxZ)) {
      console.error("❌ Hibás Z koordináták, fallback használata");
      minZ = -40; maxZ = 40; // Alapértelmezett pálya szélesség
    }

    const totalLength = maxX - minX;
    const totalWidth = maxZ - minZ;

    console.log(`📏 Számított méretek: ${totalLength} × ${totalWidth} cm`);

    // VÉDŐKÓD: NaN eredmények ellenőrzése
    const finalLength = isFinite(totalLength) ? totalLength : 250;
    const finalWidth = isFinite(totalWidth) ? totalWidth : 80;

    return {
      length: finalLength,
      width: finalWidth,
      height: {
        withoutSides: COURSE_DIMENSIONS.topPlateThickness + COURSE_DIMENSIONS.turfThickness + COURSE_DIMENSIONS.frameHeight,
        withSides: COURSE_DIMENSIONS.sideHeight,
        withLegs: COURSE_DIMENSIONS.topPlateThickness + COURSE_DIMENSIONS.turfThickness + COURSE_DIMENSIONS.frameHeight + COURSE_DIMENSIONS.legHeight,
      },
      totalVolume: this.getTotalVolume(),
    };
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
    return Array.from(this.elements.values()).filter((el) => el.materialKey === materialKey);
  }

  // Elemek szűrése shade szerint
  getElementsByShade(shade) {
    return Array.from(this.elements.values()).filter((el) => el.shade === shade);
  }

  // Elemek szűrése shade tartomány szerint
  getElementsByShadeRange(minShade, maxShade) {
    return Array.from(this.elements.values()).filter(
      (el) => el.shade >= minShade && el.shade <= maxShade
    );
  }

  // Összes elem listája
  getAllElements() {
    return Array.from(this.elements.values());
  }

  // VÉDŐKÓDOS összesítések
  getTotalWeight() {
    const total = Array.from(this.elements.values()).reduce(
      (sum, el) => {
        const weight = el.calculated?.weight || 0;
        return sum + (isFinite(weight) ? weight : 0);
      },
      0
    );
    return isFinite(total) ? total : 0;
  }

  getTotalVolume() {
    const total = Array.from(this.elements.values()).reduce(
      (sum, el) => {
        const volume = el.calculated?.volume || 0;
        return sum + (isFinite(volume) ? volume : 0);
      },
      0
    );
    return isFinite(total) ? total : 0;
  }

  // Súly megoszlás anyag szerint
  getWeightByMaterial() {
    const materialWeights = new Map();

    this.elements.forEach((element) => {
      const materialName = element.material?.name || 'Ismeretlen anyag';
      const currentWeight = materialWeights.get(materialName) || 0;
      const elementWeight = element.calculated?.weight || 0;
      const safeWeight = isFinite(elementWeight) ? elementWeight : 0;
      
      materialWeights.set(materialName, currentWeight + safeWeight);
    });

    return Array.from(materialWeights.entries()).map(([name, weight]) => ({
      name,
      weight: isFinite(weight) ? weight : 0,
      weightKg: isFinite(weight) ? weight / 1000 : 0,
    }));
  }

  // Súly megoszlás típus szerint
  getWeightByType() {
    const typeWeights = new Map();

    this.elements.forEach((element) => {
      const typeName = this.getTypeDisplayName(element.type);
      const currentWeight = typeWeights.get(typeName) || 0;
      const elementWeight = element.calculated?.weight || 0;
      const safeWeight = isFinite(elementWeight) ? elementWeight : 0;
      
      typeWeights.set(typeName, currentWeight + safeWeight);
    });

    return Array.from(typeWeights.entries()).map(([name, weight]) => ({
      name,
      weight: isFinite(weight) ? weight : 0,
      weightKg: isFinite(weight) ? weight / 1000 : 0,
    }));
  }

  // Súly megoszlás shade szerint
  getWeightByShade() {
    const shadeWeights = new Map();

    this.elements.forEach((element) => {
      const shade = element.shade || 5;
      const currentWeight = shadeWeights.get(shade) || 0;
      const elementWeight = element.calculated?.weight || 0;
      const safeWeight = isFinite(elementWeight) ? elementWeight : 0;
      
      shadeWeights.set(shade, currentWeight + safeWeight);
    });

    return Array.from(shadeWeights.entries()).map(([shade, weight]) => ({
      shade,
      weight: isFinite(weight) ? weight : 0,
      weightKg: isFinite(weight) ? weight / 1000 : 0,
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
      [ELEMENT_TYPES.PART]: "Alkatrészek",
      [ELEMENT_TYPES.FASTENER]: "Merevítők",
    };
    return typeNames[type] || type;
  }

  // Summary objektum generálása
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
          (sum, el) => sum + (el.calculated?.volume || 0),
          0
        );
        const totalTypeWeight = elements.reduce(
          (sum, el) => sum + (el.calculated?.weight || 0),
          0
        );

        return {
          name: typeName,
          material: elements[0].material?.name || 'Ismeretlen',
          elements: elements.map((el) => ({
            id: el.id,
            name: el.name,
            count: 1,
            dimensions: this.getElementDimensions(el),
            volume: el.calculated?.volume || 0,
            weight: el.calculated?.weight || 0,
            spacing: el.spacing || null,
            shade: el.shade || 5,
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
        byShade: this.getWeightByShade(),
      },
      shadeStats: {
        elementCount: this.getAllElements().length,
        shadeRange: this.getShadeRange(),
        averageShade: this.getAverageShade(),
        shadeDistribution: this.getShadeDistribution(),
      },
    };
  }

  // Elem méretek lekérése típus szerint
  getElementDimensions(element) {
    const geom = element.geometry;
    
    if (geom.type === GEOMETRY_TYPES.GROUP) {
      return { length: 10.0, width: 2.0, height: 0.2 };
    } else {
      return geom.dimensions;
    }
  }

  // Shade tartomány meghatározása
  getShadeRange() {
    const elements = this.getAllElements();
    if (elements.length === 0) return { min: 5, max: 5 };

    const shades = elements.map(el => el.shade || 5);
    return {
      min: Math.min(...shades),
      max: Math.max(...shades),
    };
  }

  // Átlagos shade érték
  getAverageShade() {
    const elements = this.getAllElements();
    if (elements.length === 0) return 5;

    const totalShade = elements.reduce((sum, el) => sum + (el.shade || 5), 0);
    return Math.round((totalShade / elements.length) * 10) / 10;
  }

  // Shade eloszlás
  getShadeDistribution() {
    const distribution = {};
    
    this.getAllElements().forEach((element) => {
      const shade = element.shade || 5;
      distribution[shade] = (distribution[shade] || 0) + 1;
    });

    return distribution;
  }

  // Debug info shade-ekkel
  getDebugInfo() {
    return {
      version: this.version,
      elementCount: this.elements.size,
      totalWeight: this.getTotalWeight(),
      totalVolume: this.getTotalVolume(),
      shadeStats: {
        range: this.getShadeRange(),
        average: this.getAverageShade(),
        distribution: this.getShadeDistribution(),
      },
    };
  }
}