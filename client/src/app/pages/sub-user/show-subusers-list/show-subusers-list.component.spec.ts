import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowSubusersListComponent } from './show-subusers-list.component';

describe('ShowSubusersListComponent', () => {
  let component: ShowSubusersListComponent;
  let fixture: ComponentFixture<ShowSubusersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowSubusersListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowSubusersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
