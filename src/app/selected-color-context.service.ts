import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RGBColor } from './color.service';

@Injectable({
  providedIn: 'root',
})
export class SelectedColorContextService {
  private color$ = new BehaviorSubject<RGBColor>({ r: 255, g: 255, b: 255 });
  selectedColor$ = this.color$.asObservable();
  constructor() {}

  selectColor(color: any) {
    this.color$.next(color);
  }
}
