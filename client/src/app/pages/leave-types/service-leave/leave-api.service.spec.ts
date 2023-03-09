import { TestBed } from '@angular/core/testing';

import { LeaveApiService } from './leave-api.service';

describe('LeaveApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LeaveApiService = TestBed.get(LeaveApiService);
    expect(service).toBeTruthy();
  });
});
