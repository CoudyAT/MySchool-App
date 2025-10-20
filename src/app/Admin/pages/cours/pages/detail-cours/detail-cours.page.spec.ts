import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailCoursPage } from './detail-cours.page';

describe('DetailCoursPage', () => {
  let component: DetailCoursPage;
  let fixture: ComponentFixture<DetailCoursPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailCoursPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
