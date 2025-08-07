import { ROUTES } from '@/constants/routes';
import { Session, UserInfo } from '@/types/dbInterface';
import Cookies from 'js-cookie';

const API_BASE = ROUTES.API;

export class AuthService {
  private static async fetchWithAuth<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.text().catch(() => 'Request failed');
      if (typeof window !== 'undefined' && response.status === 401) {
        Cookies.remove('jwt');
      }
      throw new Error(error || 'Request failed');
    }

    return response.json();
  }

  static async login(email: string): Promise<{ access_token: string }> {
    // The backend will set the JWT in an HTTP-only cookie
    const response = await fetch(ROUTES.AUTH.LOGIN_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const error = await response.text().catch(() => 'Login failed');
      throw new Error(error);
    }

    const data = await response.json();
    return data;
  }

  static async getProfile(): Promise<UserInfo> {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear any invalid session
        this.logout();
      }
      throw new Error('Failed to fetch user profile');
    }

    const user = await response.json();

    // Ensure we have required fields
    if (!user || !user.email) {
      throw new Error('Invalid user data received from server');
    }

    // Map the backend user to our frontend User type
    return {
      _id: user._id,
      email: user.email,
      name: user.name || user.email.split('@')[0] || 'User'
    };
  }

  static async getSession(): Promise<Session | null> {
    try {
      // First try to get the profile using the HTTP-only cookie
      const user = await this.getProfile();

      if (!user) {
        return null;
      }

      return {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name || user.email.split('@')[0]
        },
        accessToken: 'http-only-cookie' // The actual token is in the HTTP-only cookie
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      Cookies.remove('jwt', { path: '/' });
    }
  }
}
