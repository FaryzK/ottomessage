import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/connect';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    
    const { firebaseId, name, image } = await request.json();

    if (!firebaseId || !name) {
      return NextResponse.json(
        { error: 'Firebase ID and name are required' },
        { status: 400 }
      );
    }

    // Update user if exists, create if doesn't exist
    const user = await User.findOneAndUpdate(
      { firebaseId },
      { name, image },
      { new: true, upsert: true }
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json(
      { error: 'Failed to save user' },
      { status: 500 }
    );
  }
} 