import { create } from 'venom-bot';
import { NextResponse } from 'next/server';

let client = null;
let qrCode = null;
let connectionStatus = 'disconnected';

export async function GET() {
  return NextResponse.json({ 
    status: connectionStatus,
    qrCode
  });
}

export async function POST() {
  if (client) {
    return NextResponse.json({ 
      status: 'already_connected',
      message: 'WhatsApp is already connected'
    });
  }

  try {
    client = await create({
      session: 'whatsapp-bot',
      headless: 'new',
      disableWelcome: true,
      disableSpins: true,
    }, 
    (base64Qr, asciiQR) => {
      qrCode = base64Qr;
    },
    (statusSession) => {
      connectionStatus = statusSession;
    });

    return NextResponse.json({ 
      status: 'initializing',
      message: 'WhatsApp connection is being initialized'
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      message: error.message 
    }, { status: 500 });
  }
} 