import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { landingPageCtaTranslations } from './translations';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeafletService } from '../../../_shared/services/leaflet.service';
import { PLATFORM_ID } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { priceSignal } from '../../../_signals/price.signal';
import { HttpClient } from '@angular/common/http';
import { GoogleAutocompleteService } from '../../../_shared/services/google-autocomplete.service';
import { Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';

declare const google: any; // Ensure Google API is loaded

@Component({
  selector: 'app-landing-page-cta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  providers: [LeafletService, GoogleAutocompleteService],
  templateUrl: './landing-page-cta.component.html'
})
export class LandingPageCtaComponent {
  // Language
  currentLanguage: any = 'pt-PT';

  //Injectors
  private route = inject(ActivatedRoute);
  private leaflet = inject(LeafletService);
  private googleAutocompleteService = inject(GoogleAutocompleteService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private priceSignal = inject(priceSignal);
  private http = inject(HttpClient);

  // Variables
  private desktopMap!: any;
  private mobileMap!: any;
  private pickupMarker!: any;
  private destinationMarker!: any;
  private routeLayer!: any;

  googlePickupPredictions: any[] = [];
  googleDeliveryPredictions: any[] = [];

  private currentPickupRequest = 0;
  private currentDeliveryRequest = 0;

  form!: FormGroup;

  constructor(
    private leafletService: LeafletService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private titleService: Title,
    private metaService: Meta,
  ) {
    // Form initialization with controls
    this.form = this.fb.group({
      pickupLocation: ['', [Validators.required]],
      destinationLocation: ['', [Validators.required]],
    });
  }

  // Get a specific translation by key
  getTranslation(key: string) {
    return landingPageCtaTranslations[this.currentLanguage]?.[key] || landingPageCtaTranslations['en']?.[key];
  }

  // https://stackoverflow.com/questions/58080301/how-to-use-angular-universal-with-leaflet

  ngOnInit() {
    // Get the "lang" route param
    const langParam = this.route.snapshot.paramMap.get('lang');

    if (langParam) {
      this.currentLanguage = langParam;
    }

    // Map logic
    if (this.leafletService.L) {
      this.setupMap();
    }

    // Watch for changes in the pickupLocation input and call the service
    this.form.get('pickupLocation')?.valueChanges.pipe(
      debounceTime(500), // Wait 500ms after the user stops typing
      distinctUntilChanged(), // Only trigger the service if the value changes
      switchMap((inputValue: string) => this.googleAutocompleteService.testMethod(inputValue)) // Call the service with the current input value
    ).subscribe((response: any) => {
      this.googlePickupPredictions = response;
      this.cd.detectChanges();
    });

    // Watch for changes in the pickupLocation input and call the service
    this.form.get('destinationLocation')?.valueChanges.pipe(
      debounceTime(500), // Wait 500ms after the user stops typing
      distinctUntilChanged(), // Only trigger the service if the value changes
      switchMap((inputValue: string) => this.googleAutocompleteService.testMethod(inputValue)) // Call the service with the current input value
    ).subscribe((response: any) => {
      this.googleDeliveryPredictions = response;
      this.cd.detectChanges();
    });
  }



  private setupMap() {
    if (this.leafletService.L) {
      // Ensure L is available before using it
      this.desktopMap = this.leafletService.L.map('leaflet-map-desktop', {
        attributionControl: false,
        zoomControl: false
      }).setView([38.7169, -9.1399], 12);

      // Add a tilelayer
      this.leafletService.L.tileLayer(
        'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      ).addTo(this.desktopMap);
    } else {
      console.error('Leaflet is not loaded');
      // Optionally show an error message to the user or retry logic here
    }
  }

  selectGooglePickupLocation(prediction: any): void {
    const lat = prediction.lat;
    const lon = prediction.lng;

    this.googlePickupPredictions = [];

    this.form.get('pickupLocation')?.setValue(prediction.description, { emitEvent: false });

    if (!this.pickupMarker) {
      this.pickupMarker = this.leafletService.L.marker([lat, lon], {
        draggable: true,
        icon: this.getBlueMarker(),
      })
        .addTo(this.desktopMap)
        .bindPopup('Ponto de Recolha')
    } else {
      this.pickupMarker.setLatLng([lat, lon]).openPopup();
    }

    this.desktopMap.setView([lat, lon], 14);

    this.priceSignal.updateState({
      pickupLocationText: prediction.description,
      pickupLatitude: lat,
      pickupLongitude: lon,
    });


    // ✅ 🚨 Only calculate route if dropoff already exists
    if (this.destinationMarker) {
      this.getRoute();
    }

  }


  /** ✅ Select a Delivery Location & Update Map */
  selectGoogleDeliveryLocation(prediction: any): void {
    const lat = prediction.lat;
    const lon = prediction.lng;

    // Clear predictions
    this.googleDeliveryPredictions = [];

    this.form.get('destinationLocation')?.setValue(prediction.description, { emitEvent: false });

    if (!this.destinationMarker) {
      this.destinationMarker = this.leafletService.L.marker([lat, lon], {
        draggable: true,
        icon: this.getRedMarker(),
      })
        .addTo(this.desktopMap)
        .bindPopup('Ponto de Recolha')
    } else {
      this.destinationMarker.setLatLng([lat, lon]).openPopup();
    }

    this.desktopMap.setView([lat, lon], 14);

    this.priceSignal.updateState({
      dropoffLocationText: prediction.description,
      dropoffLatitude: lat,
      dropoffLongitude: lon,
    });

    if (this.pickupMarker) {
      this.getRoute();
    }
  }

  getBlueMarker() {
    return this.leafletService.L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }

  getRedMarker() {
    return this.leafletService.L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }

  getRoute() {
    const pickupCoords = this.pickupMarker?.getLatLng();
    const destinationCoords = this.destinationMarker?.getLatLng();

    const url = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=full&geometries=geojson`;


    this.http.get(url).subscribe((response: any) => {
      if (response && response.routes && response.routes.length > 0) {
        const routeCoords = response.routes[0].geometry.coordinates.map((coord: any) => [coord[1], coord[0]]);

        // ✅ Store new route in the layer
        this.routeLayer = this.leafletService.L.polyline(routeCoords, { color: 'black', weight: 5, opacity: 0.7 });

        // ✅ Add new route to both maps
        this.routeLayer.addTo(this.desktopMap);
        // this.routeLayer.addTo(this.mobileMap);

        // ✅ Ensure map has the correct size before fitting bounds
        setTimeout(() => {
          try {
            this.desktopMap.fitBounds(this.routeLayer.getBounds());
            // this.mobileMap.fitBounds(this.routeLayer.getBounds());
          } catch (error) { }
        }, 500); // Small delay ensures map is ready

        const distanceKm = response.routes[0].distance / 1000;


        console.log('got here 5')

        // ✅ Update distance in priceSignal
        this.priceSignal.updateState({
          distance: distanceKm,
          pickupLatitude: pickupCoords.lat,
          pickupLongitude: pickupCoords.lng,
          dropoffLatitude: destinationCoords.lat,
          dropoffLongitude: destinationCoords.lng,
        });

        console.log('console.log(this.priceSignal());', this.priceSignal.state);

      } else {
        console.error("🚨 No routes found from OSRM API.");
      }
    }, (error: any) => {
      console.error("🚨 Error fetching route:", error);
    });
  }

  /** ✅ Use Current Location for Pickup (All-in-One) */
  useCurrentLocationForPickup(): void {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log(`📍 Obtained GPS Location: ${lat}, ${lon}`);

        const geocoder = new google.maps.Geocoder();
        const latLng = new google.maps.LatLng(lat, lon);

        geocoder.geocode({ location: latLng }, (results: any, status: any) => {
          console.log('🛰️ Geocoder Results:', results, 'Status:', status);

          if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
            let formattedAddress = results.find((res: any) => res.types.includes('street_address'))?.formatted_address || results[0].formatted_address;

            if (!formattedAddress) {
              console.warn('⚠️ No detailed address found, using fallback:', results);
              formattedAddress = results[0].formatted_address; // Fallback to first result
            }

            console.log(`🏡 Selected Address: ${formattedAddress}`);

            // Update input field without triggering valueChanges again
            this.form.get('pickupLocation')?.setValue(formattedAddress, { emitEvent: false });

            // ✅ If marker doesn't exist, create it
            if (!this.pickupMarker) {
              this.pickupMarker = this.leafletService.L.marker([lat, lon], {
                draggable: true,
                icon: this.getBlueMarker(),
              })
                .addTo(this.desktopMap) // or this.mobileMap depending on current view
                .bindPopup('Ponto de Recolha')
              // .on('dragend', () => this.getRoute());
            } else {
              this.pickupMarker.setLatLng([lat, lon]).openPopup();
            }

            // Center the map on the selected location
            this.desktopMap.setView([lat, lon], 14);
            // this.mobileMap.setView([lat, lon], 14); // if needed

            // Update app-wide state
            this.priceSignal.updateState({
              pickupLocationText: formattedAddress,
              pickupLatitude: lat,
              pickupLongitude: lon,
            });
          }
        });
      },
      (error) => {
        console.error('❌ Erro ao obter a localização:', error);
        alert('Não foi possível obter a localização. Verifique as permissões de localização.');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }

  /** ✅ Use Current Location for Delivery (All-in-One) */
  useCurrentLocationForDelivery(): void {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log(`📍 Obtained GPS Location for Delivery: ${lat}, ${lon}`);

        const geocoder = new google.maps.Geocoder();
        const latLng = new google.maps.LatLng(lat, lon);

        geocoder.geocode({ location: latLng }, (results: any, status: any) => {
          console.log('🛰️ Geocoder Results for Delivery:', results, 'Status:', status);

          if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
            let formattedAddress = results.find((res: any) => res.types.includes('street_address'))?.formatted_address || results[0].formatted_address;

            if (!formattedAddress) {
              console.warn('⚠️ No detailed address found, using fallback:', results);
              formattedAddress = results[0].formatted_address;
            }

            console.log(`🏡 Selected Delivery Address: ${formattedAddress}`);

            // Update input field without triggering valueChanges again
            this.form.get('destinationLocation')?.setValue(formattedAddress, { emitEvent: false });

            // ✅ If marker doesn't exist, create it
            if (!this.destinationMarker) {
              this.destinationMarker = this.leafletService.L.marker([lat, lon], {
                draggable: true,
                icon: this.getRedMarker(),
              })
                .addTo(this.desktopMap)
                .bindPopup('Ponto de Entrega');
              // .on('dragend', () => this.getRoute());
            } else {
              this.destinationMarker.setLatLng([lat, lon]).openPopup();
            }

            // Center the map on the selected location
            this.desktopMap.setView([lat, lon], 14);

            // Update app-wide state
            this.priceSignal.updateState({
              dropoffLocationText: formattedAddress,
              dropoffLatitude: lat,
              dropoffLongitude: lon,
            });

            // ✅ If pickup marker exists, recalculate route
            if (this.pickupMarker) {
              this.getRoute();
            }
          } else {
            console.error('❌ Erro ao obter endereço de entrega:', status);
            alert('Não foi possível obter um endereço. Tente novamente.');
          }
        });
      },
      (error) => {
        console.error('❌ Erro ao obter a localização de entrega:', error);
        alert('Não foi possível obter a localização. Verifique as permissões de localização.');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }

  ngOnDestroy(): void {
    this.desktopMap?.remove();
    this.mobileMap?.remove();
  }

}
