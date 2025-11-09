import React, { useMemo, useEffect, useState } from 'react'
import JSConfetti from 'js-confetti'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'
import { TrendingUp } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

// Configure Chart.js colors to match theme
ChartJS.defaults.color = '#64748b'
ChartJS.defaults.borderColor = 'rgba(148, 163, 184, 0.1)'

// Modern stats card component matching AdminBookings style
const StatsCard = ({ label, value, icon, color = '#1d4ed8' }) => (
  <div
    style={{
      background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
      border: '1px solid rgba(148, 163, 184, 0.25)',
      borderRadius: '16px',
      padding: 'clamp(16px, 2vw, 20px) clamp(20px, 4vw, 28px)',
      textAlign: 'center',
      boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
      height: '100%',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 16px 32px rgba(96, 165, 250, 0.22)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.08)';
    }}
  >
    <div style={{ fontSize: '28px', marginBottom: '12px' }}>{icon}</div>
    <div style={{
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '1.2px',
      fontWeight: '600',
      color: color,
      marginBottom: '8px'
    }}>
      {label}
    </div>
    <div style={{
      fontSize: '36px',
      fontWeight: '700',
      color: '#0f172a',
      letterSpacing: '-0.5px'
    }}>
      {value}
    </div>
  </div>
)

const Home = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    totalSeats: 0,
    occupiedSeats: 0,
    availableSeats: 0,
    occupancyRateSeats: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    occupancyRateRooms: 0,
    totalBookings: 0,
    pendingBookings: 0,
    acceptedBookings: 0,
    declinedBookings: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  // Track screen size for responsive design
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Confetti animation on login
  useEffect(() => {
    const showConfetti = localStorage.getItem('showLoginConfetti');
    if (showConfetti === 'true') {
      const confetti = new JSConfetti();
      confetti.addConfetti({
        emojis: ['🍺', '🍻', '�', '🍾'],
        confettiRadius: 6,
        confettiNumber: 60
      }).then(() => {
        localStorage.removeItem('showLoginConfetti');
      });
    }
  }, []);

  useEffect(() => {
    // Fetch statistics from API
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch desks data
      const desksRes = await fetch('https://molsongbsspaces.onrender.com/api/desk/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const desksData = desksRes.ok ? await desksRes.json() : { data: [] };
      const desks = desksData.data || desksData || [];

      // Calculate desk and room stats separately
      let totalSeats = 0;
      let occupiedSeats = 0;
      let totalRooms = 0;
      let occupiedRooms = 0;
      let totalBookings = 0;
      let pendingBookings = 0;
      let acceptedBookings = 0;
      let declinedBookings = 0;

      desks.forEach((desk) => {
        // Categorize as seat or room based on locationId
        // Seats have pattern like "A_Table1.M1", "B_Table2.M3", etc. (contain "Table")
        // Rooms don't have the "Table" pattern
        const isSeat = desk.locationId && desk.locationId.includes('Table');
        
        // Check if desk is occupied:
        // - By the isOccupied flag OR
        // - By having an accepted booking
        let hasActiveBooking = false;
        if (desk.bookings && desk.bookings.length > 0) {
          hasActiveBooking = desk.bookings.some(booking => booking.status === 'accepted');
        }
        const isOccupied = desk.isOccupied || hasActiveBooking;
        
        if (isSeat) {
          totalSeats++;
          if (isOccupied) occupiedSeats++;
        } else {
          totalRooms++;
          if (isOccupied) occupiedRooms++;
        }

        if (desk.bookings && desk.bookings.length > 0) {
          desk.bookings.forEach((booking) => {
            totalBookings++;
            if (!booking.status || booking.status === 'pending') pendingBookings++;
            else if (booking.status === 'accepted') acceptedBookings++;
            else if (booking.status === 'declined') declinedBookings++;
          });
        }
      });

      // If the categorization didn't work (no desks found), use fallback
      // We know there are 216 seats and 17 rooms total
      if (totalSeats === 0 && totalRooms === 0 && desks.length > 0) {
        // Fallback: assume 216 are seats and rest are rooms
        // Re-iterate to count occupied correctly
        let seatsCounter = 0;
        let roomsCounter = 0;
        let occupiedSeatsCounter = 0;
        let occupiedRoomsCounter = 0;
        
        desks.forEach((desk, index) => {
          if (index < 216) {
            seatsCounter++;
            if (desk.isOccupied) occupiedSeatsCounter++;
          } else {
            roomsCounter++;
            if (desk.isOccupied) occupiedRoomsCounter++;
          }
        });
        
        totalSeats = seatsCounter;
        totalRooms = roomsCounter;
        occupiedSeats = occupiedSeatsCounter;
        occupiedRooms = occupiedRoomsCounter;
      }

      // Fetch users data
      const usersRes = await fetch('https://molsongbsspaces.onrender.com/api/user/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const usersData = usersRes.ok ? await usersRes.json() : { data: [] };
      const users = Array.isArray(usersData?.data) ? usersData.data : Array.isArray(usersData) ? usersData : [];
      const totalUsers = users.length;

      const availableSeats = totalSeats - occupiedSeats;
      const availableRooms = totalRooms - occupiedRooms;
      const occupancyRateSeats = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;
      const occupancyRateRooms = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      setStats({
        totalSeats,
        occupiedSeats,
        availableSeats,
        occupancyRateSeats,
        totalRooms,
        occupiedRooms,
        availableRooms,
        occupancyRateRooms,
        totalBookings,
        pendingBookings,
        acceptedBookings,
        declinedBookings,
        totalUsers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const pieData = useMemo(() => ({
    labels: ['Occupied Seats', 'Available Seats'],
    datasets: [
      {
        data: [stats.occupiedSeats, stats.availableSeats],
        backgroundColor: ['#2563eb', '#e5e7eb'],
        borderColor: ['#1e40af', '#d1d5db'],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  }), [stats.occupiedSeats, stats.availableSeats])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 45%, #dbeafe 100%)',
      padding: isMobile ? '16px 12px 20px' : '20px 16px 24px',
      position: 'relative',
      overflowX: 'hidden',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
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
      }} />
      <div style={{
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
      }} />

      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
        width: '100%',
        boxSizing: 'border-box',
        paddingLeft: isMobile ? '0' : '0',
        paddingRight: isMobile ? '0' : '0'
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '24px' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            flexWrap: 'wrap'
          }}>
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
              <TrendingUp color="#bfdbfe" size={30} />
            </motion.div>
            <div>
              <h1 style={{
                fontSize: '34px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #0f172a, #1d4ed8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.4px',
                margin: 0
              }}>
                Office Analytics
              </h1>
              <p style={{
                color: '#475569',
                margin: '6px 0 0 0',
                fontSize: '16px',
                fontWeight: '500'
              }}>
                Real-time workspace occupancy & booking insights
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: isMobile ? '12px' : '20px',
            marginBottom: isMobile ? '20px' : '28px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <StatsCard label="Total Seats" value={loading ? '...' : stats.totalSeats} icon="🪑" color="#1d4ed8" />
          <StatsCard label="Occupied Seats" value={loading ? '...' : stats.occupiedSeats} icon="👤" color="#b45309" />
          <StatsCard label="Pending Bookings" value={loading ? '...' : stats.pendingBookings} icon="⏳" color="#f97316" />
          <StatsCard label="Accepted Bookings" value={loading ? '...' : stats.acceptedBookings} icon="✅" color="#16a34a" />
          <StatsCard label="Declined Bookings" value={loading ? '...' : stats.declinedBookings} icon="❌" color="#dc2626" />
        </motion.div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: isMobile ? '16px' : '24px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.98))',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              borderRadius: '18px',
              padding: isMobile ? '16px 14px' : '20px 24px',
              boxShadow: '0 14px 32px rgba(15, 23, 42, 0.1)',
              width: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#0f172a',
                margin: '0 0 8px 0'
              }}>
                Desk Occupancy
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: 0
              }}>
                Current occupancy distribution
              </p>
            </div>
            <div style={{ width: '100%', height: '200px' }}>
              {!loading && <Pie data={pieData} options={{
                ...{
                  animation: { duration: 900, easing: 'easeOutQuart' },
                  responsive: true,
                  maintainAspectRatio: false
                },
                plugins: { legend: { position: 'bottom', labels: { color: '#374151' } }, title: { display: false } },
              }} />}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.98))',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              borderRadius: '18px',
              padding: '20px 24px',
              boxShadow: '0 14px 32px rgba(15, 23, 42, 0.1)'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#0f172a',
                margin: '0 0 8px 0'
              }}>
                Booking Status
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: 0
              }}>
                Booking request breakdown
              </p>
            </div>
            <div style={{ width: '100%', height: '200px' }}>
              {!loading && (
                <Bar data={{
                  labels: ['Pending', 'Accepted', 'Declined'],
                  datasets: [{
                    label: 'Bookings',
                    data: [stats.pendingBookings, stats.acceptedBookings, stats.declinedBookings],
                    backgroundColor: ['#fbbf24', '#86efac', '#f87171'],
                    borderRadius: 6,
                    barThickness: 28,
                  }]
                }} options={{
                  ...{
                    animation: { duration: 900, easing: 'easeOutQuart' },
                    responsive: true,
                    maintainAspectRatio: false
                  },
                  plugins: { legend: { position: 'top', labels: { boxWidth: 12 } }, title: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } },
                  },
                }} />
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes gradientShift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 30px); }
        }
      `}</style>
    </div>
  )
}

export default Home