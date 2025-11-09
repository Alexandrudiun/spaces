import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [processedBookings, setProcessedBookings] = useState(new Set());
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    fetchPendingBookings();
    const interval = setInterval(fetchPendingBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = viewportWidth <= 1024;
  const isMobile = viewportWidth <= 640;

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('https://molsongbsspaces.onrender.com/api/desk/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch desks');
      }

      const data = await response.json();
      const desksData = data.data || data;

      const allBookings = [];
      desksData.forEach((desk) => {
        if (desk.bookings && desk.bookings.length > 0) {
          desk.bookings.forEach((booking) => {
            allBookings.push({
              ...booking,
              deskId: desk._id || desk.id,
              deskName: desk.name || desk.locationId,
              locationId: desk.locationId
            });
          });
        }
      });

      setBookings(allBookings);
      console.log('📋 All bookings found:', allBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const markBookingProcessed = (bookingId) => {
    if (!bookingId) {
      return;
    }

    setProcessedBookings((prev) => {
      const next = new Set(prev);
      next.add(bookingId);
      return next;
    });
  };

  const handleAccept = async (booking) => {
    try {
      setProcessingId(booking._id);
      const token = localStorage.getItem('token');

      console.log('🔄 Accepting booking:', booking);

      const response = await fetch(`https://molsongbsspaces.onrender.com/api/desk/${booking.deskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: booking._id,
          status: 'accepted'
        })
      });

      const result = await response.json().catch(() => ({}));
      console.log('📥 Response:', { status: response.status, data: result });

      alert('✅ Booking accepted!');
      markBookingProcessed(booking._id);

      setTimeout(() => {
        fetchPendingBookings();
      }, 1000);
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('Request sent - refreshing to verify...');
      markBookingProcessed(booking._id);
      setTimeout(() => {
        fetchPendingBookings();
      }, 1000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (booking) => {
    try {
      setProcessingId(booking._id);
      const token = localStorage.getItem('token');

      console.log('🔄 Declining booking:', booking);

      const response = await fetch(`https://molsongbsspaces.onrender.com/api/desk/${booking.deskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: booking._id,
          status: 'declined'
        })
      });

      const result = await response.json().catch(() => ({}));
      console.log('📥 Response:', { status: response.status, data: result });

      alert('❌ Booking declined!');
      markBookingProcessed(booking._id);

      setTimeout(() => {
        fetchPendingBookings();
      }, 1000);
    } catch (error) {
      console.error('Error declining booking:', error);
      alert('Request sent - refreshing to verify...');
      markBookingProcessed(booking._id);
      setTimeout(() => {
        fetchPendingBookings();
      }, 1000);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatUserToken = (value) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    const text = typeof value === 'string' ? value : String(value);

    if (text.length <= 10) {
      return text;
    }

    return `${text.slice(0, 4)}...${text.slice(-4)}`;
  };

  const getStatusToken = (status = 'pending') => {
    switch (status) {
      case 'accepted':
        return {
          chipBg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
          chipBorder: '1px solid rgba(34, 197, 94, 0.35)',
          chipColor: '#166534',
          icon: '✓',
          label: 'Accepted'
        };
      case 'declined':
        return {
          chipBg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
          chipBorder: '1px solid rgba(239, 68, 68, 0.35)',
          chipColor: '#991b1b',
          icon: '✗',
          label: 'Declined'
        };
      case 'pending':
      default:
        return {
          chipBg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          chipBorder: '1px solid rgba(251, 191, 36, 0.45)',
          chipColor: '#92400e',
          icon: '⏳',
          label: 'Pending'
        };
    }
  };

  const infoCardBase = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(241, 245, 249, 0.96))',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)'
  };

  const statsCardBase = {
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    borderRadius: '16px',
    padding: 'clamp(16px, 2vw, 20px) clamp(20px, 4vw, 28px)',
    minWidth: 'min(200px, 100%)',
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
    textAlign: 'center'
  };

  const detailLabelStyles = {
    fontSize: '11px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '600',
    marginBottom: '6px'
  };

  const detailValueStyles = {
    fontSize: '13px',
    color: '#1e293b',
    fontWeight: '600',
    letterSpacing: '0.2px'
  };

  const badgeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(14, 116, 144, 0.18))',
    border: '1px solid rgba(37, 99, 235, 0.24)',
    color: '#1d4ed8',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.3px'
  };

  const pendingCount = bookings.filter((booking) => (booking.status || 'pending') === 'pending').length;
  const acceptedCount = bookings.filter((booking) => booking.status === 'accepted').length;
  const declinedCount = bookings.filter((booking) => booking.status === 'declined').length;

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 45%, #dbeafe 100%)',
        padding: isMobile ? '24px 16px 36px' : isTablet ? '32px 20px 44px' : '40px 24px 52px',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
        overscrollBehavior: 'auto'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.08,
          backgroundImage: `
            radial-gradient(circle at 12% 22%, rgba(0,103,172,0.35) 0%, transparent 22%),
            radial-gradient(circle at 88% 78%, rgba(246,221,88,0.35) 0%, transparent 22%),
            radial-gradient(circle at 50% 50%, rgba(2,132,199,0.25) 0%, transparent 28%)
          `,
          animation: 'gradientShift 20s ease infinite',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'linear-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.35,
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          maxWidth: isTablet ? '100%' : '1320px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          width: '100%',
          padding: isMobile ? '0' : '0 8px'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            marginBottom: isMobile ? '26px' : '36px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isTablet ? 'center' : 'space-between',
              flexWrap: 'wrap',
              gap: isMobile ? '16px' : '20px',
              textAlign: isTablet ? 'center' : 'left'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: isTablet ? 'center' : 'flex-start',
                gap: isMobile ? '14px' : '18px',
                flexDirection: isTablet ? 'column' : 'row'
              }}
            >
              <motion.div
                animate={{
                  rotate: [0, 4, -4, 0],
                  scale: [1, 1.04, 1]
                }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3 }}
                style={{
                  background: 'linear-gradient(135deg, #0067AC, #1d4ed8)',
                  borderRadius: '14px',
                  padding: '14px',
                  boxShadow: '0 10px 25px rgba(30, 64, 175, 0.25)'
                }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3L2 9L12 15L22 9L12 3Z"
                    stroke="#bfdbfe"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 10V17C4 17.5304 4.21071 18.0391 4.58579 18.4142C4.96086 18.7893 5.46957 19 6 19H10"
                    stroke="#bfdbfe"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 10V14"
                    stroke="#bfdbfe"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.5 18V21"
                    stroke="#bfdbfe"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.5 18H16.5"
                    stroke="#bfdbfe"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
              <div
                style={{
                  textAlign: isTablet ? 'center' : 'left'
                }}
              >
                <h1
                  style={{
                    fontSize: '34px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #0f172a, #1d4ed8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.4px',
                    margin: 0
                  }}
                >
                  Admin Bookings
                </h1>
                <p
                  style={{
                    color: '#475569',
                    margin: '6px 0 0 0',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  Review and manage desk reservation requests across the workspace
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
            gap: isMobile ? '16px' : '24px',
            marginBottom: isMobile ? '28px' : '40px'
          }}
        >
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(96, 165, 250, 0.22)' }}
            style={{
              ...statsCardBase,
              border: '1px solid rgba(59, 130, 246, 0.2)',
              background: 'linear-gradient(135deg, #eff6ff, #f8fafc)',
              height: '100%'
            }}
          >
            <div
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                fontWeight: '600',
                color: '#1d4ed8',
                marginBottom: '8px'
              }}
            >
              Total Requests
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#0f172a',
                letterSpacing: '-0.5px',
                marginBottom: '6px'
              }}
            >
              {loading ? '...' : bookings.length}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(15, 23, 42, 0.55)'
              }}
            >
              All booking records fetched
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(217, 119, 6, 0.18)' }}
            style={{
              ...statsCardBase,
              border: '1px solid rgba(217, 119, 6, 0.25)',
              background: 'linear-gradient(135deg, #fff7ed, #fffbeb)',
              height: '100%'
            }}
          >
            <div
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                fontWeight: '600',
                color: '#b45309',
                marginBottom: '8px'
              }}
            >
              Pending Review
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#92400e',
                letterSpacing: '-0.5px',
                marginBottom: '6px'
              }}
            >
              {loading ? '...' : pendingCount}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(180, 83, 9, 0.65)'
              }}
            >
              Awaiting admin action
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(34, 197, 94, 0.22)' }}
            style={{
              ...statsCardBase,
              border: '1px solid rgba(34, 197, 94, 0.25)',
              background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
              height: '100%'
            }}
          >
            <div
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                fontWeight: '600',
                color: '#166534',
                marginBottom: '8px'
              }}
            >
              Approved
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#14532d',
                letterSpacing: '-0.5px',
                marginBottom: '6px'
              }}
            >
              {loading ? '...' : acceptedCount}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(22, 101, 52, 0.65)'
              }}
            >
              Confirmed desk bookings
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(248, 113, 113, 0.18)' }}
            style={{
              ...statsCardBase,
              border: '1px solid rgba(248, 113, 113, 0.25)',
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              height: '100%'
            }}
          >
            <div
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                fontWeight: '600',
                color: '#b91c1c',
                marginBottom: '8px'
              }}
            >
              Declined
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#991b1b',
                letterSpacing: '-0.5px',
                marginBottom: '6px'
              }}
            >
              {loading ? '...' : declinedCount}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(185, 28, 28, 0.65)'
              }}
            >
              Marked as unavailable
            </div>
          </motion.div>
        </motion.div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              borderRadius: '20px',
              padding: isMobile ? '32px 24px' : '48px',
              textAlign: 'center',
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)'
            }}
          >
            <div
              style={{
                width: isMobile ? '42px' : '50px',
                height: isMobile ? '42px' : '50px',
                border: '3px solid rgba(14, 116, 144, 0.2)',
                borderTop: '3px solid #1d4ed8',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px',
                boxShadow: '0 0 15px rgba(29, 78, 216, 0.25)'
              }}
            />
            <p
              style={{
                color: '#475569',
                fontSize: '14px',
                margin: 0,
                letterSpacing: '0.5px'
              }}
            >
              Loading booking data...
            </p>
          </motion.div>
        )}

        {!loading && bookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(148, 163, 184, 0.24)',
              borderRadius: '20px',
              padding: isMobile ? '44px 24px' : isTablet ? '60px 32px' : '70px 36px',
              textAlign: 'center',
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)'
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                fontSize: isMobile ? '52px' : '64px',
                marginBottom: '20px',
                filter: 'drop-shadow(0 0 18px rgba(34, 197, 94, 0.35))'
              }}
            >
              ✓
            </motion.div>
            <h2
              style={{
                fontSize: isMobile ? '24px' : '28px',
                color: '#0f172a',
                marginBottom: '10px',
                fontWeight: '600',
                letterSpacing: '-0.5px'
              }}
            >
              All Clear
            </h2>
            <p
              style={{
                color: '#475569',
                fontSize: '14px',
                margin: 0,
                letterSpacing: '0.3px'
              }}
            >
              No booking requests require your attention
            </p>
          </motion.div>
        )}

        {!loading && bookings.length > 0 && (
          <div
            style={{
              display: 'grid',
              gap: isMobile ? '18px' : '24px'
            }}
          >
            {bookings.map((booking, index) => {
              const statusToken = getStatusToken(booking.status || 'pending');
              const bookingKey = booking._id || booking.id || `${booking.deskId || 'desk'}-${booking.start || index}`;
              const bookingId = booking._id;
              const isProcessing = processingId === bookingId;
              const isCompleted =
                booking.status === 'accepted' || booking.status === 'declined' || processedBookings.has(bookingId);
              const isAccepted = booking.status === 'accepted';
              const isDeclined = booking.status === 'declined';
              const requesterToken = formatUserToken(booking.userId);
              const attendeeIds = Array.isArray(booking.attendees)
                ? Array.from(new Set(booking.attendees))
                : [];

              return (
                <motion.div
                  key={bookingKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{
                    y: -2,
                    boxShadow: '0 18px 36px rgba(15, 23, 42, 0.14)'
                  }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.98))',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    borderRadius: '18px',
                    padding: isMobile ? '18px 18px' : isTablet ? '20px 22px' : '20px 24px',
                    boxShadow: '0 14px 32px rgba(15, 23, 42, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: statusToken.chipBg,
                      opacity: 0.7
                    }}
                  />

                  <div
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      flexDirection: isTablet ? 'column' : 'row',
                      flexWrap: isTablet ? 'nowrap' : 'wrap',
                      gap: isMobile ? '18px' : '24px',
                      alignItems: 'stretch',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      style={{
                        ...infoCardBase,
                        padding: '18px',
                        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08), rgba(14, 116, 144, 0.14))',
                        border: '1px solid rgba(2, 132, 199, 0.18)',
                        boxShadow: '0 10px 22px rgba(15, 23, 42, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        minWidth: isTablet ? '100%' : '170px',
                        flex: isTablet ? '1 1 100%' : '0 1 210px',
                        width: '100%'
                      }}
                    >
                      <div style={{ fontSize: '28px' }}>🪑</div>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#0f172a',
                          letterSpacing: '-0.2px'
                        }}
                      >
                        {booking.deskName || booking.locationId || 'Desk'}
                      </div>
                      {booking.locationId && booking.deskName && booking.locationId !== booking.deskName && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'rgba(3, 105, 161, 0.65)',
                            letterSpacing: '0.4px'
                          }}
                        >
                          {booking.locationId}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'rgba(3, 105, 161, 0.6)',
                          letterSpacing: '0.4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        Desk Reference
                      </div>
                    </div>

                    <div
                      style={{
                        flex: isTablet ? '1 1 100%' : '1 1 320px',
                        minWidth: isTablet ? '100%' : '260px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: isMobile ? 'column' : 'row',
                          flexWrap: 'wrap',
                          alignItems: isMobile ? 'flex-start' : 'center',
                          gap: isMobile ? '8px' : '10px',
                          marginBottom: isMobile ? '12px' : '14px'
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 14px',
                            borderRadius: '999px',
                            background: statusToken.chipBg,
                            border: statusToken.chipBorder,
                            color: statusToken.chipColor,
                            fontSize: '12px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            boxShadow: '0 8px 16px rgba(15, 23, 42, 0.08)'
                          }}
                        >
                          <span>{statusToken.icon}</span>
                          {statusToken.label}
                        </div>
                        {bookingId && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#94a3b8',
                              letterSpacing: '0.4px'
                            }}
                          >
                            ID: {bookingId.slice(0, 8)}...
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile
                            ? '1fr'
                            : 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: isMobile ? '12px' : '16px'
                        }}
                      >
                        <div
                          style={{
                            ...infoCardBase,
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(241, 245, 249, 0.9))'
                          }}
                        >
                          <div
                            style={{
                              ...detailLabelStyles,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span style={{ fontSize: '14px' }}>📅</span>
                            Start Time
                          </div>
                          <div style={detailValueStyles}>{formatDateTime(booking.start)}</div>
                        </div>

                        <div
                          style={{
                            ...infoCardBase,
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(241, 245, 249, 0.9))'
                          }}
                        >
                          <div
                            style={{
                              ...detailLabelStyles,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span style={{ fontSize: '14px' }}>⏰</span>
                            End Time
                          </div>
                          <div style={detailValueStyles}>
                            {booking.end ? formatDateTime(booking.end) : 'Open ended'}
                          </div>
                        </div>

                        <div
                          style={{
                            ...infoCardBase,
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(241, 245, 249, 0.9))'
                          }}
                        >
                          <div
                            style={{
                              ...detailLabelStyles,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span style={{ fontSize: '14px' }}>👤</span>
                            User ID
                          </div>
                          {requesterToken === 'N/A' ? (
                            <div
                              style={{
                                ...detailValueStyles,
                                color: '#94a3b8'
                              }}
                            >
                              N/A
                            </div>
                          ) : (
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px'
                              }}
                            >
                              <span style={badgeStyles}>{requesterToken}</span>
                            </div>
                          )}
                        </div>
                        {attendeeIds.length > 0 ? (
                          <div
                            style={{
                              ...infoCardBase,
                              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(226, 232, 240, 0.85))'
                            }}
                          >
                            <div
                              style={{
                                ...detailLabelStyles,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                                <span style={{ fontSize: '14px' }}>👥</span>
                              Attendees
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px'
                              }}
                            >
                              {attendeeIds.map((attId) => (
                                <span key={`${bookingKey}-attendee-${attId}`} style={badgeStyles}>
                                  {formatUserToken(attId)}
                                </span>
                              ))}
                            </div>
                            </div>
                          ) : null}
                      </div>
                    </div>

                    <div
                      style={{
                        flex: isTablet ? '1 1 100%' : '0 0 190px',
                        minWidth: isTablet ? '100%' : '190px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: isMobile ? '10px' : '12px'
                      }}
                    >
                      {isCompleted ? (
                        <div
                          style={{
                            ...infoCardBase,
                            padding: '20px',
                            background: isAccepted
                              ? 'linear-gradient(135deg, rgba(187, 247, 208, 0.75), rgba(220, 252, 231, 0.8))'
                              : isDeclined
                              ? 'linear-gradient(135deg, rgba(254, 202, 202, 0.75), rgba(254, 226, 226, 0.8))'
                              : 'linear-gradient(135deg, rgba(254, 240, 138, 0.7), rgba(253, 224, 71, 0.75))',
                            border: isAccepted
                              ? '1px solid rgba(34, 197, 94, 0.35)'
                              : isDeclined
                              ? '1px solid rgba(239, 68, 68, 0.35)'
                              : '1px solid rgba(217, 119, 6, 0.3)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            minHeight: '110px'
                          }}
                        >
                          <div
                            style={{
                              fontSize: '30px',
                              color: isAccepted ? '#166534' : isDeclined ? '#991b1b' : '#92400e'
                            }}
                          >
                            {isAccepted ? '✓' : isDeclined ? '✗' : statusToken.icon}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              color: isAccepted ? '#166534' : isDeclined ? '#991b1b' : '#92400e'
                            }}
                          >
                            {isAccepted ? 'Accepted' : isDeclined ? 'Declined' : 'Processed'}
                          </div>
                        </div>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ y: -2, boxShadow: '0 16px 32px rgba(22, 163, 74, 0.25)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAccept(booking)}
                            disabled={isProcessing}
                            style={{
                              padding: '12px 20px',
                              background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(22, 163, 74, 0.3))',
                              color: '#166534',
                              border: '1px solid rgba(22, 163, 74, 0.35)',
                              borderRadius: '12px',
                              fontWeight: '600',
                              cursor: isProcessing ? 'not-allowed' : 'pointer',
                              opacity: isProcessing ? 0.55 : 1,
                              fontSize: '13px',
                              boxShadow: '0 8px 18px rgba(22, 163, 74, 0.25)',
                              transition: 'all 0.25s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              width: isTablet ? '100%' : 'auto',
                              letterSpacing: '0.6px',
                              textTransform: 'uppercase'
                            }}
                          >
                            <span style={{ fontSize: '16px' }}>✓</span>
                            Accept
                          </motion.button>

                          <motion.button
                            whileHover={{ y: -2, boxShadow: '0 16px 32px rgba(220, 38, 38, 0.25)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDecline(booking)}
                            disabled={isProcessing}
                            style={{
                              padding: '12px 20px',
                              background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.2), rgba(220, 38, 38, 0.3))',
                              color: '#991b1b',
                              border: '1px solid rgba(220, 38, 38, 0.35)',
                              borderRadius: '12px',
                              fontWeight: '600',
                              cursor: isProcessing ? 'not-allowed' : 'pointer',
                              opacity: isProcessing ? 0.55 : 1,
                              fontSize: '13px',
                              boxShadow: '0 8px 18px rgba(220, 38, 38, 0.25)',
                              transition: 'all 0.25s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              width: isTablet ? '100%' : 'auto',
                              letterSpacing: '0.6px',
                              textTransform: 'uppercase'
                            }}
                          >
                            <span style={{ fontSize: '16px' }}>✗</span>
                            Decline
                          </motion.button>

                          {isProcessing && (
                            <div
                              style={{
                                textAlign: 'center',
                                fontSize: '11px',
                                color: '#64748b',
                                letterSpacing: '0.4px'
                              }}
                            >
                              Working on it...
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes gradientShift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 30px); }
        }
      `}</style>
    </div>
  );
};

export default AdminBookings;
