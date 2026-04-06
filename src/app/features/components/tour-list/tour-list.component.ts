import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { Tour } from '../../models/tour.model';

@Component({
  selector: 'app-tour-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour-list.component.html',
  styleUrl: './tour-list.component.css'
})
export class TourListComponent implements OnInit {  // ← ✅ "export" VOR "class"!
  private tourService: TourService = inject(TourService);
  private router = inject(Router);

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
    if (confirm('Are you sure you want to delete this tour?')) {
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
