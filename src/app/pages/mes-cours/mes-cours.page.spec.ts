import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MesCoursPage } from './mes-cours.page';

describe('MesCoursPage', () => {
  let component: MesCoursPage;
  let fixture: ComponentFixture<MesCoursPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MesCoursPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
