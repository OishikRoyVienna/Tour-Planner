import { Component, inject } from '@angular/core';
import { I18nService } from './i18n.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  template: `
    <div class="lang-toggle" role="group" [attr.aria-label]="i18n.t('lang.aria')">
      <span class="lang-label">{{ i18n.t('lang.label') }}</span>
      <button
        type="button"
        class="lang-btn"
        [class.active]="i18n.lang() === 'de'"
        (click)="i18n.setLang('de')"
      >
        DE
      </button>
      <button
        type="button"
        class="lang-btn"
        [class.active]="i18n.lang() === 'en'"
        (click)="i18n.setLang('en')"
      >
        EN
      </button>
    </div>
  `,
  styleUrl: './language-toggle.component.css'
})
export class LanguageToggleComponent {
  protected readonly i18n = inject(I18nService);
}
