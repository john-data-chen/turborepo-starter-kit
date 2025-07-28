import { ROUTES } from '@/constants/routes';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  user: User;
  accessToken: string;
}

const API_BASE = ROUTES.API;

export class AuthService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text().catch(() => 'Request failed');
      if (typeof window !== 'undefined' && response.status === 401) {
        Cookies.remove('jwt');
      }
      throw new Error(error || 'Request failed');
    }
    return response.json();
  }

  // Static version of handleResponse for static methods
  private static async handleStaticResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text().catch(() => 'Request failed');
      if (typeof window !== 'undefined' && response.status === 401) {
        Cookies.remove('jwt');
      }
      throw new Error(error || 'Request failed');
    }
    return response.json();
  }

  static async validateSession(token?: string): Promise<Session | null> {
    if (!token) return null;
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) return null;

      const user = await response.json();
      return { user, accessToken: token };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  // Instance method version for dependency injection
  async validateSessionInstance(
    cookieHeader?: string
  ): Promise<Session | null> {
    return AuthService.validateSession(cookieHeader);
  }

  async login(email: string): Promise<{ access_token: string }> {
    const response = await fetch(ROUTES.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email })
    });

    const data = await this.handleResponse<{ access_token: string }>(response);

    if (typeof window !== 'undefined') {
      Cookies.set('jwt', data.access_token, { expires: 7, path: '/' });
    }

    return data;
  }

  // Static version for backward compatibility
  static async loginStatic(email: string): Promise<{ access_token: string }> {
    return new AuthService().login(email);
  }

  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      },
      credentials: 'include'
    });

    return this.handleResponse<User>(response);
  }

  // Static version for backward compatibility
  static async getProfileStatic(token: string): Promise<User> {
    return new AuthService().getProfile(token);
  }

  // Client-side only
  async getSession(): Promise<Session | null> {
    if (typeof window === 'undefined') {
      throw new Error('getSession should only be called on the client side');
    }

    const token = Cookies.get('jwt');
    if (!token) return null;

    try {
      const user = await this.getProfile(token);
      return {
        user,
        accessToken: token
      };
    } catch (error) {
      console.error('Failed to get session:', error);
      this.logout();
      return null;
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      Cookies.remove('jwt');
    }
  }

  // Static versions for backward compatibility
  static async getSessionStatic(): Promise<Session | null> {
    return new AuthService().getSession();
  }

  static logoutStatic(): void {
    new AuthService().logout();
  }
}

const authService = new AuthService();

export default authService;
