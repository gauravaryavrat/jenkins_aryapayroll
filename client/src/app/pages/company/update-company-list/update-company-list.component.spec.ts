import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCompanyListComponent } from './update-company-list.component';

describe('UpdateCompanyListComponent', () => {
  let component: UpdateCompanyListComponent;
  let fixture: ComponentFixture<UpdateCompanyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateCompanyListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateCompanyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
