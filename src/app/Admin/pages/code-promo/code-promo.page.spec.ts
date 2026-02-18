import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodePromoPage } from './code-promo.page';

describe('CodePromoPage', () => {
  let component: CodePromoPage;
  let fixture: ComponentFixture<CodePromoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CodePromoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
