'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [status, setStatus] = useState('checking');
  const [qrCode, setQrCode] = useState(null);
  const [message, setMessage] = useState('');
  const [groupName, setGroupName] = useState('Test Restaurant x Supplier');
  const [sendStatus, setSendStatus] = useState('');

  const connectWhatsApp = async () => {
    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
      });
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error('Error connecting to WhatsApp:', error);
      setStatus('disconnected');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !groupName.trim()) return;
    
    try {
      setSendStatus('sending...');
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          groupName 
        }),
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setMessage('');
        setSendStatus('Message sent successfully!');
        setTimeout(() => setSendStatus(''), 3000);
      } else {
        setSendStatus('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSendStatus('Error sending message');
    }
  };

  // Initial connection and status check
  useEffect(() => {
    const initializeWhatsApp = async () => {
      try {
        // First check current status
        const statusResponse = await fetch('/api/whatsapp');
        const statusData = await statusResponse.json();
        
        // If not connected, try to connect
        if (statusData.status === 'disconnected') {
          await connectWhatsApp();
        } else {
          setStatus(statusData.status);
          setQrCode(statusData.qrCode);
        }

        // Start polling for status updates
        const interval = setInterval(async () => {
          const response = await fetch('/api/whatsapp');
          const data = await response.json();
          setStatus(data.status);
          setQrCode(data.qrCode);
        }, 1000);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error initializing WhatsApp:', error);
        setStatus('disconnected');
      }
    };

    initializeWhatsApp();
  }, []);

  const isConnectedAndReady = status === 'successChat' || status === 'isLogged';

  if (status === 'checking') {
    return <div className="min-h-screen p-8 flex items-center justify-center">
      <p>Initializing WhatsApp...</p>
    </div>;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">WhatsApp Bot Connection</h1>
        
        <div className="p-4 rounded-lg bg-gray-100">
          <p className="text-center mb-4">
            Status: <span className="font-semibold">{status}</span>
          </p>

          {qrCode && !isConnectedAndReady && (
            <div className="mt-4">
              <p className="text-center mb-2">Scan this QR code with WhatsApp</p>
              <img 
                src={qrCode}
                alt="WhatsApp QR Code" 
                className="mx-auto"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          )}

          {isConnectedAndReady && (
            <div className="mt-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <input
                    id="groupName"
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Send
                  </button>
                </div>
              </div>
              {sendStatus && (
                <p className={`text-center text-sm ${
                  sendStatus.startsWith('Error') ? 'text-red-500' : 'text-green-500'
                }`}>
                  {sendStatus}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}