/**
 * Fa tipli létrehozása - 8×40mm fix mérettel
 * @param {Object} params - Paraméterek objektum
 * @param {string} params.id - Egyedi azonosító
 * @param {Object} params.position - Pozíció {x, y, z}
 * @param {Object} params.explodeOffset - Szétszedési offset {x, y, z}
 * @param {Object} params.rotation - Rotáció {x, y, z} (opcionális)
 * @returns {Object} Element objektum
 */
function dowel(params) {
  const {
    id,
    position,
    explodeOffset,
    rotation = { x: 0, y: 0, z: 0 },
  } = params;

  return {
    id: id,
    name: "Fa tipli 8×40mm",
    type: ELEMENT_TYPES.PART,
    material: "PINE_PLYWOOD",
    geometry: {
      type: GEOMETRY_TYPES.CYLINDER,
      dimensions: {
        diameter: 0.8, // 8mm = 0.8 cm
        radius: 0.4, // 4mm = 0.4 cm
        height: 4.0, // 40mm = 4.0 cm
      },
    },
    transform: {
      position: position,
      rotation: rotation,
    },
    explode: {
      offset: explodeOffset,
    },
  };
}

function bigCorner(params) {
  const {
    id,
    position,
    explodeOffset,
    rotation = { x: 0, y: 0, z: 0 },
  } = params;

  const length = 10;
  const width = 2;
  const thickness = 0.2;
  const holeRadius = 0.3;
  const holeShiftFromSide = 2;

  return {
    id: id,
    name: "Nagy sarok elem",
    type: ELEMENT_TYPES.PART,
    material: "GALVANIZED_STEEL",
    geometry: {
      type: GEOMETRY_TYPES.GROUP,
      elements: [     // Gyerek elemek
        {
          id: `${id}_horizontal`,
          name: "horizontal",
          geometry: {
            type: GEOMETRY_TYPES.BOX,
            dimensions: {
              length: length, 
              width: width, 
              height: thickness,
            },
            csgOperations: [
              createCircleHole({
                radius: holeRadius,
                position: {
                  x: - length / 2 + holeShiftFromSide,
                  y: 0,
                  z: 0,
                },
                axis: 'y',
                direction: 'down',
                depth: thickness,
              }),
              createCircleHole({
                radius: holeRadius,
                position: {
                  x: length / 2 - thickness / 2 - holeShiftFromSide,
                  y: 0,
                  z: 0,
                },
                axis: 'y',
                direction: 'down',
                depth: thickness,
              }),
            ]
          },
          transform: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
          },
        },
        {
          id: `${id}_vertical`,
          name: "vertical",
          geometry: {
            type: GEOMETRY_TYPES.BOX,
            dimensions: {
              length: length - thickness, 
              width: width, 
              height: thickness,
            },
            csgOperations: [
              createCircleHole({
                radius: holeRadius,
                position: {
                  x: - length / 2 + holeShiftFromSide,
                  y: 0,
                  z: 0,
                },
                axis: 'y',
                direction: 'down',
                depth: thickness,
              }),
              createCircleHole({
                radius: holeRadius,
                position: {
                  x: length / 2 - thickness / 2 - holeShiftFromSide,
                  y: 0,
                  z: 0,
                },
                axis: 'y',
                direction: 'down',
                depth: thickness,
              }),
            ]
          },
          transform: {
            position: { x: length / 2 - thickness / 2, y: length / 2, z: 0 },
            rotation: { x: 0, y: 0, z: Math.PI / 2 },
          },
        }
      ],
    },
    transform: {
      position: position,
      rotation: rotation,
    },
    explode: {
      offset: explodeOffset,
    },
  };
}

function smallCorner(params) {
  const {
    id,
    position,
    explodeOffset,
    rotation = { x: 0, y: 0, z: 0 },
  } = params;

  const length = 3; // 2.5
  const width = 3; // 1.5
  const thickness = 0.2;
  const holeRadius = 0.3;
  const holeShiftFromSide = 2;

  return {
    id: id,
    name: "Kis sarok elem",
    type: ELEMENT_TYPES.PART,
    material: "GALVANIZED_STEEL",
    geometry: {
      type: GEOMETRY_TYPES.GROUP,
      elements: [     // Gyerek elemek
        {
          id: `${id}_horizontal`,
          name: "horizontal",
          geometry: {
            type: GEOMETRY_TYPES.BOX,
            dimensions: {
              length: length, 
              width: width, 
              height: thickness,
            },
            csgOperations: [
              createCircleHole({
                radius: holeRadius,
                position: {
                  x: length / 2 - thickness / 2 - holeShiftFromSide,
                  y: 0,
                  z: 0,
                },
                axis: 'y',
                direction: 'down',
                depth: thickness,
              }),
            ]
          },
          transform: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
          },
        },
        {
          id: `${id}_vertical`,
          name: "vertical",
          geometry: {
            type: GEOMETRY_TYPES.BOX,
            dimensions: {
              length: length - thickness, 
              width: width, 
              height: thickness,
            },
            csgOperations: [
              createCircleHole({
                radius: holeRadius,
                position: {
                  x: - length / 2 + holeShiftFromSide,
                  y: 0,
                  z: 0,
                },
                axis: 'y',
                direction: 'down',
                depth: thickness,
              }),
            ]
          },
          transform: {
            position: { x: length / 2 - thickness / 2, y: length / 2, z: 0 },
            rotation: { x: 0, y: 0, z: Math.PI / 2 },
          },
        }
      ],
    },
    transform: {
      position: position,
      rotation: rotation,
    },
    explode: {
      offset: explodeOffset,
    },
  };
}

function hexBolt(params) {
  const {
    id,
    position,
    explodeOffset,
    rotation = { x: 0, y: 0, z: 0 },
  } = params;

  const headDiameter = 1.3; // M8 hatlapfej átmérő: 13mm = 1.3 cm
  const headHeight = 0.5;   // Hatlapfej magasság: 5mm = 0.5 cm
  const shaftDiameter = 0.8; // M8 menet átmérő: 8mm = 0.8 cm
  const shaftLength = 14.0;  // Szár hossz: 140mm = 14.0 cm

  // Kereszt horony paraméterei
  const slotLength = 0.1;     // Horony szélesség: 1mm = 0.1 cm
  const slotDepth = 0.2;    // Horony mélység: 1.5mm = 0.15 cm
  const slotWidth = 0.7;

  return {
    id: id,
    name: "Hatlapfejű csavar M8×140mm (valódi hatszög)",
    type: ELEMENT_TYPES.PART,
    material: "GALVANIZED_STEEL",
    geometry: {
      type: GEOMETRY_TYPES.GROUP,
      elements: [
        // Hatlapfej (valódi hatszög)
        // {
        //   id: `${id}_head`,
        //   name: "head",
        //   geometry: {
        //     type: GEOMETRY_TYPES.CYLINDER,
        //     dimensions: {
        //       diameter: headDiameter,
        //       radius: headDiameter / 2,
        //       height: headHeight,
        //       segments: 6, // 6 szegmens = hatszög
        //     },
        //   },
        //   transform: {
        //     position: { x: 0, y: headHeight / 2, z: 0 },
        //     rotation: { x: 0, y: 0, z: 0 },
        //   },
        // },
        {
          id: `${id}_head`,
          name: "countersunk_head",
          geometry: {
            type: GEOMETRY_TYPES.CYLINDER,
            dimensions: {
              topRadius: headDiameter / 2,                    // Felül keskeny (0)
              bottomRadius: shaftDiameter / 2,  // Alul széles
              height: headHeight,
              segments: 16,
            },
            csgOperations: [
              // Vízszintes horony (X irányban)
              {
                type: CSG_OPERATIONS.SUBTRACT,
                geometry: "box",
                params: {
                  width: slotLength,  // Teljes fejen átmegy
                  height: slotDepth,          // 1.5mm mély
                  length: slotWidth,          // 1mm széles
                },
                position: { x: 0, y: headHeight / 2 - slotDepth / 2, z: 0 },
              },
              // Függőleges horony (Z irányban)
              {
                type: CSG_OPERATIONS.SUBTRACT,
                geometry: "box", 
                params: {
                  width: slotWidth,           // 1mm széles
                  height: slotDepth,          // 1.5mm mély
                  length: slotLength, // Teljes fejen átmegy
                },
                position: { x: 0, y: headHeight / 2 - slotDepth / 2, z: 0 },
              },
            ],
          },
          transform: {
            position: { x: 0, y: headHeight / 2, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
          },
        },
        // Menetes szár
        {
          id: `${id}_shaft`,
          name: "shaft", 
          geometry: {
            type: GEOMETRY_TYPES.CYLINDER,
            dimensions: {
              diameter: shaftDiameter,
              radius: shaftDiameter / 2,
              height: shaftLength,
            },
          },
          transform: {
            position: { x: 0, y: -shaftLength / 2, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
          },
        }
      ],
    },
    transform: {
      position: position,
      rotation: rotation,
    },
    explode: {
      offset: explodeOffset,
    },
  };
}

// Globális elérhetőség
window.part = {
  dowel,
  bigCorner,
  smallCorner,
  hexBolt,
};
