import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslatePipe } from '../../core/translate.pipe';
import { I18nService } from '../../core/i18n.service';
import { LanguageToggleComponent } from '../../core/language-toggle.component';
import { ThemeToggleComponent } from '../../core/theme-toggle.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, TranslatePipe, LanguageToggleComponent, ThemeToggleComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  email = '';
  username = '';
  password = '';
  message = '';
  isError = false;
  isLoading = false;
  submitted = false;

  onSubmit(form: NgForm): void {
    this.submitted = true;
    this.message = '';
    this.isError = false;

    if (form.invalid) {
      this.message = this.i18n.t('register.formInvalid');
      this.isError = true;
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.auth.register({ username: this.username, password: this.password, email: this.email }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.message = err.error?.message ?? this.i18n.t('auth.userExists');
        this.isError = true;
        this.cdr.detectChanges();
      }
    });
  }
}
