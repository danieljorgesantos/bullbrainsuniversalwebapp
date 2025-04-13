import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequesterTransportDetailComponent } from './requester-transport-detail.component';

describe('RequesterTransportDetailComponent', () => {
  let component: RequesterTransportDetailComponent;
  let fixture: ComponentFixture<RequesterTransportDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequesterTransportDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequesterTransportDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
