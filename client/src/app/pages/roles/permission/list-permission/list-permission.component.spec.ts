import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPermissionComponent } from './list-permission.component';

describe('ListPermissionComponent', () => {
  let component: ListPermissionComponent;
  let fixture: ComponentFixture<ListPermissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListPermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
