import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { Tour } from '../../models/tour.model';
import { TranslatePipe } from '../../../core/translate.pipe';
import { LanguageToggleComponent } from '../../../core/language-toggle.component';
import { I18nService } from '../../../core/i18n.service';

@Component({
  selector: 'app-tour-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, LanguageToggleComponent],
  templateUrl: './tour-form.component.html',
  styleUrl: './tour-form.component.css'
})
export class TourFormComponent implements OnInit {
  private tourService = inject(TourService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly i18n = inject(I18nService);

  tour: Partial<Tour> = {
    name: '',
    description: '',
    fromLocation: '',
    toLocation: '',
    transportType: 'HIKE',
    distance: 0,
    estimatedTime: 0,
    routeInformation: '',
    imagePath: '',
    userId: 1,
    popularity: 0,
    childFriendly: false
  };

  isEditMode = false;
  tourId: number | null = null;
  error: string | null = null;
  saving = false;

  readonly transportValues: Array<'HIKE' | 'BIKE' | 'RUNNING' | 'VACATION'> = [
    'HIKE',
    'BIKE',
    'RUNNING',
    'VACATION'
  ];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.tourId = +id;
        this.loadTour(this.tourId);
      }
    });
  }

  loadTour(id: number): void {
    this.tourService.getTour(id).subscribe({
      next: (tour) => {
        this.tour = { ...tour };
      },
      error: (err) => {
        this.error = err.message;
      }
    });
  }

  onSubmit(): void {
    if (!this.tour.name || !this.tour.fromLocation || !this.tour.toLocation) {
      this.error = this.i18n.t('tourForm.errRequired');
      return;
    }

    this.saving = true;
    this.error = null;

    if (this.isEditMode && this.tourId) {
      this.tourService.updateTour(this.tourId, this.tour).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error = err.message;
          this.saving = false;
        }
      });
    } else {
      this.tourService.createTour(this.tour as Omit<Tour, 'id'>).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
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
