import { TestBed } from '@angular/core/testing';

import { JobProfileService } from './job-profile.service';

describe('JobProfileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JobProfileService = TestBed.get(JobProfileService);
    expect(service).toBeTruthy();
  });
});
