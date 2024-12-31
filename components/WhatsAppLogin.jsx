import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function WhatsAppLogin({ onLoginStatusChange }) {
  const [status, setStatus] = useState('checking'); // checking, needsLogin, connected
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState(null);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/session');
      const data = await response.json();
      
      if (data.isLoggedIn) {
        setStatus('connected');
        onLoginStatusChange?.(true);
      } else {
        setStatus('needsLogin');
        onLoginStatusChange?.(false);
      }
      
      if (data.qrCode) {
        setQrCode(data.qrCode);
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
      setError('Failed to check WhatsApp status');
    }
  };

  const startSession = async () => {
    try {
      setStatus('starting');
      const response = await fetch('/api/whatsapp/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start session');
      }
      
      // Start polling for QR code and status
      pollStatus();
    } catch (error) {
      console.error('Error starting WhatsApp session:', error);
      setError('Failed to start WhatsApp session');
      setStatus('needsLogin');
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/whatsapp/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'logout' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
      
      setStatus('needsLogin');
      setQrCode(null);
      onLoginStatusChange?.(false);
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to logout');
    }
  };

  const pollStatus = () => {
    const interval = setInterval(async () => {
      if (status === 'connected') {
        clearInterval(interval);
        return;
      }
      
      await checkStatus();
    }, 1000);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={() => {
            setError(null);
            checkStatus();
          }}
          className="mt-2 text-sm underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">WhatsApp Connection</h2>
      
      {status === 'checking' && (
        <p className="text-gray-600">Checking WhatsApp connection status...</p>
      )}

      {status === 'needsLogin' && (
        <div className="space-y-4">
          <p className="text-gray-600">You need to connect to WhatsApp to send scheduled messages.</p>
          <button
            onClick={startSession}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Connect WhatsApp
          </button>
        </div>
      )}

      {status === 'starting' && (
        <p className="text-gray-600">Starting WhatsApp session...</p>
      )}

      {status === 'connected' && (
        <div className="space-y-4">
          <p className="text-green-600">Connected to WhatsApp</p>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
      )}

      {qrCode && status !== 'connected' && (
        <div className="mt-4">
          <p className="text-gray-600 mb-2">Scan this QR code with WhatsApp:</p>
          <div className="bg-white p-4 inline-block rounded-lg shadow-sm">
            <img
              src={qrCode}
              alt="WhatsApp QR Code"
              width={256}
              height={256}
            />
          </div>
        </div>
      )}
    </div>
  );
} 