import { motion } from 'framer-motion';
import { useState } from 'react';
import '../index.css';

function FindMyMate() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const colleagues = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@molsoncoors.com',
      department: 'Marketing',
      location: 'Floor 3, Desk 12A',
      status: 'in-office',
      avatar: 'SJ'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.c@molsoncoors.com',
      department: 'Engineering',
      location: 'Floor 2, Desk 8B',
      status: 'in-office',
      avatar: 'MC'
    },
    {
      id: 3,
      name: 'Emma Williams',
      email: 'emma.w@molsoncoors.com',
      department: 'Sales',
      location: 'Remote',
      status: 'remote',
      avatar: 'EW'
    },
    {
      id: 4,
      name: 'James Martinez',
      email: 'james.m@molsoncoors.com',
      department: 'HR',
      location: 'Floor 4, Desk 5C',
      status: 'in-office',
      avatar: 'JM'
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      email: 'lisa.a@molsoncoors.com',
      department: 'Finance',
      location: 'On Leave',
      status: 'offline',
      avatar: 'LA'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-office':
        return '#10b981';
      case 'remote':
        return '#f59e0b';
      case 'offline':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'in-office':
        return 'In Office';
      case 'remote':
        return 'Remote';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const filteredColleagues = colleagues.filter(colleague =>
    colleague.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    colleague.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Find My Mate
          </h1>
          <p className="text-gray-600">
            Locate your colleagues and see who's in the office today
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search by name or department
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search colleagues..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '2px solid #e5e7eb',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0067AC'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '2px solid #e5e7eb',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0067AC'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {colleagues.filter(c => c.status === 'in-office').length}
                </p>
                <p className="text-sm text-gray-600">In Office Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {colleagues.filter(c => c.status === 'remote').length}
                </p>
                <p className="text-sm text-gray-600">Working Remote</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {colleagues.filter(c => c.status === 'offline').length}
                </p>
                <p className="text-sm text-gray-600">Offline</p>
              </div>
            </div>
          </div>
        </div>

        {/* Colleagues Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleagues.map((colleague, index) => (
            <motion.div
              key={colleague.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0067AC, #002147)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {colleague.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {colleague.name}
                    </h3>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(colleague.status),
                        flexShrink: 0
                      }}
                    />
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1 truncate">
                    {colleague.email}
                  </p>
                  
                  <p className="text-sm text-molson-blue font-semibold mb-2">
                    {colleague.department}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm text-gray-600">{colleague.location}</p>
                  </div>

                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: `${getStatusColor(colleague.status)}20`,
                      color: getStatusColor(colleague.status)
                    }}
                  >
                    {getStatusLabel(colleague.status)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredColleagues.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No colleagues found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default FindMyMate;
