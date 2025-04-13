import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequesterTransportHistoryComponent } from './requester-transport-history.component';

describe('RequesterTransportHistoryComponent', () => {
  let component: RequesterTransportHistoryComponent;
  let fixture: ComponentFixture<RequesterTransportHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequesterTransportHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequesterTransportHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
