import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListLeaveComponent } from './list-leave.component';

describe('ListLeaveComponent', () => {
  let component: ListLeaveComponent;
  let fixture: ComponentFixture<ListLeaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListLeaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
