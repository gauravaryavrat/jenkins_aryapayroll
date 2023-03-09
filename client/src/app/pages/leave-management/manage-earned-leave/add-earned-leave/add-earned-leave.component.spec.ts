import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEarnedLeaveComponent } from './add-earned-leave.component';

describe('AddEarnedLeaveComponent', () => {
  let component: AddEarnedLeaveComponent;
  let fixture: ComponentFixture<AddEarnedLeaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEarnedLeaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEarnedLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
