import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';  // ← Import hinzufügen!
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TourListComponent } from './features/components/tour-list/tour-list.component';
import { TourDetailComponent } from './features/components/tour-detail/tour-detail.component';
import { TourFormComponent } from './features/components/tour-form/tour-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'tours', component: TourListComponent },
  { path: 'tours/new', component: TourFormComponent },
  { path: 'tours/:id', component: TourDetailComponent },
  { path: 'tours/:id/edit', component: TourFormComponent },
  { path: '**', redirectTo: 'login' }
];
