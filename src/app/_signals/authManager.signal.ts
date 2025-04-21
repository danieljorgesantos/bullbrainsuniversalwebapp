import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../_shared/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthManagerSignal {
  private user = signal<any | null>(null);
  private isLoading = signal<boolean>(false);
  private errorMessage = signal<string | null>(null);
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.loadUserFromLocalStorage();
    }
  }

  get currentUser() {
    return this.user();
  }

  get currentUser2() {
    return this.user; // return the SIGNAL, not its value
  }

  get authToken(): string | null {
    return this.currentUser?.authToken || null;
  }

  get isLoadingState(): boolean {
    return this.isLoading();
  }

  get errorMessageState(): string | null {
    return this.errorMessage();
  }

  get isAuthenticated(): boolean {
    return !!this.authToken;
  }

  async signIn(credentials: { email: string; password: string }) {
    this.isLoading.set(true);
    this.errorMessage.set('');
  
    try {
      const response = await firstValueFrom(this.authService.login(credentials));
  
      if (!response) {
        throw new Error('No response from login.');
      }
  
      this.user.set(response);
      console.log('👤 User set in signal:', this.user());
      this.persistUserToLocalStorage();
      await this.loadAccountData(response.type);
      this.redirectUser(response.type);
  
    } catch (err: any) {
      const msg = err?.error?.message || err?.message || 'Credenciais inválidas. Tente novamente.';
      this.errorMessage.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }
  

  async handleGoogleLogin(googleUser: any) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (!googleUser?.email?.trim()) {
      this.errorMessage.set("Google login failed. Please try again.");
      this.isLoading.set(false);
      return;
    }

    try {
      const loginRes = await firstValueFrom(
        this.authService.login({ email: googleUser.email.trim(), password: googleUser.sub })
      );

      this.user.set(loginRes);
      this.persistUserToLocalStorage();
      this.redirectUser(loginRes.type);
    } catch (loginError: any) {
      try {
        const registrationData = {
          fullName: googleUser.name || 'Google User',
          email: googleUser.email.trim(),
          password: googleUser.sub,
          userPhoto: googleUser.picture,
          type: 1
        };

        await firstValueFrom(this.authService.register(registrationData));

        const loginAfterRegister = await firstValueFrom(
          this.authService.login({ email: googleUser.email.trim(), password: googleUser.sub })
        );

        this.user.set(loginAfterRegister);
        this.persistUserToLocalStorage();
        this.redirectUser(loginAfterRegister.type);
      } catch (registrationError: any) {
        this.errorMessage.set("Google registration failed. Please try again.");
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async register(userData: any) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const user = await firstValueFrom(this.authService.register(userData));
      this.user.set(user);
      this.persistUserToLocalStorage();
      this.redirectUser(user.type);
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Registration failed');
    } finally {
      this.isLoading.set(false);
    }
  }

  redirectUser(userRole: number) {
    const routes: Record<number, string> = {
      0: '/admin-home',
      1: '/pt-PT/requester-home',
      2: '/pt-PT/drivers-home'
    };

    const target = routes[userRole] ?? '/login';
    this.router.navigate([target]);
  }

  persistUserToLocalStorage() {
    if (!this.isBrowser) return;
    localStorage.setItem('authData', JSON.stringify(this.user()));
  }

  loadUserFromLocalStorage() {
    if (!this.isBrowser) return;
    const data = localStorage.getItem('authData');
    if (data) {
      this.user.set(JSON.parse(data));
    }
  }

  async loadAccountData(role: number) {
    try {
      switch (role) {
        case 0:
          await this.loadAdminAccount();
          break;
        case 1:
          await this.loadRequesterAccount();
          break;
        case 2:
          await this.loadDriverAccount();
          break;
        default:
          console.warn("Unknown role:", role);
      }
    } catch (err) {
      console.error('Error loading account data:', err);
    }
  }

  async loadRequesterAccount() {
    console.log('📦 Load requester account data...');
  }

  async loadDriverAccount() {
    console.log('🚚 Load driver account data...');
  }

  async loadAdminAccount() {
    console.log('🛠️ Load admin account data...');
  }

  logout() {
    this.user.set(null);
    if (this.isBrowser) {
      localStorage.removeItem('authData');
    }
  }
}
