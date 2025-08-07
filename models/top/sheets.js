const sideSheetFromSideTop = 3;

export const elements = [
  window.part.sideSheet({
    id: "right_side_sheet",
    position: { 
        x: 0, 
        y: COURSE_DIMENSIONS.sideVerticalShift - sideSheetFromSideTop, 
        z: COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.sideWidth - 0.13,
    },
    explodeOffset: { x: 0, y: 0, z: 0 },
    rotation: { x: Math.PI / 2, y: 0, z: 0 },
  })
];
