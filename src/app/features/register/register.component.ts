import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { InMemoryAuthService } from '../../core/in-memory-auth.service';
import { TranslatePipe } from '../../core/translate.pipe';
import { I18nService } from '../../core/i18n.service';
import { LanguageToggleComponent } from '../../core/language-toggle.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, TranslatePipe, LanguageToggleComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly auth = inject(InMemoryAuthService);
  private readonly i18n = inject(I18nService);

  firstName = '';
  lastName = '';
  birthday = '';
  email = '';
  username = '';
  password = '';
  message = '';
  isError = false;
  isLoading = false;
  submitted = false;

  constructor(private router: Router) {}

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

    queueMicrotask(() => {
      const result = this.auth.register({
        firstName: this.firstName,
        lastName: this.lastName,
        birthday: this.birthday,
        email: this.email,
        username: this.username,
        password: this.password
      });
      this.isLoading = false;
      if (result.success) {
        this.router.navigate(['/login']);
      } else {
        this.message = this.mapRegisterError(result.message);
        this.isError = true;
      }
      this.cdr.detectChanges();
    });
  }

  private mapRegisterError(raw: string): string {
    if (raw === 'Username is required') {
      return this.i18n.t('auth.usernameRequired');
    }
    if (raw === 'User already exists') {
      return this.i18n.t('auth.userExists');
    }
    return raw;
  }
}
