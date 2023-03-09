import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkAbsentComponent } from './mark-absent.component';

describe('MarkAbsentComponent', () => {
  let component: MarkAbsentComponent;
  let fixture: ComponentFixture<MarkAbsentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkAbsentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkAbsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
