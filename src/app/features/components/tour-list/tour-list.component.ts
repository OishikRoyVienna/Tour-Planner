import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { AuthService } from '../../services/auth.service';
import { Tour } from '../../models/tour.model';
import { TranslatePipe } from '../../../core/translate.pipe';
import { DurationPipe } from '../../../core/duration.pipe';
import { LanguageToggleComponent } from '../../../core/language-toggle.component';
import { ThemeToggleComponent } from '../../../core/theme-toggle.component';
import { I18nService } from '../../../core/i18n.service';

@Component({
  selector: 'app-tour-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, DurationPipe, LanguageToggleComponent, ThemeToggleComponent],
  templateUrl: './tour-list.component.html',
  styleUrl: './tour-list.component.css'
})
export class TourListComponent implements OnInit {
  private tourService = inject(TourService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private readonly i18n = inject(I18nService);

  tours: Tour[] = [];
  loading = false;
  error: string | null = null;
  searchQuery = '';

  get currentUserId(): number {
    return this.authService.getUserId();
  }

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.loading = true;
    this.error = null;

    this.tourService.getTours(this.currentUserId).subscribe({
      next: (tours) => {
        this.tours = tours;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.loadTours();
      return;
    }

    this.loading = true;
    this.error = null;
    this.tourService.searchTours(this.currentUserId, this.searchQuery).subscribe({
      next: (tours) => {
        this.tours = tours;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  viewTour(id: number): void {
    this.router.navigate(['/tours', id]);
  }

  editTour(id: number): void {
    this.router.navigate(['/tours', id, 'edit']);
  }

  deleteTour(id: number): void {
    if (confirm(this.i18n.t('tourList.confirmDelete'))) {
      this.tourService.deleteTour(id).subscribe({
        next: () => { this.tours = this.tours.filter(t => t.id !== id); },
        error: (err) => { this.error = err.message; }
      });
    }
  }

  createNewTour(): void {
    this.router.navigate(['/tours/new']);
  }
}
