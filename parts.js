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

function screw(params) {
  const {
    id,
    name,
    position = { x: 0, y: 0, z: 0 },
    explodeOffset = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
    head,
    shaft
  } = params;

  let headElement;

  if(head.type === "hexagonal") {
    headElement = {
          id: `${id}_head`,
          name: "screw_head",
          geometry: {
            type: GEOMETRY_TYPES.CYLINDER,
            dimensions: {
              diameter: head.diameter,
              radius: head.diameter / 2,
              height: head.height,
              segments: 6,
            },
          },
          transform: {
            position: { x: 0, y: head.height / 2, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
          },
        }
  } else {
    const slotLength = 0.1;     
    const slotDepth = head.height - 0.1;    
    const slotWidth = head.diameter - 0.4;

    headElement = {
          id: `${id}_head`,
          name: "screw_head",
          geometry: {
            type: GEOMETRY_TYPES.CYLINDER,
            dimensions: {
              topRadius: head.diameter / 2,                   
              bottomRadius: shaft.diameter / 2,
              height: head.height,
              segments: 32,
            },
            csgOperations: [
              {
                type: CSG_OPERATIONS.SUBTRACT,
                geometry: "box",
                params: {
                  width: slotLength,
                  height: slotDepth,
                  length: slotWidth,
                },
                position: { x: 0, y: 0.1, z: 0 },
              },
              {
                type: CSG_OPERATIONS.SUBTRACT,
                geometry: "box", 
                params: {
                  width: slotWidth,     
                  height: slotDepth,
                  length: slotLength,
                },
                position: { x: 0, y: 0.1 , z: 0 },
              },
            ],
          },
          transform: {
            position: { x: 0, y: head.height / 2, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
          },
        }
  }

   return {
    id: id,
    name: name,
    type: ELEMENT_TYPES.PART,
    material: "GALVANIZED_STEEL",
    geometry: {
      type: GEOMETRY_TYPES.GROUP,
      elements: [
        {...headElement},
        {
          id: `${id}_shaft`,
          name: "shaft", 
          geometry: {
            type: GEOMETRY_TYPES.CYLINDER,
            dimensions: {
              diameter: shaft.diameter,
              radius: shaft.diameter / 2,
              height: shaft.height,
            },
          },
          transform: {
            position: { x: 0, y: - shaft.height / 2, z: 0 },
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

function screwHexBig(params) {
  const {
    id,
    position = { x: 0, y: 0, z: 0 },
    explodeOffset = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
  } = params;

  const type = "HEX";
  const head = { type: "hexagonal", diameter: 1.7, height: 0.64 }
  const shaft = { diameter: 1, height: 14 }

  return screw({
    id: `${id}_${type}`,
    name: `${type} Screw`,
    position,
    explodeOffset,
    rotation,
    head,
    shaft
  })
}

function screwCskSmall(params) {
  const {
    id,
    position = { x: 0, y: 0, z: 0 },
    explodeOffset = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
  } = params;

  const type = "COUNTERSUNK";
  const head = { type: "csk", diameter: 1.13, height: 0.33 }
  const shaft = { diameter: 0.6, height: 6 }

  return screw({
    id: `${id}_${type}`,
    name: `${type} Screw`,
    position,
    explodeOffset,
    rotation,
    head,
    shaft
  })
}

// Globális elérhetőség
window.part = {
  dowel,
  bigCorner,
  smallCorner,
  screwHexBig,
  screwCskSmall,
};
