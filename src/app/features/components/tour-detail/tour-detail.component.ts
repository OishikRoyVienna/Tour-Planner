import { Component, OnInit, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import * as L from 'leaflet';
import { Tour } from '../../models/tour.model';
import { TourService } from '../../services/tour.service';
import { TourLogListComponent } from '../tour-log-list/tour-log-list.component';
import { I18nService } from '../../../core/i18n.service';
import { TranslatePipe } from '../../../core/translate.pipe';
import { DurationPipe } from '../../../core/duration.pipe';
import { environment } from '../../environments/environments';
import { ThemeToggleComponent } from '../../../core/theme-toggle.component';

@Component({
  selector: 'app-tour-detail',
  standalone: true,
  imports: [CommonModule, TourLogListComponent, TranslatePipe, DurationPipe, ThemeToggleComponent],
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
        const latLngs = this.extractRouteCoordinates(geoJson);

        if (latLngs?.length) {
          const polyline = L.polyline(latLngs, { color: '#3b82f6', weight: 4 }).addTo(this.map);
          this.map.fitBounds(polyline.getBounds(), { padding: [20, 20] });

          const markerIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          });

          L.marker(latLngs[0], { icon: markerIcon }).addTo(this.map)
            .bindPopup(`🚩 ${this.tour.fromLocation}`).openPopup();
          L.marker(latLngs[latLngs.length - 1], { icon: markerIcon }).addTo(this.map)
            .bindPopup(`🏁 ${this.tour.toLocation}`);
        }
      } catch {
        // kein valides GeoJSON — ignorieren
      }
    }
  }

  private extractRouteCoordinates(geoJson: Record<string, unknown>): L.LatLng[] | null {
    const features = geoJson['features'] as Array<{ geometry?: { coordinates?: number[][] } }> | undefined;
    const featureCoords = features?.[0]?.geometry?.coordinates;
    if (featureCoords?.length) {
      return featureCoords.map((c) => L.latLng(c[1], c[0]));
    }

    const routes = geoJson['routes'] as Array<{ geometry?: string | { coordinates?: number[][] } }> | undefined;
    const routeGeometry = routes?.[0]?.geometry;
    if (!routeGeometry) return null;

    if (typeof routeGeometry === 'string') {
      return this.decodePolyline(routeGeometry);
    }

    const routeCoords = routeGeometry.coordinates;
    if (routeCoords?.length) {
      return routeCoords.map((c) => L.latLng(c[1], c[0]));
    }

    return null;
  }

  private decodePolyline(encoded: string): L.LatLng[] {
    const coordinates: L.LatLng[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte: number;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      lat += (result & 1) ? ~(result >> 1) : (result >> 1);

      shift = 0;
      result = 0;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      lng += (result & 1) ? ~(result >> 1) : (result >> 1);

      coordinates.push(L.latLng(lat / 1e5, lng / 1e5));
    }

    return coordinates;
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

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  imagePreviewUrl(): string {
    const path = this.tour?.imagePath ?? '';
    if (path.startsWith('/api')) {
      return environment.apiUrl.replace(/\/api$/, '') + path;
    }
    return path;
  }

  getTransportIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'BIKE': '🚴', 'HIKE': '🥾', 'RUNNING': '🏃', 'VACATION': '🏖️', 'AUTO': '🚗', 'CAR': '🚗'
    };
    return icons[type] || '📍';
  }
}
