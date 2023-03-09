import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddJobProfileComponent } from './add-job-profile.component';

describe('AddJobProfileComponent', () => {
  let component: AddJobProfileComponent;
  let fixture: ComponentFixture<AddJobProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddJobProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddJobProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
