function createMiniGolfModel(scene) {
    // Verzió
    const version = "1.0.12";

    // Méretek - 80x250 cm pályára és 9 mm vastagságú alaplapra
    const dimensions = {
        length: 250,        // 250 cm hosszú
        width: 80,          // 80 cm széles
        woodThickness: 0.9,  // 9 mm
        turfThickness: 0.6,  // 6 mm
        holeRadius: 5.4,     // átmérő: 10.8 cm
        frameWidth: 8,       // 8 cm széles lécek (módosítva 4-ről 8-ra)
        frameHeight: 4,      // 4 cm magas lécek
        sideWidth: 8,        // 8 cm széles oldallécek
        sideHeight: 15,      // 15 cm magas oldallécek
        legDiameter: 8,      // 8 cm átmérőjű lábak (módosítva 4-ről 8-ra)
        legHeight: 15        // 15 cm magas lábak
    };

    // Anyagok sűrűsége g/cm³-ben
    const materials = {
        "Lucfenyő rétegelt lemez": { 
            density: 0.5  // g/cm³ (500 kg/m³)
        },
        "Lucfenyő tömörfa": { 
            density: 0.45  // g/cm³ (450 kg/m³)
        },
        "LazyLawn Meadow Twist műfű": { 
            density: 0.2  // g/cm³ (becsült érték - 200 kg/m³)
        }
    };
    
    // Tároljuk a modell elemeit egy objektumban a könnyebb kezelhetőség érdekében
    const modelParts = {
        base: null,
        turf: null,
        frame: [],
        crossBeams: [],
        sideBoards: [],
        endBoard: null,
        legs: []  // Lábak tömbje
    };
    
    // Fa alaplap anyaga - lucfenyő rétegelt lemez
    const woodMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xF5E0C3,  // Világosabb, lucfenyő szín
        shininess: 15     // Csökkentett fényesség
    });
    const woodGeometry = new THREE.BoxGeometry(dimensions.length, dimensions.woodThickness, dimensions.width);
    modelParts.base = new THREE.Mesh(woodGeometry, woodMaterial);
    modelParts.base.position.set(0, -dimensions.woodThickness/2, 0);
    
    // Váz anyaga - lucfenyő
    const frameMaterial = new THREE.MeshPhongMaterial({
        color: 0xECD9BD,  // Lucfenyő szín a váznak
        shininess: 10
    });
    
    // Hosszanti lécek a vázon (bal és jobb oldalon)
    const longBeamGeometry = new THREE.BoxGeometry(dimensions.length, dimensions.frameHeight, dimensions.frameWidth);
    
    // Bal oldali hosszanti léc
    const leftLongBeam = new THREE.Mesh(longBeamGeometry, frameMaterial);
    leftLongBeam.position.set(0, -dimensions.frameHeight/2 - dimensions.woodThickness, -dimensions.width/2 + dimensions.frameWidth/2);
    scene.add(leftLongBeam);
    modelParts.frame.push(leftLongBeam);
    
    // Jobb oldali hosszanti léc
    const rightLongBeam = new THREE.Mesh(longBeamGeometry, frameMaterial);
    rightLongBeam.position.set(0, -dimensions.frameHeight/2 - dimensions.woodThickness, dimensions.width/2 - dimensions.frameWidth/2);
    scene.add(rightLongBeam);
    modelParts.frame.push(rightLongBeam);
    
    // Keresztlécek a vázon (elöl és hátul)
    const crossBeamGeometry = new THREE.BoxGeometry(dimensions.frameWidth, dimensions.frameHeight, dimensions.width - 2*dimensions.frameWidth);
    
    // Első keresztléc
    const frontCrossBeam = new THREE.Mesh(crossBeamGeometry, frameMaterial);
    frontCrossBeam.position.set(-dimensions.length/2 + dimensions.frameWidth/2, -dimensions.frameHeight/2 - dimensions.woodThickness, 0);
    scene.add(frontCrossBeam);
    modelParts.frame.push(frontCrossBeam);
    
    // Hátsó keresztléc
    const backCrossBeam = new THREE.Mesh(crossBeamGeometry, frameMaterial);
    backCrossBeam.position.set(dimensions.length/2 - dimensions.frameWidth/2, -dimensions.frameHeight/2 - dimensions.woodThickness, 0);
    scene.add(backCrossBeam);
    modelParts.frame.push(backCrossBeam);
    
    // 5 keresztléc a rövidebb pályára (egyenletesen elosztva)
    const crossBeamCount = 5;
    const spacing = dimensions.length / (crossBeamCount + 1);
    
    for (let i = 0; i < crossBeamCount; i++) {
        const posX = -dimensions.length/2 + spacing * (i + 1);
        const crossBeam = new THREE.Mesh(crossBeamGeometry, frameMaterial);
        crossBeam.position.set(posX, -dimensions.frameHeight/2 - dimensions.woodThickness, 0);
        scene.add(crossBeam);
        modelParts.crossBeams.push(crossBeam);
    }
    
    // Műfű réteg - pasztellesebb szín - LazyLawn Meadow Twist
    const turfMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x7BBF69,  // Világosabb, pasztellesebb zöld
        shininess: 3      // Minimális fényesség
    });
    const turfGeometry = new THREE.BoxGeometry(dimensions.length, dimensions.turfThickness, dimensions.width);
    modelParts.turf = new THREE.Mesh(turfGeometry, turfMaterial);
    modelParts.turf.position.set(0, dimensions.turfThickness/2, 0);
    
    // Modell részek hozzáadása a scene-hez
    scene.add(modelParts.base);
    scene.add(modelParts.turf);
    
    // Oldalkeretek - a pálya két hosszú oldalán (lucfenyő anyag)
    const sideBoardMaterial = new THREE.MeshPhongMaterial({
        color: 0xECD9BD,  // Lucfenyő szín
        shininess: 12
    });
    
    // Bal oldali keret - oldalról rögzítve
    const leftSideBoardGeometry = new THREE.BoxGeometry(dimensions.length, dimensions.sideHeight, dimensions.sideWidth);
    const leftSideBoard = new THREE.Mesh(leftSideBoardGeometry, sideBoardMaterial);
    // Az y pozíciót módosítjuk, hogy a keret 10 cm-rel lejjebb legyen, de felül még 5 cm magas maradjon
    leftSideBoard.position.set(0, dimensions.sideHeight/2 - 10, -dimensions.width/2 - dimensions.sideWidth/2);
    scene.add(leftSideBoard);
    modelParts.sideBoards.push(leftSideBoard);
    
    // Jobb oldali keret - oldalról rögzítve
    const rightSideBoardGeometry = new THREE.BoxGeometry(dimensions.length, dimensions.sideHeight, dimensions.sideWidth);
    const rightSideBoard = new THREE.Mesh(rightSideBoardGeometry, sideBoardMaterial);
    // Az y pozíciót módosítjuk, hogy a keret 10 cm-rel lejjebb legyen, de felül még 5 cm magas maradjon
    rightSideBoard.position.set(0, dimensions.sideHeight/2 - 10, dimensions.width/2 + dimensions.sideWidth/2);
    scene.add(rightSideBoard);
    modelParts.sideBoards.push(rightSideBoard);
    
    // Végzáró keret a lyuk felőli oldalon
    const endBoardGeometry = new THREE.BoxGeometry(dimensions.sideWidth, dimensions.sideHeight, dimensions.width + 2 * dimensions.sideWidth);
    const endBoard = new THREE.Mesh(endBoardGeometry, sideBoardMaterial);
    endBoard.position.set(dimensions.length/2 + dimensions.sideWidth/2, dimensions.sideHeight/2 - 10, 0);
    scene.add(endBoard);
    modelParts.endBoard = endBoard;

    // Lábak hozzáadása - 6 db a keresztlécekhez rögzítve
    const legMaterial = new THREE.MeshPhongMaterial({
        color: 0xECD9BD,  // Lucfenyő szín, mint a váz
        shininess: 10
    });
    
    // Láb geometria - henger
    const legGeometry = new THREE.CylinderGeometry(
        dimensions.legDiameter / 2,   // felső sugár
        dimensions.legDiameter / 2,   // alsó sugár
        dimensions.legHeight,         // magasság
        16                           // radiális szegmensek száma
    );
    
    // Láb pozíciói - 3 keresztlécen, bal és jobb oldalon
    const legPositions = [
        // Első láb pozíciók (első keresztlécnél)
        {
            x: -dimensions.length/2 + dimensions.frameWidth/2,
            y: -dimensions.frameHeight - dimensions.woodThickness - dimensions.legHeight/2,
            z: -dimensions.width/2 + dimensions.frameWidth + dimensions.legDiameter/2
        },
        {
            x: -dimensions.length/2 + dimensions.frameWidth/2,
            y: -dimensions.frameHeight - dimensions.woodThickness - dimensions.legHeight/2,
            z: dimensions.width/2 - dimensions.frameWidth - dimensions.legDiameter/2
        },
        // Középső lábak (3. keresztlécnél - közepe)
        {
            x: 0,
            y: -dimensions.frameHeight - dimensions.woodThickness - dimensions.legHeight/2,
            z: -dimensions.width/2 + dimensions.frameWidth + dimensions.legDiameter/2
        },
        {
            x: 0,
            y: -dimensions.frameHeight - dimensions.woodThickness - dimensions.legHeight/2,
            z: dimensions.width/2 - dimensions.frameWidth - dimensions.legDiameter/2
        },
        // Hátsó lábak (5. keresztlécnél - hátul)
        {
            x: dimensions.length/2 - dimensions.frameWidth/2,
            y: -dimensions.frameHeight - dimensions.woodThickness - dimensions.legHeight/2,
            z: -dimensions.width/2 + dimensions.frameWidth + dimensions.legDiameter/2
        },
        {
            x: dimensions.length/2 - dimensions.frameWidth/2,
            y: -dimensions.frameHeight - dimensions.woodThickness - dimensions.legHeight/2,
            z: dimensions.width/2 - dimensions.frameWidth - dimensions.legDiameter/2
        }
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

    // távolság a robbantásnál
    Object.keys(modelParts).forEach(key => {
        if (Array.isArray(modelParts[key])) {
            const parts = [];
            modelParts[key].forEach(part => {
                parts.push(part.position.clone());
            });
            originalPositions[key] = parts;
        } else if (modelParts[key]) {
            originalPositions[key] = modelParts[key].position.clone();
        }
    });

    const exploder = () => {
        // Műfű réteg felemelése
        modelParts.turf.position.y = 20;
        
        // Fa alaplap feljebb emelése
        modelParts.base.position.y = 10;
        
        // Oldallécek feljebb és kifelé mozgatása
        modelParts.sideBoards[0].position.y = 30; // bal oldal
        modelParts.sideBoards[0].position.z -= 20;
        
        modelParts.sideBoards[1].position.y = 30; // jobb oldal
        modelParts.sideBoards[1].position.z += 20;
        
        // Végzáró léc feljebb és kifelé mozgatása
        modelParts.endBoard.position.y = 30;
        modelParts.endBoard.position.x += 20;
        
        // Lábak lefelé és kifelé mozgatása
        if (modelParts.legs.length > 0) {
            for (let i = 0; i < modelParts.legs.length; i++) {
                modelParts.legs[i].position.y -= 10;
                
                // Páros indexű (bal oldali) lábak balra, páratlan indexűek (jobb oldaliak) jobbra
                if (i % 2 === 0) {
                    modelParts.legs[i].position.z -= 10;
                } else {
                    modelParts.legs[i].position.z += 10;
                }
            }
        }
    }

    const resetPositions = () => {
        // Minden elem visszaállítása az eredeti pozícióra
        Object.keys(originalPositions).forEach((key) => {
            if (Array.isArray(modelParts[key])) {
                modelParts[key].forEach((part, index) => {
                    const originalPosition = originalPositions[key][index];
                    part.position.set(originalPosition.x, originalPosition.y, originalPosition.z);
                });
            } else {
                const part = modelParts[key];
                const originalPosition = originalPositions[key];
                part.position.set(originalPosition.x, originalPosition.y, originalPosition.z);
            }
        });
    }

    // Helyes befoglaló méretek számítása, figyelembe véve a kereteket
    const totalLengthWithBorders = dimensions.length + dimensions.sideWidth * 2; // Alapméret + végzárólap + elülső lap (ha van)
    const totalWidthWithBorders = dimensions.width + dimensions.sideWidth * 2;  // Alapszélesség + két oldali keret
    const totalHeightWithBase = dimensions.woodThickness + dimensions.turfThickness + dimensions.frameHeight; // Alap magassága
    
    // A teljes magasság most figyelembe veszi a lábakat is
    const totalHeightWithLegs = totalHeightWithBase + dimensions.legHeight;
    
    // Térfogat számítások
    const baseVolume = dimensions.length * dimensions.width * dimensions.woodThickness;
    const turfVolume = dimensions.length * dimensions.width * dimensions.turfThickness;
    
    const longBeamsVolume = 2 * dimensions.length * dimensions.frameHeight * dimensions.frameWidth;
    const crossBeamsVolume = (2 + crossBeamCount) * dimensions.frameWidth * dimensions.frameHeight * (dimensions.width - 2 * dimensions.frameWidth);
    const frameVolume = longBeamsVolume + crossBeamsVolume;
    
    const sideWallsVolume = 2 * dimensions.length * dimensions.sideHeight * dimensions.sideWidth;
    const endWallVolume = dimensions.sideWidth * dimensions.sideHeight * (dimensions.width + 2 * dimensions.sideWidth);
    const borderVolume = sideWallsVolume + endWallVolume;
    
    // Láb térfogat számítása (henger térfogata: π * r² * h)
    const legVolume = Math.PI * Math.pow(dimensions.legDiameter / 2, 2) * dimensions.legHeight;
    const allLegsVolume = legVolume * 6;  // 6 láb
    
    const totalVolume = baseVolume + turfVolume + frameVolume + borderVolume + allLegsVolume;
    
    // Súly számítások
    const baseWeight = baseVolume * materials["Lucfenyő rétegelt lemez"].density; 
    const turfWeight = turfVolume * materials["LazyLawn Meadow Twist műfű"].density;
    const frameWeight = frameVolume * materials["Lucfenyő tömörfa"].density;
    const borderWeight = borderVolume * materials["Lucfenyő tömörfa"].density;
    const legsWeight = allLegsVolume * materials["Lucfenyő tömörfa"].density;
    const totalWeight = baseWeight + turfWeight + frameWeight + borderWeight + legsWeight;

    // Összegző objektum létrehozása - tömbbel, name attribútummal + súly adatokkal
    const summary = {
        totalDimensions: {
            length: totalLengthWithBorders,     // cm - Javítva: teljes hossz keretekkel együtt
            width: totalWidthWithBorders,       // cm - Javítva: teljes szélesség keretekkel együtt
            height: {
                withoutSides: totalHeightWithBase,  // cm - alaplap + műfű + váz magassága
                withSides: dimensions.sideHeight,   // cm - oldalfalak maximális magassága
                withLegs: totalHeightWithLegs       // cm - teljes magasság a lábakkal együtt
            },
            totalVolume: totalVolume,    // cm³
            totalWeight: totalWeight     // g
        },
        components: [
            {
                name: "Faalap",
                material: "Lucfenyő rétegelt lemez",
                dimensions: {
                    length: dimensions.length,                // 250 cm
                    width: dimensions.width,                  // 80 cm
                    thickness: dimensions.woodThickness       // 0.9 cm
                },
                volume: baseVolume,                         // cm³
                weight: baseWeight                          // g
            },
            {
                name: "Borítás",
                material: "LazyLawn Meadow Twist műfű",
                dimensions: {
                    length: dimensions.length,                // 250 cm
                    width: dimensions.width,                  // 80 cm
                    thickness: dimensions.turfThickness       // 0.6 cm
                },
                volume: turfVolume,                         // cm³
                weight: turfWeight                          // g
            },
            {
                name: "Váz",
                material: "Lucfenyő tömörfa",
                elements: [
                    {
                        name: "Hosszanti lécek",
                        count: 2,
                        dimensions: {
                            length: dimensions.length,              // 250 cm
                            height: dimensions.frameHeight,         // 4 cm
                            width: dimensions.frameWidth            // 8 cm (módosítva)
                        },
                        volume: longBeamsVolume,                  // cm³
                        weight: longBeamsVolume * materials["Lucfenyő tömörfa"].density // g
                    },
                    {
                        name: "Keresztlécek",
                        count: 2 + crossBeamCount,                  // 2 szélső + 5 belső
                        dimensions: {
                            length: dimensions.frameWidth,            // 8 cm (módosítva)
                            height: dimensions.frameHeight,           // 4 cm
                            width: dimensions.width - 2 * dimensions.frameWidth // 64 cm (80 - 2*8)
                        },
                        volume: crossBeamsVolume,                  // cm³
                        weight: crossBeamsVolume * materials["Lucfenyő tömörfa"].density, // g
                        spacing: spacing                      // cm (keresztlécek közötti távolság)
                    }
                ],
                totalVolume: frameVolume,                      // cm³
                totalWeight: frameWeight                       // g
            },
            {
                name: "Keret",
                material: "Lucfenyő tömörfa",
                elements: [
                    {
                        name: "Oldalsó falak",
                        count: 2,
                        dimensions: {
                            length: dimensions.length,              // 250 cm
                            height: dimensions.sideHeight,          // 15 cm
                            width: dimensions.sideWidth             // 8 cm
                        },
                        volume: sideWallsVolume,                  // cm³
                        weight: sideWallsVolume * materials["Lucfenyő tömörfa"].density // g
                    },
                    {
                        name: "Végfal",
                        count: 1,
                        dimensions: {
                            length: dimensions.sideWidth,                     // 8 cm
                            height: dimensions.sideHeight,                    // 15 cm
                            width: dimensions.width + 2 * dimensions.sideWidth  // 80 + 2*8 = 96 cm
                        },
                        volume: endWallVolume,                    // cm³
                        weight: endWallVolume * materials["Lucfenyő tömörfa"].density // g
                    }
                ],
                totalVolume: borderVolume,                     // cm³
                totalWeight: borderWeight                      // g
            },
            {
                name: "Lábak",
                material: "Lucfenyő tömörfa",
                elements: [
                    {
                        name: "Tartó lábak",
                        count: 6,
                        dimensions: {
                            diameter: dimensions.legDiameter,        // 8 cm átmérő (módosítva)
                            height: dimensions.legHeight            // 15 cm magasság
                        },
                        volume: legVolume,                        // cm³
                        weight: legVolume * materials["Lucfenyő tömörfa"].density // g
                    }
                ],
                totalVolume: allLegsVolume,                     // cm³
                totalWeight: legsWeight                         // g
            }
        ],
        weights: {
            // Súlyok grammban, kilogrammban és összesítve
            total: {
                grams: totalWeight,                // g
                kilograms: totalWeight / 1000      // kg
            },
            byComponent: [
                { name: "Faalap", weight: baseWeight, weightKg: baseWeight / 1000 },
                { name: "Borítás", weight: turfWeight, weightKg: turfWeight / 1000 },
                { name: "Váz", weight: frameWeight, weightKg: frameWeight / 1000 },
                { name: "Keret", weight: borderWeight, weightKg: borderWeight / 1000 },
                { name: "Lábak", weight: legsWeight, weightKg: legsWeight / 1000 }
            ],
            byMaterial: [
                { 
                    name: "Lucfenyő rétegelt lemez", 
                    weight: baseWeight, 
                    weightKg: baseWeight / 1000 
                },
                { 
                    name: "LazyLawn Meadow Twist műfű", 
                    weight: turfWeight, 
                    weightKg: turfWeight / 1000 
                },
                { 
                    name: "Lucfenyő tömörfa", 
                    weight: frameWeight + borderWeight + legsWeight, 
                    weightKg: (frameWeight + borderWeight + legsWeight) / 1000 
                }
            ]
        }
    };

    return {
        version,
        dimensions, 
        modelParts, 
        originalPositions, 
        exploder, 
        resetPositions,
        summary,    // Módosított összegző objektum súlyokkal
        materials   // Anyagtulajdonságok
    };
}