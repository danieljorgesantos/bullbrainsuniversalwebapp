import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LeafletService } from '../../../_shared/services/leaflet.service';
import { RequesterTransportsSignal } from '../../../_signals/requesterTransports.signal';

@Component({
  selector: 'app-requester-my-transport-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './requester-my-transport-detail.component.html',
  providers: [LeafletService, RequesterTransportsSignal],
})
export class RequesterMyTransportDetailComponent implements OnInit, OnDestroy {
  currentLanguage: string = 'pt-PT';


  
  private leaflet = inject(LeafletService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private cd = inject(ChangeDetectorRef);

  public transportDetails: any = null;
  private map: any;
  private pickupMarker: any;
  private destinationMarker: any;
  private routeLayer: any;

  public isBrowser: boolean = false;
  private transportId: number | null = null;

  constructor(public requesterTransportsSignal: RequesterTransportsSignal) {}

  async ngOnInit(): Promise<void> {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (!this.isBrowser) return;

    this.transportId = Number(this.route.snapshot.paramMap.get('transportId'));

    // 🚀 Load transport requests if needed
    if (this.requesterTransportsSignal.requesterTransports.length === 0) {
      try {
        await this.requesterTransportsSignal.loadRequesterTransports();
        console.log('✅ Loaded transport requests in detail component');
      } catch (err) {
        console.error('❌ Error loading transport requests', err);
        return;
      }
    }

    // 🔍 Find the specific transport
    this.transportDetails = this.requesterTransportsSignal.requesterTransports.find(
      t => Number(t.id) === this.transportId
    );

    if (!this.transportDetails) {
      console.warn('❌ Transporte não encontrado. A redirecionar...');
      this.router.navigate(['/requester-my-transports']);
      return;
    }

    // ⛳️ Initialize map after view is ready
    setTimeout(() => this.initializeMap(), 0);
  }

  initializeMap(): void {
    const L = this.leaflet.L;

    this.map = L.map('transport-map', { attributionControl: false }).setView(
      [this.transportDetails.pickupLatitude, this.transportDetails.pickupLongitude],
      12
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
    }).addTo(this.map);

    this.pickupMarker = L.marker(
      [this.transportDetails.pickupLatitude, this.transportDetails.pickupLongitude],
      { icon: this.getBlueMarker() }
    )
      .addTo(this.map)
      .bindPopup(`Ponto de Recolha: ${this.transportDetails.pickupLocationText}`)
      .openPopup();

    this.destinationMarker = L.marker(
      [this.transportDetails.dropoffLatitude, this.transportDetails.dropoffLongitude],
      { icon: this.getRedMarker() }
    )
      .addTo(this.map)
      .bindPopup(`Ponto de Entrega: ${this.transportDetails.dropoffLocationText}`);

    this.getRoute();
  }

  getBlueMarker() {
    return this.leaflet.L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  getRedMarker() {
    return this.leaflet.L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  getRoute() {
    const pickupCoords = this.pickupMarker.getLatLng();
    const destinationCoords = this.destinationMarker.getLatLng();

    const url = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=full&geometries=geojson`;

    fetch(url)
      .then(res => res.json())
      .then(response => {
        if (response?.routes?.length > 0) {
          const routeCoords = response.routes[0].geometry.coordinates.map((coord: any) => [coord[1], coord[0]]);
          if (this.routeLayer) this.map.removeLayer(this.routeLayer);

          this.routeLayer = this.leaflet.L.polyline(routeCoords, { color: 'black', weight: 5, opacity: 0.7 });
          this.routeLayer.addTo(this.map);
          this.map.fitBounds(this.routeLayer.getBounds());
        } else {
          console.warn('⚠️ Nenhuma rota encontrada.');
        }
      })
      .catch(err => console.error('❌ Erro ao buscar rota:', err));
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }
}
