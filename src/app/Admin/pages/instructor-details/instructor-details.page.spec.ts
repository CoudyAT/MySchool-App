import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstructorDetailsPage } from './instructor-details.page';

describe('InstructorDetailsPage', () => {
  let component: InstructorDetailsPage;
  let fixture: ComponentFixture<InstructorDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InstructorDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
