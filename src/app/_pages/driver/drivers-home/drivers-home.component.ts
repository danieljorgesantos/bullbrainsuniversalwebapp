import { Component, OnInit, effect, computed, signal, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TransportRequestSignal } from '../../../_signals/transportRequest';
import { CommonModule } from '@angular/common';
import { AuthManagerSignal } from '../../../_signals/authManager.signal';
import { DriverAccountSignal } from '../../../_signals/driverAccount.signal';

@Component({
  selector: 'app-drivers-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './drivers-home.component.html',
  standalone: true,
})
export class DriversHomeComponent implements OnInit {
   // Language
   currentLanguage: any = 'pt-PT';
   
  readonly transportRequestSignal = inject(TransportRequestSignal);

  driverAccount: any = null;
  availableTransports = signal(0); // reactive
  user: any | null = null;

  constructor(
    private router: Router,
    public authManagerSignal: AuthManagerSignal,
    private driverAccountStore: DriverAccountSignal,
  ) {
    // ✅ effect() placed inside the constructor — this is a valid injection context
    effect(() => {
      this.availableTransports.set(
        this.transportRequestSignal.transportRequests.length || 0
      );
    });
  }

  ngOnInit(): void {
    this.user = this.authManagerSignal.currentUser ?? null;

    this.initData();
  }

  private async initData() {
    const existingDriverAccount = this.driverAccountStore.userDriverAccount;

    if (existingDriverAccount) {
      this.driverAccount = existingDriverAccount;
    } else {
      await this.driverAccountStore.loadUserDriverAccount();
      this.driverAccount = this.driverAccountStore.userDriverAccount;
    }

    this.transportRequestSignal.loadTransportRequests();
  }
}
