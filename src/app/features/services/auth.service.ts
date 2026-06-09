import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environments';

export interface UserResponse {
  id: number;
  username: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  login(username: string, password: string): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap(user => {
        localStorage.setItem('userId', String(user.id));
        localStorage.setItem('username', user.username);
      })
    );
  }

  register(data: { username: string; password: string; email?: string }): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  }

  getUserId(): number {
    const id = Number(localStorage.getItem('userId'));
    return Number.isFinite(id) && id > 0 ? id : 0;
  }

  getUsername(): string {
    return localStorage.getItem('username') ?? '';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userId');
  }
}
