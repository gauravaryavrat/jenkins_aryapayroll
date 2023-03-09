import { TestBed } from '@angular/core/testing';

import { PayrollApiService } from './payroll-api.service';

describe('PayrollApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PayrollApiService = TestBed.get(PayrollApiService);
    expect(service).toBeTruthy();
  });
});
