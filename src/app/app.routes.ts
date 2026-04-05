import { Routes } from '@angular/router';
import TourListComponent from './features/components/tour-list/tour-list.component';
import { TourDetailComponent } from './features/components/tour-detail/tour-detail.component';
import { TourFormComponent } from './features/components/tour-form/tour-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'tours', pathMatch: 'full' },
  { path: 'tours', component: TourListComponent },
  { path: 'tours/new', component: TourFormComponent },
  { path: 'tours/:id', component: TourDetailComponent },
  { path: 'tours/:id/edit', component: TourFormComponent },
  { path: '**', redirectTo: 'tours' }
];
