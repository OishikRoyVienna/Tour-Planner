import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';  // ← NEU!

// ← WICHTIG: Named Import, nicht default!
import { TourListComponent } from '../components/tour-list/tour-list.component';
import { TourService } from '../services/tour.service';  // ← NEU! Import hinzufügen!
import { Tour } from '../models/tour.model';  // ← NEU!

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TourListComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  // ← Typ explizit angeben!
  private tourService: TourService = inject(TourService);

  username: string = 'User';
  activeToursCount = 0;
  upcomingToursCount = 0;

  readonly quickLinks = [
    { icon: '➕', title: 'Neue Tour', desc: 'Plan anlegen', accent: 'violet', route: '/tours/new' }
  ] as const;

  currentUserId = 1;

  constructor(private router: Router) {}

  get userInitial(): string {
    const name = this.username?.trim() || '?';
    return name.charAt(0).toUpperCase();
  }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      this.username = storedUser;
    }
    this.loadStats();
  }

  loadStats(): void {
    this.tourService.getTours(this.currentUserId).subscribe({
      // ← Explizite Typen für Callbacks!
      next: (tours: Tour[]) => {
        this.activeToursCount = tours.length;
        this.upcomingToursCount = 0;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading stats:', err);
      }
    });
  }

  createNewTour(): void {
    this.router.navigate(['/tours/new']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }
}
