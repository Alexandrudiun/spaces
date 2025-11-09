import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const BookingModal = ({ section, currentTime, onClose, onConfirm, deskId, deskStatus = 'available', isLiveMode = true, deskLocation = 'N/A', deskName = 'N/A', isOccupied = false }) => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingData, setBookingData] = useState({
    section: section,
    deskId: deskId,
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00'
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch bookings for this specific desk
  useEffect(() => {
    if (!deskId) return;
    
    const fetchDeskBookings = async () => {
      try {
        setLoadingBookings(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch('https://molsongbsspaces.onrender.com/api/desk/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch desk bookings');
        }

        const data = await response.json();
        const desks = data.data || data || [];
        
        // Find the specific desk using multiple matching strategies
        const desk = desks.find(d => {
          // Try exact match first
          if (d.name === deskId || d.id === deskId || d._id === deskId) return true;
          
          // Try locationId match
          if (d.locationId === deskId || d.locationId === deskLocation || d.locationId === deskName) return true;
          
          // Try matching "Table X UP/DOWN" format to locationId
          if (d.locationId) {
            const match = deskId.match(/Table (\d+) (UP|DOWN)/);
            if (match) {
              const tableNum = match[1];
              const locationMatch = d.locationId.toLowerCase().includes(`table${tableNum}`.toLowerCase());
              if (locationMatch) return true;
            }
          }
          
          return false;
        });
        
        console.log('📊 Found desk for bookings:', desk);
        console.log('🔍 Search parameters:', { deskId, deskLocation, deskName });
        
        if (desk && desk.bookings) {
          // Sort bookings by start date (newest first)
          const sortedBookings = desk.bookings
            .filter(booking => booking.status !== 'declined')
            .sort((a, b) => new Date(b.start) - new Date(a.start));
          console.log('📅 Found bookings:', sortedBookings);
          setBookings(sortedBookings);
        } else {
          console.log('⚠️ No desk found or no bookings available');
          setBookings([]);
        }
      } catch (error) {
        console.error('Error fetching desk bookings:', error);
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchDeskBookings();
  }, [deskId, deskLocation, deskName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(bookingData);
  };

  const handleChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate time options (all 24 hours)
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  const safeCurrentTime = currentTime instanceof Date && !Number.isNaN(currentTime.getTime())
    ? currentTime
    : new Date();

  const liveLabel = safeCurrentTime.toLocaleTimeString([], { hour12: false });
  const searchLabel = safeCurrentTime.toLocaleString([], {
    hour12: false,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '16px' : '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: isMobile ? '20px 16px' : '30px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            maxHeight: isMobile ? '95vh' : '90vh',
            overflow: 'auto',
            boxSizing: 'border-box'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isMobile ? '16px' : '20px',
            paddingBottom: isMobile ? '12px' : '15px',
            borderBottom: '2px solid #f0f0f0'
          }}>
            <h2 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 'bold',
              color: '#0067AC',
              margin: 0
            }}>
              Book: {section}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#999',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f0f0f0';
                e.target.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#999';
              }}
            >
              ×
            </button>
          </div>

          {/* Desk Information Card */}
          <div style={{
            padding: isMobile ? '12px 14px' : '16px 18px',
            borderRadius: '12px',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            border: '1px solid rgba(2, 132, 199, 0.2)',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '10px' : '16px' }}>
              {/* Location Info */}
              <div>
                <div style={{
                  fontSize: isMobile ? '11px' : '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '600',
                  color: '#0284c7',
                  marginBottom: '4px'
                }}>
                  📍 Location
                </div>
                <div style={{
                  fontSize: isMobile ? '13px' : '15px',
                  fontWeight: '600',
                  color: '#0f172a'
                }}>
                  {deskLocation}
                </div>
              </div>

              {/* Desk Name/Reference */}
              <div>
                <div style={{
                  fontSize: isMobile ? '11px' : '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '600',
                  color: '#0284c7',
                  marginBottom: '4px'
                }}>
                  🏷️ Desk Reference
                </div>
                <div style={{
                  fontSize: isMobile ? '13px' : '15px',
                  fontWeight: '600',
                  color: '#0f172a',
                  fontFamily: 'monospace'
                }}>
                  {deskName}
                </div>
              </div>
            </div>
          </div>

          {/* Existing Bookings Section */}
          <div style={{
            padding: isMobile ? '12px 14px' : '14px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
          }}>
            <div style={{
              fontSize: isMobile ? '12px' : '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '700',
              color: '#92400e',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📅 Booking Schedule {!loadingBookings && `(${bookings.length})`}
            </div>
            
            {loadingBookings ? (
              <div style={{ 
                fontSize: isMobile ? '12px' : '13px', 
                color: '#78716c', 
                textAlign: 'center',
                padding: '8px 0'
              }}>
                Loading bookings...
              </div>
            ) : bookings.length === 0 ? (
              <div style={{
                padding: isMobile ? '12px 10px' : '14px 12px',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '8px',
                border: '1px solid rgba(120, 113, 108, 0.2)',
                textAlign: 'center',
                fontSize: isMobile ? '12px' : '13px',
                color: '#78716c'
              }}>
                ✨ No bookings yet - This desk is completely free!
              </div>
            ) : (
              <div style={{
                maxHeight: '150px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {bookings.slice(0, 5).map((booking, index) => {
                    const startDate = new Date(booking.start);
                    const endDate = new Date(booking.end);
                    const isCurrentlyActive = new Date() >= startDate && new Date() <= endDate;
                    
                    return (
                      <div 
                        key={booking._id || index}
                        style={{
                          padding: isMobile ? '8px 10px' : '10px 12px',
                          background: isCurrentlyActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.7)',
                          borderRadius: '8px',
                          border: isCurrentlyActive ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(120, 113, 108, 0.2)',
                          fontSize: isMobile ? '11px' : '12px'
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '4px'
                        }}>
                          <span style={{ 
                            fontWeight: '700', 
                            color: isCurrentlyActive ? '#991b1b' : '#0f172a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {isCurrentlyActive && '🔴 '}
                            {booking.status === 'accepted' ? '✅' : booking.status === 'pending' ? '⏳' : '❌'} 
                            {booking.status.toUpperCase()}
                          </span>
                          {booking.requester?.name && (
                            <span style={{ 
                              fontSize: isMobile ? '10px' : '11px', 
                              color: '#64748b',
                              fontWeight: '500'
                            }}>
                              {booking.requester.name}
                            </span>
                          )}
                        </div>
                        <div style={{ color: '#57534e', fontWeight: '500' }}>
                          📆 {startDate.toLocaleDateString([], { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div style={{ color: '#78716c', marginTop: '2px' }}>
                          ⏰ {startDate.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {endDate.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        {isCurrentlyActive && (
                          <div style={{
                            marginTop: '4px',
                            fontSize: isMobile ? '10px' : '11px',
                            color: '#991b1b',
                            fontWeight: '600'
                          }}>
                            🔴 Currently Active
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {bookings.length > 5 && (
                    <div style={{
                      padding: isMobile ? '6px 8px' : '8px 10px',
                      background: 'rgba(146, 64, 14, 0.1)',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: isMobile ? '10px' : '11px',
                      color: '#92400e',
                      fontWeight: '600'
                    }}>
                      + {bookings.length - 5} more booking{bookings.length - 5 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Availability Status */}
          <div style={{
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            background: deskStatus === 'available' ? '#E8F5E9' : deskStatus === 'pending' ? '#FEF3C7' : '#FFEBEE',
            border: `1px solid ${deskStatus === 'available' ? '#4CAF50' : deskStatus === 'pending' ? '#fbbf24' : '#ef4444'}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: deskStatus === 'available' ? '#2E7D32' : deskStatus === 'pending' ? '#92400e' : '#C62828'
            }}>
              <span style={{ fontSize: '20px' }}>
                {deskStatus === 'available' ? '✓' : deskStatus === 'pending' ? '⏳' : '✗'}
              </span>
              <span>
                {deskStatus === 'available'
                  ? isLiveMode
                    ? `Available now (${liveLabel})`
                    : `Available on ${searchLabel}`
                  : deskStatus === 'pending'
                  ? 'Pending approval - Select a different time or wait for approval'
                  : 'Currently booked - Select a different time'}
              </span>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit}>
            {/* Date Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '14px'
              }}>
                📅 Date
              </label>
              <input
                type="date"
                value={bookingData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0067AC'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Time Selection */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? '12px' : '15px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  ⏰ Start Time
                </label>
                <select
                  value={bookingData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0067AC'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  ⏰ End Time
                </label>
                <select
                  value={bookingData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0067AC'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: isMobile ? '8px' : '10px',
              justifyContent: isMobile ? 'stretch' : 'flex-end',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: isMobile ? '10px 16px' : '12px 24px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flex: isMobile ? '1' : 'auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f5f5f5';
                  e.target.style.borderColor = '#999';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#e0e0e0';
                }}
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: isMobile ? '10px 16px' : '12px 32px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0067AC 0%, #002147 100%)',
                  color: 'white',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 103, 172, 0.3)',
                  transition: 'box-shadow 0.2s',
                  flex: isMobile ? '1' : 'auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 103, 172, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 103, 172, 0.3)';
                }}
              >
                Confirm Booking
              </motion.button>
            </div>
          </form>

          {/* Additional Info */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#666'
          }}>
            <p style={{ margin: '0 0 5px 0' }}>
              💡 <strong>Tip:</strong> You can book up to 30 days in advance.
            </p>
            <p style={{ margin: 0 }}>
              📧 You'll receive a confirmation email once your booking is confirmed.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
