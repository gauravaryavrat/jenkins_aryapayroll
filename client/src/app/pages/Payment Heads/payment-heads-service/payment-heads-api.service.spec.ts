import { TestBed } from '@angular/core/testing';

import { paymentHeadApiService } from './payment-heads-api.service';

describe('paymentHeadApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: paymentHeadApiService = TestBed.get(paymentHeadApiService);
    expect(service).toBeTruthy();
  });
});
