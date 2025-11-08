import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import SwitchAvatar from './SwitchAvatar';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      setUser(userData);
      setAvatarUrl(userData.image || null);
    }
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleAvatarUpdate = (newAvatarUrl) => {
    setAvatarUrl(newAvatarUrl);
    
    // Update user object in localStorage
    if (user) {
      const updatedUser = { ...user, image: newAvatarUrl };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { 
      path: '/home', 
      label: 'Home', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      path: '/map', 
      label: 'Office Map', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    { 
      path: '/bookings', 
      label: 'My Bookings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      path: '/find-mate', 
      label: 'Find My Mate', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
  ];

  return (
    <>
      {/* Hamburger Button - Mobile Only */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 10000,
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'space-around',
          width: '2.5rem',
          height: '2.5rem',
          background: 'linear-gradient(135deg, #0067AC 0%, #002147 100%)',
          border: '2px solid #F6DD58',
          borderRadius: '8px',
          cursor: 'pointer',
          padding: '0.5rem',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
        className="mobile-menu-button"
      >
        <motion.span
          animate={{
            rotate: isMobileMenuOpen ? 45 : 0,
            y: isMobileMenuOpen ? 8 : 0,
          }}
          style={{
            width: '100%',
            height: '2px',
            background: '#F6DD58',
            borderRadius: '2px',
            transformOrigin: 'center',
          }}
        />
        <motion.span
          animate={{
            opacity: isMobileMenuOpen ? 0 : 1,
          }}
          style={{
            width: '100%',
            height: '2px',
            background: '#F6DD58',
            borderRadius: '2px',
          }}
        />
        <motion.span
          animate={{
            rotate: isMobileMenuOpen ? -45 : 0,
            y: isMobileMenuOpen ? -8 : 0,
          }}
          style={{
            width: '100%',
            height: '2px',
            background: '#F6DD58',
            borderRadius: '2px',
            transformOrigin: 'center',
          }}
        />
      </button>

      {/* Overlay - Mobile Only */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
            display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: isMobileMenuOpen ? 0 : 0 }}
        style={{
          width: '280px',
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #2d3748, #1a202c)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 6px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 9999,
        }}
        className="sidebar"
      >
        {/* Profile Section */}
        <div style={{
        padding: '2rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 1rem',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid #F6DD58',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user?.name || 'User avatar'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #0067AC, #002147)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2.5rem',
              fontWeight: 'bold'
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'N/A'}
            </div>
          )}
        </motion.div>
        <h3 style={{
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '0.25rem'
        }}>
          {user?.name || 'NOT LOGGED IN'}
        </h3>
        <p style={{
          color: '#a0aec0',
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          {user?.email || 'not logged in'}
          {' Role:'+(user?.role ? ` ${user.role}` : ' N/A')}
        </p>
        
        <SwitchAvatar 
          currentAvatar={avatarUrl}
          onAvatarUpdate={handleAvatarUpdate}
        />
      </div>
      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '1.5rem 0',
        overflowY: 'auto'
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                color: isActive ? 'white' : '#a0aec0',
                textDecoration: 'none',
                transition: 'all 0.3s',
                backgroundColor: isActive ? 'rgba(0, 103, 172, 0.3)' : 'transparent',
                borderLeft: isActive ? '4px solid #F6DD58' : '4px solid transparent',
                fontWeight: isActive ? '600' : '400',
                fontSize: '1rem'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#a0aec0';
                }
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 0'
      }}>
        <Link
          to="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.5rem',
            color: '#a0aec0',
            textDecoration: 'none',
            transition: 'all 0.3s',
            fontSize: '1rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#a0aec0';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </Link>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
            padding: '1rem 1.5rem',
            color: '#ED1C24',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontSize: '1rem',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(237, 28, 36, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </motion.div>
    
    {/* Add CSS for responsive behavior */}
    <style>{`
      @media (max-width: 768px) {
        .mobile-menu-button {
          display: flex !important;
        }
        
        .mobile-overlay {
          display: block !important;
        }
        
        .sidebar {
          position: fixed !important;
          top: 0;
          left: ${isMobileMenuOpen ? '0' : '-280px'} !important;
          height: 100vh;
          transition: left 0.3s ease !important;
        }
      }
      
      @media (min-width: 769px) {
        .sidebar {
          position: relative !important;
        }
      }
    `}</style>
    </>
  );
}

export default Sidebar;
