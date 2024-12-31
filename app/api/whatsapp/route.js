import { create } from 'venom-bot';
import { NextResponse } from 'next/server';
import { auth as adminAuth } from 'firebase-admin';
import { initAdmin } from '@/firebase/admin';

// Initialize Firebase Admin if not already initialized
initAdmin();

// Store client instances for each user
const clients = new Map();
const qrCodes = new Map();
const connectionStatuses = new Map();

// Verify Firebase token middleware
async function verifyToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

async function findGroupByName(client, name) {
  try {
    const chats = await client.getAllChats();
    console.log('Number of chats found:', chats?.length);
    
    // Log each chat's basic info
    chats?.forEach((chat, index) => {
      console.log(`Chat ${index + 1}:`, {
        name: chat.name,
        isGroup: chat.isGroup,
        id: chat.id?._serialized || chat.id,
        type: chat.contact?.type,
        groupMetadata: chat.groupMetadata ? 'exists' : 'null'
      });
    });
    
    const group = chats?.find(chat => {
      const chatName = chat.name || 
                      chat.contact?.name || 
                      chat.groupMetadata?.subject;
                      
      console.log('Checking chat:', chatName);
      
      return chatName && 
             chatName.toLowerCase().includes(name.toLowerCase());
    });
    
    if (group) {
      console.log('Found group details:', {
        name: group.name,
        id: group.id?._serialized || group.id,
        metadata: group.groupMetadata
      });
    } else {
      console.log('No group found with name:', name);
    }
    
    return group;
  } catch (error) {
    console.error('Error finding group:', error);
    return null;
  }
}

export async function GET(request) {
  const uid = await verifyToken(request);
  if (!uid) {
    return NextResponse.json({ 
      status: 'error',
      message: 'Unauthorized'
    }, { status: 401 });
  }

  return NextResponse.json({ 
    status: connectionStatuses.get(uid) || 'disconnected',
    qrCode: qrCodes.get(uid)
  });
}

export async function POST(request) {
  const uid = await verifyToken(request);
  if (!uid) {
    return NextResponse.json({ 
      status: 'error',
      message: 'Unauthorized'
    }, { status: 401 });
  }

  // Check if there's a request body
  let body = null;
  try {
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      body = await request.json();
    }
  } catch (error) {
    // If JSON parsing fails, assume it's a connection request
    body = null;
  }

  // If there's no body or no message, treat it as a connection request
  if (!body || !body.message) {
    // Handle WhatsApp connection
    if (clients.get(uid)) {
      return NextResponse.json({ 
        status: 'already_connected',
        message: 'WhatsApp is already connected'
      });
    }

    try {
      const client = await create({
        session: `whatsapp-bot-${uid}`,
        headless: 'new',
        disableWelcome: true,
        disableSpins: true,
      }, 
      (base64Qr) => {
        qrCodes.set(uid, base64Qr);
      },
      (statusSession) => {
        connectionStatuses.set(uid, statusSession);
      });

      clients.set(uid, client);

      return NextResponse.json({ 
        status: 'initializing',
        message: 'WhatsApp connection is being initialized'
      });
    } catch (error) {
      console.error('Error creating WhatsApp client:', error);
      return NextResponse.json({ 
        status: 'error',
        message: error.message 
      }, { status: 500 });
    }
  }

  // Handle message sending
  const client = clients.get(uid);
  if (!client) {
    return NextResponse.json({ 
      status: 'error',
      message: 'WhatsApp is not connected'
    }, { status: 400 });
  }

  if (!body.groupName) {
    return NextResponse.json({ 
      status: 'error',
      message: 'Group name is required'
    }, { status: 400 });
  }

  try {
    const group = await findGroupByName(client, body.groupName);
    
    if (!group) {
      return NextResponse.json({ 
        status: 'error',
        message: `Group "${body.groupName}" not found. Please check console logs for available chats.`
      }, { status: 404 });
    }

    const groupId = group.id?._serialized || 
                   group.id || 
                   (group.groupMetadata && group.groupMetadata.id);

    console.log('Attempting to send message to group ID:', groupId);

    const result = await client.sendText(groupId, body.message);
    console.log('Message sent result:', result);
    return NextResponse.json({ 
      status: 'success',
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to send message: ' + error.message
    }, { status: 500 });
  }
} 