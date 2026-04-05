import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environments';  // ← KORREKTER PFAD!
import { Tour } from '../models/tour.model';

@Injectable({ providedIn: 'root' })
export class TourService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tours`;

  getTours(userId: number): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.apiUrl}?userId=${userId}`)
      .pipe(
        tap(tours => console.log('✅ Fetched tours:', tours)),
        catchError(this.handleError)
      );
  }

  getTour(id: number): Observable<Tour> {
    return this.http.get<Tour>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createTour(tour: Omit<Tour, 'id'>): Observable<Tour> {
    return this.http.post<Tour>(this.apiUrl, tour)
      .pipe(
        tap(newTour => console.log('✅ Created tour:', newTour)),
        catchError(this.handleError)
      );
  }

  updateTour(id: number, tour: Partial<Tour>): Observable<Tour> {
    return this.http.put<Tour>(`${this.apiUrl}/${id}`, tour)
      .pipe(catchError(this.handleError));
  }

  deleteTour(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status === 0) {
      errorMessage = '⚠️ Backend not running. Start Spring Boot on port 8080.';
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error?.message) {
        errorMessage += `\nDetails: ${error.error.message}`;
      }
    }

    console.error('❌ HTTP Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
