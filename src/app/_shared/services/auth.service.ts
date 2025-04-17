import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../_shared/enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    userData.type = Number(userData.type);
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  login(userData: { email: string; password: string }): Observable<any> {
    console.log('🔐 Sending login request with:', userData);

    return this.http.post<any>(`${this.apiUrl}/login`, userData).pipe(
      map(response => {
        console.log('✅ Login successful — full response:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Login failed — full error:', error);
        console.error('🧨 Error message:', error.message);
        return throwError(() => new Error(error.message || 'Login failed'));
      })
    );
  }

  updateProfile(userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-profile`, userData);
  }
}
