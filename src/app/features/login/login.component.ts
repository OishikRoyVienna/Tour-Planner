import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
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
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  username: string = '';
  password: string = '';
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.message = this.i18n.t('auth.invalidLogin');
      this.isError = true;
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.cdr.detectChanges();

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading = false;
        this.message = this.i18n.t('auth.invalidLogin');
        this.isError = true;
        this.cdr.detectChanges();
      }
    });
  }
}
