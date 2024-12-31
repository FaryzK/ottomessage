'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [status, setStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);

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
        </div>
      </div>
    </main>
  );
}
