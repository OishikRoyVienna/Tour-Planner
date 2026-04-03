import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  username: string = 'User';

  readonly quickLinks = [
    { icon: '➕', title: 'Neue Tour', desc: 'Plan anlegen', accent: 'violet' }
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
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }
}
