import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InMemoryTourLogService } from '../../../core/in-memory-tour-log.service';
import { TourLog } from '../../models/tour-log.model';

@Component({
  selector: 'app-tour-log-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tour-log-form.component.html',
  styleUrl: './tour-log-form.component.css'
})
export class TourLogFormComponent implements OnInit {
  private tourLogService = inject(InMemoryTourLogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  tourLog: Partial<TourLog> = {
    tourId: 0,
    dateTime: new Date().toISOString().slice(0, 16),
    comment: '',
    difficulty: 'MEDIUM',
    totalDistance: 0,
    totalTime: 0,
    rating: 3
  };

  isEditMode = false;
  logId: number | null = null;
  tourId: number | null = null;
  error: string | null = null;
  saving = false;

  difficulties = [
    { value: 'EASY' as const, label: 'Easy 🟢', color: '#4CAF50' },
    { value: 'MEDIUM' as const, label: 'Medium 🟡', color: '#FFC107' },
    { value: 'HARD' as const, label: 'Hard 🔴', color: '#F44336' }
  ];

  ratings = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const tourId = params.get('tourId');
      const logId = params.get('logId');

      if (tourId) {
        this.tourId = +tourId;
        this.tourLog.tourId = this.tourId;
      }

      if (logId) {
        this.isEditMode = true;
        this.logId = +logId;
        this.loadLog(this.logId);
      }
    });
  }

  loadLog(id: number): void {
    this.tourLogService.getLog(id).subscribe({
      next: (log) => {
        this.tourLog = { ...log };
        if (this.tourLog.dateTime) {
          this.tourLog.dateTime = this.tourLog.dateTime.slice(0, 16);
        }
      },
      error: (err) => {
        this.error = err.message;
      }
    });
  }

  onSubmit(): void {
    if (!this.tourLog.dateTime || !this.tourLog.comment) {
      this.error = 'Date/Time and Comment are required!';
      return;
    }

    if ((this.tourLog.totalDistance ?? 0) < 0 || (this.tourLog.totalTime ?? 0) < 0) {
      this.error = 'Distance and Time must be positive!';
      return;
    }

    this.saving = true;
    this.error = null;

    const logData = { ...this.tourLog } as Omit<TourLog, 'id'>;

    if (this.isEditMode && this.logId) {
      this.tourLogService.updateLog(this.logId, logData).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/tours', this.tourId]);
        },
        error: (err) => {
          this.error = err.message;
          this.saving = false;
        }
      });
    } else {
      this.tourLogService.createLog(logData).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/tours', this.tourId]);
        },
        error: (err) => {
          this.error = err.message;
          this.saving = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/tours', this.tourId]);
  }

  getDifficultyColor(value: 'EASY' | 'MEDIUM' | 'HARD' | undefined): string {
    const diff = this.difficulties.find(d => d.value === value);
    return diff ? diff.color : '#999';
  }
}
