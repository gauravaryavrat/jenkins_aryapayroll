import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEarnedLeaveComponent } from './list-earned-leave.component';

describe('ListEarnedLeaveComponent', () => {
  let component: ListEarnedLeaveComponent;
  let fixture: ComponentFixture<ListEarnedLeaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListEarnedLeaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListEarnedLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
