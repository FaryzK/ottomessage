import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connect';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();

    const { firebaseId, name, image } = await request.json();

    if (!firebaseId) {
      return NextResponse.json(
        { error: 'Firebase ID is required' },
        { status: 400 }
      );
    }

    // Find user by firebaseId or create new one
    let user = await User.findOne({ firebaseId });

    if (!user) {
      user = await User.create({
        firebaseId,
        name,
        image
      });
    } else {
      // Update user info if it has changed
      if (name !== user.name || image !== user.image) {
        user.name = name;
        user.image = image;
        await user.save();
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json(
      { error: 'Failed to save user' },
      { status: 500 }
    );
  }
} 