import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColorService, RGBColor } from '../color.service';
import { NgStyle } from '@angular/common';

export type ColorOption = {
  id: string;
  hexaCoords: {
    a: number;
    r: number;
    c: number;
  };
  color: RGBColor;
  cartesianCoords: {
    x: number;
    y: number;
  };
};

@Component({
  selector: '[app-color-option]',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './color-option.component.svg',
  styleUrl: './color-option.component.scss',
})
export class ColorOptionComponent {
  @Input() colorOption!: ColorOption;
  @Output() onSelected = new EventEmitter<RGBColor>();

  constructor(private readonly colorService: ColorService) {}

  getColor() {
    return this.colorService.getRGBStr(this.colorOption.color);
  }

  pickColor() {
    this.onSelected.emit(this.colorOption.color);
  }
}
