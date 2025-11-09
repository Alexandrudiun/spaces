import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import '../index.css';

function Bookings() {
  // start empty — we'll populate from the API (prevents stale mock data showing)
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    // quick simulated load to show the AdminBookings visual states
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Fetch bookings for the current user from backend (POST /api/user/positions)
  useEffect(() => {
    const fetchUserBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');

        // If neither stoken nor user info exists, nothing to do.
        if (!userString && !token) {
          console.warn('No user or token in localStorage — clearing bookings and skipping bookings fetch');
          setBookings([]);
          setLoading(false);
          return;
        }

        console.log(token);
        console.log(userString);

        let userId = null;
        try {
          if (userString) {
            const userObj = JSON.parse(userString);
            userId = userObj._id || userObj.id || userObj.userId || null;
          }
        } catch (err) {
          console.warn('Failed to parse user from localStorage', err);
        }

        // Choose API host: localhost for local dev, otherwise production
        const API_BASE = window.location.hostname.includes('localhost')
          ? 'http://localhost:3000'
          : 'https://molsongbsspaces.onrender.com';

  // Ensure timestamp is an explicit UTC ISO string (UTC now minus one hour)
  const now = new Date();
  now.setHours(now.getHours() - 1); // subtract one hour
  const utcTimestamp = now.toISOString();

  // Log explicitly so you can inspect the exact string in the console before send
  console.info('UTC timestamp to send (now -1h):', utcTimestamp);

        const payload = {
          // only include userId when we have one — backend may accept token instead
          ...(userId ? { userId } : {}),
          // keep `timestamp` for backwards compatibility and add `timestamp_utc` to be explicit
          timestamp: utcTimestamp,
          timestamp_utc: utcTimestamp
        };

        // Always use the onrender production API URL per request
        const fetchUrl = 'https://molsongbsspaces.onrender.com/api/user/positions';

  console.info('Fetching user bookings (onrender)', { fetchUrl, payload, hasToken: !!token });
  setFetchError(null);

        // If frontend and backend are on different hosts (Romania vs Frankfurt),
        // the request is cross-origin. Use CORS mode and optionally include
        // credentials if your backend expects cookies (usually not needed with Bearer tokens).
        const fetchOptions = {
          method: 'POST',
          mode: 'cors',
          // change to 'include' only if your backend relies on cookies for auth
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        };

        const res = await fetch(fetchUrl, fetchOptions);

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Failed fetching bookings: ${res.status} ${text}`);
        }

        const data = await res.json().catch(() => null);
        // Backend may return different shapes. The onrender endpoint returns:
        // { status, message, data: [ { locationId, bookings: [ { start,end,status,_id,... } ] }, ... ] }
        const raw = (data && (data.data || data.bookings || data.positions || data)) || [];

        const mapStatus = (s) => {
          if (!s) return 'unknown';
          const lower = String(s).toLowerCase();
          if (lower === 'accepted') return 'upcoming';
          if (lower === 'pending') return 'pending';
          if (lower === 'declined') return 'declined';
          return lower;
        };

        // If each item represents a location with a bookings array, flatten those
        if (Array.isArray(raw) && raw.length > 0 && raw[0] && (raw[0].locationId || raw[0].bookings)) {
          const mapped = raw.flatMap((loc) => {
            const locId = loc.locationId || loc.name || '';
            const locBookings = Array.isArray(loc.bookings) ? loc.bookings : [];
            return locBookings.map((b) => ({
              id: b._id || b.id || null,
              deskName: locId || (b.deskName || b.locationName) || 'Desk',
              location: locId || b.location || '',
              start: b.start || b.startTime || b.from || null,
              end: b.end || b.endTime || b.to || null,
              status: mapStatus(b.status || b.state || (b.approved ? 'accepted' : (b.pending ? 'pending' : null)))
            }));
          });

          const finalList = filterAndSortBookings(mapped);
          setBookings(finalList);
          console.info(`Loaded ${finalList.length} bookings (flattened by location) from API`);

        } else {
          // fallback: try to treat raw as an array of booking-like objects
          const normalize = (b) => ({
            id: b._id || b.id || b.bookingId || b.idBooking || null,
            deskName: b.deskName || (b.desk && (b.desk.name || b.desk.label)) || b.locationName || b.section || b.deskId || 'Desk',
            location: b.location || (b.desk && b.desk.location) || b.locationName || '',
            start: b.startTime || b.start || b.from || b.timestamp || null,
            end: b.endTime || b.end || b.to || null,
            status: mapStatus(b.status || b.state || (b.approved ? 'accepted' : (b.pending ? 'pending' : 'pending')))
          });

          if (Array.isArray(raw)) {
            const mapped = raw.map(normalize);
            const finalList = filterAndSortBookings(mapped);
            setBookings(finalList);
            console.info(`Loaded ${finalList.length} bookings from API`);
          } else if (raw && typeof raw === 'object') {
            const mapped = [normalize(raw)];
            const finalList = filterAndSortBookings(mapped);
            setBookings(finalList);
            console.info(`Loaded ${finalList.length} booking object from API`);
          } else {
            console.warn('Unexpected bookings payload, clearing bookings', data);
            setBookings([]);
          }
        }
      } catch (err) {
        console.error('Error fetching user bookings:', err);
        // Surface a friendly message in the UI. CORS failures often show as TypeError/NetworkError.
        const message = err && err.message ? err.message : String(err);
        setFetchError(message.includes('Failed to fetch') || message.includes('NetworkError') ?
          'Network or CORS error while fetching bookings. Verify backend CORS allows this origin.' : message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, []);

  const pendingCount = bookings.filter((b) => (b.status || 'pending') === 'pending').length;
  const acceptedCount = bookings.filter((b) => b.status === 'upcoming').length;
  const declinedCount = bookings.filter((b) => b.status === 'cancelled' || b.status === 'declined').length;

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Shorten booking ids for display (e.g. '632af3b9...' or fallback to location)
  const truncateId = (id) => {
    if (!id) return '';
    const s = String(id);
    if (s.length <= 10) return s;
    return `${s.slice(0, 8)}...`;
  };

  // Keep only bookings that haven't expired (end > now) and sort by end desc (latest end first)
  const filterAndSortBookings = (arr) => {
    if (!Array.isArray(arr)) return [];
    const nowTs = Date.now();
    const parsed = arr
      .map((b) => ({
        ...b,
        _endTs: (() => {
          try {
            if (b.end == null) return null;
            if (typeof b.end === 'number' && Number.isFinite(b.end)) return Number(b.end);
            if (b.end instanceof Date) return b.end.getTime();
            const t = Date.parse(String(b.end));
            return Number.isFinite(t) ? t : null;
          } catch (e) {
            return null;
          }
        })()
      }))
      // remove entries that have an end timestamp that is in the past
      .filter((b) => (b._endTs === null ? true : b._endTs > nowTs))
      // sort by end timestamp descending (latest end first). Keep items with null _endTs at the end
      .sort((a, b) => {
        if (a._endTs === null && b._endTs === null) return 0;
        if (a._endTs === null) return 1;
        if (b._endTs === null) return -1;
        return b._endTs - a._endTs;
      })
      // remove helper property
      .map(({ _endTs, ...rest }) => rest);

    return parsed;
  };

  // Map status to the project's chip token (colors/icons/labels)
  const getStatusToken = (status = 'pending') => {
    const s = String(status || '').toLowerCase();
    // treat 'upcoming' as accepted for display purposes
    if (s === 'upcoming' || s === 'accepted' || s === 'approved') {
      return {
        chipBg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
        chipBorder: '1px solid rgba(34, 197, 94, 0.35)',
        chipColor: '#166534',
        icon: '✓',
        label: 'Accepted'
      };
    }

    if (s === 'declined' || s === 'cancelled' || s === 'rejected') {
      return {
        chipBg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
        chipBorder: '1px solid rgba(239, 68, 68, 0.35)',
        chipColor: '#991b1b',
        icon: '✗',
        label: 'Declined'
      };
    }

    // default -> pending
    return {
      chipBg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      chipBorder: '1px solid rgba(251, 191, 36, 0.45)',
      chipColor: '#92400e',
      icon: '⏳',
      label: 'Pending'
    };
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
    padding: '20px 28px',
    minWidth: '200px',
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
    textAlign: 'center'
  };

  return (
    <div className="bookings-page"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 45%, #dbeafe 100%)',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden'
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

  <div className="bookings-container" style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <motion.div animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.04, 1] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3 }} style={{ background: 'linear-gradient(135deg, #0067AC, #1d4ed8)', borderRadius: '14px', padding: '14px', boxShadow: '0 10px 25px rgba(30, 64, 175, 0.25)' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L2 9L12 15L22 9L12 3Z" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 10V17C4 17.5304 4.21071 18.0391 4.58579 18.4142C4.96086 18.7893 5.46957 19 6 19H10" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 10V14" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.5 18V21" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.5 18H16.5" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
              <div>
                <h1 style={{ fontSize: '34px', fontWeight: '800', background: 'linear-gradient(135deg, #0f172a, #1d4ed8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.4px', margin: 0 }}>My Bookings</h1>
                <p style={{ color: '#475569', margin: '6px 0 0 0', fontSize: '16px', fontWeight: '500' }}>View and manage your desk and room bookings</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="bookings-stats" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ display: 'flex', gap: '24px', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <motion.div className="stats-card" whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(96, 165, 250, 0.22)' }} style={{ ...statsCardBase, border: '1px solid rgba(59, 130, 246, 0.2)', background: 'linear-gradient(135deg, #eff6ff, #f8fafc)' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600', color: '#1d4ed8', marginBottom: '8px' }}>Total Bookings</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '6px' }}>{loading ? '...' : bookings.length}</div>
            <div style={{ fontSize: '12px', color: 'rgba(15, 23, 42, 0.55)' }}>All booking records fetched</div>
          </motion.div>

          <motion.div className="stats-card" whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(217, 119, 6, 0.18)' }} style={{ ...statsCardBase, border: '1px solid rgba(217, 119, 6, 0.25)', background: 'linear-gradient(135deg, #fff7ed, #fffbeb)' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600', color: '#b45309', marginBottom: '8px' }}>Pending Review</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#92400e', letterSpacing: '-0.5px', marginBottom: '6px' }}>{loading ? '...' : pendingCount}</div>
            <div style={{ fontSize: '12px', color: 'rgba(180, 83, 9, 0.65)' }}>Awaiting admin action</div>
          </motion.div>

          <motion.div className="stats-card" whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(34, 197, 94, 0.22)' }} style={{ ...statsCardBase, border: '1px solid rgba(34, 197, 94, 0.25)', background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>Approved</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#14532d', letterSpacing: '-0.5px', marginBottom: '6px' }}>{loading ? '...' : acceptedCount}</div>
            <div style={{ fontSize: '12px', color: 'rgba(22, 101, 52, 0.65)' }}>Confirmed desk bookings</div>
          </motion.div>

          <motion.div className="stats-card" whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(248, 113, 113, 0.18)' }} style={{ ...statsCardBase, border: '1px solid rgba(248, 113, 113, 0.25)', background: 'linear-gradient(135deg, #fef2f2, #fee2e2)' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600', color: '#b91c1c', marginBottom: '8px' }}>Declined</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#991b1b', letterSpacing: '-0.5px', marginBottom: '6px' }}>{loading ? '...' : declinedCount}</div>
            <div style={{ fontSize: '12px', color: 'rgba(185, 28, 28, 0.65)' }}>Marked as unavailable</div>
          </motion.div>
        </motion.div>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(14px)', border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: '20px', padding: '48px', textAlign: 'center', boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)' }}>
            <div style={{ width: '50px', height: '50px', border: '3px solid rgba(14, 116, 144, 0.2)', borderTop: '3px solid #1d4ed8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px', boxShadow: '0 0 15px rgba(29, 78, 216, 0.25)' }} />
            <p style={{ color: '#475569', fontSize: '14px', margin: 0, letterSpacing: '0.5px' }}>Loading booking data...</p>
          </motion.div>
        )}

        {!loading && bookings.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ background: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(14px)', border: '1px solid rgba(148, 163, 184, 0.24)', borderRadius: '20px', padding: '70px 36px', textAlign: 'center', boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)' }}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: '64px', marginBottom: '20px', filter: 'drop-shadow(0 0 18px rgba(34, 197, 94, 0.35))' }}>✓</motion.div>
            <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '10px', fontWeight: '600', letterSpacing: '-0.5px' }}>All Clear</h2>
            <p style={{ color: '#475569', fontSize: '14px', margin: 0, letterSpacing: '0.3px' }}>No booking requests require your attention</p>
          </motion.div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="booking-list" style={{ display: 'grid', gap: '24px' }}>
            {bookings.map((booking, index) => {
              const bookingKey = booking.id || `${booking.deskName}-${index}`;
              return (
                <motion.div className="booking-card" key={bookingKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} whileHover={{ y: -4 }} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(241,245,249,0.96))', border: '1px solid rgba(148,163,184,0.12)', padding: 18, borderRadius: 12, display: 'grid', gridTemplateColumns: '1fr', gap: 12, alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <h4 style={{ margin: 0, color: '#0f172a', fontSize: 16 }}>{booking.deskName}</h4>
                        {(() => {
                          const token = getStatusToken(booking.status);
                          return (
                            <span style={{ background: token.chipBg, color: token.chipColor, padding: '6px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700, border: token.chipBorder, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>{token.icon} {token.label}</span>
                          );
                        })()}
                    </div>
                    <div style={{ color: '#475569', fontSize: 14 }}>#{truncateId(booking.id) || booking.location}</div>
                    <div style={{ color: '#1e293b', marginTop: 6, fontSize: 13 }}>{formatDateTime(booking.start)} • {formatDateTime(booking.end)}</div>
                  </div>

                  {/* Removed 'Completed' tag per request */}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* New Booking FAB */}
        <motion.button className="new-booking-fab" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ marginTop: 20, padding: '12px 18px', background: 'linear-gradient(90deg,#F6DD58,#ffbf00)', color: '#002147', border: 'none', borderRadius: 10, fontWeight: 700, boxShadow: '0 8px 24px rgba(246,221,88,0.2)' }} onClick={() => window.location.href = '/map'}>
          + New Booking
        </motion.button>
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes gradientShift { 0%,100%{transform:translate(0,0);}50%{transform:translate(30px,30px);} }

        /* Ensure the page chrome matches the component background to avoid a white bar on mobile */
        html, body, #root {
          height: 100%;
          margin: 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 45%, #dbeafe 100%);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Component-level responsive helpers */
        .bookings-page { min-height: 100vh; padding: 40px 24px; box-sizing: border-box; }
        .bookings-container { max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }
        .bookings-stats { display: flex; gap: 24px; margin-bottom: 40px; flex-wrap: wrap; justify-content: center; }
        .stats-card { min-width: 180px; flex: 1 1 200px; border-radius: 16px; }

        .booking-list { display: grid; gap: 24px; }
        .booking-card { padding: 18px; border-radius: 12px; display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; }

        .new-booking-fab { position: static; }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .bookings-page { padding: 18px 12px; }
          .bookings-stats { gap: 12px; margin-bottom: 20px; }
          .stats-card { min-width: 140px; flex: 1 1 45%; padding: 12px 14px; }
          .booking-card { grid-template-columns: 1fr; padding: 12px; }
          .booking-card h4 { font-size: 15px; }
          .new-booking-fab { position: fixed; right: 18px; bottom: 18px; margin: 0; z-index: 60; border-radius: 12px; }
        }

        /* Tablet / small desktop */
        @media (min-width: 769px) and (max-width: 1200px) {
          .stats-card { min-width: 160px; flex: 1 1 30%; }
          .booking-list { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default Bookings;