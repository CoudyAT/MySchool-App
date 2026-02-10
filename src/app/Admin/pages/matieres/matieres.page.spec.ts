import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatieresPage } from './matieres.page';

describe('MatieresPage', () => {
  let component: MatieresPage;
  let fixture: ComponentFixture<MatieresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MatieresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
