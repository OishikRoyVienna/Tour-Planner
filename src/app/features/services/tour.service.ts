import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Tour } from '../models/tour.model';

@Injectable({ providedIn: 'root' })
export class TourService {
  // Temporäre Tours im Speicher
  private tours: Tour[] = [];
  private nextId = 1;

  getTours(userId: number): Observable<Tour[]> {
    const userTours = this.tours.filter(t => t.userId === userId);
    console.log('✅ Fetched tours from memory:', userTours);
    return of(userTours);
  }

  getTour(id: number): Observable<Tour> {
    const tour = this.tours.find(t => t.id === id);
    if (!tour) {
      throw new Error(`Tour with ID ${id} not found`);
    }
    return of(tour);
  }

  createTour(tourData: Omit<Tour, 'id'>): Observable<Tour> {
    const newTour: Tour = {
      ...tourData,
      id: this.nextId++
    };
    this.tours.push(newTour);
    console.log('✅ Created tour in memory:', newTour);
    return of(newTour);
  }

  updateTour(id: number, tourData: Partial<Tour>): Observable<Tour> {
    const index = this.tours.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Tour with ID ${id} not found`);
    }

    const updatedTour: Tour = {
      ...this.tours[index],
      ...tourData
    };
    this.tours[index] = updatedTour;
    return of(updatedTour);
  }

  deleteTour(id: number): Observable<void> {
    const index = this.tours.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Tour with ID ${id} not found`);
    }

    this.tours.splice(index, 1);
    return of(undefined);
  }
}
