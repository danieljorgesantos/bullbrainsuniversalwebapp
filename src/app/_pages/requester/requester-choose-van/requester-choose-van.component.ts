import { Component, inject, OnDestroy, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
import { priceSignal } from '../../../_signals/price.signal';
import { Router, RouterModule } from '@angular/router';
// import { ConfigSignal } from '../../../_signals/config';
// import { TransportRequestService } from '../../../_shared/services/transport-request.service';
import { NgxStripeModule, StripeFactoryService, StripeInstance } from "ngx-stripe";
import { Subscription, switchMap } from "rxjs";
import { environment } from '../../../_shared/enviroments/enviroment';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthManagerSignal } from '../../../_signals/authManager.signal';
import { TransportRequestService } from '../../../_shared/services/transport-request.service';

import { Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';


// import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
// import { CountryISO } from 'ngx-intl-tel-input';
// import { AuthManagerSignal } from '../../../_signals/authManager.signal';


@Component({
  selector: 'app-requester-choose-van',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './requester-choose-van.component.html',
  providers: []
})
export class RequesterChooseVanComponent implements OnInit, OnDestroy {
  public priceSignal = inject(priceSignal);

  // ✅ Inject the signal (Angular v14+ way)
  authManagerSignal = inject(AuthManagerSignal);

  transportRequestService = inject(TransportRequestService);

  private apiUrl = `${environment.apiBaseUrl}`;

  public stripe!: StripeInstance;
  public stripeAmount!: number;
  // public stripePublicKey = 'pk_test_51Qvz43FQKbu2elOQuFD5qGlmxxnUBMMsZt1ATmOnHgsxLhfqk0cXgNrzueAgbWIaEFFXa6gzcRDOJ83POUT0e9nQ00GQiuJWVc'; // chave de testes
  public stripePublicKey = 'pk_live_51Qvz3tFAcPNRPq1tscpWVRnG4oPJ6fTpLCJRZrdkSA0c3ZDzcW6qMqx2fIWHGWiylbEqDO0M2oefs3YTX4KvXhfH00gQR8mflB'; // chave de producao

  private subscriptions: Subscription;
  isLoading: boolean = false; // Track loading state
  errorMessage: string = ''; // Track errors

  numberText: string = '';

  totalFareNormal: any = null;
  totalFareBox: any = null;

  vanNormal: boolean = true;
  vanBox: boolean = false;
  selectedVan: string = 'normal'; // Stores the selected van type

  form!: FormGroup;
  separateDialCode = true;
  // defaultCountry = CountryISO.Portugal;
  // preferredCountries = [
  //   CountryISO.Portugal,
  //   CountryISO.UnitedStates,
  //   CountryISO.UnitedKingdom,
  //   CountryISO.France,
  //   CountryISO.Spain
  // ];

  submitted = false;
  showPhoneValidation = false;

  constructor(
    // public priceSignal: priceSignal,
    private router: Router,
    // private configSignal: ConfigSignal,
    // public authManagerSignal: AuthManagerSignal,
    // private http: HttpClient,
    private stripeFactory: StripeFactoryService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.subscriptions = new Subscription();
  }

  ngOnInit() {

    console.log('this.priceSignal.state', this.priceSignal.state)

    this.form = new FormGroup({
      vanType: new FormControl('normal', [Validators.required]),
      phone: new FormControl(null, [Validators.required]),
      needsAssembly: new FormControl(null, [Validators.required]),
      numberOfItems: new FormControl('', [Validators.required, Validators.min(1)]),
      itemDimensions: new FormControl('', [Validators.required]),
      itemWeight: new FormControl('', [Validators.required]),
      hasElevator: new FormControl(null, [Validators.required]),
      floorNumber: new FormControl('', [Validators.required, Validators.min(0)]),
      description: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      needsPackaging: new FormControl(null, [Validators.required]),
      easyAccess: new FormControl(null, [Validators.required]),
      preferredTime: new FormControl(null, [Validators.required]),
      vanAccess: new FormControl(null, [Validators.required]),
    });



    // Ensure the phone input starts as untouched
    setTimeout(() => {
      const phoneControl = this.form.get('phone');
      if (phoneControl) {
        phoneControl.markAsPristine();
        phoneControl.markAsUntouched();
      }
    }, 0);

    // if (!this.priceSignal.state.distance || this.priceSignal.state.distance === 0) {
    //   this.router.navigate(['/requester-map']);
    //   return;
    // }

    // Initialize Stripe
    this.stripe = this.stripeFactory.create(this.stripePublicKey);
    this.stripeAmount = 5000; // Example amount (50.00 in cents)

    // calculate prices to be sent to stripe
    const fareParams: any = {
      baseFare: 3.00,           // Tarifa base ajustada
      costPerKm: 1.05,          // Custo por km ajustado
      distanceKm: this.priceSignal.state.distance,           // Distância da viagem
      costPerMinute: 0.18,      // Custo por minuto rodado ajustado
      averageSpeedKmh: 60,      // Velocidade média assumida (km/h)
      costPerWaitMinute: 0.30,  // Custo por minuto de espera
      waitTimeMinutes: 30,      // Tempo de espera estimado (15 min carga + 15 min descarga)
      serviceFeePercentage: 25, // Taxa de serviço da Uber
    };

    this.totalFareNormal = this.calculateFare(fareParams);
    this.totalFareBox = this.calculateFareBox(fareParams) + 5;
  }

  getPhoneNumber() {
    return this.form.get('phone')?.value;
  }

  get isPhoneInvalid(): boolean {
    const phoneControl = this.form?.get('phone');
    if (!phoneControl) return false; // Prevent errors

    // Only validate after user interacts or form is submitted
    return this.showPhoneValidation && phoneControl.invalid;
  }

  calculateFare(params: any): number {
    const {
      baseFare,
      costPerKm,
      distanceKm,
      costPerMinute,
      averageSpeedKmh,
      costPerWaitMinute,
      waitTimeMinutes,
      serviceFeePercentage,
    } = params;

    // Estimar tempo de viagem com base na velocidade média
    const travelTimeMinutes = (distanceKm / averageSpeedKmh) * 60;

    // Cálculo do custo por distância
    const distanceCost = distanceKm * costPerKm;

    // Cálculo do custo por tempo de viagem
    const travelTimeCost = travelTimeMinutes * costPerMinute;

    // Cálculo do custo por tempo de espera
    const waitTimeCost = waitTimeMinutes * costPerWaitMinute;

    // Soma dos custos
    const totalBeforeServiceFee = baseFare + distanceCost + travelTimeCost + waitTimeCost;

    // Aplicando a taxa de serviço
    const finalTotal = totalBeforeServiceFee * (1 + serviceFeePercentage / 100);

    return parseFloat(finalTotal.toFixed(2)); // Retorna o valor arredondado para 2 casas decimais
  }

  calculateFareBox(params: any): number {
    const {
      baseFare,
      costPerKm,
      distanceKm,
      costPerMinute,
      averageSpeedKmh,
      costPerWaitMinute,
      waitTimeMinutes,
      serviceFeePercentage,
    } = params;

    // Estimar tempo de viagem com base na velocidade média
    const travelTimeMinutes = (distanceKm / averageSpeedKmh) * 60;

    // Cálculo do custo por distância
    const distanceCost = distanceKm * costPerKm;

    // Cálculo do custo por tempo de viagem
    const travelTimeCost = travelTimeMinutes * costPerMinute;

    // Cálculo do custo por tempo de espera
    const waitTimeCost = waitTimeMinutes * costPerWaitMinute;

    // Soma dos custos
    const totalBeforeServiceFee = baseFare + distanceCost + travelTimeCost + waitTimeCost;

    // Aplicando a taxa de serviço
    const finalTotal = totalBeforeServiceFee * (1 + serviceFeePercentage / 100) + 4;

    return parseFloat(finalTotal.toFixed(2)); // Retorna o valor arredondado para 2 casas decimais
  }

  public processStripePayment(): void {
    // Make sure this code only runs in the browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
  
    const host = this.apiUrl + '/api/stripe/create-checkout-session';
    const amount = Math.round((this.vanNormal ? this.totalFareNormal : this.totalFareBox) * 100);
  
    const checkoutSub = this.http.post(
      host,
      {
        amount,
        currency: "eur",
        productName: "Transporte de Carrinha de Caixa Normal"
      },
      { observe: 'response' }
    ).pipe(
      switchMap((response: any) => {
        const sessionId: string = response.body?.sessionId;
        if (!sessionId) {
          throw new Error("No sessionId returned from Stripe");
        }
  
        // Only redirect if we're in the browser
        return this.stripe.redirectToCheckout({ sessionId });
      })
    ).subscribe({
      next: (result:any) => {
        if (result.error) {
          console.error('Stripe Checkout error:', result.error.message);
        }
      },
      error: (err:any) => {
        console.error('Failed to initiate Stripe checkout:', err);
      }
    });
  
    this.subscriptions.add(checkoutSub);
  }

  updateSelection(type: string) {
    this.vanNormal = type === 'normal';
    this.vanBox = type === 'box';
  }

  handleTransportAndPayment() {
    // console.log('Phone Number:', this.getPhoneNumber());
    // alert(`Phone Number Submitted: ${this.getPhoneNumber().internationalNumber}`);

    if (this.isLoading) return;

    this.submitted = true;
    this.showPhoneValidation = true;

    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = ''; // Reset error before new request

    // if (!this.authManagerSignal.currentUser?.id) {
    //   console.error("User ID is missing. Cannot submit transport request.");
    //   this.isLoading = false;
    //   this.errorMessage = 'Erro: ID do usuário ausente.';
    //   return;
    // }


    const transportRequestData = {
      userId: this.authManagerSignal.currentUser?.id ?? null,
      requesterEmail: this.authManagerSignal.currentUser?.email ?? '',
      requesterName: this.authManagerSignal.currentUser?.fullName ?? '',


      // form related fields
      price: this.vanNormal ? this.totalFareNormal : this.totalFareBox,
      description: this.form.get('description')?.value,
      needsSetup: this.form.get('needsAssembly')?.value,
      vanType: this.form.get('vanType')?.value,
      volumes: this.form.get('numberOfItems')?.value,
      dimensions: this.form.get('itemDimensions')?.value,
      weight: String(this.form.get('itemWeight')?.value ?? ''),
      hasElevator: this.form.get('hasElevator')?.value,
      floor: String(this.form.get('floorNumber')?.value ?? ''),
      needsPackaging: this.form.get('needsPackaging')?.value,
      easyAccess: this.form.get('easyAccess')?.value,
      preferredTime: this.form.get('preferredTime')?.value,
      vanAccess: this.form.get('vanAccess')?.value,

      cardName: null,
      cardNumber: null,
      cardMM: null,
      cardYY: null,
      cardCVV: null,

      distance: this.priceSignal.state.distance,
      dropoffLatitude: this.priceSignal.state.dropoffLatitude,
      dropoffLongitude: this.priceSignal.state.dropoffLongitude,
      dropoffLocationText: this.priceSignal.state.dropoffLocationText,
      pickupLatitude: this.priceSignal.state.pickupLatitude,
      pickupLongitude: this.priceSignal.state.pickupLongitude,
      pickupLocationText: this.priceSignal.state.pickupLocationText,

      requesterPhone: this.form.get('phone')?.value,
      status: "Pending",

      // Information relative to the driver, everything needs to be empty or null
      designatedDriverId: null,
      designatedDriverName: null,
      designatedDriverLicencePlate: null,
      designatedDriverVanModel: null,
      designatedDriverEmail: null,
      designatedDriverPhone: null,
      designatedDriverPhoto: null,
      designatedDriverVanColor: null,
      designatedDriverRating: null,
      timeOfDelivery: null,
      timeOfRequestAcceptedByDriver: null,
      timeOfRequestDelivered: null,
      recieptPdfId: null,

      timeOfRequestCreated: new Date().toISOString(), // Keep current timestamp
    };


    // if (!transportRequestData.distance || transportRequestData.distance === 0) {
    //   this.isLoading = false;
    //   this.errorMessage = 'Erro: Distância inválida.';
    //   this.router.navigate(['/requester-map']);
    //   return;
    // }

    console.log('Submitting transport request:', transportRequestData);

    this.transportRequestService.createTransportRequest(transportRequestData).subscribe(
      (response: any) => {
        console.log('Transport request submitted successfully:', response);
        this.processStripePayment();
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error submitting transport request:', error);
        this.errorMessage = 'Ocorreu um erro ao enviar o pedido. Tente novamente.';
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
