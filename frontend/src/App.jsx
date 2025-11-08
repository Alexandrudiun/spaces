import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      <header style={{
        background: 'linear-gradient(to right, #0067AC, #002147)',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1280px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <h1 style={{ 
              color: '#F6DD58', 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              margin: 0 
            }}>
              Molson Coors
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link 
                to="/home" 
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '600',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Home
              </Link>
              <Link 
                to="/map" 
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '600',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Office Map
              </Link>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#ED1C24',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'opacity 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Logout
          </button>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;