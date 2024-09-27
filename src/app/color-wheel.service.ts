import { Injectable } from '@angular/core';
import { CoordinatesService, HexaCoord } from './coordinates.service';

@Injectable({
  providedIn: 'root',
})
export class ColorWheelService {
  constructor(private readonly coordinatesService: CoordinatesService) {}

  private easeInEaseOut(x: number) {
    const sqrX = Math.pow(x, 2);
    return sqrX / (2 * (sqrX - x) + 1);
  }

  private camp(x: number) {
    return Math.min(Math.max(0, Math.round(x)), 255);
  }

  getColorWheelValue({
    hexaCoords,
    maxColumn,
  }: {
    hexaCoords: HexaCoord;
    maxColumn: number;
  }) {
    // Geometry foreplays
    const { x, y } = this.coordinatesService.getCartesianFromHexaCoord({
      hexaCoords,
    });
    const hypothenus = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    const cosinus = x / hypothenus;
    const sinus = y / hypothenus;

    // Compute YUV color model on color wheel
    const U = hypothenus !== 0 ? (1 + cosinus) * 127 : 128; // we make cosinus range from 0 to 255. Also, (255,128,128) is white in YUV and we want white in the middle.
    const V = hypothenus !== 0 ? (1 + sinus) * 127 : 128; // same with sinus.
    const Y = this.easeInEaseOut(1 - hypothenus / maxColumn) * 255;

    // Convert to RGB color model
    const r = Math.min(Math.max(0, Math.round(Y + 1.4075 * (V - 128))), 255);
    const g = Y - 0.3455 * (U - 128) - 0.7169 * (V - 128);
    const b = Y + 1.779 * (U - 128);

    return {
      r: this.camp(r),
      g: this.camp(g),
      b: this.camp(b),
    };
  }
}
