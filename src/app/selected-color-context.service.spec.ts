import { TestBed } from '@angular/core/testing';

import { SelectedColorContextService } from './selected-color-context.service';

describe('SelectedColorContextService', () => {
  let service: SelectedColorContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedColorContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
