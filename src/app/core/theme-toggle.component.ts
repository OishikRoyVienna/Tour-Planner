import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <div class="theme-toggle">
      <button
        type="button"
        class="theme-btn"
        (click)="theme.toggle()"
        [title]="theme.isDark() ? 'Light mode' : 'Dark mode'"
      >
        {{ theme.isDark() ? '☀️' : '🌙' }}
      </button>
    </div>
  `,
  styleUrl: './theme-toggle.component.css'
})
export class ThemeToggleComponent {
  theme = inject(ThemeService);
}
