import { auth } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { NextResponse } from 'next/server';

export const GET = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const username = searchParams.get('username');

    let query = {};
    if (username) {
      query = {
        $or: [{ name: { $regex: username, $options: 'i' } }]
      };
    }

    const users = await UserModel.find(query).select('_id email name');

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
});
