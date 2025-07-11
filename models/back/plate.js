export const elements = [
  {
    id: "top_plate",
    name: "Faalap",
    type: ELEMENT_TYPES.PLATE,
    material: "PINE_PLYWOOD",
    shade: 3,
    geometry: {
      type: GEOMETRY_TYPES.BOX,
      dimensions: {
        width: COURSE_DIMENSIONS.width, // 80 cm
        height: COURSE_DIMENSIONS.topPlateThickness, // 12mm = 1.2 cm
        length: COURSE_DIMENSIONS.length, // 250 cm
      },
      csgOperations: [
        ...twoStepHole({
          position: {
            x: COURSE_DIMENSIONS.length / 2 - COURSE_DIMENSIONS.holePositionX,
            y: 0,
            z: 0,
          },
          axis: "y",
          direction: "down",
          parentThickness: 1.2,
          firstHole: { radius: 8.7, depth: 0.3 },
          secondHole: { radius: 6.6, depth: 0.9 },
        }),
      ],
    },
    transform: {
      position: { x: 0, y: 0, z: 0 },
    },
    explode: {
      offset: { x: 0, y: 30, z: 0 },
    },
  },
];
