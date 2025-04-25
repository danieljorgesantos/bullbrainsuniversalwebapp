import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthManagerSignal } from '../../../_signals/authManager.signal';
import { AuthService } from '../../../_shared/services/auth.service';
import { registerTranslations } from './translations';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  passwordStrengthMessage = '';
  isPasswordValid = false;
  errorMessage = '';
  isLoading = false;
  token: any = '';
  authInstance: any;
  user: any = null;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;


  constructor(
    private router: Router,
    private fb: FormBuilder,
    public authManagerSignal: AuthManagerSignal,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private titleService: Title,
    private metaService: Meta,
    private route: ActivatedRoute
  ) {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        type: ['Requester', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
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

  loadGoogleAuth() {
    // Load Google script dynamically
    const scriptId = 'google-client-id-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => this.initializeGoogle();
      document.head.appendChild(script);
    } else {
      this.initializeGoogle();
    }
  }

  initializeGoogle() {
    if ((window as any).google && (window as any).google.accounts) {
      (window as any).google.accounts.id.initialize({
        client_id:
          '273478331479-pmld2ebi9ah730jbo4r433r8atg4bo8p.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this),
      });

      const buttonContainer = document.getElementById('google-signin-btn');
      if (buttonContainer) {
        buttonContainer.innerHTML = '';
        (window as any).google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
        });
      }
    } else {
      console.warn('Google Auth not ready, retrying...');
      setTimeout(() => this.initializeGoogle(), 500);
    }
  }

  handleCredentialResponse(response: any) {
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
      console.error('Failed to parse JWT:', error);
      return null;
    }
  }

  // Other form-related code unchanged...
  checkPasswordStrength(): void {
    const password = this.registerForm.get('password')?.value || '';
    if (password.length < 6) {
      this.passwordStrengthMessage =
        'A palavra-passe deve ter pelo menos 6 caracteres.';
      this.isPasswordValid = false;
    } else if (!/[A-Z]/.test(password)) {
      this.passwordStrengthMessage =
        'A palavra-passe deve conter pelo menos uma letra maiúscula.';
      this.isPasswordValid = false;
    } else if (!/[0-9]/.test(password)) {
      this.passwordStrengthMessage =
        'A palavra-passe deve conter pelo menos um número.';
      this.isPasswordValid = false;
    } else {
      this.passwordStrengthMessage = '';
      this.isPasswordValid = true;
    }
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async submit() {
    if (this.registerForm.valid) {






      // Request permission and retrieve FCM token
      // const token = await this.firebaseService.requestPermission();
      // this.token = token;
      this.token = "";

      this.errorMessage = '';
      this.isLoading = true;
      const { email, password, type } = this.registerForm.value;

      const userObject = {
        // User account
        fullName: "", // Nome Completo
        email: email || "", // Email
        phone: "", // Telefone
        password: password || "", // Senha do usuário (precisa ser hash no backend)
        type: 1, // Tipo de usuário (1: Requester, 2: Driver, 3: Admin)

        // Personal Information
        dateOfBirth: "", // Data de Nascimento
        placeOfBirth: "", // Local de Nascimento
        nationality: "", // Nacionalidade
        emergencyContactName: "", // Nome do Contacto de Emergência
        emergencyContactPhone: "", // Telefone do Contacto de Emergência

        // Identification Documents
        idCardNumber: "", // Nº do Cartão de Cidadão ou Passaporte
        idCardExpiration: "", // Data de Validade do CC/Passaporte
        taxId: "", // Número de Identificação Fiscal (NIF)
        socialSecurityNumber: "", // Número de Segurança Social (NISS)

        // Driver-Specific Fields (for type 2 users)
        licenseNumber: "", // Número da Carta de Condução
        licenseCategory: "", // Categoria da Carta de Condução (B, C, C1, etc.)
        licenseIssueDate: "", // Data de Emissão da Carta de Condução
        licenseExpirationDate: "", // Data de Validade da Carta de Condução
        issuingCountry: "", // País de Emissão da Carta
        professionalDriverCertificate: "", // Certificado de Aptidão Profissional (CAP/CQM)
        adrCertificate: "", // Certificado ADR (se necessário)

        // Vehicle Information (if driver owns the van)
        vehiclePlateNumber: "", // Matrícula do Veículo
        vehicleMakeModel: "", // Marca e Modelo do Veículo
        vehicleVIN: "", // Número de Chassi (VIN)
        vehicleInsuranceCompany: "", // Companhia de Seguros do Veículo
        vehicleInsurancePolicy: "", // Número da Apólice de Seguro
        vehicleInspectionExpiry: "", // Data de Validade da Inspeção Periódica Obrigatória (IPO)
        vehicleOwnership: "", // Propriedade do Veículo (Empresa ou Pessoal)

        // File Uploads
        licenseFront: null, // Arquivo da Frente da Carta de Condução
        licenseBack: null, // Arquivo do Verso da Carta de Condução
        idCardFront: null, // Arquivo da Frente do Passaporte ou CC
        idCardBack: null, // Arquivo do Verso do Passaporte ou CC

        FcmToken: this.token, // FCM Token for Push Notifications
      };



      this.authService.register(userObject).subscribe({
        next: () => {
          this.isLoading = false; // Stop loading
          this.router.navigate(['/pt-PT/register-requester-success']);
        },
        error: (err: any) => {
          this.isLoading = false; // Stop loading on error
          this.errorMessage = err.error?.message || 'Erro ao registar a conta.';
        }
      });
    }
  }



















  // SEO

  // Language
  currentLanguage: any = 'pt-PT';

  // Get a specific translation by key
  getTranslation(key: string) {
    return registerTranslations[this.currentLanguage]?.[key] || registerTranslations['en']?.[key];
  }

  setInitialPageConfiguration() {
    const titleToSet = registerTranslations[this.currentLanguage]?.meta_title || registerTranslations['en']?.meta_title;
    const descriptionToSet = registerTranslations[this.currentLanguage]?.meta_description || registerTranslations['en']?.meta_description;
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
