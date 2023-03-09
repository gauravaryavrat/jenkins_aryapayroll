import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBranchDataComponent } from './update-branch-data.component';

describe('UpdateBranchDataComponent', () => {
  let component: UpdateBranchDataComponent;
  let fixture: ComponentFixture<UpdateBranchDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateBranchDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateBranchDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
