import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobProfileListComponent } from './job-profile-list.component';

describe('JobProfileListComponent', () => {
  let component: JobProfileListComponent;
  let fixture: ComponentFixture<JobProfileListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobProfileListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobProfileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
