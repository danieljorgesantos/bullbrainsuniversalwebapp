import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { homeTranslations } from './translations';

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
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  providers: [LeafletService, GoogleAutocompleteService],
  templateUrl: './home.component.html'
})
export class HomeComponent {
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
    return homeTranslations[this.currentLanguage]?.[key] || homeTranslations['en']?.[key];
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
      console.log('response in the component')
      this.cd.detectChanges();
      // console.log('Service response:', response);
      // this.testPickupLocationControlResponse = response;
    });

    // Watch for changes in the pickupLocation input and call the service
    this.form.get('destinationLocation')?.valueChanges.pipe(
      debounceTime(500), // Wait 500ms after the user stops typing
      distinctUntilChanged(), // Only trigger the service if the value changes
      switchMap((inputValue: string) => this.googleAutocompleteService.testMethod(inputValue)) // Call the service with the current input value
    ).subscribe((response: any) => {
      this.googleDeliveryPredictions = response;
      console.log('response in the component delivery delivery')
      this.cd.detectChanges();
      // console.log('Service response:', response);
      // this.testPickupLocationControlResponse = response;
    });

    // this.googleIniPickupAutocomplete();
    // this.googleInitDeliveryAutocomplete();

    // // Initialize Google Autocomplete for Pickup Point
    // this.googleAutocompleteService.googleIniPickupAutocomplete(
    //   document.getElementById('pickup-location-input') as HTMLInputElement,
    //   this.googleLocationControl
    // );

    // // Subscribe to the googlePredictions observable to get predictions
    // this.googleAutocompleteService.googlePredictions$.subscribe(predictions => {
    //   this.googlePredictions = predictions;
    // });



    this.setInitialPageConfiguration();

  }

  setInitialPageConfiguration() {
    // // 🆕 Set the lang attribute on <html>
    // document.documentElement.lang = this.currentLanguage;

    const titleToSet = homeTranslations[this.currentLanguage]?.meta_title || homeTranslations['en']?.meta_title;
    const descriptionToSet = homeTranslations[this.currentLanguage]?.meta_description || homeTranslations['en']?.meta_description;
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
    this.metaService.updateTag({ property: 'og:locale', content: this.currentLanguage });
    this.metaService.updateTag({ property: 'og:image', content: shareImage });

    // Twitter
    // this.metaService.updateTag({ name: 'twitter:card', content: twitterCard });
    this.metaService.updateTag({ name: 'twitter:title', content: titleToSet });
    this.metaService.updateTag({ name: 'twitter:description', content: descriptionToSet });
    this.metaService.updateTag({ name: 'twitter:site', content: '@floandgo' }); // Replace with your Twitter handle
    this.metaService.updateTag({ name: 'twitter:image', content: shareImage });
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

  // /** ✅ Initialize Google Autocomplete for Pickup Point */
  // private googleIniPickupAutocomplete(): void {
  //   this.googleAutocomplete = new google.maps.places.AutocompleteService();

  //   this.googleLocationControl.valueChanges
  //     .pipe(debounceTime(500), distinctUntilChanged())
  //     .subscribe((inputValue: string) => {
  //       if (inputValue.length > 2) {
  //         const requestId = ++this.currentPickupRequest; // ✅ Track request ID

  //         this.googleAutocomplete.getPlacePredictions(
  //           { input: inputValue, componentRestrictions: { country: 'PT' } },
  //           (predictions: any[], status: any) => {
  //             if (requestId !== this.currentPickupRequest) return; // ✅ Ignore old responses

  //             this.googlePredictions =
  //               status === google.maps.places.PlacesServiceStatus.OK ? predictions : [];
  //           }
  //         );
  //       } else {
  //         this.googlePredictions = [];
  //       }
  //     });
  // }

  // /** ✅ Initialize Google Autocomplete for Delivery Point */
  // private googleInitDeliveryAutocomplete(): void {
  //   this.googleDeliveryAutocomplete = new google.maps.places.AutocompleteService();

  //   this.googleDeliveryControl.valueChanges
  //     .pipe(debounceTime(500), distinctUntilChanged())
  //     .subscribe((inputValue: string) => {
  //       if (inputValue.length > 2) {
  //         const requestId = ++this.currentDeliveryRequest; // ✅ Track request ID

  //         this.googleDeliveryAutocomplete.getPlacePredictions(
  //           { input: inputValue, componentRestrictions: { country: 'PT' } },
  //           (predictions: any[], status: any) => {
  //             if (requestId !== this.currentDeliveryRequest) return; // ✅ Ignore old responses

  //             this.googleDeliveryPredictions =
  //               status === google.maps.places.PlacesServiceStatus.OK ? predictions : [];
  //           }
  //         );
  //       } else {
  //         this.googleDeliveryPredictions = [];
  //       }
  //     });
  // }


  /** ✅ Select a Pickup Location & Update Map */
  selectGooglePickupLocation(prediction: any): void {
    const lat = prediction.lat;
    const lon = prediction.lng;

    // Clear predictions
    this.googlePickupPredictions = [];

    // Update input field without triggering valueChanges again
    this.form.get('pickupLocation')?.setValue(prediction.description, { emitEvent: false });

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
      pickupLocationText: prediction.description,
      pickupLatitude: lat,
      pickupLongitude: lon,
    });


    // ✅ 🚨 Only calculate route if dropoff already exists
    if (this.destinationMarker) {
      console.log('destination marker exists!!!!!!!!!!!')
      // this.getRoute();
    }

    // const placesService = new google.maps.places.PlacesService(document.createElement('div'));
    // placesService.getDetails({ placeId: prediction.place_id }, (place: any, status: any) => {
    //   if (status === google.maps.places.PlacesServiceStatus.OK && place.geometry) {
    //     const lat = place.geometry.location.lat();
    //     const lon = place.geometry.location.lng();

    //     this.form.get('pickupLocation')?.setValue(prediction.description, { emitEvent: false });

    //     this.googlePickupPredictions = [];
    //     // this.cdr.detectChanges();
    //     // this.currentPickupRequest++;

    //     // ✅ If marker doesn't exist, create it
    //     if (!this.pickupMarker) {
    //       // this.pickupMarker = this.leafletService.L.marker([lat, lon], { draggable: true, icon: this.getBlueMarker() })
    //       //   .addTo(this.mobileMap)
    //       //   .bindPopup('Ponto de Recolha')
    //       //   .on('dragend', () => this.getRoute());

    //       // this.pickupMarker = this.leafletService.L.marker([lat, lon], { draggable: true, icon: this.getBlueMarker() })
    //       //   .addTo(this.desktopMap)
    //       //   .bindPopup('Ponto de Recolha')
    //       //   .on('dragend', () => this.getRoute());
    //     } else {
    //       this.pickupMarker.setLatLng([lat, lon]).openPopup();
    //     }

    //     // ✅ Update map
    //     this.desktopMap.setView([lat, lon], 14);
    //     this.mobileMap.setView([lat, lon], 14);

    //     this.priceSignal.updateState({
    //       pickupLocationText: prediction.description,
    //       pickupLatitude: lat,
    //       pickupLongitude: lon,
    //     });

    //     // ✅ 🚨 Only calculate route if dropoff already exists
    //     if (this.destinationMarker) {
    //       // this.getRoute();
    //     }
    //   }
    // });
  }


  /** ✅ Select a Delivery Location & Update Map */
  selectGoogleDeliveryLocation(prediction: any): void {
    const lat = prediction.lat;
    const lon = prediction.lng;

    // Clear predictions
    this.googleDeliveryPredictions = [];

    // Update input field without triggering valueChanges again
    this.form.get('destinationLocation')?.setValue(prediction.description, { emitEvent: false });

    // ✅ If marker doesn't exist, create it
    if (!this.destinationMarker) {
      this.destinationMarker = this.leafletService.L.marker([lat, lon], {
        draggable: true,
        icon: this.getRedMarker(),
      })
        .addTo(this.desktopMap) // or this.mobileMap depending on current view
        .bindPopup('Ponto de Recolha')
      // .on('dragend', () => this.getRoute());
    } else {
      this.destinationMarker.setLatLng([lat, lon]).openPopup();
    }

    // Center the map on the selected location
    this.desktopMap.setView([lat, lon], 14);
    // this.mobileMap.setView([lat, lon], 14); // if needed

    // Update app-wide state
    this.priceSignal.updateState({
      dropoffLocationText: prediction.description,
      dropoffLatitude: lat,
      dropoffLongitude: lon,
    });

    if (this.pickupMarker) {
      console.log('pickup marker exsteeee!!!!')
      // ✅ Update route
      this.getRoute();
    }


    // // ✅ Google Places Service to get details
    // const placesService = new google.maps.places.PlacesService(document.createElement('div'));
    // placesService.getDetails({ placeId: prediction.place_id }, (place: any, status: any) => {
    //   if (status === google.maps.places.PlacesServiceStatus.OK && place.geometry) {
    //     const lat = place.geometry.location.lat();
    //     const lon = place.geometry.location.lng();

    //     // ✅ Update the input field without triggering valueChanges
    //     this.googleDeliveryControl.setValue(prediction.description, { emitEvent: false });
    //     this.googleDeliveryPredictions = []; // ✅ Hide dropdown
    //     this.cdr.detectChanges();
    //     this.currentDeliveryRequest++;

    //     // ✅ If marker doesn't exist, create it
    //     if (!this.destinationMarker) {
    //       this.destinationMarker = this.leafletService.L.marker([lat, lon], { draggable: true, icon: this.getRedMarker() })
    //         .addTo(this.mobileMap)
    //         .bindPopup('Ponto de Entrega')
    //         .on('dragend', () => this.getRoute());

    //       this.destinationMarker = this.leafletService.L.marker([lat, lon], { draggable: true, icon: this.getRedMarker() })
    //         .addTo(this.desktopMap)
    //         .bindPopup('Ponto de Entrega')
    //         .on('dragend', () => this.getRoute());
    //     } else {
    //       this.destinationMarker.setLatLng([lat, lon]).openPopup();
    //     }


    //     // ✅ Update map
    //     this.desktopMap.setView([lat, lon], 14);
    //     this.mobileMap.setView([lat, lon], 14);

    //     // ✅ Update the priceSignal state
    //     this.priceSignal.updateState({
    //       dropoffLocationText: prediction.description,
    //       dropoffLatitude: lat,
    //       dropoffLongitude: lon,
    //     });

    //     if (this.pickupMarker) {
    //       // ✅ Update route
    //       // this.getRoute();
    //     }
    //   }
    // });
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




  // // faz o update do marker
  // updateMarker(marker: any, location: any, label: string) {
  //   const lat = location.lat;
  //   const lon = location.lon;

  //   // Update both maps with the new location
  //   this.desktopMap.setView([lat, lon], 14);
  //   this.mobileMap.setView([lat, lon], 14);

  //   marker.setLatLng([lat, lon]).bindPopup(label).openPopup();
  // }

  getRoute() {
    // if (!this.pickupMarker || !this.destinationMarker || !this.desktopMap || !this.mobileMap) {
    //   return;
    // }

    console.log('got here 1')

    const pickupCoords = this.pickupMarker?.getLatLng();
    const destinationCoords = this.destinationMarker?.getLatLng();

    const url = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=full&geometries=geojson`;

    console.log('got here 2')

    this.http.get(url).subscribe((response: any) => {
      if (response && response.routes && response.routes.length > 0) {
        const routeCoords = response.routes[0].geometry.coordinates.map((coord: any) => [coord[1], coord[0]]);

        console.log('got here 3')

        // // ✅ Ensure maps are ready before adding the route
        // if (!this.desktopMap || !this.mobileMap) {
        //   return;
        // }

        // // ✅ Ensure previous route is removed before adding a new one
        // try {
        //   if (this.routeLayer) {
        //     this.desktopMap.removeLayer(this.routeLayer);
        //     // this.mobileMap.removeLayer(this.routeLayer);
        //   }
        // } catch (error) {
        //   console.warn("⚠️ Route layer was already removed or did not exist.", error);
        // }

        // ✅ Store new route in the layer
        this.routeLayer = this.leafletService.L.polyline(routeCoords, { color: 'black', weight: 5, opacity: 0.7 });

        // ✅ Add new route to both maps
        this.routeLayer.addTo(this.desktopMap);
        // this.routeLayer.addTo(this.mobileMap);

        console.log('got here 4')

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

            // // ✅ Ensure that the maps are initialized before proceeding
            // if (!this.desktopMap || !this.mobileMap) {
            //   console.error("🚨 Error: Maps are not initialized yet.");
            //   return;
            // }

            // // ✅ Ensure markers exist before updating
            // if (!this.pickupMarker) {
            //   console.warn("⚠️ Pickup marker is missing. Initializing new markers.");

            //   // ✅ Add marker to both maps
            //   this.pickupMarker = this.leafletService.L.marker([lat, lon], { draggable: true, icon: this.getBlueMarker() })
            //     .addTo(this.mobileMap)
            //     .bindPopup('Ponto de Recolha')
            //     .on('dragend', () => this.getRoute());

            //   this.pickupMarker = this.leafletService.L.marker([lat, lon], { draggable: true, icon: this.getBlueMarker() })
            //     .addTo(this.desktopMap)
            //     .bindPopup('Ponto de Recolha')
            //     .on('dragend', () => this.getRoute());
            // } else {
            //   // ✅ Move marker & update popups on both maps
            //   this.pickupMarker.setLatLng([lat, lon]).bindPopup('Ponto de Recolha').openPopup();
            // }

            // // ✅ Update input field
            // this.googleLocationControl.setValue(formattedAddress, { emitEvent: false });

            // // ✅ Update both maps' view
            // setTimeout(() => {
            //   this.desktopMap.setView([lat, lon], 14);
            //   this.mobileMap.setView([lat, lon], 14);
            // }, 500); // Ensure map updates fully before setting view

            // // ✅ Update state & price calculation
            // this.priceSignal.updateState({
            //   pickupLocationText: formattedAddress,
            //   pickupLatitude: lat,
            //   pickupLongitude: lon,
            // });

            // // ✅ Ensure route recalculates **only if both markers exist**
            //   setTimeout(() => {
            //     if (this.pickupMarker && this.destinationMarker) {
            //       console.log("🚀 Recalculating Route...");
            //       this.getRoute();
            //     } else {
            //       console.warn("⚠️ Cannot calculate route: Destination marker is missing.");
            //     }
            //   }, 800); // Delay ensures the map updates before recalculating route
            // } else {
            //   console.error('❌ Erro ao obter endereço:', status);
            //   alert('Não foi possível obter um endereço. Tente novamente.');
            // }
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

  // /** ✅ Use Current Location for Delivery (Dropoff) */
  // useCurrentLocationForDelivery(): void {
  //   if (!navigator.geolocation) {
  //     alert('Geolocalização não é suportada pelo seu navegador.');
  //     return;
  //   }

  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       const lat = position.coords.latitude;
  //       const lon = position.coords.longitude;
  //       console.log(`📍 Obtained GPS Location for Delivery: ${lat}, ${lon}`);

  //       const geocoder = new google.maps.Geocoder();
  //       const latLng = new google.maps.LatLng(lat, lon);

  //       geocoder.geocode({ location: latLng }, (results: any, status: any) => {
  //         console.log('🛰️ Geocoder Results:', results, 'Status:', status);

  //         if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
  //           let formattedAddress = results.find((res: any) => res.types.includes('street_address'))?.formatted_address || results[0].formatted_address;

  //           if (!formattedAddress) {
  //             console.warn('⚠️ No detailed address found, using fallback:', results);
  //             formattedAddress = results[0].formatted_address; // Fallback to first result
  //           }

  //           console.log(`🏡 Selected Delivery Address: ${formattedAddress}`);

  //           // ✅ Ensure that the maps are initialized before proceeding
  //           if (!this.desktopMap || !this.mobileMap) {
  //             console.error("🚨 Error: Maps are not initialized yet.");
  //             return;
  //           }

  //           // ✅ Ensure markers exist before updating
  //           if (!this.destinationMarker) {
  //             console.warn("⚠️ Destination marker is missing. Initializing new markers.");

  //             // ✅ Add marker to both maps
  //             this.destinationMarker = this.leafletService.L.marker([lat, lon], { draggable: true, icon: this.getRedMarker() })
  //               .addTo(this.mobileMap)
  //               .bindPopup('Ponto de Entrega')
  //               .on('dragend', () => this.getRoute());

  //             this.destinationMarker = this.leafletService.L.marker([lat, lon], { draggable: true, icon: this.getRedMarker() })
  //               .addTo(this.desktopMap)
  //               .bindPopup('Ponto de Entrega')
  //               .on('dragend', () => this.getRoute());
  //           } else {
  //             // ✅ Move marker & update popups on both maps
  //             this.destinationMarker.setLatLng([lat, lon]).bindPopup('Ponto de Entrega').openPopup();
  //           }

  //           // ✅ Update input field
  //           this.googleDeliveryControl.setValue(formattedAddress, { emitEvent: false });

  //           // ✅ Update both maps' view
  //           setTimeout(() => {
  //             this.desktopMap.setView([lat, lon], 14);
  //             this.mobileMap.setView([lat, lon], 14);
  //           }, 500); // Ensure map updates fully before centering

  //           // ✅ Update state & price calculation
  //           this.priceSignal.updateState({
  //             dropoffLocationText: formattedAddress,
  //             dropoffLatitude: lat,
  //             dropoffLongitude: lon,
  //           });

  //           // ✅ Ensure route recalculates **only if both markers exist**
  //           setTimeout(() => {
  //             if (this.pickupMarker && this.destinationMarker) {
  //               console.log("🚀 Recalculating Route...");
  //               this.getRoute();
  //             } else {
  //               console.warn("⚠️ Cannot calculate route: Pickup marker is missing.");
  //             }
  //           }, 800); // Delay ensures the map updates before recalculating route
  //         } else {
  //           console.error('❌ Erro ao obter endereço:', status);
  //           alert('Não foi possível obter um endereço. Tente novamente.');
  //         }
  //       });
  //     },
  //     (error) => {
  //       console.error('❌ Erro ao obter a localização:', error);
  //       alert('Não foi possível obter a localização. Verifique as permissões de localização.');
  //     },
  //     { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
  //   );
  // }

  // scheduleTrip() {
  //   this.router.navigate(['/choose-truck']);
  // }

  // openSections: { [key: string]: boolean } = {};

  // toggleAccordion(id: string): void {
  //   this.openSections[id] = !this.openSections[id];
  // }















  ngOnDestroy(): void {
    this.desktopMap?.remove();
    this.mobileMap?.remove();
  }






}
