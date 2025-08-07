const sideSheetFromSideTop = 2.5;
const sheetInset = 0.12;

export const elements = [
  window.part.sideSheet({
    id: "right_side_sheet",
    position: { 
        x: 0, 
        y: COURSE_DIMENSIONS.sideVerticalShift - sideSheetFromSideTop, 
        z: COURSE_DIMENSIONS.width / 2 + COURSE_DIMENSIONS.sideWidth - sheetInset,
    },
    explodeOffset: { x: 0, y: 0, z: 80 },
    rotation: { x: Math.PI / 2, y: 0, z: 0 },
  }),
  window.part.sideSheet({
    id: "left_side_sheet",
    position: { 
        x: 0, 
        y: COURSE_DIMENSIONS.sideVerticalShift - sideSheetFromSideTop, 
        z: - COURSE_DIMENSIONS.width / 2 - COURSE_DIMENSIONS.sideWidth + sheetInset,
    },
    explodeOffset: { x: 0, y: 0, z: -80 },
    rotation: { x: Math.PI / 2, y: 0, z: 0 },
  }),
  window.part.sideSheet({
    id: "front_sheet",
    position: { 
        x: - COURSE_DIMENSIONS.length - COURSE_DIMENSIONS.frontWidth + sheetInset, 
        y: - 1.5, 
        z: 0,
    },
    explodeOffset: { x: -100, y: 0, z: 0 },
    rotation: { x: Math.PI / 2, y: 0, z: Math.PI / 2 },
  }),
  window.part.productSheet({
    id: "product_sheet",
    position: { 
        x: COURSE_DIMENSIONS.length + COURSE_DIMENSIONS.sideWidth - sheetInset, 
        y: 4, 
        z: 0,
    },
    explodeOffset: { x: 100, y: 0, z: 0 },
    rotation: { x: Math.PI / 2, y: 0, z: Math.PI / 2 },
  })
];
