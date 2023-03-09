import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProfileDataComponent } from './update-profile-data.component';

describe('UpdateProfileDataComponent', () => {
  let component: UpdateProfileDataComponent;
  let fixture: ComponentFixture<UpdateProfileDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateProfileDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateProfileDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
