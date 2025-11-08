import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

function Login() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://molsongbsspaces.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please check the API endpoint.');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('Login successful:', data);
      // Token is in data.data.token based on API response
      if (data.data && data.data.token) {
        localStorage.setItem('token', data.data.token);
        // Optionally store user info
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
      }
      
      // Redirect to home page
      navigate('/home');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-molson-blue to-coors-blue" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'linear-gradient(to bottom right, #0067AC, #002147)' }}>
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('/office-background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3
        }}
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(2px)'
      }} />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding & Welcome */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white space-y-6"
          >
            {/* Logo/Bottles Image */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <img 
                src="/molson-bottles.png" 
                alt="Molson Coors Products" 
                className="w-full max-w-md mx-auto rounded-2xl"
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.target.style.display = 'none';
                }}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-5xl md:text-6xl font-bold leading-tight"
            >
              Welcome to
              <span className="block text-molson-yellow mt-2">
                Molson Coors
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-200"
            >
              Interactive Office Planner & Booking System
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex gap-4 pt-4"
            >
              <div className="h-1 w-16 bg-molson-yellow rounded-full" />
              <div className="h-1 w-16 bg-molson-red rounded-full" />
              <div className="h-1 w-16 bg-coors-red rounded-full" />
            </motion.div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full"
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              borderRadius: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '3rem'
            }}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h2 className="text-3xl font-bold text-molson-blue mb-2">
                 Log In
                </h2>
                <p className="text-gray-600 mb-15">
                  Access your booking dashboard
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      backgroundColor: '#fee2e2',
                      border: '1px solid #ef4444',
                      color: '#dc2626',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    {error}
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.75rem',
                      border: '2px solid #e5e7eb',
                      outline: 'none',
                      transition: 'border-color 0.3s',
                      fontSize: '1rem'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0067AC'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    placeholder="your.email@molsoncoors.com"
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.75rem',
                      border: '2px solid #e5e7eb',
                      outline: 'none',
                      transition: 'border-color 0.3s',
                      fontSize: '1rem'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0067AC'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    placeholder="••••••••"
                    required
                  />
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? '#6b7280' : 'linear-gradient(to right, #0067AC, #002147)',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    transition: 'box-shadow 0.3s',
                    opacity: loading ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)')}
                  onMouseLeave={(e) => e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </motion.button>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="text-center pt-4"
                  style={{ textAlign: 'center', paddingTop: '1rem' }}
                >
                  <p className="text-sm text-gray-600" style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                    Don't have an account?{' '}
                    <a 
                      href="#" 
                      className="text-molson-blue hover:text-coors-blue font-semibold transition-colors"
                      style={{ color: '#0067AC', fontWeight: '600', textDecoration: 'none' }}
                    >
                      Contact IT Support
                    </a>
                  </p>
                </motion.div>
              </form>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-10 right-10 w-32 h-32 bg-molson-yellow/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-10 left-10 w-40 h-40 bg-molson-red/10 rounded-full blur-3xl"
      />
    </div>
  );
}

export default Login;
