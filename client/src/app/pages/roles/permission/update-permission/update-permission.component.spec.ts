import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePermissionComponent } from './update-permission.component';

describe('UpdatePermissionComponent', () => {
  let component: UpdatePermissionComponent;
  let fixture: ComponentFixture<UpdatePermissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdatePermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatePermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
