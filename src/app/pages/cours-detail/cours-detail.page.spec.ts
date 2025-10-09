import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoursDetailPage } from './cours-detail.page';

describe('CoursDetailPage', () => {
  let component: CoursDetailPage;
  let fixture: ComponentFixture<CoursDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
