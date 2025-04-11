import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { AuthService } from '../../../_shared/services/auth.service'; // Use AuthService
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { HttpClientModule } from '@angular/common/http';
import { AuthManagerSignal } from '../../../_signals/authManager.signal';
// import { FirebaseService } from '../../../_shared/services/firebase.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  standalone: true
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  passwordStrengthMessage: string = '';
  isPasswordValid: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  token: any = "";

  constructor(
    private router: Router,
    private fb: FormBuilder,
    // private authService: AuthService,
    public authManagerSignal: AuthManagerSignal,
    // private firebaseService: FirebaseService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      type: ['Requester', Validators.required] // Always "Requester"
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // this.loadGoogleAuth();
  }

  checkPasswordStrength(): void {
    const password = this.registerForm.get('password')?.value || '';
    if (password.length < 6) {
      this.passwordStrengthMessage = 'A palavra-passe deve ter pelo menos 6 caracteres.';
      this.isPasswordValid = false;
    } else if (!/[A-Z]/.test(password)) {
      this.passwordStrengthMessage = 'A palavra-passe deve conter pelo menos uma letra maiúscula.';
      this.isPasswordValid = false;
    } else if (!/[0-9]/.test(password)) {
      this.passwordStrengthMessage = 'A palavra-passe deve conter pelo menos um número.';
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
      const token = '';
      this.token = token;

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



      // this.authService.register(userObject).subscribe({
      //   next: () => {
      //     this.isLoading = false; // Stop loading
      //     this.router.navigate(['/register-requester-success']);
      //   },
      //   error: (err: any) => {
      //     this.isLoading = false; // Stop loading on error
      //     this.errorMessage = err.error?.message || 'Erro ao registar a conta.';
      //   }
      // });
    }
  }

  // google auth -------------------------------------------------------------------------------------------------------



  authInstance: any;
  user: any = null;



  loadGoogleAuth() {

    // const checkGoogleLoaded = () => {
    //   if ((window as any).google && (window as any).google.accounts) {

    //     (window as any).google.accounts.id.initialize({
    //       client_id: '273478331479-pmld2ebi9ah730jbo4r433r8atg4bo8p.apps.googleusercontent.com',
    //       callback: this.handleCredentialResponse.bind(this)
    //     });

    //     setTimeout(() => {
    //       const buttonContainer = document.getElementById('google-signin-btn');
    //       if (buttonContainer) {

    //         // Clear the div before rendering in case of duplicate buttons
    //         buttonContainer.innerHTML = "";

    //         (window as any).google.accounts.id.renderButton(
    //           buttonContainer,
    //           { theme: 'outline', size: 'large' }
    //         );

    //       } else {
    //         console.error("Google Sign-In button container not found!");
    //       }
    //     }, 0);
    //   } else {
    //     setTimeout(checkGoogleLoaded, 500);
    //   }
    // };

    // checkGoogleLoaded();
  }

  handleCredentialResponse(response: any) {
    // const token = response.credential;

    // // Convert JWT token into a JS object
    // const userData = this.parseJwt(token);

    // if (!userData) {
    //   return;
    // }

    // // Call AuthManagerSignal's new method to handle the user login
    // this.authManagerSignal.handleGoogleLogin(userData);
  }

  // ✅ Helper function to convert Google JWT to a JS object
  parseJwt(token: string): any {
    // try {
    //   const base64Url = token.split('.')[1]; // Extract payload
    //   const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    //   const jsonPayload = decodeURIComponent(
    //     atob(base64)
    //       .split('')
    //       .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
    //       .join('')
    //   );
    //   return JSON.parse(jsonPayload); // ✅ Convert to JavaScript object
    // } catch (error) {
    //   console.error("🚨 Failed to parse JWT:", error);
    //   return null;
    // }
  }

  decodeJwtToken(token: string) {
    // const base64Url = token.split('.')[1];
    // const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // const jsonPayload = decodeURIComponent(
    //   atob(base64)
    //     .split('')
    //     .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
    //     .join('')
    // );
    // this.user = JSON.parse(jsonPayload);
    // return jsonPayload
  }
}
