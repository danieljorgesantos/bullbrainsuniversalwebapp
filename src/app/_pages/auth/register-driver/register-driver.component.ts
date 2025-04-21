import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../_shared/services/auth.service';
// import { FirebaseService } from '../../../_shared/services/firebase.service';

@Component({
  selector: 'app-register-driver',
  imports: [FormsModule, CommonModule],
  templateUrl: './register-driver.component.html',
  standalone: true,
})
export class RegisterDriverComponent {
  // Language
  currentLanguage: any = 'pt-PT';

  isLoading = false;
  errorMessage: string | null = null;

  driver = {
    // User Account
    fullName: '',
    email: '',
    phone: '',
    password: '',
    type: 2,

    // Personal Information
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    emergencyContactName: '',
    emergencyContactPhone: '',

    // Identification Documents
    idCardNumber: '',
    idCardExpiration: '',
    taxId: '',
    socialSecurityNumber: '',

    // Driver-Specific Fields
    licenseNumber: '',
    licenseCategory: '',
    licenseIssueDate: '',
    licenseExpirationDate: '',
    issuingCountry: '',
    professionalDriverCertificate: '',
    adrCertificate: '',

    // Vehicle Information
    vehiclePlateNumber: '',
    vehicleMakeModel: '',
    vehicleVIN: '',
    vehicleInsuranceCompany: '',
    vehicleInsurancePolicy: '',
    vehicleInspectionExpiry: '',
    vehicleOwnership: '',

    // File Uploads
    userPhoto: null as File | null,
    licenseFront: null as File | null,
    licenseBack: null as File | null,
    idCardFront: null as File | null,
    idCardBack: null as File | null,


  };

  // ✅ Fixed: Added `filePreview` property for image previews
  filePreview = {
    userPhoto: '',
    licenseFront: '',
    licenseBack: '',
    idCardFront: '',
    idCardBack: ''
  };

  token: any = "";

  constructor(
    private router: Router,
    private authService: AuthService,
    // private firebaseService: FirebaseService
  ) { }

  async ngOnInit() {
    // 🔥 Request permission and retrieve FCM token when component initializes
    // try {
    //   const permission = await Notification.requestPermission();
    //   if (permission !== 'granted') {
    //     return;
    //   }

    //   // Request permission and retrieve FCM token
    //   // const token = await this.firebaseService.requestPermission();
    //   this.token = 'token';

    //   // Start listening for messages
    //   // this.firebaseService.listenForMessages();

    // } catch (error) {
    //   console.error('❌ Error retrieving FCM Token:', error);
    // }
  }

  handleFileInput(event: any, field: keyof typeof this.driver) {
    const file = event.target.files[0];

    if (file) {
      if (typeof this.driver[field] === "object" || this.driver[field] === null) {

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target?.result as string;

          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) return;

            // Set desired scaled-down size (e.g., 300x300)
            const maxWidth = 300;
            const maxHeight = 300;
            let width = img.width;
            let height = img.height;

            // Scale while maintaining aspect ratio
            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }

            // Set canvas size and draw image
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Convert canvas to Base64 and store it
            const scaledBase64 = canvas.toDataURL("image/jpeg", 0.8); // 0.8 = 80% quality

            (this.driver as any)[field] = scaledBase64; // Save Base64 instead of file
            (this.filePreview as any)[field] = scaledBase64; // Update preview

            console.log(`📸 ${field} carregado e redimensionado:`, scaledBase64.substring(0, 50) + "..."); // Short log
          };
        };

        console.log(`📸 ${field} carregado:`, file.name);
      } else {
        console.error(`🚨 Campo '${field}' não é um campo de upload de arquivo.`);
      }
    }
  }



  validateForm(): boolean {
    if (!this.driver.fullName || this.driver.fullName.trim().length < 3) {
      return false;
    }
    if (!this.driver.email || !this.driver.email.includes('@')) {
      return false;
    }
    if (!this.driver.phone || this.driver.phone.length < 9) {
      return false;
    }
    if (!this.driver.licenseNumber) {
      return false;
    }
    return true;
  }

  removeUserPhoto() {
    this.driver.userPhoto = null;
    this.filePreview.userPhoto = '';
  }

  removeLicenseFront() {
    this.driver.licenseFront = null;
    this.filePreview.licenseFront = '';
  }

  removeLicenseBack() {
    this.driver.licenseBack = null;
    this.filePreview.licenseBack = '';
  }

  removeIdCardFront() {
    this.driver.idCardFront = null;
    this.filePreview.idCardFront = '';
  }

  removeIdCardBack() {
    this.driver.idCardBack = null;
    this.filePreview.idCardBack = '';
  }

  async submitForm() {
    if (!this.validateForm()) {
      return;
    }

    // // 🔥 Request permission and retrieve FCM token
    // const token = await this.firebaseService.requestPermission();
    // this.token = token;
    // console.log('🔑 Firebase FCM Token:', token);

    this.isLoading = true;
    this.errorMessage = null; // Reset error message

    const formData = new FormData();

    // ✅ Append all driver data
    Object.keys(this.driver).forEach(key => {
      const value = this.driver[key as keyof typeof this.driver];
      if (value !== null) {
        if (value instanceof File) {
          formData.append(key, value, value.name);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    formData.append("FcmToken", this.token ?? "");

    console.log("🚀 Dados enviados:", Object.fromEntries((formData as any).entries()));

    this.authService.register(Object.fromEntries((formData as any).entries())).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/', this.currentLanguage, 'driver-registration-success']);

      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erro ao registar a conta.';
      }
    });
  }

}
