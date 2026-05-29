import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { TourService } from '../services/tour.service';
import { AuthService } from '../services/auth.service';
import { Tour } from '../models/tour.model';
import { TranslatePipe } from '../../core/translate.pipe';
import { I18nService } from '../../core/i18n.service';
import { LanguageToggleComponent } from '../../core/language-toggle.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LanguageToggleComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  private tourService: TourService = inject(TourService);
  private authService = inject(AuthService);
  private readonly i18n = inject(I18nService);

  username: string = 'User';
  activeToursCount = 0;
  upcomingToursCount = 0;
  tours: Tour[] = [];

  readonly quickLinks = [
    { icon: '➕', titleKey: 'dashboard.quickTitle', descKey: 'dashboard.quickDesc', accent: 'violet' }
  ] as const;

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
    this.tourService.getTours(this.authService.getUserId()).subscribe({
      next: (tours: Tour[]) => {
        this.tours = tours;
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

  viewTour(id: number): void {
    this.router.navigate(['/tours', id]);
  }

  deleteTour(id: number): void {
    if (!confirm(this.i18n.t('dashboard.confirmDelete'))) {
      return;
    }

    this.tourService.deleteTour(id).subscribe({
      next: () => {
        this.tours = this.tours.filter(tour => tour.id !== id);
        this.activeToursCount = this.tours.length;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error deleting tour:', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
