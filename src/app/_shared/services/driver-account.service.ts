import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../_shared/enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class DriverAccountService {
  private apiUrl = `${environment.apiBaseUrl}/api/driver-accounts`;

  constructor(private http: HttpClient) {}

  // 🔹 Get all driver accounts
  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // 🔹 Get a driver account by ID
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // 🔹 Create a new driver account
  create(driverAccount: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, driverAccount);
  }

  // 🔹 Update an existing driver account
  update(id: number, driverAccount: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, driverAccount);
  }

  // 🔹 Delete a driver account
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
