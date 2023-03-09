import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowDepartmentsComponent } from './show-departments.component';

describe('ShowDepartmentsComponent', () => {
  let component: ShowDepartmentsComponent;
  let fixture: ComponentFixture<ShowDepartmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowDepartmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowDepartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
