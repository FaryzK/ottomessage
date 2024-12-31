'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';

export default function SchedulesPage() {
  const router = useRouter();
  const [status, setStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);
  const [message, setMessage] = useState('');
  const [groupName, setGroupName] = useState('Test Restaurant x Supplier');
  const [sendStatus, setSendStatus] = useState('');
  const [user, setUser] = useState(null);

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/');
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const connectWhatsApp = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error('Error connecting to WhatsApp:', error);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/whatsapp', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setStatus(data.status);
        setQrCode(data.qrCode);
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    if (user) {
      const interval = setInterval(checkStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const sendMessage = async () => {
    if (!message.trim() || !groupName.trim() || !user) return;
    
    try {
      setSendStatus('sending...');
      const token = await user.getIdToken();
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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

  const isConnectedAndReady = status === 'successChat' || status === 'isLogged';

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">WhatsApp Bot Connection</h1>
          <button
            onClick={() => auth.signOut()}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Sign Out
          </button>
        </div>
        
        <div className="p-4 rounded-lg bg-gray-100">
          <p className="text-center mb-4">
            Status: <span className="font-semibold">{status}</span>
          </p>

          {status === 'disconnected' && (
            <div className="flex justify-center">
              <button
                onClick={connectWhatsApp}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Connect to WhatsApp
              </button>
            </div>
          )}

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