import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.readInitial());

  constructor() {
    document.body.classList.toggle('dark', this.isDark());
  }

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    document.body.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  private readInitial(): boolean {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
