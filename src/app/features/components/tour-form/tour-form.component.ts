import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { AuthService } from '../../services/auth.service';
import { Tour } from '../../models/tour.model';
import { TranslatePipe } from '../../../core/translate.pipe';
import { DurationPipe } from '../../../core/duration.pipe';
import { LanguageToggleComponent } from '../../../core/language-toggle.component';
import { I18nService } from '../../../core/i18n.service';
import { environment } from '../../environments/environments';

@Component({
  selector: 'app-tour-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, DurationPipe, LanguageToggleComponent],
  templateUrl: './tour-form.component.html',
  styleUrl: './tour-form.component.css'
})
export class TourFormComponent implements OnInit {
  private tourService = inject(TourService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly i18n = inject(I18nService);

  tour: Partial<Tour> = {
    name: '',
    description: '',
    fromLocation: '',
    toLocation: '',
    transportType: 'HIKE',
    distance: undefined,
    estimatedTime: undefined,
    routeInformation: '',
    imagePath: '',
  };

  isEditMode = false;
  tourId: number | null = null;
  error: string | null = null;
  saving = false;
  fetchingRoute = false;
  uploadingImage = false;

  readonly transportValues: Array<'HIKE' | 'BIKE' | 'RUNNING' | 'AUTO'> = [
    'HIKE', 'BIKE', 'RUNNING', 'AUTO'
  ];

  ngOnInit(): void {
    this.tour.userId = this.authService.getUserId();

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
      next: (tour) => { this.tour = { ...tour }; },
      error: (err) => { this.error = err.message; }
    });
  }

  fetchRoute(): void {
    if (!this.tour.fromLocation || !this.tour.toLocation) {
      this.error = 'Bitte Start- und Zielort eingeben';
      return;
    }

    this.fetchingRoute = true;
    this.error = null;

    this.tourService.getRoute(
      this.tour.fromLocation,
      this.tour.toLocation,
      this.tour.transportType ?? 'HIKE'
    ).subscribe({
      next: (routeInfo) => {
        this.tour.distance = routeInfo.distance;
        this.tour.estimatedTime = routeInfo.estimatedTime;
        this.tour.routeInformation = routeInfo.routeInformation;
        this.fetchingRoute = false;
      },
      error: (err) => {
        this.error = err.error?.message ?? 'Route konnte nicht berechnet werden';
        this.fetchingRoute = false;
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingImage = true;
    this.error = null;

    this.tourService.uploadImage(file).subscribe({
      next: (result) => {
        this.tour.imagePath = result.imagePath;
        this.uploadingImage = false;
      },
      error: (err) => {
        this.error = err.error?.message ?? 'Bild konnte nicht hochgeladen werden';
        this.uploadingImage = false;
      }
    });
  }

  imagePreviewUrl(): string {
    const path = this.tour.imagePath ?? '';
    if (path.startsWith('/api')) {
      return environment.apiUrl.replace(/\/api$/, '') + path;
    }
    return path;
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
        next: () => { this.saving = false; this.router.navigate(['/tours', this.tourId]); },
        error: (err) => { this.error = err.error?.message ?? err.message; this.saving = false; }
      });
    } else {
      this.tourService.createTour(this.tour as Omit<Tour, 'id'>).subscribe({
        next: (created) => { this.saving = false; this.router.navigate(['/tours', created.id]); },
        error: (err) => { this.error = err.error?.message ?? err.message; this.saving = false; }
      });
    }
  }

  onCancel(): void {
    if (this.isEditMode && this.tourId) {
      this.router.navigate(['/tours', this.tourId]);
      return;
    }

    const returnUrl = history.state?.['returnUrl'] as string | undefined;
    this.router.navigateByUrl(returnUrl ?? '/dashboard');
  }
}
