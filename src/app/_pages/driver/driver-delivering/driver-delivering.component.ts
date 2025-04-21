import {
  Component,
  AfterViewInit,
  OnInit,
  Inject,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { priceSignal } from '../../../_signals/price.signal';
import { MyTransportRequestsSignal } from '../../../_signals/my-transport-requests.signal';
import { TransportRequestService } from '../../../_shared/services/transport-request.service';
import { AuthManagerSignal } from '../../../_signals/authManager.signal';
import { DriverAccountSignal } from '../../../_signals/driverAccount.signal';
import { LeafletService } from '../../../_shared/services/leaflet.service';
import { TransportRequestSignal } from '../../../_signals/transportRequest';

@Component({
  selector: 'app-driver-delivering',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [LeafletService],
  templateUrl: './driver-delivering.component.html',
})
export class DriverDeliveringComponent implements  OnInit {
  
  private transportRequestSignal = inject(TransportRequestSignal);
  
  // Variables
  private desktopMap!: any;
  private mobileMap!: any;

  private map!: any;
  private routeLayer!: any;
  private pickupMarker!: any;
  private destinationMarker!: any;

  priceSignal = priceSignal;

  isOrderStarted = false;
  isRequestFinalized = false;

  transportId: number | null = null;
  transportDetails: any = null;

  currentLocationAddress: any = '';
  currentLocationLat: any = '';
  currentLocationLng: any = '';

  deliveryStep: number = 0;

  isBrowser: boolean;

  constructor(
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute,
    private myTransportRequestsSignal: MyTransportRequestsSignal,
    private transportRequestService: TransportRequestService,
    public authManagerSignal: AuthManagerSignal,
    private driverAccountSignal: DriverAccountSignal,
    private leafletService: LeafletService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.getCurrentLocation();
  
    this.transportId = Number(this.route.snapshot.paramMap.get('transportId'));
  
    // Load if transportRequests list is empty
    if (!this.transportRequestSignal.transportRequests.length) {
      this.transportRequestSignal.loadTransportRequests();
  
      // Poll until the transport requests are loaded
      const interval = setInterval(() => {
        const loadedRequests = this.transportRequestSignal.transportRequests;
        if (loadedRequests.length > 0) {
          this.transportDetails = loadedRequests.find(t => Number(t.id) === this.transportId);
          clearInterval(interval);
  
          if (this.isBrowser && this.transportDetails && this.leafletService.L) {
            this.setupMap();
          }
        }
      }, 200); // Check every 200ms
    } else {
      // Requests already exist
      this.transportDetails = this.transportRequestSignal.transportRequests.find(
        (t) => Number(t.id) === this.transportId
      );
  
      if (this.isBrowser && this.transportDetails && this.leafletService.L) {
        this.setupMap();
      }
    }
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

  private addMarkers(): void {
    // if (!this.transportDetails || !this.currentLocationLat || !this.currentLocationLng) return;

    // L.marker([this.currentLocationLat, this.currentLocationLng], {
    //   draggable: false,
    //   icon: this.getVanMarker(),
    // })
    //   .addTo(this.map)
    //   .openPopup();

    // this.pickupMarker = L.marker(
    //   [this.transportDetails.pickupLatitude, this.transportDetails.pickupLongitude],
    //   { draggable: false, icon: this.getBlueMarker() }
    // ).addTo(this.map);

    // this.destinationMarker = L.marker(
    //   [this.transportDetails.dropoffLatitude, this.transportDetails.dropoffLongitude],
    //   { draggable: false, icon: this.getRedMarker() }
    // ).addTo(this.map);
  }

  private loadRoute(): void {
    // if (!this.transportDetails || !this.currentLocationLat || !this.currentLocationLng) return;

    // const currentCoords = [this.currentLocationLat, this.currentLocationLng];
    // const pickupCoords = [this.transportDetails.pickupLatitude, this.transportDetails.pickupLongitude];
    // const dropoffCoords = [this.transportDetails.dropoffLatitude, this.transportDetails.dropoffLongitude];

    // const firstRouteUrl = `https://router.project-osrm.org/route/v1/driving/${currentCoords[1]},${currentCoords[0]};${pickupCoords[1]},${pickupCoords[0]}?overview=full&geometries=geojson`;

    // this.http.get(firstRouteUrl).subscribe((response: any) => {
    //   if (response?.routes?.length) {
    //     const coords = response.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
    //     L.polyline(coords, { color: 'black', weight: 6, opacity: 0.8 }).addTo(this.map);
    //   }
    // });

    // const secondRouteUrl = `https://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${dropoffCoords[1]},${dropoffCoords[0]}?overview=full&geometries=geojson`;

    // this.http.get(secondRouteUrl).subscribe((response: any) => {
    //   if (response?.routes?.length) {
    //     const coords = response.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
    //     L.polyline(coords, { color: 'blue', weight: 6, opacity: 0.8 }).addTo(this.map);
    //     this.map.fitBounds(L.latLngBounds([...coords, ...currentCoords]));
    //   }
    // });
  }

  getVanMarker() {
    // return L.icon({
    //   iconUrl: '/2020_24.avif',
    //   iconSize: [80, 40],
    //   iconAnchor: [20, 40],
    //   popupAnchor: [0, -40],
    // });
  }

  getBlueMarker() {
    // return L.icon({
    //   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    //   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    //   iconSize: [25, 41],
    //   iconAnchor: [12, 41],
    //   popupAnchor: [1, -34],
    //   shadowSize: [41, 41],
    // });
  }

  getRedMarker() {
    // return L.icon({
    //   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    //   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    //   iconSize: [25, 41],
    //   iconAnchor: [12, 41],
    //   popupAnchor: [1, -34],
    //   shadowSize: [41, 41],
    // });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  openGoogleMaps() {
    if (!this.transportDetails) return;

    let originLat, originLng, destinationLat, destinationLng;

    if (this.deliveryStep === 0) {
      if (!this.currentLocationLat || !this.currentLocationLng) return;
      originLat = this.currentLocationLat;
      originLng = this.currentLocationLng;
      destinationLat = this.transportDetails.pickupLatitude;
      destinationLng = this.transportDetails.pickupLongitude;
    } else if (this.deliveryStep === 1) {
      originLat = this.transportDetails.pickupLatitude;
      originLng = this.transportDetails.pickupLongitude;
      destinationLat = this.transportDetails.dropoffLatitude;
      destinationLng = this.transportDetails.dropoffLongitude;
    } else {
      return;
    }

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destinationLat},${destinationLng}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
  }

  getOrderButtonText(): string {
    return ['Iniciar Recolha', 'Entregar na Morada', 'Finalizar Pedido', 'Pedido Finalizado'][this.deliveryStep] ?? 'Erro';
  }

  handleOrderStep() {
    if (this.deliveryStep === 0) this.startPickup();
    else if (this.deliveryStep === 1) this.startDelivery();
    else if (this.deliveryStep === 2) this.finalizeOrder();
  }

  startPickup() {
    if (!this.transportId || !this.transportDetails) return;

    this.transportDetails.status = 'Going to Pickup';
    this.transportDetails.timeOfRequestAcceptedByDriver = new Date().toISOString();
    const user = this.authManagerSignal.currentUser;

    Object.assign(this.transportDetails, {
      designatedDriverEmail: user?.userName ?? '',
      designatedDriverId: user?.id ?? null,
      designatedDriverLicencePlate: user?.vehiclePlateNumber ?? '',
      designatedDriverName: user?.fullName ?? '',
      designatedDriverPhone: user?.phone ?? '',
      designatedDriverPhoto: user?.userPhoto ?? null,
      designatedDriverRating: 5.0,
      designatedDriverVanColor: user?.vehicleMakeModel ?? '',
      designatedDriverVanModel: user?.vehicleVIN ?? '',
    });

    this.transportRequestService.updateTransportRequest(this.transportId, this.transportDetails).subscribe(() => {
      this.isOrderStarted = true;
      this.openGoogleMaps();
      this.deliveryStep = 1;
    });
  }

  startDelivery() {
    if (!this.transportId || !this.transportDetails) return;

    this.transportDetails.status = 'Going to Dropoff';

    this.transportRequestService.updateTransportRequest(this.transportId, this.transportDetails).subscribe(() => {
      this.isOrderStarted = true;
      this.openGoogleMaps();
      this.deliveryStep = 2;
    });
  }

  finalizeOrder() {
    if (!this.transportId || !this.transportDetails) return;

    this.transportDetails.status = 'Delivered';

    this.transportRequestService.updateTransportRequest(this.transportId, this.transportDetails).subscribe(() => {
      this.isOrderStarted = true;
      this.deliveryStep = 3;
      this.openGoogleMaps();
      this.updateDriverEarnings();
      this.router.navigate(['/driver-delivering-finished']);
    });
  }

  updateDriverEarnings(): void {
    const { designatedDriverId, price } = this.transportDetails;
    if (!designatedDriverId || !price) return;

    const earnings = price * 0.75;
    const driverAccount = this.driverAccountSignal.userDriverAccount;
    if (!driverAccount) return;

    const updatedAccount = {
      totalEarnings: (driverAccount.totalEarnings ?? 0) + earnings,
      pendingPayout: (driverAccount.pendingPayout ?? 0) + earnings,
      totalTripsCompleted: (driverAccount.totalTripsCompleted ?? 0) + 1,
    };

    this.driverAccountSignal.updateUserDriverAccount(updatedAccount);
  }

  getCurrentLocation(): void {
    if (!this.isBrowser || !navigator.geolocation) {
      this.currentLocationAddress = 'Geolocation not supported';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.currentLocationLat = position.coords.latitude;
        this.currentLocationLng = position.coords.longitude;
        this.getAddressFromCoordinates(this.currentLocationLat, this.currentLocationLng);
        if (this.map) {
          this.addMarkers();
          this.loadRoute();
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        this.currentLocationAddress = 'Location unavailable';
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  getAddressFromCoordinates(lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    this.http.get(url).subscribe(
      (response: any) => {
        this.currentLocationAddress = response?.display_name || 'Address not found';
      },
      () => {
        this.currentLocationAddress = 'Error retrieving address';
      }
    );
  }
}
