import { Component, OnInit, effect, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TransportRequestSignal } from '../../../_signals/transportRequest';
import { MyTransportRequestsSignal } from '../../../_signals/my-transport-requests.signal';

@Component({
  selector: 'app-drivers-transports',
  imports: [CommonModule, RouterModule],
  templateUrl: './drivers-transports.component.html',
  standalone: true
})
export class DriversTransportsComponent implements OnInit {
  transportRequestSignal = inject(TransportRequestSignal);
  myTransportRequestsSignal = inject(MyTransportRequestsSignal);

  constructor(
    private router: Router,
  ) {
    effect(() => {
      this.myTransportRequestsSignal.setTransportRequests(this.transportRequestSignal.transportRequests);
    });
  }

  ngOnInit(): void {
    this.transportRequestSignal.loadTransportRequests();
  }



  acceptRequest(request: any) {
    this.router.navigate(['/driver-delivering', request.id]);
  }

  deleteRequest(id: number): void {
    this.transportRequestSignal.deleteTransportRequest(id);
  }

  refreshTransportRequests() {
    this.transportRequestSignal.loadTransportRequests();
  }

  getTimeAgo(requestTime: string): string {
    const requestDate = new Date(requestTime);
    const now = new Date();
    const diffInMs = now.getTime() - requestDate.getTime();

    const minutes = Math.floor(diffInMs / 60000) % 60;
    const hours = Math.floor(diffInMs / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    let timeAgo = "";

    if (days > 0) {
      timeAgo += `${days} dia${days > 1 ? "s" : ""}`;
    }
    if (hours > 0) {
      timeAgo += (timeAgo ? ", " : "") + `${hours} hora${hours > 1 ? "s" : ""}`;
    }
    if (minutes > 0) {
      timeAgo += (timeAgo ? " e " : "") + `${minutes} minuto${minutes > 1 ? "s" : ""}`;
    }

    return timeAgo ? `${timeAgo} atrás` : "Agora mesmo";
  }
}
