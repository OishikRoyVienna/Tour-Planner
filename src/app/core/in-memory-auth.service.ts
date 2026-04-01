import { Injectable } from '@angular/core';

export interface InMemoryUser {
  firstName: string;
  lastName: string;
  birthday: string;
  email: string;
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class InMemoryAuthService {
  private readonly users = new Map<string, InMemoryUser>();

  register(user: InMemoryUser): { success: boolean; message: string } {
    const u = user.username?.trim();
    if (!u) {
      return { success: false, message: 'Username is required' };
    }
    if (this.users.has(u)) {
      return { success: false, message: 'User already exists' };
    }
    this.users.set(u, { ...user, username: u });
    return { success: true, message: 'Registration successful' };
  }

  login(username: string, password: string): boolean {
    const u = this.users.get(username?.trim() ?? '');
    return u != null && u.password === password;
  }
}
