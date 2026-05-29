import { Component, OnInit, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import * as L from 'leaflet';
import { Tour } from '../../models/tour.model';
import { TourService } from '../../services/tour.service';
import { TourLogListComponent } from '../tour-log-list/tour-log-list.component';
import { I18nService } from '../../../core/i18n.service';

@Component({
  selector: 'app-tour-detail',
  standalone: true,
  imports: [CommonModule, TourLogListComponent],
  templateUrl: './tour-detail.component.html',
  styleUrl: './tour-detail.component.css'
})
export class TourDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  private tourService = inject(TourService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private readonly i18n = inject(I18nService);

  tour: Tour | null = null;
  loading = false;
  error: string | null = null;

  private map: L.Map | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadTour(+id);
    });
  }

  ngAfterViewInit(): void {
    // Map wird nach Tour-Load initialisiert
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  loadTour(id: number): void {
    this.loading = true;
    this.error = null;

    this.tourService.getTour(id).subscribe({
      next: (tour: Tour) => {
        this.tour = tour;
        this.loading = false;
        setTimeout(() => this.initMap(), 100);
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  private initMap(): void {
    const mapEl = document.getElementById('leaflet-map');
    if (!mapEl || !this.tour) return;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    this.map = L.map('leaflet-map').setView([48.2082, 16.3738], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    if (this.tour.routeInformation) {
      try {
        const geoJson = JSON.parse(this.tour.routeInformation);
        const routeCoords = geoJson?.routes?.[0]?.geometry?.coordinates;

        if (routeCoords?.length > 0) {
          const latLngs: L.LatLng[] = routeCoords.map((c: number[]) => L.latLng(c[1], c[0]));
          const polyline = L.polyline(latLngs, { color: '#3b82f6', weight: 4 }).addTo(this.map);
          this.map.fitBounds(polyline.getBounds(), { padding: [20, 20] });

          L.marker(latLngs[0]).addTo(this.map)
            .bindPopup(`🚩 ${this.tour.fromLocation}`).openPopup();
          L.marker(latLngs[latLngs.length - 1]).addTo(this.map)
            .bindPopup(`🏁 ${this.tour.toLocation}`);
        }
      } catch {
        // kein valides GeoJSON — ignorieren
      }
    }
  }

  deleteTour(): void {
    if (!this.tour?.id) return;
    if (confirm(this.i18n.t('tourDetail.confirmDelete'))) {
      this.tourService.deleteTour(this.tour.id).subscribe({
        next: () => this.router.navigate(['/tours']),
        error: (err: HttpErrorResponse) => { this.error = err.message; }
      });
    }
  }

  editTour(): void {
    if (this.tour?.id) this.router.navigate(['/tours', this.tour.id, 'edit']);
  }

  getTransportIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'BIKE': '🚴', 'HIKE': '🥾', 'RUNNING': '🏃', 'VACATION': '🏖️', 'CAR': '🚗'
    };
    return icons[type] || '📍';
  }
}
