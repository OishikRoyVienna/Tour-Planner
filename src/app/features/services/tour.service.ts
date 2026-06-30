import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tour } from '../models/tour.model';
import { environment } from '../environments/environments';

export interface RouteInfo {
  distance: number;
  estimatedTime: number;
  routeInformation: string;
}

@Injectable({ providedIn: 'root' })
export class TourService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tours`;

  getTours(userId: number): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.baseUrl}?userId=${userId}`);
  }

  getTour(id: number): Observable<Tour> {
    return this.http.get<Tour>(`${this.baseUrl}/${id}`);
  }

  searchTours(userId: number, query: string): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.baseUrl}/search?userId=${userId}&q=${encodeURIComponent(query)}`);
  }

  createTour(tourData: Omit<Tour, 'id'>): Observable<Tour> {
    return this.http.post<Tour>(this.baseUrl, tourData);
  }

  updateTour(id: number, tourData: Partial<Tour>): Observable<Tour> {
    return this.http.put<Tour>(`${this.baseUrl}/${id}`, tourData);
  }

  deleteTour(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getRoute(from: string, to: string, transportType: string): Observable<RouteInfo> {
    const params = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&transportType=${transportType}`;
    return this.http.get<RouteInfo>(`${this.baseUrl}/route?${params}`);
  }

  uploadImage(file: File): Observable<{ imagePath: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imagePath: string }>(`${environment.apiUrl}/images/upload`, formData);
  }
}
