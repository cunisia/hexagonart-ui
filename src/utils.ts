export type RGBColor = {
  r: number;
  g: number;
  b: number;
};

export const getRGBStr = ({ r, g, b }: RGBColor) => `rgb(${r}, ${g}, ${b})`;
