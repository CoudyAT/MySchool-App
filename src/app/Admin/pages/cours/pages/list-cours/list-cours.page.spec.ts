import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListCoursPage } from './list-cours.page';

describe('ListCoursPage', () => {
  let component: ListCoursPage;
  let fixture: ComponentFixture<ListCoursPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListCoursPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
