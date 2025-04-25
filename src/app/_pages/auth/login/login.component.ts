import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../../_shared/services/auth.service';
// import { ConfigSignal } from '../../../_signals/config';
import { AuthManagerSignal } from '../../../_signals/authManager.signal';
import { loginTranslations } from './translations';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

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
    public authManagerSignal: AuthManagerSignal,
    private titleService: Title,
    private metaService: Meta,
    private route: ActivatedRoute
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Get the "lang" route param
    const langParam = this.route.snapshot.paramMap.get('lang');

    if (langParam) {
      this.currentLanguage = langParam;
    }

    this.setInitialPageConfiguration();


    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleAuth();
    }
  }


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

  // SEO

  // Language
  currentLanguage: any = 'pt-PT';

  // Get a specific translation by key
  getTranslation(key: string) {
    return loginTranslations[this.currentLanguage]?.[key] || loginTranslations['en']?.[key];
  }

  setInitialPageConfiguration() {
    const titleToSet = loginTranslations[this.currentLanguage]?.meta_title || loginTranslations['en']?.meta_title;
    const descriptionToSet = loginTranslations[this.currentLanguage]?.meta_description || loginTranslations['en']?.meta_description;
    const shareImage = 'https://www.floand-go.com/flo-logo-11.jpg';

    this.titleService.setTitle(titleToSet);
    this.metaService.updateTag({ name: 'description', content: descriptionToSet });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({ name: 'author', content: 'Flo and Go' });
    this.metaService.updateTag({ httpEquiv: 'content-language', content: this.currentLanguage });

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: titleToSet });
    this.metaService.updateTag({ property: 'og:description', content: descriptionToSet });
    this.metaService.updateTag({ property: 'og:url', content: 'https://www.floand-go.com/available-anytime-moving-services' });
    // this.metaService.updateTag({ property: 'og:type', content: contentType });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Flo and Go' });
    // this.metaService.updateTag({ property: 'og:locale', content: this.formatLocale(currentLanguage) });
    this.metaService.updateTag({ property: 'og:image', content: shareImage });

    // if (alternateLocales) {
    //   alternateLocales.forEach(alt => {
    //     this.metaService.addTag({ property: 'og:locale:alternate', content: alt.locale });
    //     // You might need to handle the alternate URL separately if needed by some platforms
    //   });
    // }

    // Twitter
    // this.metaService.updateTag({ name: 'twitter:card', content: twitterCard });
    this.metaService.updateTag({ name: 'twitter:title', content: titleToSet });
    this.metaService.updateTag({ name: 'twitter:description', content: descriptionToSet });
    this.metaService.updateTag({ name: 'twitter:site', content: '@floandgo' }); // Replace with your Twitter handle
    this.metaService.updateTag({ name: 'twitter:image', content: shareImage });
  }

}
