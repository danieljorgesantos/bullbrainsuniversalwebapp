import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequesterMapComponent } from './requester-map.component';

describe('RequesterMapComponent', () => {
  let component: RequesterMapComponent;
  let fixture: ComponentFixture<RequesterMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequesterMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequesterMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
