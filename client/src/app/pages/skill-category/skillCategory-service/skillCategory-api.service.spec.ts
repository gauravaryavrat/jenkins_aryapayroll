import { TestBed } from '@angular/core/testing';

import { skillCategoryApiService } from './skillCategory-api.service';

describe('JobCategoryApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: skillCategoryApiService = TestBed.get(skillCategoryApiService);
    expect(service).toBeTruthy();
  });
});
