import { TestBed } from '@angular/core/testing';

import { LeaveServicesService } from './leave-services.service';

describe('LeaveServicesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LeaveServicesService = TestBed.get(LeaveServicesService);
    expect(service).toBeTruthy();
  });
});
