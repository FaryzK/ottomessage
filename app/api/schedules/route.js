import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connect';
import Schedule from '@/models/Schedule';
import UserSchedules from '@/models/UserSchedules';

export async function GET(request) {
  try {
    const conn = await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('Fetching schedules for userId:', userId);

    // Get the user's schedules from UserSchedules
    const userSchedules = await UserSchedules.findOne({ userId });
    console.log('Found UserSchedules:', userSchedules);
    
    if (!userSchedules || !userSchedules.schedules || !Array.isArray(userSchedules.schedules)) {
      console.log('No schedules found or invalid schedules array');
      return NextResponse.json([], { status: 200 });
    }

    // Explicitly fetch and populate schedules
    const schedules = await Schedule.find({
      _id: { $in: userSchedules.schedules }
    });
    console.log('Fetched schedules:', schedules);

    // Ensure we're returning an array
    const schedulesArray = Array.isArray(schedules) ? schedules : [];
    return NextResponse.json(schedulesArray);
  } catch (error) {
    console.error('Error in schedules GET route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
} 