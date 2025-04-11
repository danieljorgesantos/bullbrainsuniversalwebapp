// driver-registration-success.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-driver-registration-success',
    templateUrl: './driver-registration-success.component.html',
    styleUrls: [],
    standalone: false
})
export class DriverRegistrationSuccessComponent {
  constructor(private router: Router) {}

  goToDashboard() {
    this.router.navigate(['/driversTransportsComponent']);
  }
}
