'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import Link from 'next/link'
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline'
import WhatsAppLogin from '@/components/WhatsAppLogin'

export default function Schedules() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(`/api/schedules?userId=${user.uid}`);
        const data = await response.json();
        console.log('Received schedules data:', data);
        setSchedules(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSchedules();
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <WhatsAppLogin onLoginStatusChange={setIsWhatsAppConnected} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Schedules</h1>
        {isWhatsAppConnected ? (
          <Link
            href="/dashboard/schedules/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Schedule
          </Link>
        ) : (
          <button
            disabled
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
            title="Connect to WhatsApp to create schedules"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Schedule
          </button>
        )}
      </div>

      {!isWhatsAppConnected ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Connect to WhatsApp above to manage your scheduled messages.</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No schedules found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => (
            <div
              key={schedule._id}
              className="bg-white shadow rounded-lg p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">Group: {schedule.groupChatId}</h3>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-500">Schedule Times:</h4>
                    <ul className="mt-1 space-y-1">
                      {schedule.timeSlots?.map((slot, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {slot.day} at {slot.time}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Link
                  href={`/dashboard/schedules/${schedule._id}`}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 