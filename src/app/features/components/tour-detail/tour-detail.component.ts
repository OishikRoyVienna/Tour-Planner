import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Tour } from '../../models/tour.model';
import { TourService } from '../../services/tour.service';
import { TourLogListComponent } from '../tour-log-list/tour-log-list.component';
import { TranslatePipe } from '../../../core/translate.pipe';
import { LanguageToggleComponent } from '../../../core/language-toggle.component';
import { I18nService } from '../../../core/i18n.service';

@Component({
  selector: 'app-tour-detail',
  standalone: true,
  imports: [CommonModule, TourLogListComponent, TranslatePipe, LanguageToggleComponent],
  templateUrl: './tour-detail.component.html',
  styleUrl: './tour-detail.component.css'
})
export class TourDetailComponent implements OnInit {
  private tourService: TourService = inject(TourService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private readonly i18n = inject(I18nService);

  tour: Tour | null = null;
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadTour(+id);
      }
    });
  }

  loadTour(id: number): void {
    this.loading = true;
    this.error = null;

    this.tourService.getTour(id).subscribe({
      next: (tour: Tour) => {
        this.tour = tour;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  deleteTour(): void {
    if (!this.tour?.id) return;

    if (confirm(this.i18n.t('tourDetail.confirmDelete'))) {
      this.tourService.deleteTour(this.tour.id).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err: HttpErrorResponse) => {
          this.error = err.message;
        }
      });
    }
  }

  editTour(): void {
    if (this.tour?.id) {
      this.router.navigate(['/tours', this.tour.id, 'edit']);
    }
  }

  getTransportIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'BIKE': '🚴',
      'HIKE': '🥾',
      'RUNNING': '🏃',
      'VACATION': '🏖️'
    };
    return icons[type] || '📍';
  }
}
