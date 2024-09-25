import { TestBed } from '@angular/core/testing';

import { UpdateCacheOnColorEventService } from './update-cache-on-color-event.service';

describe('UpdateCacheOnColorEventService', () => {
  let service: UpdateCacheOnColorEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateCacheOnColorEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
