import { auth } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { NextResponse } from 'next/server';

export const GET = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const users = await UserModel.find().select('_id email name');
    return NextResponse.json({ users });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
});
