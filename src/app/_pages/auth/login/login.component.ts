import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AuthManagerSignal } from '../../../_signals/authManager.signal';
import { AuthService } from '../../../_shared/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  standalone: true,
  // providers: [AuthManagerSignal, AuthService],
})
export class LoginComponent {
  private route = inject(ActivatedRoute);

  // Language
  currentLanguage: any = 'pt-PT';

  loginForm: FormGroup;
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    // private authService: AuthService,
    public authManagerSignal: AuthManagerSignal
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Get the "lang" route param
    const langParam = this.route.snapshot.paramMap.get('lang');

    if (langParam) {
      this.currentLanguage = langParam;
    }
    //   this.loadGoogleAuth();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  submit() {
    this.router.navigate(['/', this.currentLanguage, 'requester-home']);

    // if (this.loginForm.valid) {
    //   this.authManagerSignal.signIn(this.loginForm.value);
    // }
  }


  // // google auth -------------------------------------------------------------------------------------------------------



  // authInstance: any;
  // user: any = null;



  // loadGoogleAuth() {
  //   const checkGoogleLoaded = () => {
  //     if ((window as any).google && (window as any).google.accounts) {

  //       (window as any).google.accounts.id.initialize({
  //         client_id: '273478331479-pmld2ebi9ah730jbo4r433r8atg4bo8p.apps.googleusercontent.com',
  //         callback: this.handleCredentialResponse.bind(this)
  //       });

  //       setTimeout(() => {
  //         const buttonContainer = document.getElementById('google-signin-btn');
  //         if (buttonContainer) {

  //           // Clear the div before rendering in case of duplicate buttons
  //           buttonContainer.innerHTML = "";

  //           (window as any).google.accounts.id.renderButton(
  //             buttonContainer,
  //             { theme: 'outline', size: 'large' }
  //           );

  //         } else {
  //           console.error("Google Sign-In button container not found!");
  //         }
  //       }, 0);
  //     } else {
  //       setTimeout(checkGoogleLoaded, 500);
  //     }
  //   };

  //   checkGoogleLoaded();
  // }



  // handleCredentialResponse(response: any) {
  //   const token = response.credential;

  //   // Convert JWT token into a JS object
  //   const userData = this.parseJwt(token);

  //   if (!userData) {
  //     return;
  //   }
  //   // Call AuthManagerSignal's new method to handle the user login
  //   this.authManagerSignal.handleGoogleLogin(userData);
  // }

  // // ✅ Helper function to convert Google JWT to a JS object
  // parseJwt(token: string): any {
  //   try {
  //     const base64Url = token.split('.')[1]; // Extract payload
  //     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  //     const jsonPayload = decodeURIComponent(
  //       atob(base64)
  //         .split('')
  //         .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
  //         .join('')
  //     );
  //     return JSON.parse(jsonPayload); // ✅ Convert to JavaScript object
  //   } catch (error) {
  //     console.error("🚨 Failed to parse JWT:", error);
  //     return null;
  //   }
  // }

  // decodeJwtToken(token: string) {
  //   const base64Url = token.split('.')[1];
  //   const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  //   const jsonPayload = decodeURIComponent(
  //     atob(base64)
  //       .split('')
  //       .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
  //       .join('')
  //   );
  //   this.user = JSON.parse(jsonPayload);
  //   return jsonPayload
  // }
}
