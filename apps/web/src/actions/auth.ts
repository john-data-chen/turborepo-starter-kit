'use server';

import { cookies } from 'next/headers';

export async function isAuthenticated() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const jwtCookie = allCookies.find(cookie => cookie.name === 'jwt');
    return { isAuthenticated: !!jwtCookie?.value };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { isAuthenticated: false };
  }
}
