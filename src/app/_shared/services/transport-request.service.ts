import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransportRequestService {
  private apiUrl = `${environment.apiBaseUrl}/api/TransportRequest`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Get all transport requests
  getAllTransportRequests(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/getAll');
  }

  // Get a single transport request by ID
  getTransportRequestById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Create a new transport request
  createTransportRequest(transportRequest: any): Observable<any> {
    return this.http.post(this.apiUrl + '/create', transportRequest);
  }

  // Update an existing transport request
  updateTransportRequest(id: number, transportRequest: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, transportRequest);
  }

  // Delete a transport request
  deleteTransportRequest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  // Requester -----------------------------------------------------------------------------------------

  private _transportRequests = signal<any[]>([]); // Stores the transport requests
  private _currentUserEmail = signal<string | null>(null); // Stores the logged-in user's email

  // Getter to access all transport requests
  get transportRequests() {
    return this._transportRequests();
  }

  // Getter to access the current user email
  get currentUserEmail() {
    return this._currentUserEmail();
  }

  // Getter to get my own transport requests
  get requesterTransports() {
    if (!this._currentUserEmail()) {
      return [];
    }
    return this._transportRequests().filter(req => req.requesterEmail === this._currentUserEmail());
  }

  // Get transport requests for the logged-in user
  getUserTransportRequests(userId: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }
}
