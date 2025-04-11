/**
 * @file authManager.signal.ts
 * @description This signal manages authentication-related operations and handles authentication state management.
 *
 * @getter currentUser
 * Retrieves the currently authenticated user from the signal.
 *
 * @getter authToken
 * Retrieves the authentication token of the currently signed-in user.
 *
 * @getter isAuthenticated
 * A getter that determines if the user is authenticated based on the presence of valid authentication data.
 * Returns `true` if the user has an authentication token; otherwise, `false`.
 *
 * @getter isLoadingState
 * Retrieves the current loading state of authentication actions.
 * Returns `true` if an authentication request (e.g., login, registration) is in progress; otherwise, `false`.
 *
 * @getter errorMessageState
 * Retrieves the latest authentication error message.
 * Returns a string message if an error occurs; otherwise, `null`.
 *
 * @method signIn
 * Authenticates the user, updates the authentication state, and persists the user data.
 * 
 * @method register
 * Registers a new user, updates the authentication state, and redirects them to the dashboard.
 * 
 * @method logout
 * Logs out the user, resets authentication-related data, and removes the user from local storage.
 * 
 * @method redirectUser
 * Redirects the user to the appropriate dashboard based on their role.
 * 
 * @method loadRequesterAccount
 * Loads and sets authentication data for a requester user.
 * 
 * @method loadDriverAccount
 * Loads and sets authentication data for a driver user.
 * 
 * @method loadAdminAccount
 * Loads and sets authentication data for an admin user.
 * 
 * @method persistUserToLocalStorage
 * Saves the currently authenticated user data to localStorage for persistence.
 * 
 * @method loadUserFromLocalStorage
 * Retrieves the user data from localStorage and restores the authentication state.
 * 
 * @method handleGoogleLogin
 * Handles user authentication via Google Sign-In.
 * 
 * @howToUse
 * 1. Import the signal: `import { AuthManagerSignal } from '../../../_signals/AuthManager.signal';`
 * 2. Inject it into the constructor: `public authManagerSignal: AuthManagerSignal`
 * 3. Use it as needed, example: `this.authManagerSignal.signIn(this.loginForm.value);`
 *
 * @date 14-03-2025
 * @updateDate 16-03-2025
 */


import { Injectable, Injector, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../_shared/services/auth.service';
import { firstValueFrom } from 'rxjs';
// import { RequesterTransportsSignal } from './requesterTransports.signal';

@Injectable({ providedIn: 'root' })
export class AuthManagerSignal {
    // private authService!: AuthService;
    // private requesterTransportsSignal!: RequesterTransportsSignal;

    // ⬤ Authentication state signals
    private user = signal<any | null>(null);
    private isLoading = signal<boolean>(false);
    private errorMessage = signal<string | null>(null);

    constructor(
        private injector: Injector,
        private router: Router
    ) {
        setTimeout(() => {
            // this.authService = this.injector.get(AuthService);
            // this.requesterTransportsSignal = this.injector.get(RequesterTransportsSignal);
        });
    }

    // ⬤ Getter Current User
    get currentUser() {
        return this.user();
    }

    // ⬤ Getter for Auth Token
    get authToken(): string | null {
        return this.user()?.authToken || null;
    }

    // ⬤ Getter for isLoading
    get isLoadingState(): boolean {
        return this.isLoading();
    }

    // ⬤ Getter for errorMessage
    get errorMessageState(): string | null {
        return this.errorMessage();
    }

    // ⬤ Getter to Check if User is Authenticated
    get isAuthenticated(): boolean {
        return !!this.currentUser && !!this.currentUser.authToken;
    }

    // ⬤ Sign In User
    async signIn(credentials: { email: string; password: string }) {
        this.isLoading.set(true);
        this.errorMessage.set(''); // Reset error message

        try {
            // const response = await firstValueFrom(this.authService.login(credentials));
            // if (!response) {
            //     console.warn("No response received from login.");
            //     return;
            // }
            // this.user.set(response);
            // this.persistUserToLocalStorage();
            // this.loadAccountData(response.type);
            // this.redirectUser(response.type);
        } catch (err: any) {
            const errorMsg = err.error?.message || 'Credenciais inválidas. Tente novamente.';
            this.errorMessage.set(errorMsg);
        } finally {
            this.isLoading.set(false);
        }
    }

    async handleGoogleLogin(googleUser: any) {
        console.log("🔹 INSIDE THE SIGNAL Handling Google User Login", googleUser);
    
        this.isLoading.set(true);
        this.errorMessage.set(null);
    
        // ✅ Debug: Explicitly log email field type
        console.log("🔍 Checking googleUser.email:", typeof googleUser.email, googleUser.email);
    
        // ✅ Ensure googleUser is valid and email exists
        if (!googleUser || typeof googleUser.email !== "string" || !googleUser.email.trim()) {
            console.error("🚨 Google User object is missing a valid email!", googleUser);
            this.errorMessage.set("Google login failed. Please try again.");
            this.isLoading.set(false);
            return;
        }
    
        try {
            // console.log("🔄 Attempting to log in user...");
    
            // // Try logging in the user
            // const loginResponse = await firstValueFrom(this.authService.login({
            //     email: googleUser.email.trim(),
            //     password: googleUser.sub // Using Google User ID as a pseudo-password
            // }));
    
            // console.log("✅ User logged in successfully:", loginResponse);
    
            // // Store user data
            // this.user.set(loginResponse);
            // this.persistUserToLocalStorage();
    
            // // ✅ Redirect user to /requester-home after login
            // this.router.navigate(['/requester-home']);
    
        } catch (loginError: any) {
            console.warn("⚠️ User not found, attempting to register...");
            console.error("🔴 Login Error:", loginError);
    
            // // If login fails, register the user
            // try {

            //     console.log('      try {      try {      try {      try {      try {      try {', googleUser )
            //     const userRegistrationData = {
            //         fullName: googleUser.name?.trim() || "Google User", // ✅ Ensure name is defined
            //         email: googleUser.email.trim(),
            //         userPhoto: googleUser.picture,
            //         phone: "", // Google does not provide phone numbers
            //         password: googleUser.sub, // Using Google ID as password for simplicity
            //         type: 1, // Default user role (Requester)
            //         dateOfBirth: "",
            //         placeOfBirth: "",
            //         nationality: "",
            //         emergencyContactName: "",
            //         emergencyContactPhone: "",
            //         idCardNumber: "",
            //         idCardExpiration: "",
            //         taxId: "",
            //         socialSecurityNumber: "",
            //         licenseNumber: "",
            //         licenseCategory: "",
            //         licenseIssueDate: "",
            //         licenseExpirationDate: "",
            //         issuingCountry: "",
            //         professionalDriverCertificate: "",
            //         adrCertificate: "",
            //         vehiclePlateNumber: "",
            //         vehicleMakeModel: "",
            //         vehicleVIN: "",
            //         vehicleInsuranceCompany: "",
            //         vehicleInsurancePolicy: "",
            //         vehicleInspectionExpiry: "",
            //         vehicleOwnership: "",
            //         licenseFront: null,
            //         licenseBack: null,
            //         idCardFront: null,
            //         idCardBack: null
            //     };
    
            //     console.log("🔹 Registering new user with:", userRegistrationData);
    
            //     const registerResponse = await firstValueFrom(this.authService.register(userRegistrationData));
            //     console.log("✅ User registered successfully:", registerResponse);
    
            //     // Now log in the user after successful registration
            //     const loginAfterRegister = await firstValueFrom(this.authService.login({
            //         email: googleUser.email.trim(),
            //         password: googleUser.sub
            //     }));
    
                // console.log("✅ User logged in after registration:", loginAfterRegister);
    
                // // Store user data
                // this.user.set(loginAfterRegister);
                // this.persistUserToLocalStorage();
    
                // // ✅ Redirect user to /requester-home after successful login
                // this.router.navigate(['/requester-home']);
    
            // } catch (registrationError: any) {
            //     console.error("🚨 Registration failed:", registrationError);
            //     this.errorMessage.set("Google registration failed. Please try again.");
            // }
        } finally {
            this.isLoading.set(false);
        }
    }
    
    

    // ⬤ Register user
    async register(userData: any) {
        this.isLoading.set(true);
        this.errorMessage.set(null);

        try {
            // const user = await this.authService.register(userData);
            // this.user.set(user);
            // this.router.navigate(['/dashboard']); // Redirect after registration
        } catch (error: any) {
            this.errorMessage.set(error.message || 'Registration failed');
        } finally {
            this.isLoading.set(false);
        }
    }

    // ⬤ Redirect User Based on Role
    redirectUser(userRole: number) {
        const routes: any = {
            0: '/admin-home',
            1: '/requester-home',
            2: '/drivers-home'
        };

        if (routes[userRole] !== undefined) {
            this.router.navigate([routes[userRole]]);
        } else {
            this.router.navigate(['/login']);
        }
    }

    // ⬤ Persist User Data to LocalStorage Based on Role
    persistUserToLocalStorage() {
        if (this.user()) {
            localStorage.setItem('authData', JSON.stringify(this.user()));
        }
    }

    // ⬤ Load Account Data Based on User Role
    async loadAccountData(userRole: number) {
        try {
            console.log(`🚀 Loading account data for role: ${userRole}`);

            switch (userRole) {
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
                    console.warn('⚠️ Unknown user role. No account data to load.');
            }
        } catch (error) {
            console.error('🚨 Error loading account data:', error);
        }
    }


    // ⬤ Loads User Data from LocalStorage
    loadUserFromLocalStorage() {
        const storedUser = localStorage.getItem('authData');
        if (storedUser) {
            this.user.set(JSON.parse(storedUser)); // Correct way to update the signal
        }
    }

    // ⬤ Load Requester Account Data
    async loadRequesterAccount() {
        try {
            console.log('🚀 Loading Requester Account Data...');
            // await this.requesterTransportsSignal.loadRequesterTransports();
        } catch (error) {
            console.error('🚨 Error loading requester account:', error);
        }
    }

    // ⬤ Load Driver Account Data
    loadDriverAccount() {
        // this.loadDriverConfigurations();
        // this.loadDriverTransportRequests();
    }

    // ⬤ Load Admin Account Data
    loadAdminAccount() {
        // this.loadAdminConfigurations();
        // this.loadAdminDashboardData();
    }

    logout() {
        // Reset the state to its default values
        this.user.set({
            isAuthenticated: false,
            userId: null,
            userName: null,
            authToken: null,
            userRole: null,

            // Reset all user properties
            fullName: null,
            phone: null,
            dateOfBirth: null,
            placeOfBirth: null,
            nationality: null,
            emergencyContactName: null,
            emergencyContactPhone: null,

            idCardNumber: null,
            idCardExpiration: null,
            taxId: null,
            socialSecurityNumber: null,

            licenseNumber: null,
            licenseCategory: null,
            licenseIssueDate: null,
            licenseExpirationDate: null,
            issuingCountry: null,
            professionalDriverCertificate: null,
            adrCertificate: null,

            vehiclePlateNumber: null,
            vehicleMakeModel: null,
            vehicleVIN: null,
            vehicleInsuranceCompany: null,
            vehicleInsurancePolicy: null,
            vehicleInspectionExpiry: null,
            vehicleOwnership: null,

            userPhoto: null,
            licenseFront: null,
            licenseBack: null,
            idCardFront: null,
            idCardBack: null
        });

        // Remove all stored user data from localStorage
        localStorage.removeItem('authData'); // Clears the entire stored user object
    }

}
