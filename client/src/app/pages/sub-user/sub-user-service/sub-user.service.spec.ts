import { TestBed } from '@angular/core/testing';

import { SubUserService } from './sub-user.service';

describe('SubUserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SubUserService = TestBed.get(SubUserService);
    expect(service).toBeTruthy();
  });
});
