import { ROUTES } from '@/constants/routes';
import { Session, UserInfo } from '@/types/dbInterface';
import Cookies from 'js-cookie';

const API_BASE = ROUTES.API;

export class AuthService {
  private static async fetchWithAuth<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers
      },
      // Always include credentials for cross-origin requests
      credentials: 'include',
      // Add cache control headers to prevent caching of auth requests
      cache: 'no-store',
      // Add CORS mode for cross-origin requests
      mode: 'cors'
    };

    if (isProduction && isVercel) {
      // For Vercel production, ensure we're using the correct domain
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (url.startsWith('/')) {
        url = `${baseUrl}${url}`;
      }
    }

    console.log('Making authenticated request:', {
      url,
      method: options.method || 'GET',
      credentials: requestOptions.credentials,
      isProduction,
      isVercel,
      hasCookies:
        typeof document !== 'undefined' ? document.cookie.length > 0 : 'n/a'
    });

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Request failed');
      const error = new Error(errorText || 'Request failed');

      // Add status code to error for better error handling
      (error as any).status = response.status;

      if (typeof window !== 'undefined' && response.status === 401) {
        console.log('Unauthorized - removing JWT cookie');
        Cookies.remove('jwt');
        Cookies.remove('isAuthenticated');
      }

      console.error('Request failed:', {
        status: response.status,
        statusText: response.statusText,
        url,
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });

      throw error;
    }

    try {
      return await response.json();
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      throw new Error('Failed to parse response');
    }
  }

  static async login(email: string): Promise<{ access_token: string }> {
    console.log('Attempting login for email:', email);

    try {
      const response = await fetch(ROUTES.AUTH.LOGIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        credentials: 'include', // This is crucial for receiving cookies
        body: JSON.stringify({ email })
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Login failed');
        console.error('Login error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(errorText || 'Login failed');
      }

      // Get the response data
      const data = await response.json();
      console.log('Login successful, response data:', data);

      // The server should set the HTTP-only cookie
      // We don't need to handle the token client-side anymore

      return { access_token: 'http-only-cookie' };
    } catch (error) {
      console.error('Login request failed:', error);
      throw error;
    }
  }

  static async getProfile(): Promise<UserInfo> {
    console.log('Fetching profile from:', `${API_BASE}/auth/profile`);

    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'GET',
      credentials: 'include', // This is crucial for sending cookies
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    });

    console.log('Profile response status:', response.status);

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => 'Failed to fetch profile');
      console.error('Profile fetch error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      if (response.status === 401) {
        console.log('Authentication failed, clearing session');
        this.logout();
      }

      throw new Error(
        `Failed to fetch user profile: ${response.status} ${response.statusText}`
      );
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
      console.log('Getting session...');

      // First try to get the profile using the HTTP-only cookie
      const user = await this.getProfile();

      if (!user) {
        console.log('No user found in session');
        return null;
      }

      console.log('Session user found:', {
        id: user._id,
        email: user.email,
        name: user.name
      });

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
      // Don't throw here, just return null to indicate no valid session
      return null;
    }
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      Cookies.remove('jwt', { path: '/' });
    }
  }
}
