import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../../_shared/services/auth.service';
// import { ConfigSignal } from '../../../_signals/config';
import { AuthManagerSignal } from '../../../_signals/authManager.signal';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  // Language
  currentLanguage: any = 'pt-PT';

  loginForm: FormGroup;
  errorMessage: string = '';
  showPassword: boolean = false;
  authInstance: any;
  user: any = null;
  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    // public configSignal: ConfigSignal,
    public authManagerSignal: AuthManagerSignal
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // this.setInitialPageConfig();

    if (this.isBrowser) {
      this.loadGoogleAuth();
    }
  }

  // private setInitialPageConfig(): void {
  //   this.configSignal.setMode('single_page_layout');
  // }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  submit(): void {
    if (this.loginForm.valid) {
      this.authManagerSignal.signIn(this.loginForm.value);
    }
  }

  loadGoogleAuth(): void {
    if (!this.isBrowser) return;

    const checkGoogleLoaded = () => {
      if ((window as any).google?.accounts) {
        (window as any).google.accounts.id.initialize({
          client_id: '273478331479-pmld2ebi9ah730jbo4r433r8atg4bo8p.apps.googleusercontent.com',
          callback: this.handleCredentialResponse.bind(this)
        });

        setTimeout(() => {
          const buttonContainer = document.getElementById('google-signin-btn');
          if (buttonContainer) {
            buttonContainer.innerHTML = '';

            (window as any).google.accounts.id.renderButton(buttonContainer, {
              theme: 'outline',
              size: 'large'
            });
          } else {
            console.error('Google Sign-In button container not found!');
          }
        }, 0);
      } else {
        setTimeout(checkGoogleLoaded, 500);
      }
    };

    checkGoogleLoaded();
  }

  handleCredentialResponse(response: any): void {
    const token = response.credential;
    const userData = this.parseJwt(token);
    if (userData) {
      this.authManagerSignal.handleGoogleLogin(userData);
    }
  }

  parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('🚨 Failed to parse JWT:', error);
      return null;
    }
  }

  decodeJwtToken(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    this.user = JSON.parse(jsonPayload);
    return jsonPayload;
  }
}
