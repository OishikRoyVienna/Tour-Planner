import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { InMemoryTourLogService } from '../../../core/in-memory-tour-log.service';
import { TourLog } from '../../models/tour-log.model';

@Component({
  selector: 'app-tour-log-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tour-log-list.component.html',
  styleUrl: './tour-log-list.component.css'
})
export class TourLogListComponent implements OnInit {
  private tourLogService = inject(InMemoryTourLogService);
  private router = inject(Router);

  @Input() tourId!: number;

  tourLogs: TourLog[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    if (this.tourId) {
      this.loadLogs();
    }
  }

  loadLogs(): void {
    this.loading = true;
    this.error = null;

    this.tourLogService.getLogsByTour(this.tourId).subscribe({
      next: (logs) => {
        this.tourLogs = logs;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  createNewLog(): void {
    this.router.navigate(['/tours', this.tourId, 'logs', 'new']);
  }

  editLog(id: number): void {
    this.router.navigate(['/tours', this.tourId, 'logs', id, 'edit']);
  }

  deleteLog(id: number): void {
    if (confirm('Are you sure you want to delete this log?')) {
      this.tourLogService.deleteLog(id).subscribe({
        next: () => {
          this.tourLogs = this.tourLogs.filter(log => log.id !== id);
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    }
  }

  getDifficultyLabel(difficulty: 'EASY' | 'MEDIUM' | 'HARD' | undefined): string {
    if (!difficulty) return 'Unknown';
    const labels: { [key: string]: string } = {
      'EASY': 'Easy 🟢',
      'MEDIUM': 'Medium 🟡',
      'HARD': 'Hard 🔴'
    };
    return labels[difficulty] || difficulty;
  }

  getDifficultyColor(difficulty: 'EASY' | 'MEDIUM' | 'HARD' | undefined): string {
    if (!difficulty) return '#999';
    const colors: { [key: string]: string } = {
      'EASY': '#4CAF50',
      'MEDIUM': '#FFC107',
      'HARD': '#F44336'
    };
    return colors[difficulty] || '#999';
  }

  getRatingStars(rating: number | undefined): string {
    if (!rating) return '☆☆☆☆☆';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}
