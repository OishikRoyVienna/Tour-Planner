import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TourLog } from '../models/tour-log.model';
import { environment } from '../environments/environments';

@Injectable({ providedIn: 'root' })
export class TourLogService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tour-logs`;

  getLogsByTour(tourId: number): Observable<TourLog[]> {
    return this.http.get<TourLog[]>(`${this.baseUrl}?tourId=${tourId}`);
  }

  getLog(id: number): Observable<TourLog> {
    return this.http.get<TourLog>(`${this.baseUrl}/${id}`);
  }

  createLog(log: Omit<TourLog, 'id'>): Observable<TourLog> {
    return this.http.post<TourLog>(this.baseUrl, log);
  }

  updateLog(id: number, log: Partial<TourLog>): Observable<TourLog> {
    return this.http.put<TourLog>(`${this.baseUrl}/${id}`, log);
  }

  deleteLog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
