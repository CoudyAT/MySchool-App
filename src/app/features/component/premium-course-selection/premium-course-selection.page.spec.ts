import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PremiumCourseSelectionPage } from './premium-course-selection.page';

describe('PremiumCourseSelectionPage', () => {
  let component: PremiumCourseSelectionPage;
  let fixture: ComponentFixture<PremiumCourseSelectionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PremiumCourseSelectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
