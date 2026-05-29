import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { AuthService } from '../../services/auth.service';
import { Tour } from '../../models/tour.model';
import { TranslatePipe } from '../../../core/translate.pipe';
import { LanguageToggleComponent } from '../../../core/language-toggle.component';
import { I18nService } from '../../../core/i18n.service';
import { environment } from '../../environments/environments';

@Component({
  selector: 'app-tour-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, LanguageToggleComponent],
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

  exportTours(): void {
    window.open(`${environment.apiUrl}/export?userId=${this.currentUserId}`, '_blank');
  }

  importTours(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const formData = new FormData();
    formData.append('file', input.files[0]);
    formData.append('userId', String(this.currentUserId));

    fetch(`${environment.apiUrl}/import`, { method: 'POST', body: formData })
      .then(r => r.json())
      .then(result => {
        alert(`Import: ${result.toursImported} Touren, ${result.logsImported} Logs`);
        this.loadTours();
      })
      .catch(() => { this.error = 'Import fehlgeschlagen'; });

    input.value = '';
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
