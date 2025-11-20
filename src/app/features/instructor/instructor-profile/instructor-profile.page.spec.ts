import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstructorProfilePage } from './instructor-profile.page';

describe('InstructorProfilePage', () => {
  let component: InstructorProfilePage;
  let fixture: ComponentFixture<InstructorProfilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InstructorProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
