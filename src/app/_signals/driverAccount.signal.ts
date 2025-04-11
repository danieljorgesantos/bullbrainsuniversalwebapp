import { Injectable, signal } from '@angular/core';
import { DriverAccountService } from '../_shared/services/driver-account.service';
import { AuthManagerSignal } from './authManager.signal';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverAccountSignal {
  private _driverAccounts = signal<any[]>([]); // Signal for all driver accounts (admin view)
  private _userDriverAccount = signal<any | null>(null); // Signal for authenticated user's driver account

  constructor(
    private driverAccountService: DriverAccountService,
    public authManagerSignal: AuthManagerSignal
  ) {}

  // 🔹 Getter to access all driver accounts (Admin View)
  get driverAccounts() {
    return this._driverAccounts();
  }

  // 🔹 Getter for the authenticated user's driver account
  get userDriverAccount() {
    return this._userDriverAccount();
  }

  // ---------------------------------------------------------------------------------------------------------------------
  // CRUD FOR ALL DRIVER ACCOUNTS (ADMIN) --------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------------

  async loadDriverAccounts() {
    try {
      const data = await this.driverAccountService.getAll().toPromise();
      this._driverAccounts.set(data || []);
    } catch (error) {
      console.error('Error loading driver accounts:', error);
    }
  }

  async addDriverAccount(account: any) {
    try {
      const newAccount = await this.driverAccountService.create(account).toPromise();
      if (!newAccount) throw new Error('Received undefined when creating a new driver account');

      this._driverAccounts.set([...this._driverAccounts(), newAccount]);
    } catch (error) {
      console.error('Error adding driver account:', error);
    }
  }

  async updateDriverAccount(id: number, updatedAccount: any) {
    try {
      await this.driverAccountService.update(id, updatedAccount).toPromise();
      this._driverAccounts.set(
        this._driverAccounts().map(account =>
          account.id === id ? { ...account, ...updatedAccount } : account
        )
      );
    } catch (error) {
      console.error('Error updating driver account:', error);
    }
  }

  async deleteDriverAccount(id: number) {
    try {
      await this.driverAccountService.delete(id).toPromise();
      this._driverAccounts.set(
        this._driverAccounts().filter(account => account.id !== id)
      );
    } catch (error) {
      console.error('Error deleting driver account:', error);
    }
  }

  clearDriverAccounts() {
    this._driverAccounts.set([]);
  }

  // ---------------------------------------------------------------------------------------------------------------------
  // CRUD FOR INDIVIDUAL DRIVER ACCOUNTS (FOR LOGGED-IN DRIVER) ----------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------------

  async loadUserDriverAccount() {
    try {
      const userId = this.authManagerSignal.currentUser?.id ?? null;
      if (!userId) {
        console.warn('No authenticated user found.');
        return;
      }

      const userAccount = await this.driverAccountService.getById(userId).toPromise();
      if (!userAccount) throw new Error('User driver account not found.');

      this._userDriverAccount.set(userAccount);
    } catch (error) {
      console.error('Error loading user driver account:', error);
    }
  }


  updateUserDriverAccount(updatedAccount: Partial<any>): void {
    const userId = this.authManagerSignal.currentUser?.id ?? null;
    if (!userId) {
      console.error('No authenticated user found.');
      return;
    }
  
    firstValueFrom(this.driverAccountService.update(userId, updatedAccount as any)).then(() => {
      this._userDriverAccount.set({
        ...this._userDriverAccount(),
        ...updatedAccount
      } as any);
    }).catch(error => {
      console.error('Error updating user driver account:', error);
    });
  }
  

  async deleteUserDriverAccount() {
    try {
      const userId = this.authManagerSignal.currentUser?.id ?? null;
      if (!userId) throw new Error('No authenticated user found.');

      await this.driverAccountService.delete(userId).toPromise();
      this._userDriverAccount.set(null);
    } catch (error) {
      console.error('Error deleting user driver account:', error);
    }
  }

  clearUserDriverAccount() {
    this._userDriverAccount.set(null);
  }

  incrementUserTripCount(): void {
    const userId = this.authManagerSignal.currentUser?.id ?? null;
    const current = this._userDriverAccount();
  
    if (!userId || !current) return;
  
    const updatedTrips = (current.totalTripsCompleted ?? 0) + 1;
  
    firstValueFrom(this.driverAccountService.update(userId, { totalTripsCompleted: updatedTrips }))
      .then(() => {
        this._userDriverAccount.set({
          ...current,
          totalTripsCompleted: updatedTrips
        });
      });
  }
  
}
