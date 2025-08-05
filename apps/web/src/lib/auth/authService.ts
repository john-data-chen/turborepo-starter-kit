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
    return this.fetchWithAuth<{ access_token: string }>(ROUTES.AUTH.LOGIN_API, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  static async getProfile(token: string): Promise<UserInfo> {
    const user = await this.fetchWithAuth<any>(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Ensure we have required fields
    if (!user || !user.email) {
      throw new Error('Invalid user data received from server');
    }
    // Map the backend user to our frontend User type
    const userInfo: UserInfo = {
      _id: user._id,
      email: user.email,
      name: user.name || user.email.split('@')[0] || 'User'
    };

    return userInfo;
  }

  static async getSession(): Promise<Session | null> {
    try {
      const token = Cookies.get('jwt');
      if (!token) {
        return null;
      }

      const user = await this.getProfile(token);

      // getProfile now handles the case where _id is undefined
      if (!user) {
        return null;
      }

      return {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name || user.email.split('@')[0]
        },
        accessToken: token
      };
    } catch (error) {
      console.error('Session validation error:', error);
      // Clear invalid token
      if (typeof window !== 'undefined') {
        Cookies.remove('jwt', { path: '/' });
      }
      return null;
    }
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      Cookies.remove('jwt', { path: '/' });
    }
  }
}
