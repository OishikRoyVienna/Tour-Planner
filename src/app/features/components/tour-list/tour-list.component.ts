import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';  // ← HINZUFÜGEN für Navigation!
import { TourService } from '../../services/tour.service';
import { Tour } from '../../models/tour.model';

@Component({
  selector: 'app-tour-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour-list.component.html',
  styleUrl: './tour-list.component.css'
})
class TourListComponent implements OnInit {
  private tourService = inject(TourService);
  private router = inject(Router);  // ← HINZUFÜGEN!

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

  // ========== FEHLENDE METHODEN HINZUFÜGEN ==========

  /**
   * Navigate to tour detail page
   */
  viewTour(id: number): void {
    this.router.navigate(['/tours', id]);
  }

  /**
   * Navigate to tour edit page
   */
  editTour(id: number): void {
    this.router.navigate(['/tours', id, 'edit']);
  }

  /**
   * Delete a tour with confirmation
   */
  deleteTour(id: number): void {
    if (confirm('Are you sure you want to delete this tour?')) {
      this.tourService.deleteTour(id).subscribe({
        next: () => {
          // Remove from local list
          this.tours = this.tours.filter(t => t.id !== id);
          console.log('✅ Tour deleted');
        },
        error: (err) => {
          this.error = err.message;
          console.error('❌ Error deleting tour:', err);
        }
      });
    }
  }

  /**
   * Navigate to create new tour page
   */
  createNewTour(): void {
    this.router.navigate(['/tours/new']);
  }


}

export default TourListComponent;
