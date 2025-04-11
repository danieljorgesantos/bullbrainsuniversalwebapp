import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { TransportRequestService } from '../_shared/services/transport-request.service';

@Injectable({
  providedIn: 'root'
})
export class TransportRequestSignal {
  private _transportRequests = signal<any[]>([]); // Stores the transport requests

  constructor(private transportRequestService: TransportRequestService) {}

  // Getter to access the transport requests
  get transportRequests() {
    return this._transportRequests();
  }

  // Method to load transport requests from the API
  loadTransportRequests(): void {
    this.transportRequestService.getAllTransportRequests().subscribe({
      next: (data) => this._transportRequests.set(data),
      error: (error) => console.error('Error fetching transport requests:', error)
    });
  }

  // Method to add a new transport request
  addTransportRequest(newRequest: any): void {
    this.transportRequestService.createTransportRequest(newRequest).subscribe({
      next: (response) => {
        this._transportRequests.set([...this._transportRequests(), response]);
      },
      error: (error) => console.error('Error creating transport request:', error)
    });
  }

  // Method to update a transport request
  updateTransportRequest(id: number, updatedRequest: any): void {
    this.transportRequestService.updateTransportRequest(id, updatedRequest).subscribe({
      next: () => {
        const updatedRequests = this._transportRequests().map(request =>
          request.id === id ? { ...request, ...updatedRequest } : request
        );
        this._transportRequests.set(updatedRequests);
      },
      error: (error) => console.error('Error updating transport request:', error)
    });
  }

  // Method to delete a transport request
  deleteTransportRequest(id: number): void {
    this.transportRequestService.deleteTransportRequest(id).subscribe({
      next: () => {
        const filteredRequests = this._transportRequests().filter(request => request.id !== id);
        this._transportRequests.set(filteredRequests);
      },
      error: (error) => console.error('Error deleting transport request:', error)
    });
  }
}
