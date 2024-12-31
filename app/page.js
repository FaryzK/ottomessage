'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [status, setStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);
  const [message, setMessage] = useState('');
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
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      setSendStatus('sending...');
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
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

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/whatsapp');
        const data = await response.json();
        setStatus(data.status);
        setQrCode(data.qrCode);
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  console.log(status);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">WhatsApp Bot Connection</h1>
        
        <div className="p-4 rounded-lg bg-gray-100">
          <p className="text-center mb-4">
            Status: <span className="font-semibold">{status}</span>
          </p>
          
          {status === 'disconnected' && (
            <button
              onClick={connectWhatsApp}
              className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Connect WhatsApp
            </button>
          )}

          {qrCode && (
            <div className="mt-4">
              <p className="text-center mb-2">Scan this QR code with WhatsApp</p>
              <img 
                src={qrCode} 
                alt="WhatsApp QR Code" 
                className="mx-auto"
              />
            </div>
          )}

          {status === 'successChat' && (
            <div className="mt-6 space-y-4">
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
