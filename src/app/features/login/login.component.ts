import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';  // 🆐 Import hinzufügen

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  // 🆐 Router injecten
  constructor(private router: Router) {}

  onSubmit(): void {
    this.isLoading = true;
    this.message = '';

    fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.username,
        password: this.password
      })
    })
      .then(response => response.json())
      .then(data => {
        this.isLoading = false;

        if (data.success) {
          // 🆐 Token und Username speichern
          localStorage.setItem('token', 'mock-token');
          localStorage.setItem('username', this.username);

          // 🆐 Zum Dashboard navigieren
          this.router.navigate(['/dashboard']);
        } else {
          this.message = data.message;
          this.isError = true;
        }
      })
      .catch(() => {
        this.isLoading = false;
        this.message = 'Server not reachable';
        this.isError = true;
      });
  }
}
