import { Injectable } from '@angular/core';

export const EXPERIMENTAL_MAGIC_RATIO = 3 / 4;

export type HexaCoord = {
  a: number;
  r: number;
  c: number;
};

export type CartesianCoord = {
  x: number;
  y: number;
};

@Injectable({
  providedIn: 'root',
})
export class CoordinatesService {
  constructor() {}

  getCartesianFromHexaCoord({
    hexaCoords,
    tileWidth = 1,
    tileHeight = 1,
  }: {
    hexaCoords: HexaCoord;
    tileWidth?: number;
    tileHeight?: number;
  }): CartesianCoord {
    const { a, r, c } = hexaCoords;
    return {
      x: (c + a / 2) * tileWidth,
      y: (2 * r + a) * tileHeight * EXPERIMENTAL_MAGIC_RATIO,
    };
  }
}
