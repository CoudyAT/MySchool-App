import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbonnementPage } from './abonnement.page';

describe('AbonnementPage', () => {
  let component: AbonnementPage;
  let fixture: ComponentFixture<AbonnementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AbonnementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
