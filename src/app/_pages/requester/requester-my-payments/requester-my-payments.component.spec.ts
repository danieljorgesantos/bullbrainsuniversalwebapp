import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequesterMyPaymentsComponent } from './requester-my-payments.component';

describe('RequesterMyPaymentsComponent', () => {
  let component: RequesterMyPaymentsComponent;
  let fixture: ComponentFixture<RequesterMyPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequesterMyPaymentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequesterMyPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
