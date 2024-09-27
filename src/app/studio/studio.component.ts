import { Component } from '@angular/core';
import { BoardComponent } from '../board/board.component';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { ColorService, RGBColor } from '../color.service';
import { BOARD_ID } from '../../const';

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [BoardComponent, ColorPickerComponent],
  templateUrl: './studio.component.html',
  styleUrl: './studio.component.scss',
})
export class StudioComponent {
  selectedColor: RGBColor;
  boardId: string = BOARD_ID;

  constructor(colorService: ColorService) {
    this.selectedColor = colorService.getRandomColor();
  }
}
