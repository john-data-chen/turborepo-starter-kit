import { ROUTES } from '@/constants/routes';

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
        localStorage.removeItem('authToken');
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
        localStorage.removeItem('authToken');
      }
      throw new Error(error || 'Request failed');
    }
    return response.json();
  }

  // Server-side session validation (static version)
  static async validateSession(cookieHeader?: string): Promise<Session | null> {
    try {
      const response = await fetch(`${API_BASE}/auth/validate-session`, {
        headers: {
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) return null;

      return await response.json();
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
      localStorage.setItem('authToken', data.access_token);
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

    const token = localStorage.getItem('authToken');
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
      localStorage.removeItem('authToken');
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
