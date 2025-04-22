import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DriverAccountSignal } from '../../../_signals/driverAccount.signal';

@Component({
  selector: 'app-drivers-payments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './drivers-payments.component.html'
})
export class DriversPaymentsComponent implements OnInit {
  // Language
  currentLanguage: any = 'pt-PT';

  private driverAccountSignal = inject(DriverAccountSignal);

  isLoading = true;
  userAccount: any = null;

  ngOnInit(): void {

    const cached = this.driverAccountSignal.userDriverAccount;
    if (cached) {
      this.userAccount = cached;
      this.isLoading = false;

      // Load updated data in background
      queueMicrotask(() => this.refreshUserAccount());
    } else {
      // Load and wait if nothing is cached
      this.loadUserAccount();
    }
  }

  private async loadUserAccount(): Promise<void> {
    this.isLoading = true;
    await this.driverAccountSignal.loadUserDriverAccount();
    this.userAccount = this.driverAccountSignal.userDriverAccount;
    this.isLoading = false;
  }

  private async refreshUserAccount(): Promise<void> {
    await this.driverAccountSignal.loadUserDriverAccount();
    this.userAccount = this.driverAccountSignal.userDriverAccount;
  }
}
