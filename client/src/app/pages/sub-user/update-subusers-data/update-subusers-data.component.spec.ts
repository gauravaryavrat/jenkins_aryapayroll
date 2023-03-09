import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSubusersDataComponent } from './update-subusers-data.component';

describe('UpdateSubusersDataComponent', () => {
  let component: UpdateSubusersDataComponent;
  let fixture: ComponentFixture<UpdateSubusersDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateSubusersDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateSubusersDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
