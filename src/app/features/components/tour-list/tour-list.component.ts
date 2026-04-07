import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { Tour } from '../../models/tour.model';
import { TranslatePipe } from '../../../core/translate.pipe';
import { LanguageToggleComponent } from '../../../core/language-toggle.component';
import { I18nService } from '../../../core/i18n.service';

@Component({
  selector: 'app-tour-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LanguageToggleComponent],
  templateUrl: './tour-list.component.html',
  styleUrl: './tour-list.component.css'
})
export class TourListComponent implements OnInit {
  private tourService: TourService = inject(TourService);
  private router = inject(Router);
  private readonly i18n = inject(I18nService);

  tours: Tour[] = [];
  loading = false;
  error: string | null = null;
  currentUserId = 1;

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.loading = true;
    this.error = null;

    this.tourService.getTours(this.currentUserId).subscribe({
      next: (tours: Tour[]) => {
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
        next: () => {
          this.tours = this.tours.filter(t => t.id !== id);
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    }
  }

  createNewTour(): void {
    this.router.navigate(['/tours/new']);
  }
}
