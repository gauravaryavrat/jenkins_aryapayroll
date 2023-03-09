import { TestBed } from '@angular/core/testing';

import { GraderuleApiService } from './graderule-api.service';

describe('GraderuleApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GraderuleApiService = TestBed.get(GraderuleApiService);
    expect(service).toBeTruthy();
  });
});
