import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TourLog } from '../features/models/tour-log.model';

@Injectable({
  providedIn: 'root'
})
export class InMemoryTourLogService {
  private tourLogs: TourLog[] = [];
  private nextId = 1;

  getLogsByTour(tourId: number): Observable<TourLog[]> {
    const logs = this.tourLogs.filter(log => log.tourId === tourId);
    return of(logs);
  }

  getLog(id: number): Observable<TourLog> {
    const log = this.tourLogs.find(l => l.id === id);
    if (!log) {
      throw new Error(`TourLog with ID ${id} not found`);
    }
    return of(log);
  }

  createLog(logData: Omit<TourLog, 'id'>): Observable<TourLog> {
    const newLog: TourLog = {
      ...logData,
      id: this.nextId++
    };
    this.tourLogs.push(newLog);
    return of(newLog);
  }

  updateLog(id: number, logData: Partial<TourLog>): Observable<TourLog> {
    const index = this.tourLogs.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error(`TourLog with ID ${id} not found`);
    }

    const updatedLog: TourLog = {
      ...this.tourLogs[index],
      ...logData
    };
    this.tourLogs[index] = updatedLog;
    return of(updatedLog);
  }

  deleteLog(id: number): Observable<void> {
    const index = this.tourLogs.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error(`TourLog with ID ${id} not found`);
    }

    this.tourLogs.splice(index, 1);
    return of(undefined);
  }
}
