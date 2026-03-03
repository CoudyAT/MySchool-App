import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExoPage } from './exo.page';

describe('ExoPage', () => {
  let component: ExoPage;
  let fixture: ComponentFixture<ExoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
