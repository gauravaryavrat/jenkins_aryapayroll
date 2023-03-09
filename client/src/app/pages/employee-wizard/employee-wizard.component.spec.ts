import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeWizardComponent } from './employee-wizard.component';

describe('EmployeeWizardComponent', () => {
  let component: EmployeeWizardComponent;
  let fixture: ComponentFixture<EmployeeWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
