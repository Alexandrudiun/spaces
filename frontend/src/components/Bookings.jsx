import { motion } from 'framer-motion';
import { useState } from 'react';
import '../index.css';

function Bookings() {
  const [bookings] = useState([
    {
      id: 1,
      deskName: 'Desk 12A',
      location: 'Floor 3, Zone B',
      date: '2025-11-09',
      time: '09:00 - 17:00',
      status: 'upcoming'
    },
    {
      id: 2,
      deskName: 'Meeting Room 5',
      location: 'Floor 2',
      date: '2025-11-10',
      time: '14:00 - 15:30',
      status: 'upcoming'
    },
    {
      id: 3,
      deskName: 'Desk 8C',
      location: 'Floor 3, Zone A',
      date: '2025-11-05',
      time: '09:00 - 17:00',
      status: 'completed'
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return '#10b981';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-molson-blue mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600">
            Manage your office space reservations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-molson-blue">24</p>
              </div>
              <div className="w-12 h-12 bg-molson-blue/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-molson-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Upcoming</p>
                <p className="text-3xl font-bold text-green-600">2</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">This Month</p>
                <p className="text-3xl font-bold text-molson-yellow">8</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-molson-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">All Bookings</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.deskName}
                      </h3>
                      <span
                        style={{
                          backgroundColor: `${getStatusColor(booking.status)}20`,
                          color: getStatusColor(booking.status),
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">
                      📍 {booking.location}
                    </p>
                    <p className="text-gray-600 text-sm">
                      📅 {booking.date} • ⏰ {booking.time}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {booking.status === 'upcoming' && (
                      <>
                        <button
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #0067AC',
                            color: '#0067AC',
                            backgroundColor: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#0067AC';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#0067AC';
                          }}
                        >
                          Modify
                        </button>
                        <button
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            backgroundColor: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#ef4444';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#ef4444';
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* New Booking Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            marginTop: '2rem',
            padding: '1rem 2rem',
            background: 'linear-gradient(to right, #0067AC, #002147)',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          onClick={() => window.location.href = '/map'}
        >
          + New Booking
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Bookings;
