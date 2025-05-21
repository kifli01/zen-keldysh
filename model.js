function createMiniGolfModel(scene) {
  // Verzió
  const version = "1.0.18"; // Verzió frissítve (robbantott nézet finomítva)

  // Méretek - 80x250 cm pályára és 9 mm vastagságú alaplapra
  const dimensions = {
    length: 250, // 250 cm hosszú
    width: 80, // 80 cm széles
    woodThickness: 0.9, // 9 mm
    bottomPlateThickness: 0.6, // 6 mm (új alsó rétegelt lemez)
    turfThickness: 0.6, // 6 mm
    holeRadius: 5.4, // átmérő: 10.8 cm
    holePositionX: 55, // A lyuk pozíciója a pálya végétől (cm)
    frameWidth: 6, // 6 cm széles lécek (módosítva 8-ról 6-ra)
    frameHeight: 4, // 4 cm magas lécek
    sideWidth: 6, // 6 cm széles oldallécek (módosítva 8-ról 6-ra)
    sideHeight: 12, // 12 cm magas oldallécek (módosítva 15-ről 12-re)
    legDiameter: 6, // 6 cm átmérőjű lábak
    legHeight: 15, // 15 cm magas lábak
  };

  // Anyagok sűrűsége g/cm³-ben
  const materials = {
    "Lucfenyő rétegelt lemez": {
      density: 0.5, // g/cm³ (500 kg/m³)
    },
    "Lucfenyő tömörfa": {
      density: 0.45, // g/cm³ (450 kg/m³)
    },
    "LazyLawn Meadow Twist műfű": {
      density: 0.2, // g/cm³ (becsült érték - 200 kg/m³)
    },
  };

  // Tároljuk a modell elemeit egy objektumban a könnyebb kezelhetőség érdekében
  const modelParts = {
    base: null,
    bottomPlate: null, // Új 6mm-es rétegelt lemez alul
    turf: null,
    frame: [],
    crossBeams: [],
    sideBoards: [],
    endBoard: null,
    legs: [], // Lábak tömbje
    hole: null, // Lyuk a pályán
  };

  // Fa alaplap anyaga - lucfenyő rétegelt lemez
  const woodMaterial = new THREE.MeshPhongMaterial({
    color: 0xf5e0c3, // Világosabb, lucfenyő szín
    shininess: 15, // Csökkentett fényesség
  });

  // Alsó rétegelt lemez anyaga - lucfenyő rétegelt lemez (kicsit sötétebb)
  const bottomPlateMaterial = new THREE.MeshPhongMaterial({
    color: 0xecd9bd, // Kicsit sötétebb árnyalat, hogy látható legyen a különbség
    shininess: 15,
  });

  // Lyuk alatti sötétebb anyag
  const holeMaterial = new THREE.MeshPhongMaterial({
    color: 0x333333, // Sötét szín a lyuk belsejéhez
    shininess: 0,
  });

  // A lyuk pozíciójának kiszámítása
  const holePosition = {
    x: dimensions.length / 2 - dimensions.holePositionX,
    y: 0,
    z: 0,
  };

  // Alaplap geometria létrehozása lyukkal
  const baseShape = new THREE.Shape();
  baseShape.moveTo(-dimensions.length / 2, -dimensions.width / 2);
  baseShape.lineTo(dimensions.length / 2, -dimensions.width / 2);
  baseShape.lineTo(dimensions.length / 2, dimensions.width / 2);
  baseShape.lineTo(-dimensions.length / 2, dimensions.width / 2);
  baseShape.lineTo(-dimensions.length / 2, -dimensions.width / 2);

  // Lyuk kivágása
  const holeShape = new THREE.Path();
  holeShape.absarc(
    holePosition.x,
    holePosition.z,
    dimensions.holeRadius,
    0,
    Math.PI * 2,
    true
  );
  baseShape.holes.push(holeShape);

  // Extrúzió beállítások
  const extrudeSettings = {
    steps: 1,
    depth: dimensions.woodThickness,
    bevelEnabled: false,
  };

  // Alaplap létrehozása extrúzióval
  const baseGeometry = new THREE.ExtrudeGeometry(baseShape, extrudeSettings);
  baseGeometry.rotateX(Math.PI / 2);
  modelParts.base = new THREE.Mesh(baseGeometry, woodMaterial);
  modelParts.base.position.set(0, -dimensions.woodThickness / 2, 0);

  // Alsó rétegelt lemez létrehozása (teljes méretű, lyuk nélkül)
  const bottomPlateGeometry = new THREE.BoxGeometry(
    dimensions.length,
    dimensions.bottomPlateThickness,
    dimensions.width
  );
  modelParts.bottomPlate = new THREE.Mesh(
    bottomPlateGeometry,
    bottomPlateMaterial
  );
  modelParts.bottomPlate.position.set(
    0,
    -dimensions.frameHeight -
      dimensions.woodThickness -
      dimensions.bottomPlateThickness / 2,
    0
  );

  // Műfű geometria létrehozása lyukkal
  const turfExtrudeSettings = {
    steps: 1,
    depth: dimensions.turfThickness,
    bevelEnabled: false,
  };

  // Műfű geometria
  const turfGeometry = new THREE.ExtrudeGeometry(
    baseShape,
    turfExtrudeSettings
  );
  turfGeometry.rotateX(Math.PI / 2);

  // Műfű réteg - pasztellesebb szín - LazyLawn Meadow Twist
  const turfMaterial = new THREE.MeshPhongMaterial({
    color: 0x7bbf69, // Világosabb, pasztellesebb zöld
    shininess: 3, // Minimális fényesség
  });

  modelParts.turf = new THREE.Mesh(turfGeometry, turfMaterial);
  modelParts.turf.position.set(0, dimensions.turfThickness / 2, 0);

  // Váz anyaga - lucfenyő
  const frameMaterial = new THREE.MeshPhongMaterial({
    color: 0xecd9bd, // Lucfenyő szín a váznak
    shininess: 10,
  });

  // Hosszanti lécek a vázon (bal és jobb oldalon)
  const longBeamGeometry = new THREE.BoxGeometry(
    dimensions.length,
    dimensions.frameHeight,
    dimensions.frameWidth
  );

  // Bal oldali hosszanti léc
  const leftLongBeam = new THREE.Mesh(longBeamGeometry, frameMaterial);
  leftLongBeam.position.set(
    0,
    -dimensions.frameHeight / 2 - dimensions.woodThickness,
    -dimensions.width / 2 + dimensions.frameWidth / 2
  );
  scene.add(leftLongBeam);
  modelParts.frame.push(leftLongBeam);

  // Jobb oldali hosszanti léc
  const rightLongBeam = new THREE.Mesh(longBeamGeometry, frameMaterial);
  rightLongBeam.position.set(
    0,
    -dimensions.frameHeight / 2 - dimensions.woodThickness,
    dimensions.width / 2 - dimensions.frameWidth / 2
  );
  scene.add(rightLongBeam);
  modelParts.frame.push(rightLongBeam);

  // Keresztlécek a vázon (elöl és hátul)
  const crossBeamGeometry = new THREE.BoxGeometry(
    dimensions.frameWidth,
    dimensions.frameHeight,
    dimensions.width - 2 * dimensions.frameWidth
  );

  // Első keresztléc
  const frontCrossBeam = new THREE.Mesh(crossBeamGeometry, frameMaterial);
  frontCrossBeam.position.set(
    -dimensions.length / 2 + dimensions.frameWidth / 2,
    -dimensions.frameHeight / 2 - dimensions.woodThickness,
    0
  );
  scene.add(frontCrossBeam);
  modelParts.frame.push(frontCrossBeam);

  // Hátsó keresztléc
  const backCrossBeam = new THREE.Mesh(crossBeamGeometry, frameMaterial);
  backCrossBeam.position.set(
    dimensions.length / 2 - dimensions.frameWidth / 2,
    -dimensions.frameHeight / 2 - dimensions.woodThickness,
    0
  );
  scene.add(backCrossBeam);
  modelParts.frame.push(backCrossBeam);

  // 4 keresztléc (csökkentve az eredeti 5-ről) a rövidebb pályára (egyenletesen elosztva)
  const crossBeamCount = 4; // Csökkentve 5-ről 4-re
  const spacing = dimensions.length / (crossBeamCount + 1);

  for (let i = 0; i < crossBeamCount; i++) {
    const posX = -dimensions.length / 2 + spacing * (i + 1);
    const crossBeam = new THREE.Mesh(crossBeamGeometry, frameMaterial);
    crossBeam.position.set(
      posX,
      -dimensions.frameHeight / 2 - dimensions.woodThickness,
      0
    );
    scene.add(crossBeam);
    modelParts.crossBeams.push(crossBeam);
  }

  // Modell részek hozzáadása a scene-hez
  scene.add(modelParts.base);
  scene.add(modelParts.bottomPlate);
  scene.add(modelParts.turf);
  scene.add(modelParts.hole);

  // Oldalkeretek - a pálya két hosszú oldalán (lucfenyő anyag)
  const sideBoardMaterial = new THREE.MeshPhongMaterial({
    color: 0xecd9bd, // Lucfenyő szín
    shininess: 12,
  });

  // A borítás tetejétől számított 5cm magasság kiszámítása
  // A borítás teteje dimensions.turfThickness/2 magasságban van
  const wallTopHeight = dimensions.turfThickness / 2 + 5; // 5cm-rel a borítás felett
  const wallYPosition = wallTopHeight - dimensions.sideHeight / 2; // A fal közepének pozíciója

  // Bal oldali keret - oldalról rögzítve
  const leftSideBoardGeometry = new THREE.BoxGeometry(
    dimensions.length,
    dimensions.sideHeight,
    dimensions.sideWidth
  );
  const leftSideBoard = new THREE.Mesh(
    leftSideBoardGeometry,
    sideBoardMaterial
  );
  leftSideBoard.position.set(
    0,
    wallYPosition,
    -dimensions.width / 2 - dimensions.sideWidth / 2
  );
  scene.add(leftSideBoard);
  modelParts.sideBoards.push(leftSideBoard);

  // Jobb oldali keret - oldalról rögzítve
  const rightSideBoardGeometry = new THREE.BoxGeometry(
    dimensions.length,
    dimensions.sideHeight,
    dimensions.sideWidth
  );
  const rightSideBoard = new THREE.Mesh(
    rightSideBoardGeometry,
    sideBoardMaterial
  );
  rightSideBoard.position.set(
    0,
    wallYPosition,
    dimensions.width / 2 + dimensions.sideWidth / 2
  );
  scene.add(rightSideBoard);
  modelParts.sideBoards.push(rightSideBoard);

  // Végzáró keret a lyuk felőli oldalon
  const endBoardGeometry = new THREE.BoxGeometry(
    dimensions.sideWidth,
    dimensions.sideHeight,
    dimensions.width + 2 * dimensions.sideWidth
  );
  const endBoard = new THREE.Mesh(endBoardGeometry, sideBoardMaterial);
  endBoard.position.set(
    dimensions.length / 2 + dimensions.sideWidth / 2,
    wallYPosition,
    0
  );
  scene.add(endBoard);
  modelParts.endBoard = endBoard;

  // Lábak hozzáadása - 8 db (növelve 6-ról 8-ra)
  const legMaterial = new THREE.MeshPhongMaterial({
    color: 0xecd9bd, // Lucfenyő szín, mint a váz
    shininess: 10,
  });

  // Láb geometria - henger
  const legGeometry = new THREE.CylinderGeometry(
    dimensions.legDiameter / 2, // felső sugár
    dimensions.legDiameter / 2, // alsó sugár
    dimensions.legHeight, // magasság
    16 // radiális szegmensek száma
  );

  // Láb pozíciói - 4 helyen, bal és jobb oldalon (8 láb összesen)
  const legPositions = [
    // Első láb pozíciók (első keresztlécnél)
    {
      x: -dimensions.length / 2 + dimensions.frameWidth / 2,
      y:
        -dimensions.frameHeight -
        dimensions.woodThickness -
        dimensions.bottomPlateThickness -
        dimensions.legHeight / 2,
      z:
        -dimensions.width / 2 +
        dimensions.frameWidth +
        dimensions.legDiameter / 2,
    },
    {
      x: -dimensions.length / 2 + dimensions.frameWidth / 2,
      y:
        -dimensions.frameHeight -
        dimensions.woodThickness -
        dimensions.bottomPlateThickness -
        dimensions.legHeight / 2,
      z:
        dimensions.width / 2 -
        dimensions.frameWidth -
        dimensions.legDiameter / 2,
    },
    // Első harmad lábak (1/3 távolságnál)
    {
      x: -dimensions.length / 2 + dimensions.length / 3,
      y:
        -dimensions.frameHeight -
        dimensions.woodThickness -
        dimensions.bottomPlateThickness -
        dimensions.legHeight / 2,
      z:
        -dimensions.width / 2 +
        dimensions.frameWidth +
        dimensions.legDiameter / 2,
    },
    {
      x: -dimensions.length / 2 + dimensions.length / 3,
      y:
        -dimensions.frameHeight -
        dimensions.woodThickness -
        dimensions.bottomPlateThickness -
        dimensions.legHeight / 2,
      z:
        dimensions.width / 2 -
        dimensions.frameWidth -
        dimensions.legDiameter / 2,
    },
    // Második harmad lábak (2/3 távolságnál)
    {
      x: -dimensions.length / 2 + (2 * dimensions.length) / 3,
      y:
        -dimensions.frameHeight -
        dimensions.woodThickness -
        dimensions.bottomPlateThickness -
        dimensions.legHeight / 2,
      z:
        -dimensions.width / 2 +
        dimensions.frameWidth +
        dimensions.legDiameter / 2,
    },
    {
      x: -dimensions.length / 2 + (2 * dimensions.length) / 3,
      y:
        -dimensions.frameHeight -
        dimensions.woodThickness -
        dimensions.bottomPlateThickness -
        dimensions.legHeight / 2,
      z:
        dimensions.width / 2 -
        dimensions.frameWidth -
        dimensions.legDiameter / 2,
    },
    // Hátsó lábak
    {
      x: dimensions.length / 2 - dimensions.frameWidth / 2,
      y:
        -dimensions.frameHeight -
        dimensions.woodThickness -
        dimensions.bottomPlateThickness -
        dimensions.legHeight / 2,
      z:
        -dimensions.width / 2 +
        dimensions.frameWidth +
        dimensions.legDiameter / 2,
    },
    {
      x: dimensions.length / 2 - dimensions.frameWidth / 2,
      y:
        -dimensions.frameHeight -
        dimensions.woodThickness -
        dimensions.bottomPlateThickness -
        dimensions.legHeight / 2,
      z:
        dimensions.width / 2 -
        dimensions.frameWidth -
        dimensions.legDiameter / 2,
    },
  ];

  // Lábak létrehozása és hozzáadása a jelenethez
  for (let i = 0; i < legPositions.length; i++) {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    const pos = legPositions[i];
    leg.position.set(pos.x, pos.y, pos.z);
    scene.add(leg);
    modelParts.legs.push(leg);
  }

  const originalPositions = {};

  // Eredeti pozíciók mentése
  Object.keys(modelParts).forEach((key) => {
    if (Array.isArray(modelParts[key])) {
      const parts = [];
      modelParts[key].forEach((part) => {
        parts.push(part.position.clone());
      });
      originalPositions[key] = parts;
    } else if (modelParts[key]) {
      originalPositions[key] = modelParts[key].position.clone();
    }
  });

  const exploder = () => {
    // Vertikális távolságok beállítása - kisebb távolságok
    const levelSpacing = 20; // Csökkentett vertikális távolság a szintek között

    // Műfű réteg felemelése - legfelső szint
    modelParts.turf.position.y = levelSpacing * 2;

    // Fa alaplap felemelése - második szint
    modelParts.base.position.y = levelSpacing;

    // Alsó rétegelt lemez süllyesztése - külön szint lefelé
    modelParts.bottomPlate.position.y = -levelSpacing * 3;

    // Lyuk mozgatása külön
    if (modelParts.hole) {
      modelParts.hole.position.y = 0;
    }

    // Oldalkeretek és végzáró léc - legfelső szint felett
    const wallLevel = levelSpacing * 3;

    // Oldallécek feljebb és kifelé mozgatása
    modelParts.sideBoards[0].position.y = wallLevel; // bal oldal
    modelParts.sideBoards[0].position.z -= 40;

    modelParts.sideBoards[1].position.y = wallLevel; // jobb oldal
    modelParts.sideBoards[1].position.z += 40;

    // Végzáró léc feljebb és kifelé mozgatása
    modelParts.endBoard.position.y = wallLevel;
    modelParts.endBoard.position.x += 40;

    // Váz elemek - mind ugyanazon a szinten, csak vízszintesen szétmozgatva
    const frameLevel = -levelSpacing;

    // Hosszú keret lécek mozgatása
    for (let i = 0; i < 2; i++) {
      modelParts.frame[i].position.y = frameLevel;

      // Bal oldali léc balra, jobb oldali jobbra
      if (i === 0) {
        modelParts.frame[i].position.z -= 25;
      } else {
        modelParts.frame[i].position.z += 25;
      }
    }

    // Rövid keret lécek (elöl-hátul) mozgatása
    for (let i = 2; i < 4; i++) {
      modelParts.frame[i].position.y = frameLevel;

      // Elülső léc előre, hátsó hátra
      if (i === 2) {
        modelParts.frame[i].position.x -= 35;
      } else {
        modelParts.frame[i].position.x += 35;
      }
    }

    // Keresztlécek mozgatása - azonos szinten, csak Z irányban eltolva
    for (let i = 0; i < modelParts.crossBeams.length; i++) {
      modelParts.crossBeams[i].position.y = frameLevel;

      // Z irányban eltolás, de X irányban marad az eredeti pozíción
      const zOffset = i % 2 === 0 ? -25 : 25;

      modelParts.crossBeams[i].position.z += zOffset;
    }

    // Lábak - mind azonos szinten, lefelé mozgatva, de X tengely mentén eredeti helyükön
    const legLevel = -levelSpacing * 4;

    if (modelParts.legs.length > 0) {
      for (let i = 0; i < modelParts.legs.length; i++) {
        modelParts.legs[i].position.y = legLevel;

        // Csak Z irányban mozdítjuk, attól függően, hogy bal vagy jobb oldali
        if (i % 2 === 0) {
          // Bal oldali lábak
          modelParts.legs[i].position.z -= 40;
        } else {
          // Jobb oldali lábak
          modelParts.legs[i].position.z += 40;
        }
      }
    }
  };

  const resetPositions = () => {
    // Minden elem visszaállítása az eredeti pozícióra
    Object.keys(originalPositions).forEach((key) => {
      if (Array.isArray(modelParts[key])) {
        modelParts[key].forEach((part, index) => {
          const originalPosition = originalPositions[key][index];
          part.position.set(
            originalPosition.x,
            originalPosition.y,
            originalPosition.z
          );
        });
      } else if (modelParts[key]) {
        const part = modelParts[key];
        const originalPosition = originalPositions[key];
        part.position.set(
          originalPosition.x,
          originalPosition.y,
          originalPosition.z
        );
      }
    });
  };

  // A lyuk térfogatának kiszámítása (henger)
  const holeVolume =
    Math.PI *
    Math.pow(dimensions.holeRadius, 2) *
    (dimensions.woodThickness + dimensions.turfThickness);

  // Helyes befoglaló méretek számítása, figyelembe véve a kereteket
  const totalLengthWithBorders = dimensions.length + dimensions.sideWidth * 2; // Alapméret + végzárólap + elülső lap (ha van)
  const totalWidthWithBorders = dimensions.width + dimensions.sideWidth * 2; // Alapszélesség + két oldali keret
  const totalHeightWithBase =
    dimensions.woodThickness +
    dimensions.turfThickness +
    dimensions.frameHeight; // Alap magassága

  // A teljes magasság most figyelembe veszi a lábakat és az alsó lemez vastagságát is
  const totalHeightWithLegs =
    totalHeightWithBase +
    dimensions.legHeight +
    dimensions.bottomPlateThickness;

  // Térfogat számítások
  const baseVolume =
    dimensions.length * dimensions.width * dimensions.woodThickness -
    Math.PI * Math.pow(dimensions.holeRadius, 2) * dimensions.woodThickness;

  const turfVolume =
    dimensions.length * dimensions.width * dimensions.turfThickness -
    Math.PI * Math.pow(dimensions.holeRadius, 2) * dimensions.turfThickness;

  // Alsó rétegelt lemez térfogata
  const bottomPlateVolume =
    dimensions.length * dimensions.width * dimensions.bottomPlateThickness;

  const longBeamsVolume =
    2 * dimensions.length * dimensions.frameHeight * dimensions.frameWidth;
  const crossBeamsVolume =
    (2 + crossBeamCount) *
    dimensions.frameWidth *
    dimensions.frameHeight *
    (dimensions.width - 2 * dimensions.frameWidth);
  const frameVolume = longBeamsVolume + crossBeamsVolume;

  const sideWallsVolume =
    2 * dimensions.length * dimensions.sideHeight * dimensions.sideWidth;
  const endWallVolume =
    dimensions.sideWidth *
    dimensions.sideHeight *
    (dimensions.width + 2 * dimensions.sideWidth);
  const borderVolume = sideWallsVolume + endWallVolume;

  // Láb térfogat számítása (henger térfogata: π * r² * h)
  const legVolume =
    Math.PI * Math.pow(dimensions.legDiameter / 2, 2) * dimensions.legHeight;
  const allLegsVolume = legVolume * 8; // 8 láb

  const totalVolume =
    baseVolume +
    bottomPlateVolume +
    turfVolume +
    frameVolume +
    borderVolume +
    allLegsVolume;

  // Súly számítások
  const baseWeight = baseVolume * materials["Lucfenyő rétegelt lemez"].density;
  const bottomPlateWeight =
    bottomPlateVolume * materials["Lucfenyő rétegelt lemez"].density;
  const turfWeight =
    turfVolume * materials["LazyLawn Meadow Twist műfű"].density;
  const frameWeight = frameVolume * materials["Lucfenyő tömörfa"].density;
  const borderWeight = borderVolume * materials["Lucfenyő tömörfa"].density;
  const legsWeight = allLegsVolume * materials["Lucfenyő tömörfa"].density;
  const totalWeight =
    baseWeight +
    bottomPlateWeight +
    turfWeight +
    frameWeight +
    borderWeight +
    legsWeight;

  // Összegző objektum létrehozása
  const summary = {
    totalDimensions: {
      length: totalLengthWithBorders, // cm
      width: totalWidthWithBorders, // cm
      height: {
        withoutSides: totalHeightWithBase, // cm - alaplap + műfű + váz magassága
        withSides: dimensions.sideHeight, // cm - oldalfalak maximális magassága
        withLegs: totalHeightWithLegs, // cm - teljes magasság a lábakkal együtt
      },
      totalVolume: totalVolume, // cm³
      totalWeight: totalWeight, // g
    },
    components: [
      {
        name: "Faalap",
        material: "Lucfenyő rétegelt lemez",
        dimensions: {
          length: dimensions.length, // 250 cm
          width: dimensions.width, // 80 cm
          thickness: dimensions.woodThickness, // 0.9 cm
        },
        volume: baseVolume, // cm³
        weight: baseWeight, // g
        elements: [
          {
            name: "Lyuk",
            count: 1,
            dimensions: {
              diameter: dimensions.holeRadius * 2, // lyuk átmérője
              thickness: dimensions.woodThickness, // lyuk mélysége az alaplapban
            },
            volume:
              Math.PI *
              Math.pow(dimensions.holeRadius, 2) *
              dimensions.woodThickness,
            position: {
              x: holePosition.x,
              y: 0,
              z: holePosition.z,
            },
          },
        ],
      },
      {
        name: "Alsó rétegelt lemez",
        material: "Lucfenyő rétegelt lemez",
        dimensions: {
          length: dimensions.length, // 250 cm
          width: dimensions.width, // 80 cm
          thickness: dimensions.bottomPlateThickness, // 0.6 cm
        },
        volume: bottomPlateVolume, // cm³
        weight: bottomPlateWeight, // g
      },
      {
        name: "Borítás",
        material: "LazyLawn Meadow Twist műfű",
        dimensions: {
          length: dimensions.length, // 250 cm
          width: dimensions.width, // 80 cm
          thickness: dimensions.turfThickness, // 0.6 cm
        },
        volume: turfVolume, // cm³
        weight: turfWeight, // g
        elements: [
          {
            name: "Lyuk",
            count: 1,
            dimensions: {
              diameter: dimensions.holeRadius * 2, // lyuk átmérője
              thickness: dimensions.turfThickness, // lyuk mélysége a borításban
            },
            volume:
              Math.PI *
              Math.pow(dimensions.holeRadius, 2) *
              dimensions.turfThickness,
            position: {
              x: holePosition.x,
              y: 0,
              z: holePosition.z,
            },
          },
        ],
      },
      {
        name: "Váz",
        material: "Lucfenyő tömörfa",
        elements: [
          {
            name: "Hosszanti lécek",
            count: 2,
            dimensions: {
              length: dimensions.length, // 250 cm
              height: dimensions.frameHeight, // 4 cm
              width: dimensions.frameWidth, // 6 cm
            },
            volume: longBeamsVolume, // cm³
            weight: longBeamsVolume * materials["Lucfenyő tömörfa"].density, // g
          },
          {
            name: "Keresztlécek",
            count: 2 + crossBeamCount, // 2 szélső + 4 belső
            dimensions: {
              length: dimensions.frameWidth, // 6 cm
              height: dimensions.frameHeight, // 4 cm
              width: dimensions.width - 2 * dimensions.frameWidth, // 68 cm (80 - 2*6)
            },
            volume: crossBeamsVolume, // cm³
            weight: crossBeamsVolume * materials["Lucfenyő tömörfa"].density, // g
            spacing: spacing, // cm (keresztlécek közötti távolság)
          },
        ],
        totalVolume: frameVolume, // cm³
        totalWeight: frameWeight, // g
      },
      {
        name: "Keret",
        material: "Lucfenyő tömörfa",
        elements: [
          {
            name: "Oldalsó falak",
            count: 2,
            dimensions: {
              length: dimensions.length, // 250 cm
              height: dimensions.sideHeight, // 12 cm
              width: dimensions.sideWidth, // 6 cm
            },
            volume: sideWallsVolume, // cm³
            weight: sideWallsVolume * materials["Lucfenyő tömörfa"].density, // g
          },
          {
            name: "Végfal",
            count: 1,
            dimensions: {
              length: dimensions.sideWidth, // 6 cm
              height: dimensions.sideHeight, // 12 cm
              width: dimensions.width + 2 * dimensions.sideWidth, // 80 + 2*6 = 92 cm
            },
            volume: endWallVolume, // cm³
            weight: endWallVolume * materials["Lucfenyő tömörfa"].density, // g
          },
        ],
        totalVolume: borderVolume, // cm³
        totalWeight: borderWeight, // g
      },
      {
        name: "Lábak",
        material: "Lucfenyő tömörfa",
        elements: [
          {
            name: "Tartó lábak",
            count: 8, // 8 láb
            dimensions: {
              diameter: dimensions.legDiameter, // 6 cm átmérő
              height: dimensions.legHeight, // 15 cm magasság
            },
            volume: legVolume, // cm³
            weight: legVolume * materials["Lucfenyő tömörfa"].density, // g
          },
        ],
        totalVolume: allLegsVolume, // cm³
        totalWeight: legsWeight, // g
      },
    ],
    weights: {
      // Súlyok grammban, kilogrammban és összesítve
      total: {
        grams: totalWeight, // g
        kilograms: totalWeight / 1000, // kg
      },
      byComponent: [
        { name: "Faalap", weight: baseWeight, weightKg: baseWeight / 1000 },
        {
          name: "Alsó rétegelt lemez",
          weight: bottomPlateWeight,
          weightKg: bottomPlateWeight / 1000,
        },
        { name: "Borítás", weight: turfWeight, weightKg: turfWeight / 1000 },
        { name: "Váz", weight: frameWeight, weightKg: frameWeight / 1000 },
        { name: "Keret", weight: borderWeight, weightKg: borderWeight / 1000 },
        { name: "Lábak", weight: legsWeight, weightKg: legsWeight / 1000 },
      ],
      byMaterial: [
        {
          name: "Lucfenyő rétegelt lemez",
          weight: baseWeight + bottomPlateWeight,
          weightKg: (baseWeight + bottomPlateWeight) / 1000,
        },
        {
          name: "LazyLawn Meadow Twist műfű",
          weight: turfWeight,
          weightKg: turfWeight / 1000,
        },
        {
          name: "Lucfenyő tömörfa",
          weight: frameWeight + borderWeight + legsWeight,
          weightKg: (frameWeight + borderWeight + legsWeight) / 1000,
        },
      ],
    },
  };

  return {
    version,
    dimensions,
    modelParts,
    originalPositions,
    exploder,
    resetPositions,
    summary,
    materials,
  };
}
