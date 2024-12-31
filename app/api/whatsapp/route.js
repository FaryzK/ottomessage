import { create } from 'venom-bot';
import { NextResponse } from 'next/server';

let client = null;
let qrCode = null;
let connectionStatus = 'disconnected';

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
    
    // Try different ways to find the group
    const group = chats?.find(chat => {
      // Check various possible name locations
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

export async function GET() {
  return NextResponse.json({ 
    status: connectionStatus,
    qrCode
  });
}

export async function POST(request) {
  // If there's a request body, it's a message sending request
  try {
    const body = await request.json();
    
    if (body.message) {
      if (!client) {
        return NextResponse.json({ 
          status: 'error',
          message: 'WhatsApp is not connected'
        }, { status: 400 });
      }

      try {
        // Try to find group by name first
        const groupName = "Test Restaurant x Supplier";
        const group = await findGroupByName(client, groupName);
        
        if (!group) {
          return NextResponse.json({ 
            status: 'error',
            message: 'Group not found by name. Please check console logs for available chats.'
          }, { status: 404 });
        }

        // Get the correct group ID format
        const groupId = group.id?._serialized || 
                       group.id || 
                       (group.groupMetadata && group.groupMetadata.id);

        console.log('Attempting to send message to group ID:', groupId);

        // Send message to the group
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
  } catch (error) {
    // If there's no request body or parsing fails, treat it as a connection request
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
} 