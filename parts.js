/**
 * test commit
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
    material: "PINE_SOLID",
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

// Globális elérhetőség
window.part = {
  dowel: dowel,
};
