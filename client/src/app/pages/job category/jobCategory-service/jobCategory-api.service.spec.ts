import { TestBed } from '@angular/core/testing';

import { JobCategoryApiService } from './jobCategory-api.service';

describe('JobCategoryApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JobCategoryApiService = TestBed.get(JobCategoryApiService);
    expect(service).toBeTruthy();
  });
});
