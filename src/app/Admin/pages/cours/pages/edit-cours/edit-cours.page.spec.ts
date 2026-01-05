import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditCoursPage } from './edit-cours.page';

describe('EditCoursPage', () => {
  let component: EditCoursPage;
  let fixture: ComponentFixture<EditCoursPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCoursPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
