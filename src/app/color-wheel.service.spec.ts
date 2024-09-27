import { TestBed } from '@angular/core/testing';

import { ColorWheelService } from './color-wheel.service';

describe('ColorWheelService', () => {
  let service: ColorWheelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorWheelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
