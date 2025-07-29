import { API_URL } from '@/constants/routes';

interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// API Response User Type (from backend)
interface ApiUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Frontend User Type (matches dbInterface.ts)
export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

function transformUserData(users: ApiUser[]): User[] {
  return users.map(user => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt)
  }));
}

export async function searchUsers(search: string = ''): Promise<User[]> {
  try {
    const response = await fetch(`${API_URL}/users/search?username=${encodeURIComponent(search)}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return transformUserData(data.users || []);
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const user: ApiUser = await response.json();
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    };
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return null;
  }
}
