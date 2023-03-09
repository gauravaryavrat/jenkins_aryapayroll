import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEarnedLeaveComponent } from './update-earned-leave.component';

describe('UpdateEarnedLeaveComponent', () => {
  let component: UpdateEarnedLeaveComponent;
  let fixture: ComponentFixture<UpdateEarnedLeaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateEarnedLeaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateEarnedLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
