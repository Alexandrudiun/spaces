import React, { useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

function Register() {
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  // Track screen size for responsive design
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill name, email, and password.');
      return false;
    }

    if (form.confirmPassword && form.confirmPassword !== form.password) {
      setError('Password confirmation does not match.');
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }

    setError('');
    return true;
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError('');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Missing authentication token');
      }

      const response = await fetch('https://molsongbsspaces.onrender.com/api/user/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to fetch users');
      }

      const payload = await response.json();
      const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setUsers(list);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
      setUsersError(err.message || 'Unable to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers().catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('https://molsongbsspaces.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: form.name.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role
        })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || 'Registration failed');
      }

      setSuccess('User successfully registered.');
      setForm({ name: '', username: '', email: '', password: '', confirmPassword: '', role: 'user' });
      await fetchUsers();
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  const tableRows = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users
      .map((user) => ({
        id: user._id || user.id,
        name: user.name || user.fullName || 'N/A',
        username: user.username || 'N/A',
        email: user.email || 'N/A',
        role: user.role || 'user',
        createdAt: user.createdAt || user.created_at,
        status: user.status || 'active'
      }))
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [users]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 45%, #dbeafe 100%)',
        padding: isMobile ? '24px 12px' : '48px 24px',
        overflow: 'hidden',
        width: '100%'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: isMobile ? '20px' : '32px' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '12px' : '18px',
              flexWrap: 'wrap'
            }}
          >
            <motion.div
              animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.04, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3 }}
              style={{
                background: 'linear-gradient(135deg, #0067AC, #1d4ed8)',
                borderRadius: '14px',
                padding: '14px',
                boxShadow: '0 10px 25px rgba(30, 64, 175, 0.25)',
                flexShrink: 0
              }}
            >
              <svg width={isMobile ? '24' : '30'} height={isMobile ? '24' : '30'} viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                  stroke="#bfdbfe"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22"
                  stroke="#bfdbfe"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            <div>
              <h1
                style={{
                  fontSize: isMobile ? '24px' : '34px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #0f172a, #1d4ed8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.4px',
                  margin: 0
                }}
              >
                Register Users
              </h1>
              <p
                style={{
                  color: '#475569',
                  margin: '6px 0 0 0',
                  fontSize: isMobile ? '13px' : '16px',
                  fontWeight: '500'
                }}
              >
                Invite teammates and review who already has access to the workspace
              </p>
            </div>
          </div>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gap: isMobile ? '18px' : '28px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(241, 245, 249, 0.95))',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              borderRadius: '18px',
              padding: isMobile ? '20px 16px' : '26px 28px 30px',
              width: '100%',
              boxSizing: 'border-box',
              boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)'
            }}
          >
            <h2
              style={{
                fontSize: isMobile ? '18px' : '20px',
                color: '#0f172a',
                margin: '0 0 16px 0',
                fontWeight: '700'
              }}
            >
              Invite a new user
            </h2>

            {error && (
              <div
                style={{
                  marginBottom: '12px',
                  color: '#991b1b',
                  background: 'rgba(248, 113, 113, 0.15)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(248, 113, 113, 0.25)'
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  marginBottom: '12px',
                  color: '#166534',
                  background: 'rgba(34, 197, 94, 0.15)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(34, 197, 94, 0.25)'
                }}
              >
                {success}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{
                display: 'grid',
                gap: isMobile ? '12px' : '16px'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gap: isMobile ? '12px' : '14px',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))'
                }}
              >
                <input
                  name="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                  style={{
                    padding: isMobile ? '11px 12px' : '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(148, 163, 184, 0.35)',
                    background: 'rgba(255, 255, 255, 0.75)',
                    color: '#0f172a',
                    fontWeight: '500',
                    fontSize: isMobile ? '14px' : '16px'
                  }}
                />
                <input
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  style={{
                    padding: isMobile ? '11px 12px' : '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(148, 163, 184, 0.35)',
                    background: 'rgba(255, 255, 255, 0.75)',
                    color: '#0f172a',
                    fontWeight: '500',
                    fontSize: isMobile ? '14px' : '16px'
                  }}
                />
                <input
                  name="email"
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  style={{
                    padding: isMobile ? '11px 12px' : '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(148, 163, 184, 0.35)',
                    background: 'rgba(255, 255, 255, 0.75)',
                    color: '#0f172a',
                    fontWeight: '500',
                    fontSize: isMobile ? '14px' : '16px'
                  }}
                />
                <input
                  name="password"
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  style={{
                    padding: isMobile ? '11px 12px' : '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(148, 163, 184, 0.35)',
                    background: 'rgba(255, 255, 255, 0.75)',
                    color: '#0f172a',
                    fontWeight: '500',
                    fontSize: isMobile ? '14px' : '16px'
                  }}
                />
                <input
                  name="confirmPassword"
                  placeholder="Confirm password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  style={{
                    padding: isMobile ? '11px 12px' : '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(148, 163, 184, 0.35)',
                    background: 'rgba(255, 255, 255, 0.75)',
                    color: '#0f172a',
                    fontWeight: '500',
                    fontSize: isMobile ? '14px' : '16px'
                  }}
                />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  style={{
                    padding: isMobile ? '11px 12px' : '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(148, 163, 184, 0.35)',
                    background: 'rgba(255, 255, 255, 0.75)',
                    color: '#0f172a',
                    fontWeight: '500',
                    fontSize: isMobile ? '14px' : '16px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <motion.button
                type="submit"
                whileHover={{ y: -2, boxShadow: '0 18px 38px rgba(30, 64, 175, 0.25)' }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                style={{
                  justifySelf: 'flex-start',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                  color: '#f8fafc',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.5px',
                  opacity: loading ? 0.7 : 1,
                  transition: 'opacity 0.2s ease'
                }}
              >
                {loading ? 'Creating...' : 'Create account'}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(241, 245, 249, 0.98))',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '18px',
              padding: isMobile ? '18px 16px' : '24px',
              width: '100%',
              boxSizing: 'border-box',
              boxShadow: '0 20px 42px rgba(15, 23, 42, 0.12)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: isMobile ? '12px' : '12px',
                marginBottom: '18px',
                flexDirection: isMobile ? 'column' : 'row'
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: isMobile ? '18px' : '20px',
                    color: '#0f172a',
                    margin: '0 0 4px 0',
                    fontWeight: '700'
                  }}
                >
                  Existing users
                </h2>
                <p
                  style={{
                    color: '#64748b',
                    margin: 0,
                    fontSize: '14px'
                  }}
                >
                  {tableRows.length} user{tableRows.length === 1 ? '' : 's'} found
                </p>
              </div>
              <motion.button
                onClick={() => fetchUsers()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={usersLoading}
                style={{
                  padding: isMobile ? '10px 16px' : '8px 16px',
                  borderRadius: '999px',
                  border: '1px solid rgba(37, 99, 235, 0.25)',
                  background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                  color: '#1d4ed8',
                  fontWeight: '600',
                  cursor: usersLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 10px 20px rgba(59, 130, 246, 0.1)',
                  opacity: usersLoading ? 0.7 : 1,
                  fontSize: isMobile ? '13px' : '14px',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                {usersLoading ? 'Refreshing...' : 'Refresh list'}
              </motion.button>
            </div>

            {usersError && (
              <div
                style={{
                  marginBottom: '14px',
                  color: '#991b1b',
                  background: 'rgba(248, 113, 113, 0.12)',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(248, 113, 113, 0.22)'
                }}
              >
                {usersError}
              </div>
            )}

            <div
              style={{
                overflowX: 'auto',
                borderRadius: '14px',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                background: 'rgba(248, 250, 252, 0.85)',
                WebkitOverflowScrolling: 'touch',
                width: '100%',
                maxWidth: '100%'
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: isMobile ? '520px' : '100%'
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: 'linear-gradient(135deg, rgba(226, 232, 240, 0.9), rgba(203, 213, 225, 0.7))',
                      color: '#0f172a',
                      textAlign: 'left'
                    }}
                  >
                    <th style={{ padding: isMobile ? '10px 8px' : '14px 16px', fontSize: isMobile ? '10px' : '12px', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '700', whiteSpace: 'nowrap' }}>Name</th>
                    <th style={{ padding: isMobile ? '10px 8px' : '14px 16px', fontSize: isMobile ? '10px' : '12px', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '700', whiteSpace: 'nowrap' }}>Username</th>
                    <th style={{ padding: isMobile ? '10px 8px' : '14px 16px', fontSize: isMobile ? '10px' : '12px', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '700', whiteSpace: 'nowrap' }}>Email</th>
                    <th style={{ padding: isMobile ? '10px 8px' : '14px 16px', fontSize: isMobile ? '10px' : '12px', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '700', whiteSpace: 'nowrap' }}>Role</th>
                    <th style={{ padding: isMobile ? '10px 8px' : '14px 16px', fontSize: isMobile ? '10px' : '12px', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '700', whiteSpace: 'nowrap' }}>Created</th>
                    <th style={{ padding: isMobile ? '10px 8px' : '14px 16px', fontSize: isMobile ? '10px' : '12px', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '700', whiteSpace: 'nowrap' }}>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading && tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: isMobile ? '12px' : '20px', textAlign: 'center', color: '#64748b', fontSize: isMobile ? '12px' : '14px' }}>
                        Loading users...
                      </td>
                    </tr>
                  ) : tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: isMobile ? '12px' : '20px', textAlign: 'center', color: '#94a3b8', fontSize: isMobile ? '12px' : '14px' }}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    tableRows.map((user) => (
                      <tr
                        key={user.id || user.email}
                        style={{
                          borderTop: '1px solid rgba(148, 163, 184, 0.2)',
                          background: 'rgba(255, 255, 255, 0.7)'
                        }}
                      >
                        <td style={{ padding: isMobile ? '10px 8px' : '14px 16px', fontSize: isMobile ? '11px' : '14px', color: '#0f172a', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</td>
                        <td style={{ padding: isMobile ? '10px 8px' : '14px 16px', fontSize: isMobile ? '11px' : '14px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</td>
                        <td style={{ padding: isMobile ? '10px 8px' : '14px 16px', fontSize: isMobile ? '11px' : '14px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</td>
                        <td style={{ padding: isMobile ? '10px 8px' : '14px 16px', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: isMobile ? '4px 8px' : '6px 12px',
                              borderRadius: '999px',
                              background: user.role === 'admin'
                                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(37, 99, 235, 0.18))'
                                : 'linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(22, 163, 74, 0.18))',
                              color: user.role === 'admin' ? '#1d4ed8' : '#166534',
                              fontSize: isMobile ? '10px' : '12px',
                              fontWeight: '600',
                              border: user.role === 'admin'
                                ? '1px solid rgba(37, 99, 235, 0.24)'
                                : '1px solid rgba(22, 163, 74, 0.24)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td style={{ padding: isMobile ? '10px 8px' : '14px 16px', fontSize: isMobile ? '10px' : '13px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatDateTime(user.createdAt)}</td>
                        <td style={{ padding: isMobile ? '10px 8px' : '14px 16px', fontFamily: 'monospace', fontSize: isMobile ? '10px' : '13px', color: '#64748b', whiteSpace: 'nowrap' }}>{formatUserToken(user.id)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Register;
