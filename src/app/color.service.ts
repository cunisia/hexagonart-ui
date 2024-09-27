import { Injectable } from '@angular/core';
import { CoordinatesService, HexaCoord } from './coordinates.service';
import { randomIntFromInterval } from '../utils';
export type RGBColor = {
  r: number;
  g: number;
  b: number;
};

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  constructor(private readonly coordinatesService: CoordinatesService) {}

  getRGBStr({ r, g, b }: RGBColor) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  getRandomColor(): RGBColor {
    return {
      r: randomIntFromInterval(0, 255),
      g: randomIntFromInterval(0, 255),
      b: randomIntFromInterval(0, 255),
    };
  }
}
