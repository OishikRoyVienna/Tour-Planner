import { Injectable, signal } from '@angular/core';

export interface AppError {
  message: string;
  status?: number;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class ErrorService {
  readonly currentError = signal<AppError | null>(null);

  show(message: string, status?: number): void {
    this.currentError.set({ message, status, timestamp: new Date() });
  }

  clear(): void {
    this.currentError.set(null);
  }
}
