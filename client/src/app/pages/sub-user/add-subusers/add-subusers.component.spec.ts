import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSubusersComponent } from './add-subusers.component';

describe('AddSubusersComponent', () => {
  let component: AddSubusersComponent;
  let fixture: ComponentFixture<AddSubusersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSubusersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSubusersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
