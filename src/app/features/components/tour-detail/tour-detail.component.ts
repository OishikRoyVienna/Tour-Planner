import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { Tour } from '../../models/tour.model';

@Component({
  selector: 'app-tour-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour-detail.component.html',
  styleUrl: './tour-detail.component.css'
})
export class TourDetailComponent implements OnInit {
  private tourService = inject(TourService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);

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
      next: (tour) => {
        this.tour = tour;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  deleteTour(): void {
    if (!this.tour?.id) return;

    if (confirm('Are you sure you want to delete this tour?')) {
      this.tourService.deleteTour(this.tour.id).subscribe({
        next: () => {
          this.router.navigate(['/tours']);
        },
        error: (err) => {
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
