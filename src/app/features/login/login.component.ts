import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { InMemoryAuthService } from '../../core/in-memory-auth.service';
import { TranslatePipe } from '../../core/translate.pipe';
import { I18nService } from '../../core/i18n.service';
import { LanguageToggleComponent } from '../../core/language-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, TranslatePipe, LanguageToggleComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly auth = inject(InMemoryAuthService);
  private readonly i18n = inject(I18nService);

  username: string = '';
  password: string = '';
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router) {}

  onSubmit(): void {
    this.isLoading = true;
    this.message = '';
    this.cdr.detectChanges();

    queueMicrotask(() => {
      const ok = this.auth.login(this.username, this.password);
      this.isLoading = false;
      if (ok) {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('username', this.username);
        this.router.navigate(['/dashboard']);
      } else {
        this.message = this.i18n.t('auth.invalidLogin');
        this.isError = true;
      }
      this.cdr.detectChanges();
    });
  }
}
