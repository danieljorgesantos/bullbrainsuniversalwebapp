import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../_shared/enviroments/enviroment';
import { AuthManagerSignal } from '../../_signals/authManager.signal';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/api/auth`;

  constructor(
    private http: HttpClient,
    public authManagerSignal: AuthManagerSignal
  ) { }

  register(userData: any): Observable<any> {
    userData.type = Number(userData.type);
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  login(userData: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, userData).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return throwError(() => new Error(error.message || 'Login failed'));
      })
    );
  }

  updateProfile(userData: any) {
    return this.http.put<any>(`${this.apiUrl}/update-profile`, userData);
  }
}
