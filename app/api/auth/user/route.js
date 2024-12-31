import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/firebase/admin';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Initialize Firebase Admin
initAdmin();

// Verify Firebase token middleware
async function verifyToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function POST(request) {
  try {
    const decodedToken = await verifyToken(request);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { name, email, image } = await request.json();

    // Find existing user or create new one
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user
      user.name = name;
      if (image) user.image = image;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        image
      });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image
      }
    });
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
} 