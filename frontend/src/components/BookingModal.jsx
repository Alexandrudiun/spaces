import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BookingModal = ({ section, isAvailable, currentTime, onClose, onConfirm }) => {
  const [bookingData, setBookingData] = useState({
    section: section,
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    notes: ''
  });

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

  // Generate time options
  const timeOptions = [];
  for (let hour = 7; hour <= 20; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

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
          padding: '20px'
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
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            maxHeight: '90vh',
            overflow: 'auto'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '2px solid #f0f0f0'
          }}>
            <h2 style={{
              fontSize: '24px',
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

          {/* Availability Status */}
          <div style={{
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            background: isAvailable ? '#E8F5E9' : '#FFEBEE',
            border: `1px solid ${isAvailable ? '#4CAF50' : '#ef4444'}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: isAvailable ? '#2E7D32' : '#C62828'
            }}>
              <span style={{ fontSize: '20px' }}>
                {isAvailable ? '✓' : '✗'}
              </span>
              <span>
                {isAvailable 
                  ? `Available now (${currentTime.toLocaleTimeString()})`
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
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
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

            {/* Notes */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '14px'
              }}>
                📝 Notes (Optional)
              </label>
              <textarea
                value={bookingData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any special requirements or notes..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0067AC'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
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
                  padding: '12px 32px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0067AC 0%, #002147 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 103, 172, 0.3)',
                  transition: 'box-shadow 0.2s'
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
