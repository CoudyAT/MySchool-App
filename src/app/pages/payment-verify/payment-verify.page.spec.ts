import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentVerifyPage } from './payment-verify.page';

describe('PaymentVerifyPage', () => {
  let component: PaymentVerifyPage;
  let fixture: ComponentFixture<PaymentVerifyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentVerifyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
