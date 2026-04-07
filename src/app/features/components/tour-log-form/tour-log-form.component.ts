import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InMemoryTourLogService } from '../../../core/in-memory-tour-log.service';
import { TourLog } from '../../models/tour-log.model';
import { TranslatePipe } from '../../../core/translate.pipe';
import { LanguageToggleComponent } from '../../../core/language-toggle.component';
import { I18nService } from '../../../core/i18n.service';

@Component({
  selector: 'app-tour-log-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, LanguageToggleComponent],
  templateUrl: './tour-log-form.component.html',
  styleUrl: './tour-log-form.component.css'
})
export class TourLogFormComponent implements OnInit {
  private tourLogService = inject(InMemoryTourLogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly i18n = inject(I18nService);

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

  readonly difficultyValues = ['EASY', 'MEDIUM', 'HARD'] as const;
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
      next: log => {
        this.tourLog = { ...log };
        if (this.tourLog.dateTime) {
          this.tourLog.dateTime = this.tourLog.dateTime.slice(0, 16);
        }
      },
      error: err => {
        this.error = err.message;
      }
    });
  }

  onSubmit(): void {
    if (!this.tourLog.dateTime || !this.tourLog.comment) {
      this.error = this.i18n.t('tourLogForm.errRequired');
      return;
    }

    if ((this.tourLog.totalDistance ?? 0) < 0 || (this.tourLog.totalTime ?? 0) < 0) {
      this.error = this.i18n.t('tourLogForm.errPositive');
      return;
    }

    this.saving = true;
    this.error = null;

    const logData = { ...this.tourLog } as Omit<TourLog, 'id'>;

    if (this.isEditMode && this.logId) {
      this.tourLogService.updateLog(this.logId, logData).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          this.error = err.message;
          this.saving = false;
        }
      });
    } else {
      this.tourLogService.createLog(logData).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          this.error = err.message;
          this.saving = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
