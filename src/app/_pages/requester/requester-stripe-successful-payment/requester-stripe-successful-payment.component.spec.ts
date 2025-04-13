import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequesterStripeSuccessfulPaymentComponent } from './requester-stripe-successful-payment.component';

describe('RequesterStripeSuccessfulPaymentComponent', () => {
  let component: RequesterStripeSuccessfulPaymentComponent;
  let fixture: ComponentFixture<RequesterStripeSuccessfulPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequesterStripeSuccessfulPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequesterStripeSuccessfulPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
