import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseVideoPage } from './course-video.page';

describe('CourseVideoPage', () => {
  let component: CourseVideoPage;
  let fixture: ComponentFixture<CourseVideoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseVideoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
