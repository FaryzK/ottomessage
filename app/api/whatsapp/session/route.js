import { NextResponse } from 'next/server';
import { initializeWhatsApp, closeWhatsApp, getQrCode, isConnected } from '@/lib/services/whatsapp';

export async function GET() {
  try {
    return NextResponse.json({
      isLoggedIn: isConnected(),
      qrCode: getQrCode()
    });
  } catch (error) {
    console.error('Error getting session status:', error);
    return NextResponse.json({ error: 'Failed to get session status' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { action } = await request.json();

    if (action === 'start') {
      if (isConnected()) {
        return NextResponse.json({ status: 'already_connected' });
      }

      try {
        await initializeWhatsApp();
        return NextResponse.json({ status: 'initialized' });
      } catch (error) {
        console.error('WhatsApp initialization error:', error);
        return NextResponse.json(
          { error: 'Failed to initialize WhatsApp' },
          { status: 500 }
        );
      }
    } 
    else if (action === 'logout') {
      try {
        await closeWhatsApp();
        return NextResponse.json({ status: 'logged_out' });
      } catch (error) {
        console.error('Error during logout:', error);
        return NextResponse.json(
          { error: 'Failed to logout' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing WhatsApp session:', error);
    return NextResponse.json({ error: 'Failed to manage session' }, { status: 500 });
  }
} 