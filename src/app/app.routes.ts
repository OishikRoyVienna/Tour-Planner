import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TourListComponent } from './features/components/tour-list/tour-list.component';
import { TourDetailComponent } from './features/components/tour-detail/tour-detail.component';
import { TourFormComponent } from './features/components/tour-form/tour-form.component';
import { TourLogListComponent } from './features/components/tour-log-list/tour-log-list.component';
import { TourLogFormComponent } from './features/components/tour-log-form/tour-log-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'tours', component: TourListComponent },
  { path: 'tours/new', component: TourFormComponent },
  { path: 'tours/:id', component: TourDetailComponent },
  { path: 'tours/:id/edit', component: TourFormComponent },
  { path: 'tours/:tourId/logs/new', component: TourLogFormComponent },
  { path: 'tours/:tourId/logs/:logId/edit', component: TourLogFormComponent },
  { path: '**', redirectTo: 'login' }
];
