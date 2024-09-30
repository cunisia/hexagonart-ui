import { Component, DestroyRef, Input, OnDestroy, OnInit } from '@angular/core';
import { CoordinatesService, HexaCoord } from '../coordinates.service';
import { ColorService, RGBColor } from '../color.service';
import {
  ColorOption,
  ColorOptionComponent,
} from '../color-option/color-option.component';
import { ColorWheelService } from '../color-wheel.service';
import { SelectedColorContextService } from '../selected-color-context.service';
import { NgStyle } from '@angular/common';
import { TILE_HEIGHT, TILE_WITH } from '../../const';

const EDGE_SIZE = 7;

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [ColorOptionComponent, NgStyle],
  templateUrl: './color-picker.component.svg',
  styleUrl: './color-picker.component.scss',
})
export class ColorPickerComponent implements OnInit {
  @Input() color!: RGBColor;

  isChoosing = false;
  colorOptions: ColorOption[] = [];
  private selectedColor: RGBColor;

  constructor(
    private readonly coordinatesService: CoordinatesService,
    private readonly colorWheelService: ColorWheelService,
    private readonly colorService: ColorService,
    private readonly selectedColorContextService: SelectedColorContextService,
    private readonly destroyRef: DestroyRef
  ) {
    this.selectedColor = this.colorService.getRandomColor();
  }

  ngOnInit(): void {
    this.colorOptions = this.getColorOptions();
    const selectedColor$ =
      this.selectedColorContextService.selectedColor$.subscribe(
        (value) => (this.selectedColor = value)
      );
    this.destroyRef.onDestroy(selectedColor$.unsubscribe);
  }

  onSelectedColor(color: RGBColor) {
    this.selectedColorContextService.selectColor(color);
    this.isChoosing = false;
  }

  getSelectedColor() {
    return this.colorService.getRGBStr(this.selectedColor);
  }

  switchToChoosingColorMode() {
    this.isChoosing = true;
  }

  private getColorOptions() {
    const colorOptions: ColorOption[] = [];

    const pushColorOption = (hexaCoords: HexaCoord) => {
      colorOptions.push({
        id: JSON.stringify(hexaCoords),
        hexaCoords,
        cartesianCoords: this.coordinatesService.getCartesianFromHexaCoord({
          hexaCoords,
          tileHeight: TILE_HEIGHT,
          tileWidth: TILE_WITH,
        }),
        color: this.colorWheelService.getColorWheelValue({
          hexaCoords,
          maxColumn: EDGE_SIZE - 1,
        }),
      });
    };

    const getR = (line: number) => {
      if (line < 0) {
        return Math.sign(line) * Math.ceil(Math.abs(line) / 2);
      }
      return Math.sign(line) * Math.floor(Math.abs(line) / 2);
    };

    const maxLine = EDGE_SIZE - 1;
    const maxNbTiles = 2 * EDGE_SIZE - 1;
    for (let line = -1 * maxLine; line <= maxLine; line++) {
      const r = getR(line);
      const a = Math.abs(line % 2);
      const nbTiles = maxNbTiles - Math.abs(line);
      const minCol = -1 * Math.floor(nbTiles / 2);
      const maxCol = -1 * minCol - a;
      for (let c = minCol; c <= maxCol; c++) {
        pushColorOption({ a, r, c });
      }
    }

    return colorOptions;
  }
}
