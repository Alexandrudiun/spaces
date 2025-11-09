import { useState, useEffect } from "react";
import BookingModal from "./BookingModal";
import { table } from "framer-motion/client";

const FloorPlanSVG = () => {
  const formatDateInputValue = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const formatTimeInputValue = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '00:00';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const buildDateTimeFromInput = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);

    if ([year, month, day, hour, minute].some((value) => Number.isNaN(value))) {
      return new Date();
    }

    return new Date(year, month - 1, day, hour, minute, 0, 0);
  };

  const formatDisplayTimestamp = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString([], { hour12: false, year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const defaultsNow = new Date();
  const defaultDate = formatDateInputValue(defaultsNow);
  const defaultTime = formatTimeInputValue(defaultsNow);

  const [hoveredSection, setHoveredSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [desks, setDesks] = useState([]); // Store all desk data
  const [loadingDesks, setLoadingDesks] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // Store current user data
  const [viewMode, setViewMode] = useState('live'); // 'live' | 'search'
  const [searchDate, setSearchDate] = useState(defaultDate);
  const [searchTime, setSearchTime] = useState(defaultTime);
  const [searchTimestamp, setSearchTimestamp] = useState(() => buildDateTimeFromInput(defaultDate, defaultTime));

  // Update current time every second for real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); 

    return () => clearInterval(timer);
  }, []);

  // Fetch current user data from backend API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get userId from the user object stored in localStorage
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userStr || !token) {
          console.warn('⚠️ No user or token found in localStorage');
          return;
        }

        const user = JSON.parse(userStr);
        const userId = user._id || user.id;

        console.log('🔄 Fetching user data from backend for userId:', userId);
        
        const response = await fetch(`https://molsongbsspaces.onrender.com/api/user/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Fetched user data:', data);
        
        // Handle if data is wrapped in a 'data' property
        const userData = data.data || data;
        setCurrentUser(userData);
      } catch (error) {
        console.error('❌ Error fetching user:', error);
      }
    };

    fetchUserData();
  }, []);

  // Keep derived search timestamp in sync with selected date/time
  useEffect(() => {
    if (viewMode === 'search') {
      setSearchTimestamp(buildDateTimeFromInput(searchDate, searchTime));
    }
  }, [viewMode, searchDate, searchTime]);

  const isLiveMode = viewMode === 'live';
  const referenceTime = isLiveMode ? currentTime : searchTimestamp;

  // Fetch all desks from backend API
  useEffect(() => {
    const fetchDesks = async () => {
      try {
        setLoadingDesks(true);
        console.log('🔄 Fetching all desks from backend...');
        
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('https://molsongbsspaces.onrender.com/api/desk/all', {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch desks: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Fetched desks data:', data);
        
        // Handle if data is wrapped in a 'data' property
        const desksData = data.data || data;
        setDesks(Array.isArray(desksData) ? desksData : []);
        console.log(`✅ Loaded ${Array.isArray(desksData) ? desksData.length : 0} desks`);
        
        // Log desks with bookings for debugging
        const desksWithBookings = desksData.filter(d => d.bookings && d.bookings.length > 0);
        console.log(`📋 Desks with bookings (${desksWithBookings.length}):`, desksWithBookings.map(d => ({
          id: d.id,
          locationId: d.locationId,
          name: d.name,
          bookings: d.bookings
        })));
      } catch (error) {
        console.error('❌ Error fetching desks:', error);
        setDesks([]);
      } finally {
        setLoadingDesks(false);
      }
    };

    fetchDesks();
    
    // Refresh desk data every 30 seconds for live updates
    const refreshInterval = setInterval(fetchDesks, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Define sections with their boundaries and colors
  const sections = {
  };

  // UP Tables (Cannot be automated because offsets aren't consistent :( )
  const tableUpData = [
    { id: 'A_Table1.M1', x: 516, y: 88, width: 44, height: 49 },
    { id: 'A_Table1.M2', x: 516, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table1.M3', x: 516, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table1.M4', x: 516 + 44, y: 88, width: 44, height: 49 },
    { id: 'A_Table1.M5', x: 516 + 44, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table1.M6', x: 516 + 44, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table2.M1', x: 516 + 88 + 43, y: 88, width: 44, height: 49 },
    { id: 'A_Table2.M2', x: 516 + 88 + 43, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table2.M3', x: 516 + 88 + 43, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table2.M4', x: 516 + 44 + 88 + 43, y: 88, width: 44, height: 49 },
    { id: 'A_Table2.M5', x: 516 + 44 + 88 + 43, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table2.M6', x: 516 + 44 + 88 + 43, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table3.M1', x: 516 + 88 * 2 + 95, y: 88, width: 44, height: 49 },
    { id: 'A_Table3.M2', x: 516 + 88 * 2 + 95, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table3.M3', x: 516 + 88 * 2 + 95, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table3.M4', x: 516 + 44 + 88 * 2 + 95, y: 88, width: 44, height: 49 },
    { id: 'A_Table3.M5', x: 516 + 44 + 88 * 2 + 95, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table3.M6', x: 516 + 44 + 88 * 2 + 95, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table4.M1', x: 516 + 88 * 3 + 137, y: 88, width: 44, height: 49 },
    { id: 'A_Table4.M2', x: 516 + 88 * 3 + 137, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table4.M3', x: 516 + 88 * 3 + 137, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table4.M4', x: 516 + 44 + 88 * 3 + 137, y: 88, width: 44, height: 49 },
    { id: 'A_Table4.M5', x: 516 + 44 + 88 * 3 + 137, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table4.M6', x: 516 + 44 + 88 * 3 + 137, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table5.M1', x: 516 + 88 * 4 + 189, y: 88, width: 44, height: 49 },
    { id: 'A_Table5.M2', x: 516 + 88 * 4 + 189, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table5.M3', x: 516 + 88 * 4 + 189, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table5.M4', x: 516 + 44 + 88 * 4 + 189, y: 88, width: 44, height: 49 },
    { id: 'A_Table5.M5', x: 516 + 44 + 88 * 4 + 189, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table5.M6', x: 516 + 44 + 88 * 4 + 189, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table6.M1', x: 516 + 88 * 5 + 231, y: 88, width: 44, height: 49 },
    { id: 'A_Table6.M2', x: 516 + 88 * 5 + 231, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table6.M3', x: 516 + 88 * 5 + 231, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table6.M4', x: 516 + 44 + 88 * 5 + 231, y: 88, width: 44, height: 49 },
    { id: 'A_Table6.M5', x: 516 + 44 + 88 * 5 + 231, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table6.M6', x: 516 + 44 + 88 * 5 + 231, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table7.M1', x: 516 + 88 * 6 + 283, y: 88, width: 44, height: 49 },
    { id: 'A_Table7.M2', x: 516 + 88 * 6 + 283, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table7.M3', x: 516 + 88 * 6 + 283, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table7.M4', x: 516 + 44 + 88 * 6 + 283, y: 88, width: 44, height: 49 },
    { id: 'A_Table7.M5', x: 516 + 44 + 88 * 6 + 283, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table7.M6', x: 516 + 44 + 88 * 6 + 283, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table8.M1', x: 516 + 88 * 7 + 325, y: 88, width: 44, height: 49 },
    { id: 'A_Table8.M2', x: 516 + 88 * 7 + 325, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table8.M3', x: 516 + 88 * 7 + 325, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table8.M4', x: 516 + 44 + 88 * 7 + 325, y: 88, width: 44, height: 49 },
    { id: 'A_Table8.M5', x: 516 + 44 + 88 * 7 + 325, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table8.M6', x: 516 + 44 + 88 * 7 + 325, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table9.M1', x: 1748, y: 88, width: 44, height: 49 },
    { id: 'A_Table9.M2', x: 1748, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table9.M3', x: 1748, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table9.M4', x: 1748 + 44, y: 88, width: 44, height: 49 },
    { id: 'A_Table9.M5', x: 1748 + 44, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table9.M6', x: 1748 + 44, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table10.M1', x: 1748 + 88 + 43, y: 88, width: 44, height: 49 },
    { id: 'A_Table10.M2', x: 1748 + 88 + 43, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table10.M3', x: 1748 + 88 + 43, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table10.M4', x: 1748 + 44 + 88 + 43, y: 88, width: 44, height: 49 },
    { id: 'A_Table10.M5', x: 1748 + 44 + 88 + 43, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table10.M6', x: 1748 + 44 + 88 + 43, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table11.M1', x: 1748 + 88 * 2 + 95, y: 88, width: 44, height: 49 },
    { id: 'A_Table11.M2', x: 1748 + 88 * 2 + 95, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table11.M3', x: 1748 + 88 * 2 + 95, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table11.M4', x: 1748 + 44 + 88 * 2 + 95, y: 88, width: 44, height: 49 },
    { id: 'A_Table11.M5', x: 1748 + 44 + 88 * 2 + 95, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table11.M6', x: 1748 + 44 + 88 * 2 + 95, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table12.M1', x: 1748 + 88 * 3 + 137, y: 88, width: 44, height: 49 },
    { id: 'A_Table12.M2', x: 1748 + 88 * 3 + 137, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table12.M3', x: 1748 + 88 * 3 + 137, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table12.M4', x: 1748 + 44 + 88 * 3 + 137, y: 88, width: 44, height: 49 },
    { id: 'A_Table12.M5', x: 1748 + 44 + 88 * 3 + 137, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table12.M6', x: 1748 + 44 + 88 * 3 + 137, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table13.M1', x: 1748 + 88 * 4 + 189, y: 88, width: 44, height: 49 },
    { id: 'A_Table13.M2', x: 1748 + 88 * 4 + 189, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table13.M3', x: 1748 + 88 * 4 + 189, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table13.M4', x: 1748 + 44 + 88 * 4 + 189, y: 88, width: 44, height: 49 },
    { id: 'A_Table13.M5', x: 1748 + 44 + 88 * 4 + 189, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table13.M6', x: 1748 + 44 + 88 * 4 + 189, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table14.M1', x: 1748 + 88 * 5 + 231, y: 88, width: 44, height: 49 },
    { id: 'A_Table14.M2', x: 1748 + 88 * 5 + 231, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table14.M3', x: 1748 + 88 * 5 + 231, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table14.M4', x: 1748 + 44 + 88 * 5 + 231, y: 88, width: 44, height: 49 },
    { id: 'A_Table14.M5', x: 1748 + 44 + 88 * 5 + 231, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table14.M6', x: 1748 + 44 + 88 * 5 + 231, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table15.M1', x: 1748 + 88 * 6 + 283, y: 88, width: 44, height: 49 },
    { id: 'A_Table15.M2', x: 1748 + 88 * 6 + 283, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table15.M3', x: 1748 + 88 * 6 + 283, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table15.M4', x: 1748 + 44 + 88 * 6 + 283, y: 88, width: 44, height: 49 },
    { id: 'A_Table15.M5', x: 1748 + 44 + 88 * 6 + 283, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table15.M6', x: 1748 + 44 + 88 * 6 + 283, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table16.M1', x: 1748 + 88 * 7 + 325, y: 88, width: 44, height: 49 },
    { id: 'A_Table16.M2', x: 1748 + 88 * 7 + 325, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table16.M3', x: 1748 + 88 * 7 + 325, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table16.M4', x: 1748 + 44 + 88 * 7 + 325, y: 88, width: 44, height: 49 },
    { id: 'A_Table16.M5', x: 1748 + 44 + 88 * 7 + 325, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table16.M6', x: 1748 + 44 + 88 * 7 + 325, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table17.M1', x: 1748 + 88 * 8 + 377, y: 88, width: 44, height: 49 },
    { id: 'A_Table17.M2', x: 1748 + 88 * 8 + 377, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table17.M3', x: 1748 + 88 * 8 + 377, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table17.M4', x: 1748 + 44 + 88 * 8 + 377, y: 88, width: 44, height: 49 },
    { id: 'A_Table17.M5', x: 1748 + 44 + 88 * 8 + 377, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table17.M6', x: 1748 + 44 + 88 * 8 + 377, y: 88 + 49 * 2, width: 44, height: 49 },

    { id: 'A_Table18.M1', x: 1748 + 88 * 9 + 416, y: 88, width: 44, height: 49 },
    { id: 'A_Table18.M2', x: 1748 + 88 * 9 + 416, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table18.M3', x: 1748 + 88 * 9 + 416, y: 88 + 49 * 2, width: 44, height: 49 },
    { id: 'A_Table18.M4', x: 1748 + 44 + 88 * 9 + 416, y: 88, width: 44, height: 49 },
    { id: 'A_Table18.M5', x: 1748 + 44 + 88 * 9 + 416, y: 88 + 49, width: 44, height: 49 },
    { id: 'A_Table18.M6', x: 1748 + 44 + 88 * 9 + 416, y: 88 + 49 * 2, width: 44, height: 49 },
  ];

  const tableDownData = [
    { id: 'B_Table1.M1', x: 516, y: 798, width: 44, height: 49 },
    { id: 'B_Table1.M2', x: 516, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table1.M3', x: 516, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table1.M4', x: 516 + 44, y: 798, width: 44, height: 49 },
    { id: 'B_Table1.M5', x: 516 + 44, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table1.M6', x: 516 + 44, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table2.M1', x: 516 + 88 + 43, y: 798, width: 44, height: 49 },
    { id: 'B_Table2.M2', x: 516 + 88 + 43, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table2.M3', x: 516 + 88 + 43, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table2.M4', x: 516 + 44 + 88 + 43, y: 798, width: 44, height: 49 },
    { id: 'B_Table2.M5', x: 516 + 44 + 88 + 43, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table2.M6', x: 516 + 44 + 88 + 43, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table3.M1', x: 516 + 88 * 2 + 95, y: 798, width: 44, height: 49 },
    { id: 'B_Table3.M2', x: 516 + 88 * 2 + 95, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table3.M3', x: 516 + 88 * 2 + 95, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table3.M4', x: 516 + 44 + 88 * 2 + 95, y: 798, width: 44, height: 49 },
    { id: 'B_Table3.M5', x: 516 + 44 + 88 * 2 + 95, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table3.M6', x: 516 + 44 + 88 * 2 + 95, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table4.M1', x: 516 + 88 * 3 + 137, y: 798, width: 44, height: 49 },
    { id: 'B_Table4.M2', x: 516 + 88 * 3 + 137, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table4.M3', x: 516 + 88 * 3 + 137, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table4.M4', x: 516 + 44 + 88 * 3 + 137, y: 798, width: 44, height: 49 },
    { id: 'B_Table4.M5', x: 516 + 44 + 88 * 3 + 137, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table4.M6', x: 516 + 44 + 88 * 3 + 137, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table5.M1', x: 516 + 88 * 4 + 189, y: 798, width: 44, height: 49 },
    { id: 'B_Table5.M2', x: 516 + 88 * 4 + 189, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table5.M3', x: 516 + 88 * 4 + 189, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table5.M4', x: 516 + 44 + 88 * 4 + 189, y: 798, width: 44, height: 49 },
    { id: 'B_Table5.M5', x: 516 + 44 + 88 * 4 + 189, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table5.M6', x: 516 + 44 + 88 * 4 + 189, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table6.M1', x: 516 + 88 * 5 + 231, y: 798, width: 44, height: 49 },
    { id: 'B_Table6.M2', x: 516 + 88 * 5 + 231, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table6.M3', x: 516 + 88 * 5 + 231, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table6.M4', x: 516 + 44 + 88 * 5 + 231, y: 798, width: 44, height: 49 },
    { id: 'B_Table6.M5', x: 516 + 44 + 88 * 5 + 231, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table6.M6', x: 516 + 44 + 88 * 5 + 231, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table7.M1', x: 516 + 88 * 6 + 283, y: 798, width: 44, height: 49 },
    { id: 'B_Table7.M2', x: 516 + 88 * 6 + 283, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table7.M3', x: 516 + 88 * 6 + 283, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table7.M4', x: 516 + 44 + 88 * 6 + 283, y: 798, width: 44, height: 49 },
    { id: 'B_Table7.M5', x: 516 + 44 + 88 * 6 + 283, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table7.M6', x: 516 + 44 + 88 * 6 + 283, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table8.M1', x: 516 + 88 * 7 + 325, y: 798, width: 44, height: 49 },
    { id: 'B_Table8.M2', x: 516 + 88 * 7 + 325, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table8.M3', x: 516 + 88 * 7 + 325, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table8.M4', x: 516 + 44 + 88 * 7 + 325, y: 798, width: 44, height: 49 },
    { id: 'B_Table8.M5', x: 516 + 44 + 88 * 7 + 325, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table8.M6', x: 516 + 44 + 88 * 7 + 325, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table9.M1', x: 1748, y: 798, width: 44, height: 49 },
    { id: 'B_Table9.M2', x: 1748, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table9.M3', x: 1748, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table9.M4', x: 1748 + 44, y: 798, width: 44, height: 49 },
    { id: 'B_Table9.M5', x: 1748 + 44, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table9.M6', x: 1748 + 44, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table10.M1', x: 1748 + 88 + 43, y: 798, width: 44, height: 49 },
    { id: 'B_Table10.M2', x: 1748 + 88 + 43, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table10.M3', x: 1748 + 88 + 43, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table10.M4', x: 1748 + 44 + 88 + 43, y: 798, width: 44, height: 49 },
    { id: 'B_Table10.M5', x: 1748 + 44 + 88 + 43, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table10.M6', x: 1748 + 44 + 88 + 43, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table11.M1', x: 1748 + 88 * 2 + 95, y: 798, width: 44, height: 49 },
    { id: 'B_Table11.M2', x: 1748 + 88 * 2 + 95, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table11.M3', x: 1748 + 88 * 2 + 95, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table11.M4', x: 1748 + 44 + 88 * 2 + 95, y: 798, width: 44, height: 49 },
    { id: 'B_Table11.M5', x: 1748 + 44 + 88 * 2 + 95, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table11.M6', x: 1748 + 44 + 88 * 2 + 95, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table12.M1', x: 1748 + 88 * 3 + 137, y: 798, width: 44, height: 49 },
    { id: 'B_Table12.M2', x: 1748 + 88 * 3 + 137, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table12.M3', x: 1748 + 88 * 3 + 137, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table12.M4', x: 1748 + 44 + 88 * 3 + 137, y: 798, width: 44, height: 49 },
    { id: 'B_Table12.M5', x: 1748 + 44 + 88 * 3 + 137, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table12.M6', x: 1748 + 44 + 88 * 3 + 137, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table13.M1', x: 1748 + 88 * 4 + 189, y: 798, width: 44, height: 49 },
    { id: 'B_Table13.M2', x: 1748 + 88 * 4 + 189, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table13.M3', x: 1748 + 88 * 4 + 189, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table13.M4', x: 1748 + 44 + 88 * 4 + 189, y: 798, width: 44, height: 49 },
    { id: 'B_Table13.M5', x: 1748 + 44 + 88 * 4 + 189, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table13.M6', x: 1748 + 44 + 88 * 4 + 189, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table14.M1', x: 1748 + 88 * 5 + 231, y: 798, width: 44, height: 49 },
    { id: 'B_Table14.M2', x: 1748 + 88 * 5 + 231, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table14.M3', x: 1748 + 88 * 5 + 231, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table14.M4', x: 1748 + 44 + 88 * 5 + 231, y: 798, width: 44, height: 49 },
    { id: 'B_Table14.M5', x: 1748 + 44 + 88 * 5 + 231, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table14.M6', x: 1748 + 44 + 88 * 5 + 231, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table15.M1', x: 1748 + 88 * 6 + 283, y: 798, width: 44, height: 49 },
    { id: 'B_Table15.M2', x: 1748 + 88 * 6 + 283, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table15.M3', x: 1748 + 88 * 6 + 283, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table15.M4', x: 1748 + 44 + 88 * 6 + 283, y: 798, width: 44, height: 49 },
    { id: 'B_Table15.M5', x: 1748 + 44 + 88 * 6 + 283, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table15.M6', x: 1748 + 44 + 88 * 6 + 283, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table16.M1', x: 1748 + 88 * 7 + 325, y: 798, width: 44, height: 49 },
    { id: 'B_Table16.M2', x: 1748 + 88 * 7 + 325, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table16.M3', x: 1748 + 88 * 7 + 325, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table16.M4', x: 1748 + 44 + 88 * 7 + 325, y: 798, width: 44, height: 49 },
    { id: 'B_Table16.M5', x: 1748 + 44 + 88 * 7 + 325, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table16.M6', x: 1748 + 44 + 88 * 7 + 325, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table17.M1', x: 1748 + 88 * 8 + 377, y: 798, width: 44, height: 49 },
    { id: 'B_Table17.M2', x: 1748 + 88 * 8 + 377, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table17.M3', x: 1748 + 88 * 8 + 377, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table17.M4', x: 1748 + 44 + 88 * 8 + 377, y: 798, width: 44, height: 49 },
    { id: 'B_Table17.M5', x: 1748 + 44 + 88 * 8 + 377, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table17.M6', x: 1748 + 44 + 88 * 8 + 377, y: 798 + 49 * 2, width: 44, height: 49 },

    { id: 'B_Table18.M1', x: 1748 + 88 * 9 + 416, y: 798, width: 44, height: 49 },
    { id: 'B_Table18.M2', x: 1748 + 88 * 9 + 416, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table18.M3', x: 1748 + 88 * 9 + 416, y: 798 + 49 * 2, width: 44, height: 49 },
    { id: 'B_Table18.M4', x: 1748 + 44 + 88 * 9 + 416, y: 798, width: 44, height: 49 },
    { id: 'B_Table18.M5', x: 1748 + 44 + 88 * 9 + 416, y: 798 + 49, width: 44, height: 49 },
    { id: 'B_Table18.M6', x: 1748 + 44 + 88 * 9 + 416, y: 798 + 49 * 2, width: 44, height: 49 },
  ];

  // Check if a desk/table is available based on real-time backend data
  const isDeskAvailable = (deskId) => {
    if (loadingDesks) return true; // Show as available while loading
    
    // Find the desk in our fetched data
    // Backend uses locationId like "A_Table2_M2", we use "Table 2 UP"
    const desk = desks.find(d => {
      // Try exact match first
      if (d.name === deskId || d.id === deskId || d._id === deskId) return true;
      
      // Try locationId match
      if (d.locationId) {
        // Extract table number from our format: "Table 2 UP" -> 2
        const match = deskId.match(/Table (\d+) (UP|DOWN)/);
        if (match) {
          const tableNum = match[1];
          const section = match[2];
          
          // Backend format: "A_Table2_M2" or similar
          // Check if locationId contains the table number
          const locationMatch = d.locationId.toLowerCase().includes(`table${tableNum}`.toLowerCase());
          
          if (locationMatch) {
            console.log(`✅ Matched "${deskId}" to desk:`, d);
            return true;
          }
        }
      }
      
      return false;
    });
    
    if (!desk) {
      // Desk not found in backend, assume available
      console.log(`⚠️ Desk not found for: ${deskId}`);
      return true;
    }

    console.log(`🔍 Checking availability for ${deskId}:`, desk);

  const now = referenceTime instanceof Date ? referenceTime : new Date(referenceTime);
  console.log(`⏰ Reference time: ${now.toISOString()} (${now.getTime()})`);
    
    // Check attendances (primary - current format from backend)
    if (desk.attendances && desk.attendances.length > 0) {
      console.log(`📋 Found ${desk.attendances.length} attendances for ${deskId}:`, desk.attendances);
      
      const hasActiveAttendance = desk.attendances.some(attendance => {
        console.log(`\n--- Checking attendance ---`);
        console.log(`Status: ${attendance.status}`);
        console.log(`Raw start: ${attendance.start}`);
        console.log(`Raw end: ${attendance.end}`);
        
        // Check if attendance is pending or active
        if (attendance.status === 'pending' || attendance.status === 'active') {
          const attendanceStart = new Date(attendance.start);
          const attendanceEnd = attendance.end ? new Date(attendance.end) : null;
          
          console.log(`Parsed start: ${attendanceStart.toISOString()} (${attendanceStart.getTime()})`);
          console.log(`Parsed end: ${attendanceEnd ? attendanceEnd.toISOString() + ' (' + attendanceEnd.getTime() + ')' : 'null'}`);
          console.log(`Current: ${now.toISOString()} (${now.getTime()})`);
          
          // If there's a start time but no end time, it's currently occupied
          if (!attendanceEnd) {
            const isOccupied = now >= attendanceStart;
            console.log(`✅ No end time - Comparing: now (${now.getTime()}) >= start (${attendanceStart.getTime()}) = ${isOccupied}`);
            return isOccupied;
          }
          
          // Check if current time is within attendance period
          const nowIsAfterStart = now >= attendanceStart;
          const nowIsBeforeEnd = now <= attendanceEnd;
          const isActive = nowIsAfterStart && nowIsBeforeEnd;
          
          console.log(`📊 Comparison:`);
          console.log(`  now >= start: ${now.getTime()} >= ${attendanceStart.getTime()} = ${nowIsAfterStart}`);
          console.log(`  now <= end: ${now.getTime()} <= ${attendanceEnd.getTime()} = ${nowIsBeforeEnd}`);
          console.log(`  Is active: ${isActive}`);
          
          return isActive;
        }
        console.log(`⏭️ Skipping - status is "${attendance.status}"`);
        return false;
      });
      
      if (hasActiveAttendance) {
        console.log(`\n❌ FINAL RESULT: ${deskId} is OCCUPIED\n`);
        return false; // Occupied
      } else {
        console.log(`\n✅ No active attendance found for ${deskId}\n`);
      }
    }
    
    // Check bookings (fallback - legacy format)
    if (desk.bookings && desk.bookings.length > 0) {
      const hasActiveBooking = desk.bookings.some(booking => {
        const bookingStart = new Date(booking.startTime || booking.start);
        const bookingEnd = new Date(booking.endTime || booking.end);
        
        // Check if current time is within booking period
        return now >= bookingStart && now <= bookingEnd;
      });
      
      if (hasActiveBooking) return false; // Booked
    }

    console.log(`✅ ${deskId} is AVAILABLE`);
    return true; // Available if no active attendance or booking
  };

  // Get booking status for a desk (available, booked, pending) at the selected time
  const getDeskStatus = (deskId, overrideTime) => {
    if (loadingDesks) return 'available';

    const desk = desks.find((d) => {
      if (d.name === deskId || d.id === deskId || d._id === deskId) return true;
      if (d.locationId === deskId) return true;
      return false;
    });

    if (!desk) {
      if (deskId.includes('Table')) {
        console.log(`⚠️ Desk not found in backend data: ${deskId}`);
        console.log(`Available desk IDs:`, desks.map((d) => ({ id: d.id, locationId: d.locationId, name: d.name })).slice(0, 5));
      }
      return 'available';
    }

    const targetTime = overrideTime instanceof Date
      ? overrideTime
      : overrideTime
      ? new Date(overrideTime)
      : referenceTime;

    if (!(targetTime instanceof Date) || Number.isNaN(targetTime.getTime())) {
      console.warn('⚠️ Invalid reference time supplied to getDeskStatus, defaulting to available');
      return 'available';
    }

    console.log(`🔍 Checking status for ${deskId} (matched desk: ${desk.locationId || desk.id}) at ${targetTime.toLocaleString()}`);

    if (desk.bookings && desk.bookings.length > 0) {
      console.log(`📋 Found ${desk.bookings.length} booking(s) for ${deskId}:`, desk.bookings);

      for (const booking of desk.bookings) {
        if (booking.status === 'declined') {
          console.log(`  Skipping declined booking`);
          continue;
        }

        const bookingStart = new Date(booking.start);
        const bookingEnd = new Date(booking.end);
        const isWithinTime = targetTime >= bookingStart && targetTime <= bookingEnd;

        console.log(`  Booking: ${bookingStart.toISOString()} - ${bookingEnd.toISOString()}`);
        console.log(`  Reference: ${targetTime.toISOString()}`);
        console.log(`  Status: ${booking.status}, Within time: ${isWithinTime}`);
        console.log(`  Comparison: ref(${targetTime.getTime()}) >= start(${bookingStart.getTime()}) && ref <= end(${bookingEnd.getTime()})`);

        if (isWithinTime) {
          if (booking.status === 'pending') {
            console.log(`  ⏳ PENDING - Booking awaiting approval`);
            return 'pending';
          }
          if (booking.status === 'accepted') {
            console.log(`  🔴 BOOKED - Accepted booking is active`);
            return 'booked';
          }
        } else {
          console.log(`  ⏭️ Booking outside selected timeframe`);
        }
      }
    }

    if (desk.attendances && desk.attendances.length > 0) {
      console.log(`📋 Checking ${desk.attendances.length} attendances for ${deskId}`);

      for (const attendance of desk.attendances) {
        if (attendance.status === 'completed') continue;

        const attendanceStart = new Date(attendance.start);

        if (attendance.end) {
          const attendanceEnd = new Date(attendance.end);
          const isWithinTime = targetTime >= attendanceStart && targetTime <= attendanceEnd;

          console.log(`  Attendance: ${attendanceStart.toISOString()} - ${attendanceEnd.toISOString()}`);
          console.log(`  Status: ${attendance.status}, Within time: ${isWithinTime}`);

          if (isWithinTime) {
            if (attendance.status === 'pending') {
              console.log(`  ⏳ PENDING attendance found`);
              return 'pending';
            }
            if (attendance.status === 'active') {
              console.log(`  🔴 BOOKED (active attendance)`);
              return 'booked';
            }
          }
        } else {
          if (targetTime >= attendanceStart && attendance.status === 'active') {
            console.log(`  🔴 BOOKED (active attendance without end time)`);
            return 'booked';
          }
          if (attendance.status === 'pending') {
            console.log(`  ⏳ PENDING attendance (no end time)`);
            return 'pending';
          }
        }
      }
    }

    console.log(`  ✅ AVAILABLE - No active bookings in selected timeframe`);
    return 'available';
  };

  // Get color based on desk status
  const getDeskColor = (deskId) => {
    const status = getDeskStatus(deskId);
    
    switch (status) {
      case 'booked':
        return '#ef4444'; // Red - occupied/booked
      case 'pending':
        return '#f59e0b'; // Orange/Yellow - pending approval
      case 'available':
      default:
        return '#10b981'; // Green - available
    }
  };

  const selectedDeskStatus = selectedSection ? getDeskStatus(selectedSection) : null;

  // Legacy function for sections (non-table areas)
  const isAvailable = (sectionName) => {
    // For individual tables, use the new desk availability check
    if (sectionName.includes('Table') && sectionName.includes('UP')) {
      return isDeskAvailable(sectionName);
    }
    if (sectionName.includes('Table') && sectionName.includes('DOWN')) {
      return isDeskAvailable(sectionName);
    }

    // For other sections, use old logic
  const currentHour = referenceTime.getHours();
  const currentDate = referenceTime.toISOString().split("T")[0];

    const sectionBooking = bookings.find(
      (b) =>
        b.section === sectionName &&
        b.date === currentDate &&
        parseInt(b.startTime) <= currentHour &&
        parseInt(b.endTime) > currentHour
    );

    return !sectionBooking;
  };

  // Get detailed booking information for a desk
  const getDeskInfo = (deskId) => {
    // Use same matching logic as isDeskAvailable
    const desk = desks.find(d => {
      // Try exact match first
      if (d.name === deskId || d.id === deskId || d._id === deskId) return true;
      
      // Try locationId match
      if (d.locationId) {
        // Extract table number from our format: "Table 2 UP" -> 2
        const match = deskId.match(/Table (\d+) (UP|DOWN)/);
        if (match) {
          const tableNum = match[1];
          
          // Backend format: "A_Table2_M2" or similar
          const locationMatch = d.locationId.toLowerCase().includes(`table${tableNum}`.toLowerCase());
          
          if (locationMatch) return true;
        }
      }
      
      return false;
    });
    
    if (!desk) {
      console.log(`⚠️ getDeskInfo: Desk not found for ${deskId}`);
      return {
        name: deskId,
        status: 'Unknown',
        available: true,
        attendances: [],
        bookings: []
      };
    }

    console.log(`📊 getDeskInfo for ${deskId}:`, desk);

  const now = referenceTime instanceof Date ? referenceTime : new Date(referenceTime);
    let currentBooking = null;
    let nextBooking = null;
    let currentAttendance = null;
    let nextAttendance = null;

    // Check attendances first (primary format)
    if (desk.attendances && desk.attendances.length > 0) {
      // Find current active attendance
      currentAttendance = desk.attendances.find(attendance => {
        if (attendance.status === 'pending' || attendance.status === 'active') {
          const attendanceStart = new Date(attendance.start);
          const attendanceEnd = attendance.end ? new Date(attendance.end) : null;
          
          if (!attendanceEnd) {
            return now >= attendanceStart;
          }
          
          return now >= attendanceStart && now <= attendanceEnd;
        }
        return false;
      });

      // Find next upcoming attendance
      const upcomingAttendances = desk.attendances
        .filter(attendance => {
          const attendanceStart = new Date(attendance.start);
          return attendanceStart > now;
        })
        .sort((a, b) => new Date(a.start) - new Date(b.start));
      
      nextAttendance = upcomingAttendances[0];
    }

    // Check bookings (fallback format)
    if (desk.bookings && desk.bookings.length > 0) {
      // Find current active booking
      currentBooking = desk.bookings.find(booking => {
        const bookingStart = new Date(booking.startTime || booking.start);
        const bookingEnd = new Date(booking.endTime || booking.end);
        return now >= bookingStart && now <= bookingEnd;
      });

      // Find next upcoming booking
      const upcomingBookings = desk.bookings
        .filter(booking => new Date(booking.startTime || booking.start) > now)
        .sort((a, b) => new Date(a.startTime || a.start) - new Date(b.startTime || b.start));
      
      nextBooking = upcomingBookings[0];
    }

    // Prioritize attendance over booking
    const activeItem = currentAttendance || currentBooking;
    const upcomingItem = nextAttendance || nextBooking;

    return {
      name: desk.name || deskId,
      id: desk._id,
      status: activeItem ? 'Occupied' : 'Available',
      available: !activeItem,
      currentBooking: activeItem,
      nextBooking: upcomingItem,
      allBookings: [...(desk.attendances || []), ...(desk.bookings || [])],
      isAttendance: !!currentAttendance
    };
  };

  const getSectionColor = (sectionName) => {
    const section = sections[sectionName];
    if (!section) return "#94a3b8";

    if (!isAvailable(sectionName)) {
      return "#ef4444"; // Red for booked
    }

    if (hoveredSection === sectionName) {
      return section.hoverColor;
    }

    return section.color;
  };

  const handleSectionClick = (sectionName) => {
    setSelectedSection(sectionName);
  };

  const handleCloseModal = () => {
    setSelectedSection(null);
  };

  const handleBookingConfirm = async (bookingData) => {
    try {
      console.log("📤 Booking data:", bookingData);
      console.log("📤 All desks:", desks);

      // Get the desk from our desks array to find the backend desk ID
      const desk = desks.find(d => {
        console.log(`🔍 Checking desk:`, d);
        
        // Try direct locationId match first (e.g., "A_Table2.M1")
        if (d.locationId === bookingData.deskId || d.locationId === bookingData.section) {
          console.log(`✅ Direct locationId match!`);
          return true;
        }
        
        // Try direct ID match
        if (d._id === bookingData.deskId || d.id === bookingData.deskId) {
          console.log(`✅ Direct ID match!`);
          return true;
        }
        
        // Try matching "Table X UP/DOWN" format to locationId
        if (d.locationId) {
          const match = bookingData.section.match(/Table (\d+) (UP|DOWN)/);
          if (match) {
            const tableNum = match[1];
            const locationMatch = d.locationId.toLowerCase().includes(`table${tableNum}`.toLowerCase());
            if (locationMatch) {
              console.log(`✅ Pattern match for Table ${tableNum}!`);
              return true;
            }
          }
        }
        
        return false;
      });

      if (!desk) {
        console.error('❌ Could not find desk. Searched for:', {
          deskId: bookingData.deskId,
          section: bookingData.section
        });
        alert('Could not find desk in backend. Please try again.');
        return;
      }

      const backendDeskId = desk._id || desk.id;
      console.log("📍 Found desk ID:", backendDeskId);

      // Combine date and time into ISO format (UTC)
      // The backend expects UTC times with Z suffix
      // Format: "2025-11-08T23:00:00Z"
      
      // Handle times that cross midnight (00:00, 00:30 are next day)
      const startHour = parseInt(bookingData.startTime.split(':')[0]);
      const endHour = parseInt(bookingData.endTime.split(':')[0]);
      
      let startDate = bookingData.date;
      let endDate = bookingData.date;
      
      // If end time is 00:00 or 00:30, it's the next day
      if (endHour === 0) {
        const nextDay = new Date(bookingData.date);
        nextDay.setDate(nextDay.getDate() + 1);
        endDate = nextDay.toISOString().split('T')[0];
      }
      
      // Create datetime in LOCAL timezone, then convert to ISO (UTC)
      // This ensures "02:00" in your local time is correctly converted to UTC
      const [startH, startM] = bookingData.startTime.split(':').map(Number);
      const [endH, endM] = bookingData.endTime.split(':').map(Number);
      
      const startDateObj = new Date(startDate);
      startDateObj.setHours(startH, startM, 0, 0);
      
      const endDateObj = new Date(endDate);
      endDateObj.setHours(endH, endM, 0, 0);
      
      const startDateTime = startDateObj.toISOString();
      const endDateTime = endDateObj.toISOString();

      console.log("📅 Start datetime (local→UTC):", startDateTime);
      console.log("📅 End datetime (local→UTC):", endDateTime);

      // Validate that end time is after start time
      if (endDateObj <= startDateObj) {
        alert('End time must be after start time!');
        return;
      }

      // Get current user ID from the fetched user data, fallback to localStorage
      let userId;
      if (currentUser) {
        userId = currentUser._id || currentUser.id;
        console.log("👤 Using userId from API:", userId);
      } else {
        // Fallback: get from localStorage user object
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            userId = user._id || user.id;
            console.log("👤 Using userId from localStorage user object:", userId);
          }
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }
      
      if (!userId) {
        alert('User not found. Please log in again.');
        return;
      }
      
      const requestBody = {
        start: startDateTime,
        end: endDateTime,
        attendees: [userId]
      };

      console.log("📤 Sending booking request:", requestBody);

      const token = localStorage.getItem('token');
      const response = await fetch(`https://molsongbsspaces.onrender.com/api/desk/book/${backendDeskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Backend error:", errorData);
        throw new Error(errorData.message || errorData.error || `Failed to book desk: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Booking successful:", result);

      // Update local bookings state
      setBookings([...bookings, bookingData]);

      // Close modal
      setSelectedSection(null);

      // Show success message
      alert(`✅ Booking confirmed for ${bookingData.section}!\nTime: ${bookingData.startTime} - ${bookingData.endTime}`);

      // Refresh desk data to show updated availability
      // The useEffect will handle this automatically with the 30-second refresh, 
      // but we can trigger it immediately
      const fetchDesks = async () => {
        try {
          const response = await fetch('https://molsongbsspaces.onrender.com/api/desk/all', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            const desksData = data.data || data;
            setDesks(Array.isArray(desksData) ? desksData : []);
          }
        } catch (error) {
          console.error('Error refreshing desks:', error);
        }
      };
      fetchDesks();

    } catch (error) {
      console.error('❌ Error booking desk:', error);
      alert(`Failed to book desk: ${error.message}`);
    }
  };

  return (
    <>
      <div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.12)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.7)',
              padding: '4px',
              borderRadius: '999px',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.1)',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('live')}
              style={{
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                padding: '10px 18px',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '14px',
                color: isLiveMode ? '#0f172a' : '#475569',
                background: isLiveMode ? 'linear-gradient(135deg, #a5b4fc, #6366f1)' : 'transparent',
                boxShadow: isLiveMode ? '0 8px 18px rgba(99, 102, 241, 0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Live Mode
            </button>
            <button
              type="button"
              onClick={() => setViewMode('search')}
              style={{
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                padding: '10px 18px',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '14px',
                color: !isLiveMode ? '#0f172a' : '#475569',
                background: !isLiveMode ? 'linear-gradient(135deg, #fde68a, #f59e0b)' : 'transparent',
                boxShadow: !isLiveMode ? '0 8px 18px rgba(245, 158, 11, 0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Search Mode
            </button>
          </div>

          {viewMode === 'search' && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                Date
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  style={{
                    marginTop: '4px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5f5',
                    background: '#fff',
                    fontSize: '14px',
                    color: '#0f172a',
                    minWidth: '160px',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                  }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                Time
                <input
                  type="time"
                  value={searchTime}
                  onChange={(e) => setSearchTime(e.target.value)}
                  step={1800}
                  style={{
                    marginTop: '4px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5f5',
                    background: '#fff',
                    fontSize: '14px',
                    color: '#0f172a',
                    minWidth: '120px',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                  }}
                />
              </label>
            </div>
          )}

          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
              {isLiveMode ? 'Live availability' : 'Previewing availability'}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
              {isLiveMode
                ? `Updated ${currentTime.toLocaleTimeString([], { hour12: false })}`
                : formatDisplayTimestamp(referenceTime)}
            </p>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "8px",
            padding: "30px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
          className="floor-plan-svg-container"
        >
          <svg
            width="3234"
            height="1036"
            viewBox="0 0 3234 1036"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ maxWidth: "1200px", width: "100%", height: "auto" }}
            className="floor-plan-svg"
          >
            <defs>
              <clipPath id="beerPointClip">
                <path d="M229.195 1035.5H0.5V0.5H229.195V249.201H418.513V319.039H625.5V722.99H409.931V790.818H229.195V1035.5Z" />
              </clipPath>
            </defs>
            <g stroke="#000">
            <path
              d="M233.5 1032H7V2.00055H233.5V249.501H421V319.001H626V721.001H412.5V788.501H233.5V1032Z"
              stroke="black"
            />
            <circle cx="575" cy="566.001" r="2" stroke="black" />
            <circle cx="526" cy="566.001" r="2" stroke="black" />
            <circle cx="476" cy="566.001" r="2" stroke="black" />
            <circle cx="575" cy="614.001" r="2" stroke="black" />
            <circle cx="526" cy="614.001" r="2" stroke="black" />
            <circle cx="476" cy="614.001" r="2" stroke="black" />
            <path d="M478.5 566.501H523.5" stroke="black" />
            <path d="M528.5 566.501H573.5" stroke="black" />
            <path d="M477.5 614.501H522.5" stroke="black" />
            <path d="M527.5 614.501H572.5" stroke="black" />
            <path d="M574.5 568.501V611.501" stroke="black" />
            <path d="M475.5 568.501V611.501" stroke="black" />
            <path
              d="M515.5 587.501L576 576.001M499.5 597.001L560 607.501"
              stroke="black"
            />
            <path
              d="M579.5 559.501H471.5C470.395 559.501 469.5 560.396 469.5 561.501V618.501C469.5 619.605 470.395 620.501 471.5 620.501H579.5C580.605 620.501 581.5 619.605 581.5 618.501V561.501C581.5 560.396 580.605 559.501 579.5 559.501Z"
              stroke="black"
            />
            <path
              d="M495.136 586.882L489.484 583.687C488.151 582.934 486.5 583.897 486.5 585.428V592.308C486.5 593.897 488.262 594.851 489.593 593.984L495.244 590.298C496.5 589.479 496.441 587.62 495.136 586.882Z"
              stroke="black"
            />
            <circle cx="576" cy="423.001" r="2" stroke="black" />
            <circle cx="527" cy="423.001" r="2" stroke="black" />
            <circle cx="477" cy="423.001" r="2" stroke="black" />
            <circle cx="576" cy="471.001" r="2" stroke="black" />
            <circle cx="527" cy="471.001" r="2" stroke="black" />
            <circle cx="477" cy="471.001" r="2" stroke="black" />
            <path d="M479.5 423.501H524.5" stroke="black" />
            <path d="M529.5 423.501H574.5" stroke="black" />
            <path d="M478.5 471.501H523.5" stroke="black" />
            <path d="M528.5 471.501H573.5" stroke="black" />
            <path d="M575.5 425.501V468.501" stroke="black" />
            <path d="M476.5 425.501V468.501" stroke="black" />
            <path
              d="M516.5 444.501L577 433.001M500.5 454.001L561 464.501"
              stroke="black"
            />
            <path
              d="M580.5 416.501H472.5C471.395 416.501 470.5 417.396 470.5 418.501V475.501C470.5 476.605 471.395 477.501 472.5 477.501H580.5C581.605 477.501 582.5 476.605 582.5 475.501V418.501C582.5 417.396 581.605 416.501 580.5 416.501Z"
              stroke="black"
            />
            <path
              d="M496.136 443.882L490.484 440.687C489.151 439.934 487.5 440.897 487.5 442.428V449.308C487.5 450.897 489.262 451.851 490.593 450.984L496.244 447.298C497.5 446.479 497.441 444.62 496.136 443.882Z"
              stroke="black"
            />
            <path d="M7.5 759.001H37V787.001H7.5V759.001Z" stroke="black" />
            <path d="M30 738.501H13.5V755.501H30V738.501Z" stroke="black" />
            <path d="M30 790.501H13.5V807.501H30V790.501Z" stroke="black" />
            <path d="M7.5 841.001H37V869.001H7.5V841.001Z" stroke="black" />
            <path d="M30 820.501H13.5V837.501H30V820.501Z" stroke="black" />
            <path d="M30 872.501H13.5V889.501H30V872.501Z" stroke="black" />
            <path d="M7.5 923.001H37V951.001H7.5V923.001Z" stroke="black" />
            <path d="M30 902.501H13.5V919.501H30V902.501Z" stroke="black" />
            <path d="M30 954.501H13.5V971.501H30V954.501Z" stroke="black" />
            <path d="M6.5 78.0005H36V106.001H6.5V78.0005Z" stroke="black" />
            <path d="M29 57.5005H12.5V74.5005H29V57.5005Z" stroke="black" />
            <path d="M29 109.501H12.5V126.501H29V109.501Z" stroke="black" />
            <path d="M6.5 160.001H36V188.001H6.5V160.001Z" stroke="black" />
            <path d="M29 139.501H12.5V156.501H29V139.501Z" stroke="black" />
            <path d="M29 191.501H12.5V208.501H29V191.501Z" stroke="black" />
            <path d="M6.5 242.001H36V270.001H6.5V242.001Z" stroke="black" />
            <path d="M29 221.501H12.5V238.501H29V221.501Z" stroke="black" />
            <path d="M29 273.501H12.5V290.501H29V273.501Z" stroke="black" />
            <path
              d="M300.5 681.501H215V709.501H300.5V681.501Z"
              stroke="black"
            />
            <path
              d="M287 663.001C291.447 663.001 295 666.387 295 670.501C295 674.615 291.447 678.001 287 678.001C282.553 678.001 279 674.615 279 670.501C279 666.387 282.553 663.001 287 663.001Z"
              stroke="black"
            />
            <path
              d="M258 663.001C262.447 663.001 266 666.387 266 670.501C266 674.615 262.447 678.001 258 678.001C253.553 678.001 250 674.615 250 670.501C250 666.387 253.553 663.001 258 663.001Z"
              stroke="black"
            />
            <path
              d="M229 663.001C233.447 663.001 237 666.387 237 670.501C237 674.615 233.447 678.001 229 678.001C224.553 678.001 221 674.615 221 670.501C221 666.387 224.553 663.001 229 663.001Z"
              stroke="black"
            />
            <path
              d="M287 713.001C291.447 713.001 295 716.387 295 720.501C295 724.615 291.447 728.001 287 728.001C282.553 728.001 279 724.615 279 720.501C279 716.387 282.553 713.001 287 713.001Z"
              stroke="black"
            />
            <path
              d="M258 713.001C262.447 713.001 266 716.387 266 720.501C266 724.615 262.447 728.001 258 728.001C253.553 728.001 250 724.615 250 720.501C250 716.387 253.553 713.001 258 713.001Z"
              stroke="black"
            />
            <path
              d="M229 713.001C233.447 713.001 237 716.387 237 720.501C237 724.615 233.447 728.001 229 728.001C224.553 728.001 221 724.615 221 720.501C221 716.387 224.553 713.001 229 713.001Z"
              stroke="black"
            />
            <path d="M172 681.501H86.5V709.501H172V681.501Z" stroke="black" />
            <path
              d="M158.5 663.001C162.947 663.001 166.5 666.387 166.5 670.501C166.5 674.615 162.947 678.001 158.5 678.001C154.053 678.001 150.5 674.615 150.5 670.501C150.5 666.387 154.053 663.001 158.5 663.001Z"
              stroke="black"
            />
            <path
              d="M129.5 663.001C133.947 663.001 137.5 666.387 137.5 670.501C137.5 674.615 133.947 678.001 129.5 678.001C125.053 678.001 121.5 674.615 121.5 670.501C121.5 666.387 125.053 663.001 129.5 663.001Z"
              stroke="black"
            />
            <path
              d="M100.5 663.001C104.947 663.001 108.5 666.387 108.5 670.501C108.5 674.615 104.947 678.001 100.5 678.001C96.0527 678.001 92.5 674.615 92.5 670.501C92.5 666.387 96.0527 663.001 100.5 663.001Z"
              stroke="black"
            />
            <path
              d="M158.5 713.001C162.947 713.001 166.5 716.387 166.5 720.501C166.5 724.615 162.947 728.001 158.5 728.001C154.053 728.001 150.5 724.615 150.5 720.501C150.5 716.387 154.053 713.001 158.5 713.001Z"
              stroke="black"
            />
            <path
              d="M129.5 713.001C133.947 713.001 137.5 716.387 137.5 720.501C137.5 724.615 133.947 728.001 129.5 728.001C125.053 728.001 121.5 724.615 121.5 720.501C121.5 716.387 125.053 713.001 129.5 713.001Z"
              stroke="black"
            />
            <path
              d="M100.5 713.001C104.947 713.001 108.5 716.387 108.5 720.501C108.5 724.615 104.947 728.001 100.5 728.001C96.0527 728.001 92.5 724.615 92.5 720.501C92.5 716.387 96.0527 713.001 100.5 713.001Z"
              stroke="black"
            />
            <path
              d="M300.5 328.501H215V356.501H300.5V328.501Z"
              stroke="black"
            />
            <path
              d="M287 310.001C291.447 310.001 295 313.387 295 317.501C295 321.615 291.447 325.001 287 325.001C282.553 325.001 279 321.615 279 317.501C279 313.387 282.553 310.001 287 310.001Z"
              stroke="black"
            />
            <path
              d="M258 310.001C262.447 310.001 266 313.387 266 317.501C266 321.615 262.447 325.001 258 325.001C253.553 325.001 250 321.615 250 317.501C250 313.387 253.553 310.001 258 310.001Z"
              stroke="black"
            />
            <path
              d="M229 310.001C233.447 310.001 237 313.387 237 317.501C237 321.615 233.447 325.001 229 325.001C224.553 325.001 221 321.615 221 317.501C221 313.387 224.553 310.001 229 310.001Z"
              stroke="black"
            />
            <path
              d="M287 360.001C291.447 360.001 295 363.387 295 367.501C295 371.615 291.447 375.001 287 375.001C282.553 375.001 279 371.615 279 367.501C279 363.387 282.553 360.001 287 360.001Z"
              stroke="black"
            />
            <path
              d="M258 360.001C262.447 360.001 266 363.387 266 367.501C266 371.615 262.447 375.001 258 375.001C253.553 375.001 250 371.615 250 367.501C250 363.387 253.553 360.001 258 360.001Z"
              stroke="black"
            />
            <path
              d="M229 360.001C233.447 360.001 237 363.387 237 367.501C237 371.615 233.447 375.001 229 375.001C224.553 375.001 221 371.615 221 367.501C221 363.387 224.553 360.001 229 360.001Z"
              stroke="black"
            />
            <path d="M172 328.501H86.5V356.501H172V328.501Z" stroke="black" />
            <path
              d="M158.5 310.001C162.947 310.001 166.5 313.387 166.5 317.501C166.5 321.615 162.947 325.001 158.5 325.001C154.053 325.001 150.5 321.615 150.5 317.501C150.5 313.387 154.053 310.001 158.5 310.001Z"
              stroke="black"
            />
            <path
              d="M129.5 310.001C133.947 310.001 137.5 313.387 137.5 317.501C137.5 321.615 133.947 325.001 129.5 325.001C125.053 325.001 121.5 321.615 121.5 317.501C121.5 313.387 125.053 310.001 129.5 310.001Z"
              stroke="black"
            />
            <path
              d="M100.5 310.001C104.947 310.001 108.5 313.387 108.5 317.501C108.5 321.615 104.947 325.001 100.5 325.001C96.0527 325.001 92.5 321.615 92.5 317.501C92.5 313.387 96.0527 310.001 100.5 310.001Z"
              stroke="black"
            />
            <path
              d="M158.5 360.001C162.947 360.001 166.5 363.387 166.5 367.501C166.5 371.615 162.947 375.001 158.5 375.001C154.053 375.001 150.5 371.615 150.5 367.501C150.5 363.387 154.053 360.001 158.5 360.001Z"
              stroke="black"
            />
            <path
              d="M129.5 360.001C133.947 360.001 137.5 363.387 137.5 367.501C137.5 371.615 133.947 375.001 129.5 375.001C125.053 375.001 121.5 371.615 121.5 367.501C121.5 363.387 125.053 360.001 129.5 360.001Z"
              stroke="black"
            />
            <path
              d="M100.5 360.001C104.947 360.001 108.5 363.387 108.5 367.501C108.5 371.615 104.947 375.001 100.5 375.001C96.0527 375.001 92.5 371.615 92.5 367.501C92.5 363.387 96.0527 360.001 100.5 360.001Z"
              stroke="black"
            />
            <path d="M178 789.001H119V891.001H178V789.001Z" stroke="black" />
            <path
              d="M189.5 791.001C197.541 791.001 204 797.077 204 804.501C204 811.924 197.541 818.001 189.5 818.001C181.459 818.001 175 811.924 175 804.501C175 797.077 181.459 791.001 189.5 791.001Z"
              stroke="black"
            />
            <path
              d="M189.5 827.001C197.541 827.001 204 833.077 204 840.501C204 847.924 197.541 854.001 189.5 854.001C181.459 854.001 175 847.924 175 840.501C175 833.077 181.459 827.001 189.5 827.001Z"
              stroke="black"
            />
            <path
              d="M189.5 859.001C197.541 859.001 204 865.077 204 872.501C204 879.924 197.541 886.001 189.5 886.001C181.459 886.001 175 879.924 175 872.501C175 865.077 181.459 859.001 189.5 859.001Z"
              stroke="black"
            />
            <path
              d="M106.5 791.001C114.541 791.001 121 797.077 121 804.501C121 811.924 114.541 818.001 106.5 818.001C98.4588 818.001 92 811.924 92 804.501C92 797.077 98.4588 791.001 106.5 791.001Z"
              stroke="black"
            />
            <path
              d="M106.5 827.001C114.541 827.001 121 833.077 121 840.501C121 847.924 114.541 854.001 106.5 854.001C98.4588 854.001 92 847.924 92 840.501C92 833.077 98.4588 827.001 106.5 827.001Z"
              stroke="black"
            />
            <path
              d="M105.5 862.001C113.541 862.001 120 868.077 120 875.501C120 882.924 113.541 889.001 105.5 889.001C97.4588 889.001 91 882.924 91 875.501C91 868.077 97.4588 862.001 105.5 862.001Z"
              stroke="black"
            />
            <path d="M178 926.501H119V1028.5H178V926.501Z" stroke="black" />
            <path
              d="M189.5 928.501C197.541 928.501 204 934.577 204 942.001C204 949.424 197.541 955.501 189.5 955.501C181.459 955.501 175 949.424 175 942.001C175 934.577 181.459 928.501 189.5 928.501Z"
              stroke="black"
            />
            <path
              d="M189.5 964.501C197.541 964.501 204 970.577 204 978.001C204 985.424 197.541 991.501 189.5 991.501C181.459 991.501 175 985.424 175 978.001C175 970.577 181.459 964.501 189.5 964.501Z"
              stroke="black"
            />
            <path
              d="M189.5 996.501C197.541 996.501 204 1002.58 204 1010C204 1017.42 197.541 1023.5 189.5 1023.5C181.459 1023.5 175 1017.42 175 1010C175 1002.58 181.459 996.501 189.5 996.501Z"
              stroke="black"
            />
            <path
              d="M106.5 928.501C114.541 928.501 121 934.577 121 942.001C121 949.424 114.541 955.501 106.5 955.501C98.4588 955.501 92 949.424 92 942.001C92 934.577 98.4588 928.501 106.5 928.501Z"
              stroke="black"
            />
            <path
              d="M106.5 964.501C114.541 964.501 121 970.577 121 978.001C121 985.424 114.541 991.501 106.5 991.501C98.4588 991.501 92 985.424 92 978.001C92 970.577 98.4588 964.501 106.5 964.501Z"
              stroke="black"
            />
            <path
              d="M105.5 999.501C113.541 999.501 120 1005.58 120 1013C120 1020.42 113.541 1026.5 105.5 1026.5C97.4588 1026.5 91 1020.42 91 1013C91 1005.58 97.4588 999.501 105.5 999.501Z"
              stroke="black"
            />
            <path d="M179 9.50055H120V111.501H179V9.50055Z" stroke="black" />
            <path
              d="M190.5 11.5005C198.541 11.5005 205 17.5766 205 25.0005C205 32.4245 198.541 38.5005 190.5 38.5005C182.459 38.5005 176 32.4245 176 25.0005C176 17.5766 182.459 11.5005 190.5 11.5005Z"
              stroke="black"
            />
            <path
              d="M190.5 47.5005C198.541 47.5005 205 53.5766 205 61.0005C205 68.4245 198.541 74.5005 190.5 74.5005C182.459 74.5005 176 68.4245 176 61.0005C176 53.5766 182.459 47.5005 190.5 47.5005Z"
              stroke="black"
            />
            <path
              d="M190.5 79.5005C198.541 79.5005 205 85.5766 205 93.0005C205 100.424 198.541 106.501 190.5 106.501C182.459 106.501 176 100.424 176 93.0005C176 85.5766 182.459 79.5005 190.5 79.5005Z"
              stroke="black"
            />
            <path
              d="M107.5 11.5005C115.541 11.5005 122 17.5766 122 25.0005C122 32.4245 115.541 38.5005 107.5 38.5005C99.4588 38.5005 93 32.4245 93 25.0005C93 17.5766 99.4588 11.5005 107.5 11.5005Z"
              stroke="black"
            />
            <path
              d="M107.5 47.5005C115.541 47.5005 122 53.5766 122 61.0005C122 68.4245 115.541 74.5005 107.5 74.5005C99.4588 74.5005 93 68.4245 93 61.0005C93 53.5766 99.4588 47.5005 107.5 47.5005Z"
              stroke="black"
            />
            <path
              d="M106.5 82.5005C114.541 82.5005 121 88.5766 121 96.0005C121 103.424 114.541 109.501 106.5 109.501C98.4588 109.501 92 103.424 92 96.0005C92 88.5766 98.4588 82.5005 106.5 82.5005Z"
              stroke="black"
            />
            <path d="M179 147.001H120V249.001H179V147.001Z" stroke="black" />
            <path
              d="M190.5 149.001C198.541 149.001 205 155.077 205 162.501C205 169.924 198.541 176.001 190.5 176.001C182.459 176.001 176 169.924 176 162.501C176 155.077 182.459 149.001 190.5 149.001Z"
              stroke="black"
            />
            <path
              d="M190.5 185.001C198.541 185.001 205 191.077 205 198.501C205 205.924 198.541 212.001 190.5 212.001C182.459 212.001 176 205.924 176 198.501C176 191.077 182.459 185.001 190.5 185.001Z"
              stroke="black"
            />
            <path
              d="M190.5 217.001C198.541 217.001 205 223.077 205 230.501C205 237.924 198.541 244.001 190.5 244.001C182.459 244.001 176 237.924 176 230.501C176 223.077 182.459 217.001 190.5 217.001Z"
              stroke="black"
            />
            <path
              d="M107.5 149.001C115.541 149.001 122 155.077 122 162.501C122 169.924 115.541 176.001 107.5 176.001C99.4588 176.001 93 169.924 93 162.501C93 155.077 99.4588 149.001 107.5 149.001Z"
              stroke="black"
            />
            <path
              d="M107.5 185.001C115.541 185.001 122 191.077 122 198.501C122 205.924 115.541 212.001 107.5 212.001C99.4588 212.001 93 205.924 93 198.501C93 191.077 99.4588 185.001 107.5 185.001Z"
              stroke="black"
            />
            <path
              d="M106.5 220.001C114.541 220.001 121 226.077 121 233.501C121 240.924 114.541 247.001 106.5 247.001C98.4588 247.001 92 240.924 92 233.501C92 226.077 98.4588 220.001 106.5 220.001Z"
              stroke="black"
            />
            <path
              d="M152.5 596.745C161.627 596.745 169 603.922 169 612.745C169 621.567 161.627 628.745 152.5 628.745C143.373 628.745 136 621.567 136 612.745C136 603.922 143.373 596.745 152.5 596.745Z"
              stroke="black"
            />
            <path
              d="M137 608.501L125.5 597.001L137 585.501L149 597.001L137 608.501Z"
              stroke="black"
            />
            <path
              d="M169 640.501L157.5 629.001L169 617.501L181 629.001L169 640.501Z"
              stroke="black"
            />
            <path
              d="M148.835 628.402L137.671 640.228L125.845 629.063L136.995 616.737L148.835 628.402Z"
              stroke="black"
            />
            <path
              d="M179.902 595.496L168.738 607.321L156.912 596.156L168.062 583.831L179.902 595.496Z"
              stroke="black"
            />
            <path
              d="M68.5 596.745C77.6269 596.745 85 603.922 85 612.745C85 621.567 77.6269 628.745 68.5 628.745C59.3731 628.745 52 621.567 52 612.745C52 603.922 59.3731 596.745 68.5 596.745Z"
              stroke="black"
            />
            <path
              d="M53 608.501L41.5 597.001L53 585.501L65 597.001L53 608.501Z"
              stroke="black"
            />
            <path
              d="M85 640.501L73.5 629.001L85 617.501L97 629.001L85 640.501Z"
              stroke="black"
            />
            <path
              d="M64.8353 628.402L53.6705 640.228L41.8448 629.063L52.9953 616.737L64.8353 628.402Z"
              stroke="black"
            />
            <path
              d="M95.9025 595.496L84.7377 607.321L72.912 596.156L84.0624 583.831L95.9025 595.496Z"
              stroke="black"
            />
            <path
              d="M152.5 530.745C161.627 530.745 169 537.922 169 546.745C169 555.567 161.627 562.745 152.5 562.745C143.373 562.745 136 555.567 136 546.745C136 537.922 143.373 530.745 152.5 530.745Z"
              stroke="black"
            />
            <path
              d="M137 542.501L125.5 531.001L137 519.501L149 531.001L137 542.501Z"
              stroke="black"
            />
            <path
              d="M169 574.501L157.5 563.001L169 551.501L181 563.001L169 574.501Z"
              stroke="black"
            />
            <path
              d="M148.835 562.402L137.671 574.228L125.845 563.063L136.995 550.737L148.835 562.402Z"
              stroke="black"
            />
            <path
              d="M179.902 529.496L168.738 541.321L156.912 530.156L168.062 517.831L179.902 529.496Z"
              stroke="black"
            />
            <path
              d="M68.5 530.745C77.6269 530.745 85 537.922 85 546.745C85 555.567 77.6269 562.745 68.5 562.745C59.3731 562.745 52 555.567 52 546.745C52 537.922 59.3731 530.745 68.5 530.745Z"
              stroke="black"
            />
            <path
              d="M53 542.501L41.5 531.001L53 519.501L65 531.001L53 542.501Z"
              stroke="black"
            />
            <path
              d="M85 574.501L73.5 563.001L85 551.501L97 563.001L85 574.501Z"
              stroke="black"
            />
            <path
              d="M64.8353 562.402L53.6705 574.228L41.8448 563.063L52.9953 550.737L64.8353 562.402Z"
              stroke="black"
            />
            <path
              d="M95.9025 529.496L84.7377 541.321L72.912 530.156L84.0624 517.831L95.9025 529.496Z"
              stroke="black"
            />
            <path
              d="M152.5 464.745C161.627 464.745 169 471.922 169 480.745C169 489.567 161.627 496.745 152.5 496.745C143.373 496.745 136 489.567 136 480.745C136 471.922 143.373 464.745 152.5 464.745Z"
              stroke="black"
            />
            <path
              d="M137 476.501L125.5 465.001L137 453.501L149 465.001L137 476.501Z"
              stroke="black"
            />
            <path
              d="M169 508.501L157.5 497.001L169 485.501L181 497.001L169 508.501Z"
              stroke="black"
            />
            <path
              d="M148.835 496.402L137.671 508.228L125.845 497.063L136.995 484.737L148.835 496.402Z"
              stroke="black"
            />
            <path
              d="M179.902 463.496L168.738 475.321L156.912 464.156L168.062 451.831L179.902 463.496Z"
              stroke="black"
            />
            <path
              d="M68.5 464.745C77.6269 464.745 85 471.922 85 480.745C85 489.567 77.6269 496.745 68.5 496.745C59.3731 496.745 52 489.567 52 480.745C52 471.922 59.3731 464.745 68.5 464.745Z"
              stroke="black"
            />
            <path
              d="M53 476.501L41.5 465.001L53 453.501L65 465.001L53 476.501Z"
              stroke="black"
            />
            <path
              d="M85 508.501L73.5 497.001L85 485.501L97 497.001L85 508.501Z"
              stroke="black"
            />
            <path
              d="M64.8353 496.402L53.6705 508.228L41.8448 497.063L52.9953 484.737L64.8353 496.402Z"
              stroke="black"
            />
            <path
              d="M95.9025 463.496L84.7377 475.321L72.912 464.156L84.0624 451.831L95.9025 463.496Z"
              stroke="black"
            />
            <path
              d="M152.5 398.745C161.627 398.745 169 405.922 169 414.745C169 423.567 161.627 430.745 152.5 430.745C143.373 430.745 136 423.567 136 414.745C136 405.922 143.373 398.745 152.5 398.745Z"
              stroke="black"
            />
            <path
              d="M137 410.501L125.5 399.001L137 387.501L149 399.001L137 410.501Z"
              stroke="black"
            />
            <path
              d="M169 442.501L157.5 431.001L169 419.501L181 431.001L169 442.501Z"
              stroke="black"
            />
            <path
              d="M148.835 430.402L137.671 442.228L125.845 431.063L136.995 418.737L148.835 430.402Z"
              stroke="black"
            />
            <path
              d="M179.902 397.496L168.738 409.321L156.912 398.156L168.062 385.831L179.902 397.496Z"
              stroke="black"
            />
            <path
              d="M68.5 398.745C77.6269 398.745 85 405.922 85 414.745C85 423.567 77.6269 430.745 68.5 430.745C59.3731 430.745 52 423.567 52 414.745C52 405.922 59.3731 398.745 68.5 398.745Z"
              stroke="black"
            />
            <path
              d="M53 410.501L41.5 399.001L53 387.501L65 399.001L53 410.501Z"
              stroke="black"
            />
            <path
              d="M85 442.501L73.5 431.001L85 419.501L97 431.001L85 442.501Z"
              stroke="black"
            />
            <path
              d="M64.8353 430.402L53.6705 442.228L41.8448 431.063L52.9953 418.737L64.8353 430.402Z"
              stroke="black"
            />
            <path
              d="M95.9025 397.496L84.7377 409.321L72.912 398.156L84.0624 385.831L95.9025 397.496Z"
              stroke="black"
            />
            <path
              d="M3033.5 885.001V896.001H3000.5V847.501H3033.5V859.501M3033.5 885.001H3044V859.501H3033.5M3033.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M3033.5 934.001V945.001H3000.5V896.501H3033.5V908.501M3033.5 934.001H3044V908.501H3033.5M3033.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M3033.5 836.001V847.001H3000.5V798.501H3033.5V810.501M3033.5 836.001H3044V810.501H3033.5M3033.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M2968 907.501V896.501H3001V945.001H2968V933.001M2968 907.501H2957.5V933.001H2968M2968 907.501V933.001"
              stroke="black"
            />
            <path
              d="M2968 858.501V847.501H3001V896.001H2968V884.001M2968 858.501H2957.5V884.001H2968M2968 858.501V884.001"
              stroke="black"
            />
            <path
              d="M2968 809.501V798.501H3001V847.001H2968V835.001M2968 809.501H2957.5V835.001H2968M2968 809.501V835.001"
              stroke="black"
            />
            <path
              d="M2904.5 885.001V896.001H2871.5V847.501H2904.5V859.501M2904.5 885.001H2915V859.501H2904.5M2904.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M2904.5 934.001V945.001H2871.5V896.501H2904.5V908.501M2904.5 934.001H2915V908.501H2904.5M2904.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M2904.5 836.001V847.001H2871.5V798.501H2904.5V810.501M2904.5 836.001H2915V810.501H2904.5M2904.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M2839 907.501V896.501H2872V945.001H2839V933.001M2839 907.501H2828.5V933.001H2839M2839 907.501V933.001"
              stroke="black"
            />
            <path
              d="M2839 858.501V847.501H2872V896.001H2839V884.001M2839 858.501H2828.5V884.001H2839M2839 858.501V884.001"
              stroke="black"
            />
            <path
              d="M2839 809.501V798.501H2872V847.001H2839V835.001M2839 809.501H2828.5V835.001H2839M2839 809.501V835.001"
              stroke="black"
            />
            <path
              d="M2765.5 885.001V896.001H2732.5V847.501H2765.5V859.501M2765.5 885.001H2776V859.501H2765.5M2765.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M2765.5 934.001V945.001H2732.5V896.501H2765.5V908.501M2765.5 934.001H2776V908.501H2765.5M2765.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M2765.5 836.001V847.001H2732.5V798.501H2765.5V810.501M2765.5 836.001H2776V810.501H2765.5M2765.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M2700 907.501V896.501H2733V945.001H2700V933.001M2700 907.501H2689.5V933.001H2700M2700 907.501V933.001"
              stroke="black"
            />
            <path
              d="M2700 858.501V847.501H2733V896.001H2700V884.001M2700 858.501H2689.5V884.001H2700M2700 858.501V884.001"
              stroke="black"
            />
            <path
              d="M2700 809.501V798.501H2733V847.001H2700V835.001M2700 809.501H2689.5V835.001H2700M2700 809.501V835.001"
              stroke="black"
            />
            <path
              d="M2636.5 885.001V896.001H2603.5V847.501H2636.5V859.501M2636.5 885.001H2647V859.501H2636.5M2636.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M2636.5 934.001V945.001H2603.5V896.501H2636.5V908.501M2636.5 934.001H2647V908.501H2636.5M2636.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M2636.5 836.001V847.001H2603.5V798.501H2636.5V810.501M2636.5 836.001H2647V810.501H2636.5M2636.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M2571 907.501V896.501H2604V945.001H2571V933.001M2571 907.501H2560.5V933.001H2571M2571 907.501V933.001"
              stroke="black"
            />
            <path
              d="M2571 858.501V847.501H2604V896.001H2571V884.001M2571 858.501H2560.5V884.001H2571M2571 858.501V884.001"
              stroke="black"
            />
            <path
              d="M2571 809.501V798.501H2604V847.001H2571V835.001M2571 809.501H2560.5V835.001H2571M2571 809.501V835.001"
              stroke="black"
            />
            <path
              d="M2496.5 885.001V896.001H2463.5V847.501H2496.5V859.501M2496.5 885.001H2507V859.501H2496.5M2496.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M2496.5 934.001V945.001H2463.5V896.501H2496.5V908.501M2496.5 934.001H2507V908.501H2496.5M2496.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M2496.5 836.001V847.001H2463.5V798.501H2496.5V810.501M2496.5 836.001H2507V810.501H2496.5M2496.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M2431 907.501V896.501H2464V945.001H2431V933.001M2431 907.501H2420.5V933.001H2431M2431 907.501V933.001"
              stroke="black"
            />
            <path
              d="M2431 858.501V847.501H2464V896.001H2431V884.001M2431 858.501H2420.5V884.001H2431M2431 858.501V884.001"
              stroke="black"
            />
            <path
              d="M2431 809.501V798.501H2464V847.001H2431V835.001M2431 809.501H2420.5V835.001H2431M2431 809.501V835.001"
              stroke="black"
            />
            <path
              d="M2365.5 885.001V896.001H2332.5V847.501H2365.5V859.501M2365.5 885.001H2376V859.501H2365.5M2365.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M2365.5 934.001V945.001H2332.5V896.501H2365.5V908.501M2365.5 934.001H2376V908.501H2365.5M2365.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M2365.5 836.001V847.001H2332.5V798.501H2365.5V810.501M2365.5 836.001H2376V810.501H2365.5M2365.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M2300 907.501V896.501H2333V945.001H2300V933.001M2300 907.501H2289.5V933.001H2300M2300 907.501V933.001"
              stroke="black"
            />
            <path
              d="M2300 858.501V847.501H2333V896.001H2300V884.001M2300 858.501H2289.5V884.001H2300M2300 858.501V884.001"
              stroke="black"
            />
            <path
              d="M2300 809.501V798.501H2333V847.001H2300V835.001M2300 809.501H2289.5V835.001H2300M2300 809.501V835.001"
              stroke="black"
            />
            <path
              d="M2225.5 885.001V896.001H2192.5V847.501H2225.5V859.501M2225.5 885.001H2236V859.501H2225.5M2225.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M2225.5 934.001V945.001H2192.5V896.501H2225.5V908.501M2225.5 934.001H2236V908.501H2225.5M2225.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M2225.5 836.001V847.001H2192.5V798.501H2225.5V810.501M2225.5 836.001H2236V810.501H2225.5M2225.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M2160 907.501V896.501H2193V945.001H2160V933.001M2160 907.501H2149.5V933.001H2160M2160 907.501V933.001"
              stroke="black"
            />
            <path
              d="M2160 858.501V847.501H2193V896.001H2160V884.001M2160 858.501H2149.5V884.001H2160M2160 858.501V884.001"
              stroke="black"
            />
            <path
              d="M2160 809.501V798.501H2193V847.001H2160V835.001M2160 809.501H2149.5V835.001H2160M2160 809.501V835.001"
              stroke="black"
            />
            <path
              d="M2095.5 885.001V896.001H2062.5V847.501H2095.5V859.501M2095.5 885.001H2106V859.501H2095.5M2095.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M2095.5 934.001V945.001H2062.5V896.501H2095.5V908.501M2095.5 934.001H2106V908.501H2095.5M2095.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M2095.5 836.001V847.001H2062.5V798.501H2095.5V810.501M2095.5 836.001H2106V810.501H2095.5M2095.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M2030 907.501V896.501H2063V945.001H2030V933.001M2030 907.501H2019.5V933.001H2030M2030 907.501V933.001"
              stroke="black"
            />
            <path
              d="M2030 858.501V847.501H2063V896.001H2030V884.001M2030 858.501H2019.5V884.001H2030M2030 858.501V884.001"
              stroke="black"
            />
            <path
              d="M2030 809.501V798.501H2063V847.001H2030V835.001M2030 809.501H2019.5V835.001H2030M2030 809.501V835.001"
              stroke="black"
            />
            <path
              d="M1955.5 885.001V896.001H1922.5V847.501H1955.5V859.501M1955.5 885.001H1966V859.501H1955.5M1955.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M1955.5 934.001V945.001H1922.5V896.501H1955.5V908.501M1955.5 934.001H1966V908.501H1955.5M1955.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M1955.5 836.001V847.001H1922.5V798.501H1955.5V810.501M1955.5 836.001H1966V810.501H1955.5M1955.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M1890 907.501V896.501H1923V945.001H1890V933.001M1890 907.501H1879.5V933.001H1890M1890 907.501V933.001"
              stroke="black"
            />
            <path
              d="M1890 858.501V847.501H1923V896.001H1890V884.001M1890 858.501H1879.5V884.001H1890M1890 858.501V884.001"
              stroke="black"
            />
            <path
              d="M1890 809.501V798.501H1923V847.001H1890V835.001M1890 809.501H1879.5V835.001H1890M1890 809.501V835.001"
              stroke="black"
            />
            <path
              d="M1824.5 885.001V896.001H1791.5V847.501H1824.5V859.501M1824.5 885.001H1835V859.501H1824.5M1824.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M1824.5 934.001V945.001H1791.5V896.501H1824.5V908.501M1824.5 934.001H1835V908.501H1824.5M1824.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M1824.5 836.001V847.001H1791.5V798.501H1824.5V810.501M1824.5 836.001H1835V810.501H1824.5M1824.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M1759 907.501V896.501H1792V945.001H1759V933.001M1759 907.501H1748.5V933.001H1759M1759 907.501V933.001"
              stroke="black"
            />
            <path
              d="M1759 858.501V847.501H1792V896.001H1759V884.001M1759 858.501H1748.5V884.001H1759M1759 858.501V884.001"
              stroke="black"
            />
            <path
              d="M1759 809.501V798.501H1792V847.001H1759V835.001M1759 809.501H1748.5V835.001H1759M1759 809.501V835.001"
              stroke="black"
            />
            <path
              d="M1534.5 885.001V896.001H1501.5V847.501H1534.5V859.501M1534.5 885.001H1545V859.501H1534.5M1534.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M1534.5 934.001V945.001H1501.5V896.501H1534.5V908.501M1534.5 934.001H1545V908.501H1534.5M1534.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M1534.5 836.001V847.001H1501.5V798.501H1534.5V810.501M1534.5 836.001H1545V810.501H1534.5M1534.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M1469 907.501V896.501H1502V945.001H1469V933.001M1469 907.501H1458.5V933.001H1469M1469 907.501V933.001"
              stroke="black"
            />
            <path
              d="M1469 858.501V847.501H1502V896.001H1469V884.001M1469 858.501H1458.5V884.001H1469M1469 858.501V884.001"
              stroke="black"
            />
            <path
              d="M1469 809.501V798.501H1502V847.001H1469V835.001M1469 809.501H1458.5V835.001H1469M1469 809.501V835.001"
              stroke="black"
            />
            <path
              d="M1403.5 885.001V896.001H1370.5V847.501H1403.5V859.501M1403.5 885.001H1414V859.501H1403.5M1403.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M1403.5 934.001V945.001H1370.5V896.501H1403.5V908.501M1403.5 934.001H1414V908.501H1403.5M1403.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M1403.5 836.001V847.001H1370.5V798.501H1403.5V810.501M1403.5 836.001H1414V810.501H1403.5M1403.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M1338 907.501V896.501H1371V945.001H1338V933.001M1338 907.501H1327.5V933.001H1338M1338 907.501V933.001"
              stroke="black"
            />
            <path
              d="M1338 858.501V847.501H1371V896.001H1338V884.001M1338 858.501H1327.5V884.001H1338M1338 858.501V884.001"
              stroke="black"
            />
            <path
              d="M1338 809.501V798.501H1371V847.001H1338V835.001M1338 809.501H1327.5V835.001H1338M1338 809.501V835.001"
              stroke="black"
            />
            <path
              d="M1263.5 885.001V896.001H1230.5V847.501H1263.5V859.501M1263.5 885.001H1274V859.501H1263.5M1263.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M1263.5 934.001V945.001H1230.5V896.501H1263.5V908.501M1263.5 934.001H1274V908.501H1263.5M1263.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M1263.5 836.001V847.001H1230.5V798.501H1263.5V810.501M1263.5 836.001H1274V810.501H1263.5M1263.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M1198 907.501V896.501H1231V945.001H1198V933.001M1198 907.501H1187.5V933.001H1198M1198 907.501V933.001"
              stroke="black"
            />
            <path
              d="M1198 858.501V847.501H1231V896.001H1198V884.001M1198 858.501H1187.5V884.001H1198M1198 858.501V884.001"
              stroke="black"
            />
            <path
              d="M1198 809.501V798.501H1231V847.001H1198V835.001M1198 809.501H1187.5V835.001H1198M1198 809.501V835.001"
              stroke="black"
            />
            <path
              d="M1133.5 885.001V896.001H1100.5V847.501H1133.5V859.501M1133.5 885.001H1144V859.501H1133.5M1133.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M1133.5 934.001V945.001H1100.5V896.501H1133.5V908.501M1133.5 934.001H1144V908.501H1133.5M1133.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M1133.5 836.001V847.001H1100.5V798.501H1133.5V810.501M1133.5 836.001H1144V810.501H1133.5M1133.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M1068 907.501V896.501H1101V945.001H1068V933.001M1068 907.501H1057.5V933.001H1068M1068 907.501V933.001"
              stroke="black"
            />
            <path
              d="M1068 858.501V847.501H1101V896.001H1068V884.001M1068 858.501H1057.5V884.001H1068M1068 858.501V884.001"
              stroke="black"
            />
            <path
              d="M1068 809.501V798.501H1101V847.001H1068V835.001M1068 809.501H1057.5V835.001H1068M1068 809.501V835.001"
              stroke="black"
            />
            <path
              d="M993.5 885.001V896.001H960.5V847.501H993.5V859.501M993.5 885.001H1004V859.501H993.5M993.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M993.5 934.001V945.001H960.5V896.501H993.5V908.501M993.5 934.001H1004V908.501H993.5M993.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M993.5 836.001V847.001H960.5V798.501H993.5V810.501M993.5 836.001H1004V810.501H993.5M993.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M928 907.501V896.501H961V945.001H928V933.001M928 907.501H917.5V933.001H928M928 907.501V933.001"
              stroke="black"
            />
            <path
              d="M928 858.501V847.501H961V896.001H928V884.001M928 858.501H917.5V884.001H928M928 858.501V884.001"
              stroke="black"
            />
            <path
              d="M928 809.501V798.501H961V847.001H928V835.001M928 809.501H917.5V835.001H928M928 809.501V835.001"
              stroke="black"
            />
            <path
              d="M863.5 885.001V896.001H830.5V847.501H863.5V859.501M863.5 885.001H874V859.501H863.5M863.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M863.5 934.001V945.001H830.5V896.501H863.5V908.501M863.5 934.001H874V908.501H863.5M863.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M863.5 836.001V847.001H830.5V798.501H863.5V810.501M863.5 836.001H874V810.501H863.5M863.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M798 907.501V896.501H831V945.001H798V933.001M798 907.501H787.5V933.001H798M798 907.501V933.001"
              stroke="black"
            />
            <path
              d="M798 858.501V847.501H831V896.001H798V884.001M798 858.501H787.5V884.001H798M798 858.501V884.001"
              stroke="black"
            />
            <path
              d="M798 809.501V798.501H831V847.001H798V835.001M798 809.501H787.5V835.001H798M798 809.501V835.001"
              stroke="black"
            />
            <path
              d="M723.5 885.001V896.001H690.5V847.501H723.5V859.501M723.5 885.001H734V859.501H723.5M723.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M723.5 934.001V945.001H690.5V896.501H723.5V908.501M723.5 934.001H734V908.501H723.5M723.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M723.5 836.001V847.001H690.5V798.501H723.5V810.501M723.5 836.001H734V810.501H723.5M723.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M658 907.501V896.501H691V945.001H658V933.001M658 907.501H647.5V933.001H658M658 907.501V933.001"
              stroke="black"
            />
            <path
              d="M658 858.501V847.501H691V896.001H658V884.001M658 858.501H647.5V884.001H658M658 858.501V884.001"
              stroke="black"
            />
            <path
              d="M658 809.501V798.501H691V847.001H658V835.001M658 809.501H647.5V835.001H658M658 809.501V835.001"
              stroke="black"
            />
            <path
              d="M592.5 885.001V896.001H559.5V847.501H592.5V859.501M592.5 885.001H603V859.501H592.5M592.5 885.001V859.501"
              stroke="black"
            />
            <path
              d="M592.5 934.001V945.001H559.5V896.501H592.5V908.501M592.5 934.001H603V908.501H592.5M592.5 934.001V908.501"
              stroke="black"
            />
            <path
              d="M592.5 836.001V847.001H559.5V798.501H592.5V810.501M592.5 836.001H603V810.501H592.5M592.5 836.001V810.501"
              stroke="black"
            />
            <path
              d="M527 907.501V896.501H560V945.001H527V933.001M527 907.501H516.5V933.001H527M527 907.501V933.001"
              stroke="black"
            />
            <path
              d="M527 858.501V847.501H560V896.001H527V884.001M527 858.501H516.5V884.001H527M527 858.501V884.001"
              stroke="black"
            />
            <path
              d="M527 809.501V798.501H560V847.001H527V835.001M527 809.501H516.5V835.001H527M527 809.501V835.001"
              stroke="black"
            />
            <path
              d="M3033.5 175.001V186.001H3000.5V137.501H3033.5V149.501M3033.5 175.001H3044V149.501H3033.5M3033.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M3033.5 224.001V235.001H3000.5V186.501H3033.5V198.501M3033.5 224.001H3044V198.501H3033.5M3033.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M3033.5 126.001V137.001H3000.5V88.5005H3033.5V100.501M3033.5 126.001H3044V100.501H3033.5M3033.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M2968 197.501V186.501H3001V235.001H2968V223.001M2968 197.501H2957.5V223.001H2968M2968 197.501V223.001"
              stroke="black"
            />
            <path
              d="M2968 148.501V137.501H3001V186.001H2968V174.001M2968 148.501H2957.5V174.001H2968M2968 148.501V174.001"
              stroke="black"
            />
            <path
              d="M2968 99.5005V88.5005H3001V137.001H2968V125.001M2968 99.5005H2957.5V125.001H2968M2968 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M2904.5 175.001V186.001H2871.5V137.501H2904.5V149.501M2904.5 175.001H2915V149.501H2904.5M2904.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M2904.5 224.001V235.001H2871.5V186.501H2904.5V198.501M2904.5 224.001H2915V198.501H2904.5M2904.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M2904.5 126.001V137.001H2871.5V88.5005H2904.5V100.501M2904.5 126.001H2915V100.501H2904.5M2904.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M2839 197.501V186.501H2872V235.001H2839V223.001M2839 197.501H2828.5V223.001H2839M2839 197.501V223.001"
              stroke="black"
            />
            <path
              d="M2839 148.501V137.501H2872V186.001H2839V174.001M2839 148.501H2828.5V174.001H2839M2839 148.501V174.001"
              stroke="black"
            />
            <path
              d="M2839 99.5005V88.5005H2872V137.001H2839V125.001M2839 99.5005H2828.5V125.001H2839M2839 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M2765.5 175.001V186.001H2732.5V137.501H2765.5V149.501M2765.5 175.001H2776V149.501H2765.5M2765.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M2765.5 224.001V235.001H2732.5V186.501H2765.5V198.501M2765.5 224.001H2776V198.501H2765.5M2765.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M2765.5 126.001V137.001H2732.5V88.5005H2765.5V100.501M2765.5 126.001H2776V100.501H2765.5M2765.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M2700 197.501V186.501H2733V235.001H2700V223.001M2700 197.501H2689.5V223.001H2700M2700 197.501V223.001"
              stroke="black"
            />
            <path
              d="M2700 148.501V137.501H2733V186.001H2700V174.001M2700 148.501H2689.5V174.001H2700M2700 148.501V174.001"
              stroke="black"
            />
            <path
              d="M2700 99.5005V88.5005H2733V137.001H2700V125.001M2700 99.5005H2689.5V125.001H2700M2700 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M2636.5 175.001V186.001H2603.5V137.501H2636.5V149.501M2636.5 175.001H2647V149.501H2636.5M2636.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M2636.5 224.001V235.001H2603.5V186.501H2636.5V198.501M2636.5 224.001H2647V198.501H2636.5M2636.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M2636.5 126.001V137.001H2603.5V88.5005H2636.5V100.501M2636.5 126.001H2647V100.501H2636.5M2636.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M2571 197.501V186.501H2604V235.001H2571V223.001M2571 197.501H2560.5V223.001H2571M2571 197.501V223.001"
              stroke="black"
            />
            <path
              d="M2571 148.501V137.501H2604V186.001H2571V174.001M2571 148.501H2560.5V174.001H2571M2571 148.501V174.001"
              stroke="black"
            />
            <path
              d="M2571 99.5005V88.5005H2604V137.001H2571V125.001M2571 99.5005H2560.5V125.001H2571M2571 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M2496.5 175.001V186.001H2463.5V137.501H2496.5V149.501M2496.5 175.001H2507V149.501H2496.5M2496.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M2496.5 224.001V235.001H2463.5V186.501H2496.5V198.501M2496.5 224.001H2507V198.501H2496.5M2496.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M2496.5 126.001V137.001H2463.5V88.5005H2496.5V100.501M2496.5 126.001H2507V100.501H2496.5M2496.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M2431 197.501V186.501H2464V235.001H2431V223.001M2431 197.501H2420.5V223.001H2431M2431 197.501V223.001"
              stroke="black"
            />
            <path
              d="M2431 148.501V137.501H2464V186.001H2431V174.001M2431 148.501H2420.5V174.001H2431M2431 148.501V174.001"
              stroke="black"
            />
            <path
              d="M2431 99.5005V88.5005H2464V137.001H2431V125.001M2431 99.5005H2420.5V125.001H2431M2431 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M2365.5 175.001V186.001H2332.5V137.501H2365.5V149.501M2365.5 175.001H2376V149.501H2365.5M2365.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M2365.5 224.001V235.001H2332.5V186.501H2365.5V198.501M2365.5 224.001H2376V198.501H2365.5M2365.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M2365.5 126.001V137.001H2332.5V88.5005H2365.5V100.501M2365.5 126.001H2376V100.501H2365.5M2365.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M2300 197.501V186.501H2333V235.001H2300V223.001M2300 197.501H2289.5V223.001H2300M2300 197.501V223.001"
              stroke="black"
            />
            <path
              d="M2300 148.501V137.501H2333V186.001H2300V174.001M2300 148.501H2289.5V174.001H2300M2300 148.501V174.001"
              stroke="black"
            />
            <path
              d="M2300 99.5005V88.5005H2333V137.001H2300V125.001M2300 99.5005H2289.5V125.001H2300M2300 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M2225.5 175.001V186.001H2192.5V137.501H2225.5V149.501M2225.5 175.001H2236V149.501H2225.5M2225.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M2225.5 224.001V235.001H2192.5V186.501H2225.5V198.501M2225.5 224.001H2236V198.501H2225.5M2225.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M2225.5 126.001V137.001H2192.5V88.5005H2225.5V100.501M2225.5 126.001H2236V100.501H2225.5M2225.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M2160 197.501V186.501H2193V235.001H2160V223.001M2160 197.501H2149.5V223.001H2160M2160 197.501V223.001"
              stroke="black"
            />
            <path
              d="M2160 148.501V137.501H2193V186.001H2160V174.001M2160 148.501H2149.5V174.001H2160M2160 148.501V174.001"
              stroke="black"
            />
            <path
              d="M2160 99.5005V88.5005H2193V137.001H2160V125.001M2160 99.5005H2149.5V125.001H2160M2160 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M2095.5 175.001V186.001H2062.5V137.501H2095.5V149.501M2095.5 175.001H2106V149.501H2095.5M2095.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M2095.5 224.001V235.001H2062.5V186.501H2095.5V198.501M2095.5 224.001H2106V198.501H2095.5M2095.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M2095.5 126.001V137.001H2062.5V88.5005H2095.5V100.501M2095.5 126.001H2106V100.501H2095.5M2095.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M2030 197.501V186.501H2063V235.001H2030V223.001M2030 197.501H2019.5V223.001H2030M2030 197.501V223.001"
              stroke="black"
            />
            <path
              d="M2030 148.501V137.501H2063V186.001H2030V174.001M2030 148.501H2019.5V174.001H2030M2030 148.501V174.001"
              stroke="black"
            />
            <path
              d="M2030 99.5005V88.5005H2063V137.001H2030V125.001M2030 99.5005H2019.5V125.001H2030M2030 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M1955.5 175.001V186.001H1922.5V137.501H1955.5V149.501M1955.5 175.001H1966V149.501H1955.5M1955.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M1955.5 224.001V235.001H1922.5V186.501H1955.5V198.501M1955.5 224.001H1966V198.501H1955.5M1955.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M1955.5 126.001V137.001H1922.5V88.5005H1955.5V100.501M1955.5 126.001H1966V100.501H1955.5M1955.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M1890 197.501V186.501H1923V235.001H1890V223.001M1890 197.501H1879.5V223.001H1890M1890 197.501V223.001"
              stroke="black"
            />
            <path
              d="M1890 148.501V137.501H1923V186.001H1890V174.001M1890 148.501H1879.5V174.001H1890M1890 148.501V174.001"
              stroke="black"
            />
            <path
              d="M1890 99.5005V88.5005H1923V137.001H1890V125.001M1890 99.5005H1879.5V125.001H1890M1890 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M1824.5 175.001V186.001H1791.5V137.501H1824.5V149.501M1824.5 175.001H1835V149.501H1824.5M1824.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M1824.5 224.001V235.001H1791.5V186.501H1824.5V198.501M1824.5 224.001H1835V198.501H1824.5M1824.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M1824.5 126.001V137.001H1791.5V88.5005H1824.5V100.501M1824.5 126.001H1835V100.501H1824.5M1824.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M1759 197.501V186.501H1792V235.001H1759V223.001M1759 197.501H1748.5V223.001H1759M1759 197.501V223.001"
              stroke="black"
            />
            <path
              d="M1759 148.501V137.501H1792V186.001H1759V174.001M1759 148.501H1748.5V174.001H1759M1759 148.501V174.001"
              stroke="black"
            />
            <path
              d="M1759 99.5005V88.5005H1792V137.001H1759V125.001M1759 99.5005H1748.5V125.001H1759M1759 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M1534.5 175.001V186.001H1501.5V137.501H1534.5V149.501M1534.5 175.001H1545V149.501H1534.5M1534.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M1534.5 224.001V235.001H1501.5V186.501H1534.5V198.501M1534.5 224.001H1545V198.501H1534.5M1534.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M1534.5 126.001V137.001H1501.5V88.5005H1534.5V100.501M1534.5 126.001H1545V100.501H1534.5M1534.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M1469 197.501V186.501H1502V235.001H1469V223.001M1469 197.501H1458.5V223.001H1469M1469 197.501V223.001"
              stroke="black"
            />
            <path
              d="M1469 148.501V137.501H1502V186.001H1469V174.001M1469 148.501H1458.5V174.001H1469M1469 148.501V174.001"
              stroke="black"
            />
            <path
              d="M1469 99.5005V88.5005H1502V137.001H1469V125.001M1469 99.5005H1458.5V125.001H1469M1469 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M1403.5 175.001V186.001H1370.5V137.501H1403.5V149.501M1403.5 175.001H1414V149.501H1403.5M1403.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M1403.5 224.001V235.001H1370.5V186.501H1403.5V198.501M1403.5 224.001H1414V198.501H1403.5M1403.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M1403.5 126.001V137.001H1370.5V88.5005H1403.5V100.501M1403.5 126.001H1414V100.501H1403.5M1403.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M1338 197.501V186.501H1371V235.001H1338V223.001M1338 197.501H1327.5V223.001H1338M1338 197.501V223.001"
              stroke="black"
            />
            <path
              d="M1338 148.501V137.501H1371V186.001H1338V174.001M1338 148.501H1327.5V174.001H1338M1338 148.501V174.001"
              stroke="black"
            />
            <path
              d="M1338 99.5005V88.5005H1371V137.001H1338V125.001M1338 99.5005H1327.5V125.001H1338M1338 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M1263.5 175.001V186.001H1230.5V137.501H1263.5V149.501M1263.5 175.001H1274V149.501H1263.5M1263.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M1263.5 224.001V235.001H1230.5V186.501H1263.5V198.501M1263.5 224.001H1274V198.501H1263.5M1263.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M1263.5 126.001V137.001H1230.5V88.5005H1263.5V100.501M1263.5 126.001H1274V100.501H1263.5M1263.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M1198 197.501V186.501H1231V235.001H1198V223.001M1198 197.501H1187.5V223.001H1198M1198 197.501V223.001"
              stroke="black"
            />
            <path
              d="M1198 148.501V137.501H1231V186.001H1198V174.001M1198 148.501H1187.5V174.001H1198M1198 148.501V174.001"
              stroke="black"
            />
            <path
              d="M1198 99.5005V88.5005H1231V137.001H1198V125.001M1198 99.5005H1187.5V125.001H1198M1198 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M1133.5 175.001V186.001H1100.5V137.501H1133.5V149.501M1133.5 175.001H1144V149.501H1133.5M1133.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M1133.5 224.001V235.001H1100.5V186.501H1133.5V198.501M1133.5 224.001H1144V198.501H1133.5M1133.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M1133.5 126.001V137.001H1100.5V88.5005H1133.5V100.501M1133.5 126.001H1144V100.501H1133.5M1133.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M1068 197.501V186.501H1101V235.001H1068V223.001M1068 197.501H1057.5V223.001H1068M1068 197.501V223.001"
              stroke="black"
            />
            <path
              d="M1068 148.501V137.501H1101V186.001H1068V174.001M1068 148.501H1057.5V174.001H1068M1068 148.501V174.001"
              stroke="black"
            />
            <path
              d="M1068 99.5005V88.5005H1101V137.001H1068V125.001M1068 99.5005H1057.5V125.001H1068M1068 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M993.5 175.001V186.001H960.5V137.501H993.5V149.501M993.5 175.001H1004V149.501H993.5M993.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M993.5 224.001V235.001H960.5V186.501H993.5V198.501M993.5 224.001H1004V198.501H993.5M993.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M993.5 126.001V137.001H960.5V88.5005H993.5V100.501M993.5 126.001H1004V100.501H993.5M993.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M928 197.501V186.501H961V235.001H928V223.001M928 197.501H917.5V223.001H928M928 197.501V223.001"
              stroke="black"
            />
            <path
              d="M928 148.501V137.501H961V186.001H928V174.001M928 148.501H917.5V174.001H928M928 148.501V174.001"
              stroke="black"
            />
            <path
              d="M928 99.5005V88.5005H961V137.001H928V125.001M928 99.5005H917.5V125.001H928M928 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M863.5 175.001V186.001H830.5V137.501H863.5V149.501M863.5 175.001H874V149.501H863.5M863.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M863.5 224.001V235.001H830.5V186.501H863.5V198.501M863.5 224.001H874V198.501H863.5M863.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M863.5 126.001V137.001H830.5V88.5005H863.5V100.501M863.5 126.001H874V100.501H863.5M863.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M798 197.501V186.501H831V235.001H798V223.001M798 197.501H787.5V223.001H798M798 197.501V223.001"
              stroke="black"
            />
            <path
              d="M798 148.501V137.501H831V186.001H798V174.001M798 148.501H787.5V174.001H798M798 148.501V174.001"
              stroke="black"
            />
            <path
              d="M798 99.5005V88.5005H831V137.001H798V125.001M798 99.5005H787.5V125.001H798M798 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M723.5 175.001V186.001H690.5V137.501H723.5V149.501M723.5 175.001H734V149.501H723.5M723.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M723.5 224.001V235.001H690.5V186.501H723.5V198.501M723.5 224.001H734V198.501H723.5M723.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M723.5 126.001V137.001H690.5V88.5005H723.5V100.501M723.5 126.001H734V100.501H723.5M723.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M658 197.501V186.501H691V235.001H658V223.001M658 197.501H647.5V223.001H658M658 197.501V223.001"
              stroke="black"
            />
            <path
              d="M658 148.501V137.501H691V186.001H658V174.001M658 148.501H647.5V174.001H658M658 148.501V174.001"
              stroke="black"
            />
            <path
              d="M658 99.5005V88.5005H691V137.001H658V125.001M658 99.5005H647.5V125.001H658M658 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M592.5 175.001V186.001H559.5V137.501H592.5V149.501M592.5 175.001H603V149.501H592.5M592.5 175.001V149.501"
              stroke="black"
            />
            <path
              d="M592.5 224.001V235.001H559.5V186.501H592.5V198.501M592.5 224.001H603V198.501H592.5M592.5 224.001V198.501"
              stroke="black"
            />
            <path
              d="M592.5 126.001V137.001H559.5V88.5005H592.5V100.501M592.5 126.001H603V100.501H592.5M592.5 126.001V100.501"
              stroke="black"
            />
            <path
              d="M527 197.501V186.501H560V235.001H527V223.001M527 197.501H516.5V223.001H527M527 197.501V223.001"
              stroke="black"
            />
            <path
              d="M527 148.501V137.501H560V186.001H527V174.001M527 148.501H516.5V174.001H527M527 148.501V174.001"
              stroke="black"
            />
            <path
              d="M527 99.5005V88.5005H560V137.001H527V125.001M527 99.5005H516.5V125.001H527M527 99.5005V125.001"
              stroke="black"
            />
            <path
              d="M2953 337.501H2847.5V699.501H2953M2998.5 699.501H3044M3087.5 699.501H3228V337.501H3087.5M3044 337.501H2998.5"
              stroke="black"
            />
            <path
              d="M2960.5 632.501H2913.5C2910.74 632.501 2908.5 630.262 2908.5 627.501V409.501C2908.5 406.739 2910.74 404.501 2913.5 404.501H2960.5C2963.26 404.501 2965.5 406.739 2965.5 409.501V627.501C2965.5 630.262 2963.26 632.501 2960.5 632.501Z"
              stroke="black"
            />
            <path
              d="M2970 613.501V622.501C2970 624.434 2971.57 626.001 2973.5 626.001H2979.91C2981.8 626.001 2983.54 624.931 2984.38 623.237L2985.88 620.237C2986.59 618.829 2986.59 617.172 2985.88 615.764L2984.38 612.764C2983.54 611.071 2981.8 610.001 2979.91 610.001H2973.5C2971.57 610.001 2970 611.568 2970 613.501Z"
              stroke="black"
            />
            <path
              d="M2904 622.501V613.501C2904 611.568 2902.43 610.001 2900.5 610.001H2894.09C2892.2 610.001 2890.46 611.071 2889.62 612.764L2888.12 615.764C2887.41 617.172 2887.41 618.829 2888.12 620.237L2889.62 623.237C2890.46 624.931 2892.2 626.001 2894.09 626.001H2900.5C2902.43 626.001 2904 624.434 2904 622.501Z"
              stroke="black"
            />
            <path
              d="M2969.5 585.001V594.001C2969.5 595.934 2971.07 597.501 2973 597.501H2979.41C2981.3 597.501 2983.04 596.431 2983.88 594.737L2985.38 591.737C2986.09 590.329 2986.09 588.672 2985.38 587.264L2983.88 584.264C2983.04 582.571 2981.3 581.501 2979.41 581.501H2973C2971.07 581.501 2969.5 583.068 2969.5 585.001Z"
              stroke="black"
            />
            <path
              d="M2903.5 594.001V585.001C2903.5 583.068 2901.93 581.501 2900 581.501H2893.59C2891.7 581.501 2889.96 582.571 2889.12 584.264L2887.62 587.264C2886.91 588.672 2886.91 590.329 2887.62 591.737L2889.12 594.737C2889.96 596.431 2891.7 597.501 2893.59 597.501H2900C2901.93 597.501 2903.5 595.934 2903.5 594.001Z"
              stroke="black"
            />
            <path
              d="M2969.5 557.001V566.001C2969.5 567.934 2971.07 569.501 2973 569.501H2979.41C2981.3 569.501 2983.04 568.431 2983.88 566.737L2985.38 563.737C2986.09 562.329 2986.09 560.672 2985.38 559.264L2983.88 556.264C2983.04 554.571 2981.3 553.501 2979.41 553.501H2973C2971.07 553.501 2969.5 555.068 2969.5 557.001Z"
              stroke="black"
            />
            <path
              d="M2903.5 566.001V557.001C2903.5 555.068 2901.93 553.501 2900 553.501H2893.59C2891.7 553.501 2889.96 554.571 2889.12 556.264L2887.62 559.264C2886.91 560.672 2886.91 562.329 2887.62 563.737L2889.12 566.737C2889.96 568.431 2891.7 569.501 2893.59 569.501H2900C2901.93 569.501 2903.5 567.934 2903.5 566.001Z"
              stroke="black"
            />
            <path
              d="M2969.5 527.001V536.001C2969.5 537.934 2971.07 539.501 2973 539.501H2979.41C2981.3 539.501 2983.04 538.431 2983.88 536.737L2985.38 533.737C2986.09 532.329 2986.09 530.672 2985.38 529.264L2983.88 526.264C2983.04 524.571 2981.3 523.501 2979.41 523.501H2973C2971.07 523.501 2969.5 525.068 2969.5 527.001Z"
              stroke="black"
            />
            <path
              d="M2903.5 536.001V527.001C2903.5 525.068 2901.93 523.501 2900 523.501H2893.59C2891.7 523.501 2889.96 524.571 2889.12 526.264L2887.62 529.264C2886.91 530.672 2886.91 532.329 2887.62 533.737L2889.12 536.737C2889.96 538.431 2891.7 539.501 2893.59 539.501H2900C2901.93 539.501 2903.5 537.934 2903.5 536.001Z"
              stroke="black"
            />
            <path
              d="M2969.5 499.001V508.001C2969.5 509.934 2971.07 511.501 2973 511.501H2979.41C2981.3 511.501 2983.04 510.431 2983.88 508.737L2985.38 505.737C2986.09 504.329 2986.09 502.672 2985.38 501.264L2983.88 498.264C2983.04 496.571 2981.3 495.501 2979.41 495.501H2973C2971.07 495.501 2969.5 497.068 2969.5 499.001Z"
              stroke="black"
            />
            <path
              d="M2903.5 508.001V499.001C2903.5 497.068 2901.93 495.501 2900 495.501H2893.59C2891.7 495.501 2889.96 496.571 2889.12 498.264L2887.62 501.264C2886.91 502.672 2886.91 504.329 2887.62 505.737L2889.12 508.737C2889.96 510.431 2891.7 511.501 2893.59 511.501H2900C2901.93 511.501 2903.5 509.934 2903.5 508.001Z"
              stroke="black"
            />
            <path
              d="M2969.5 471.001V480.001C2969.5 481.934 2971.07 483.501 2973 483.501H2979.41C2981.3 483.501 2983.04 482.431 2983.88 480.737L2985.38 477.737C2986.09 476.329 2986.09 474.672 2985.38 473.264L2983.88 470.264C2983.04 468.571 2981.3 467.501 2979.41 467.501H2973C2971.07 467.501 2969.5 469.068 2969.5 471.001Z"
              stroke="black"
            />
            <path
              d="M2903.5 480.001V471.001C2903.5 469.068 2901.93 467.501 2900 467.501H2893.59C2891.7 467.501 2889.96 468.571 2889.12 470.264L2887.62 473.264C2886.91 474.672 2886.91 476.329 2887.62 477.737L2889.12 480.737C2889.96 482.431 2891.7 483.501 2893.59 483.501H2900C2901.93 483.501 2903.5 481.934 2903.5 480.001Z"
              stroke="black"
            />
            <path
              d="M2969.5 443.001V452.001C2969.5 453.934 2971.07 455.501 2973 455.501H2979.41C2981.3 455.501 2983.04 454.431 2983.88 452.737L2985.38 449.737C2986.09 448.329 2986.09 446.672 2985.38 445.264L2983.88 442.264C2983.04 440.571 2981.3 439.501 2979.41 439.501H2973C2971.07 439.501 2969.5 441.068 2969.5 443.001Z"
              stroke="black"
            />
            <path
              d="M2903.5 452.001V443.001C2903.5 441.068 2901.93 439.501 2900 439.501H2893.59C2891.7 439.501 2889.96 440.571 2889.12 442.264L2887.62 445.264C2886.91 446.672 2886.91 448.329 2887.62 449.737L2889.12 452.737C2889.96 454.431 2891.7 455.501 2893.59 455.501H2900C2901.93 455.501 2903.5 453.934 2903.5 452.001Z"
              stroke="black"
            />
            <path
              d="M2969.5 415.001V424.001C2969.5 425.934 2971.07 427.501 2973 427.501H2979.41C2981.3 427.501 2983.04 426.431 2983.88 424.737L2985.38 421.737C2986.09 420.329 2986.09 418.672 2985.38 417.264L2983.88 414.264C2983.04 412.571 2981.3 411.501 2979.41 411.501H2973C2971.07 411.501 2969.5 413.068 2969.5 415.001Z"
              stroke="black"
            />
            <path
              d="M2903.5 424.001V415.001C2903.5 413.068 2901.93 411.501 2900 411.501H2893.59C2891.7 411.501 2889.96 412.571 2889.12 414.264L2887.62 417.264C2886.91 418.672 2886.91 420.329 2887.62 421.737L2889.12 424.737C2889.96 426.431 2891.7 427.501 2893.59 427.501H2900C2901.93 427.501 2903.5 425.934 2903.5 424.001Z"
              stroke="black"
            />
            <path
              d="M2947.5 399.001H2956.5C2958.43 399.001 2960 397.434 2960 395.501V389.091C2960 387.197 2958.93 385.466 2957.24 384.619L2954.24 383.119C2952.83 382.415 2951.17 382.415 2949.76 383.119L2946.76 384.619C2945.07 385.466 2944 387.197 2944 389.091V395.501C2944 397.434 2945.57 399.001 2947.5 399.001Z"
              stroke="black"
            />
            <path
              d="M2918 399.501H2927C2928.93 399.501 2930.5 397.934 2930.5 396.001V389.591C2930.5 387.697 2929.43 385.966 2927.74 385.119L2924.74 383.619C2923.33 382.915 2921.67 382.915 2920.26 383.619L2917.26 385.119C2915.57 385.966 2914.5 387.697 2914.5 389.591V396.001C2914.5 397.934 2916.07 399.501 2918 399.501Z"
              stroke="black"
            />
            <path
              d="M3166.5 403.001H3090.48C3087.73 403.001 3085.49 405.226 3085.48 407.979L3084.52 626.979C3084.51 629.749 3086.75 632.001 3089.52 632.001H3166.5C3169.26 632.001 3171.5 629.762 3171.5 627.001V408.001C3171.5 405.239 3169.26 403.001 3166.5 403.001Z"
              stroke="black"
            />
            <path
              d="M3175 613.501V622.501C3175 624.434 3176.57 626.001 3178.5 626.001H3184.91C3186.8 626.001 3188.54 624.931 3189.38 623.237L3190.88 620.237C3191.59 618.829 3191.59 617.172 3190.88 615.764L3189.38 612.764C3188.54 611.071 3186.8 610.001 3184.91 610.001H3178.5C3176.57 610.001 3175 611.568 3175 613.501Z"
              stroke="black"
            />
            <path
              d="M3082 622.501V613.501C3082 611.568 3080.43 610.001 3078.5 610.001H3072.09C3070.2 610.001 3068.46 611.071 3067.62 612.764L3066.12 615.764C3065.41 617.172 3065.41 618.829 3066.12 620.237L3067.62 623.237C3068.46 624.931 3070.2 626.001 3072.09 626.001H3078.5C3080.43 626.001 3082 624.434 3082 622.501Z"
              stroke="black"
            />
            <path
              d="M3174.5 585.001V594.001C3174.5 595.934 3176.07 597.501 3178 597.501H3184.41C3186.3 597.501 3188.04 596.431 3188.88 594.737L3190.38 591.737C3191.09 590.329 3191.09 588.672 3190.38 587.264L3188.88 584.264C3188.04 582.571 3186.3 581.501 3184.41 581.501H3178C3176.07 581.501 3174.5 583.068 3174.5 585.001Z"
              stroke="black"
            />
            <path
              d="M3081.5 594.001V585.001C3081.5 583.068 3079.93 581.501 3078 581.501H3071.59C3069.7 581.501 3067.96 582.571 3067.12 584.264L3065.62 587.264C3064.91 588.672 3064.91 590.329 3065.62 591.737L3067.12 594.737C3067.96 596.431 3069.7 597.501 3071.59 597.501H3078C3079.93 597.501 3081.5 595.934 3081.5 594.001Z"
              stroke="black"
            />
            <path
              d="M3174.5 557.001V566.001C3174.5 567.934 3176.07 569.501 3178 569.501H3184.41C3186.3 569.501 3188.04 568.431 3188.88 566.737L3190.38 563.737C3191.09 562.329 3191.09 560.672 3190.38 559.264L3188.88 556.264C3188.04 554.571 3186.3 553.501 3184.41 553.501H3178C3176.07 553.501 3174.5 555.068 3174.5 557.001Z"
              stroke="black"
            />
            <path
              d="M3081.5 566.001V557.001C3081.5 555.068 3079.93 553.501 3078 553.501H3071.59C3069.7 553.501 3067.96 554.571 3067.12 556.264L3065.62 559.264C3064.91 560.672 3064.91 562.329 3065.62 563.737L3067.12 566.737C3067.96 568.431 3069.7 569.501 3071.59 569.501H3078C3079.93 569.501 3081.5 567.934 3081.5 566.001Z"
              stroke="black"
            />
            <path
              d="M3174.5 527.001V536.001C3174.5 537.934 3176.07 539.501 3178 539.501H3184.41C3186.3 539.501 3188.04 538.431 3188.88 536.737L3190.38 533.737C3191.09 532.329 3191.09 530.672 3190.38 529.264L3188.88 526.264C3188.04 524.571 3186.3 523.501 3184.41 523.501H3178C3176.07 523.501 3174.5 525.068 3174.5 527.001Z"
              stroke="black"
            />
            <path
              d="M3081.5 536.001V527.001C3081.5 525.068 3079.93 523.501 3078 523.501H3071.59C3069.7 523.501 3067.96 524.571 3067.12 526.264L3065.62 529.264C3064.91 530.672 3064.91 532.329 3065.62 533.737L3067.12 536.737C3067.96 538.431 3069.7 539.501 3071.59 539.501H3078C3079.93 539.501 3081.5 537.934 3081.5 536.001Z"
              stroke="black"
            />
            <path
              d="M3174.5 499.001V508.001C3174.5 509.934 3176.07 511.501 3178 511.501H3184.41C3186.3 511.501 3188.04 510.431 3188.88 508.737L3190.38 505.737C3191.09 504.329 3191.09 502.672 3190.38 501.264L3188.88 498.264C3188.04 496.571 3186.3 495.501 3184.41 495.501H3178C3176.07 495.501 3174.5 497.068 3174.5 499.001Z"
              stroke="black"
            />
            <path
              d="M3081.5 508.001V499.001C3081.5 497.068 3079.93 495.501 3078 495.501H3071.59C3069.7 495.501 3067.96 496.571 3067.12 498.264L3065.62 501.264C3064.91 502.672 3064.91 504.329 3065.62 505.737L3067.12 508.737C3067.96 510.431 3069.7 511.501 3071.59 511.501H3078C3079.93 511.501 3081.5 509.934 3081.5 508.001Z"
              stroke="black"
            />
            <path
              d="M3174.5 471.001V480.001C3174.5 481.934 3176.07 483.501 3178 483.501H3184.41C3186.3 483.501 3188.04 482.431 3188.88 480.737L3190.38 477.737C3191.09 476.329 3191.09 474.672 3190.38 473.264L3188.88 470.264C3188.04 468.571 3186.3 467.501 3184.41 467.501H3178C3176.07 467.501 3174.5 469.068 3174.5 471.001Z"
              stroke="black"
            />
            <path
              d="M3081.5 480.001V471.001C3081.5 469.068 3079.93 467.501 3078 467.501H3071.59C3069.7 467.501 3067.96 468.571 3067.12 470.264L3065.62 473.264C3064.91 474.672 3064.91 476.329 3065.62 477.737L3067.12 480.737C3067.96 482.431 3069.7 483.501 3071.59 483.501H3078C3079.93 483.501 3081.5 481.934 3081.5 480.001Z"
              stroke="black"
            />
            <path
              d="M3174.5 443.001V452.001C3174.5 453.934 3176.07 455.501 3178 455.501H3184.41C3186.3 455.501 3188.04 454.431 3188.88 452.737L3190.38 449.737C3191.09 448.329 3191.09 446.672 3190.38 445.264L3188.88 442.264C3188.04 440.571 3186.3 439.501 3184.41 439.501H3178C3176.07 439.501 3174.5 441.068 3174.5 443.001Z"
              stroke="black"
            />
            <path
              d="M3081.5 452.001V443.001C3081.5 441.068 3079.93 439.501 3078 439.501H3071.59C3069.7 439.501 3067.96 440.571 3067.12 442.264L3065.62 445.264C3064.91 446.672 3064.91 448.329 3065.62 449.737L3067.12 452.737C3067.96 454.431 3069.7 455.501 3071.59 455.501H3078C3079.93 455.501 3081.5 453.934 3081.5 452.001Z"
              stroke="black"
            />
            <path
              d="M3174.5 415.001V424.001C3174.5 425.934 3176.07 427.501 3178 427.501H3184.41C3186.3 427.501 3188.04 426.431 3188.88 424.737L3190.38 421.737C3191.09 420.329 3191.09 418.672 3190.38 417.264L3188.88 414.264C3188.04 412.571 3186.3 411.501 3184.41 411.501H3178C3176.07 411.501 3174.5 413.068 3174.5 415.001Z"
              stroke="black"
            />
            <path
              d="M3081.5 424.001V415.001C3081.5 413.068 3079.93 411.501 3078 411.501H3071.59C3069.7 411.501 3067.96 412.571 3067.12 414.264L3065.62 417.264C3064.91 418.672 3064.91 420.329 3065.62 421.737L3067.12 424.737C3067.96 426.431 3069.7 427.501 3071.59 427.501H3078C3079.93 427.501 3081.5 425.934 3081.5 424.001Z"
              stroke="black"
            />
            <path
              d="M3095.5 399.001H3104.5C3106.43 399.001 3108 397.434 3108 395.501V389.091C3108 387.197 3106.93 385.466 3105.24 384.619L3102.24 383.119C3100.83 382.415 3099.17 382.415 3097.76 383.119L3094.76 384.619C3093.07 385.466 3092 387.197 3092 389.091V395.501C3092 397.434 3093.57 399.001 3095.5 399.001Z"
              stroke="black"
            />
            <path
              d="M3124 399.501H3133C3134.93 399.501 3136.5 397.934 3136.5 396.001V389.591C3136.5 387.697 3135.43 385.966 3133.74 385.119L3130.74 383.619C3129.33 382.915 3127.67 382.915 3126.26 383.619L3123.26 385.119C3121.57 385.966 3120.5 387.697 3120.5 389.591V396.001C3120.5 397.934 3122.07 399.501 3124 399.501Z"
              stroke="black"
            />
            <path
              d="M3153 399.501H3162C3163.93 399.501 3165.5 397.934 3165.5 396.001V389.591C3165.5 387.697 3164.43 385.966 3162.74 385.119L3159.74 383.619C3158.33 382.915 3156.67 382.915 3155.26 383.619L3152.26 385.119C3150.57 385.966 3149.5 387.697 3149.5 389.591V396.001C3149.5 397.934 3151.07 399.501 3153 399.501Z"
              stroke="black"
            />
            <path
              d="M3169.12 178.219L3156.27 191.541L3167.7 202.74L3180.55 189.417L3169.12 178.219Z"
              stroke="black"
            />
            <path
              d="M3206.97 216.379L3194.13 229.701L3205.56 240.899L3218.4 227.577L3206.97 216.379Z"
              stroke="black"
            />
            <path
              d="M3156.25 227.928L3169.47 240.875L3180.57 229.353L3167.36 216.405L3156.25 227.928Z"
              stroke="black"
            />
            <path
              d="M3194.1 189.766L3207.32 202.713L3218.43 191.191L3205.21 178.243L3194.1 189.766Z"
              stroke="black"
            />
            <path
              d="M3186.14 193.825L3171.74 208.43C3169.81 210.396 3169.82 213.575 3171.77 215.529L3182.37 226.147C3184.32 228.101 3187.47 228.091 3189.41 226.124L3203.81 211.519C3205.74 209.553 3205.73 206.374 3203.78 204.42L3193.18 193.802C3191.23 191.848 3188.08 191.858 3186.14 193.825Z"
              stroke="black"
            />
            <path
              d="M3224.01 103.406H3152.79V135.54H3224.01V103.406Z"
              stroke="black"
            />
            <path
              d="M3188.15 83.322H3169.22V98.8871H3188.15V83.322Z"
              stroke="black"
            />
            <path
              d="M3227.5 245.501V6.50055H3097.5V245.501H3227.5Z"
              stroke="black"
            />
            <path
              d="M3219 751.501H3159C3156.24 751.501 3154 753.739 3154 756.501V778.001C3154 780.762 3156.24 783.001 3159 783.001H3219C3221.76 783.001 3224 780.762 3224 778.001V756.501C3224 753.739 3221.76 751.501 3219 751.501Z"
              stroke="black"
            />
            <path
              d="M3184.5 731.501H3174.5C3171.74 731.501 3169.5 733.739 3169.5 736.501V741.001C3169.5 743.762 3171.74 746.001 3174.5 746.001H3184.5C3187.26 746.001 3189.5 743.762 3189.5 741.001V736.501C3189.5 733.739 3187.26 731.501 3184.5 731.501Z"
              stroke="black"
            />
            <circle cx="3186.5" cy="829.501" r="14.5" stroke="black" />
            <path
              d="M3170.5 833.001V825.001C3170.5 822.239 3168.26 820.001 3165.5 820.001H3159.5C3156.74 820.001 3154.5 822.239 3154.5 825.001V833.001C3154.5 835.762 3156.74 838.001 3159.5 838.001H3165.5C3168.26 838.001 3170.5 835.762 3170.5 833.001Z"
              stroke="black"
            />
            <path
              d="M3220.5 833.501V825.501C3220.5 822.739 3218.26 820.501 3215.5 820.501H3209.5C3206.74 820.501 3204.5 822.739 3204.5 825.501V833.501C3204.5 836.262 3206.74 838.501 3209.5 838.501H3215.5C3218.26 838.501 3220.5 836.262 3220.5 833.501Z"
              stroke="black"
            />
            <path
              d="M3228 851.001V700.501H3098.5V851.001H3228Z"
              stroke="black"
            />
            <path
              d="M3219.03 935.855H3159.57C3156.8 935.855 3154.57 933.616 3154.57 930.855V909.912C3154.57 907.151 3156.8 904.912 3159.57 904.912H3219.03C3221.79 904.912 3224.03 907.151 3224.03 909.912V930.855C3224.03 933.616 3221.79 935.855 3219.03 935.855Z"
              stroke="black"
            />
            <path
              d="M3184.79 955.501H3174.95C3172.18 955.501 3169.95 953.262 3169.95 950.501V946.257C3169.95 943.496 3172.18 941.257 3174.95 941.257H3184.79C3187.55 941.257 3189.79 943.496 3189.79 946.257V950.501C3189.79 953.262 3187.55 955.501 3184.79 955.501Z"
              stroke="black"
            />
            <path
              d="M3185.82 885.47C3193.77 885.469 3200.21 879.092 3200.21 871.235C3200.21 863.378 3193.77 857.001 3185.82 857.001C3177.87 857.001 3171.44 863.378 3171.44 871.235C3171.44 879.092 3177.87 885.47 3185.82 885.47Z"
              stroke="black"
            />
            <path
              d="M3169.95 867.886V875.567C3169.95 878.328 3167.71 880.567 3164.95 880.567H3159.07C3156.31 880.567 3154.07 878.328 3154.07 875.567V867.886C3154.07 865.124 3156.31 862.886 3159.07 862.886H3164.95C3167.71 862.886 3169.95 865.124 3169.95 867.886Z"
              stroke="black"
            />
            <path
              d="M3219.56 867.394V875.076C3219.56 877.837 3217.32 880.076 3214.56 880.076H3208.68C3205.92 880.076 3203.68 877.837 3203.68 875.076V867.394C3203.68 864.633 3205.92 862.394 3208.68 862.394H3214.56C3217.32 862.394 3219.56 864.633 3219.56 867.394Z"
              stroke="black"
            />
            <path d="M3227.5 1028V850.001H3098.5V1028H3227.5Z" stroke="black" />
            <path
              d="M2694 699.501V583.501C2694 580.739 2696.24 578.501 2699 578.501H2843C2845.76 578.501 2848 580.739 2848 583.501V694.501C2848 697.262 2845.76 699.501 2843 699.501H2732.5"
              stroke="black"
            />
            <path
              d="M2741.5 653.501V626.501C2741.5 623.739 2743.74 621.501 2746.5 621.501H2796C2798.76 621.501 2801 623.739 2801 626.501V653.501C2801 656.262 2798.76 658.501 2796 658.501H2746.5C2743.74 658.501 2741.5 656.262 2741.5 653.501Z"
              stroke="black"
            />
            <path
              d="M2746.5 621.001V608.501C2746.5 605.739 2748.74 603.501 2751.5 603.501H2763C2765.76 603.501 2768 605.739 2768 608.501V621.001"
              stroke="black"
            />
            <path
              d="M2775.5 621.001V608.501C2775.5 605.739 2777.74 603.501 2780.5 603.501H2792C2794.76 603.501 2797 605.739 2797 608.501V621.001"
              stroke="black"
            />
            <path
              d="M2768 658.501V671.001C2768 673.762 2765.76 676.001 2763 676.001H2751.5C2748.74 676.001 2746.5 673.762 2746.5 671.001V658.501"
              stroke="black"
            />
            <path
              d="M2797 658.501V671.001C2797 673.762 2794.76 676.001 2792 676.001H2780.5C2777.74 676.001 2775.5 673.762 2775.5 671.001V658.501"
              stroke="black"
            />
            <circle cx="3168.5" cy="291.501" r="15.5" stroke="black" />
            <path
              d="M3097.5 299.501V337.001H3227.5V244.501L3097.5 246.001V258.001"
              stroke="black"
            />
            <path
              d="M3159.5 279.001V269.501C3159.5 266.739 3161.74 264.501 3164.5 264.501H3172.5C3175.26 264.501 3177.5 266.739 3177.5 269.501V279.001"
              stroke="black"
            />
            <path
              d="M3181.5 283.501H3191C3193.76 283.501 3196 285.739 3196 288.501V296.501C3196 299.262 3193.76 301.501 3191 301.501H3181.5"
              stroke="black"
            />
            <path
              d="M3177.5 304.501V314.001C3177.5 316.762 3175.26 319.001 3172.5 319.001H3164.5C3161.74 319.001 3159.5 316.762 3159.5 314.001V304.501"
              stroke="black"
            />
            <path
              d="M3155.5 301.501H3146C3143.24 301.501 3141 299.262 3141 296.501V288.501C3141 285.739 3143.24 283.501 3146 283.501H3155.5"
              stroke="black"
            />
            <path
              d="M343.5 124.501V2.50055H234.5V124.501H343.5Z"
              stroke="black"
            />
            <path
              d="M305.5 22.0005H270V83.5005H305.5V22.0005Z"
              stroke="black"
            />
            <path
              d="M321.5 28.5005H306V48.0005H321.5V28.5005Z"
              stroke="black"
            />
            <path d="M269 28.5005H253.5V48.0005H269V28.5005Z" stroke="black" />
            <path d="M322 56.5005H306.5V76.0005H322V56.5005Z" stroke="black" />
            <path
              d="M269.5 56.5005H254V76.0005H269.5V56.5005Z"
              stroke="black"
            />
            <path
              d="M305.5 167.501H270V229.001H305.5V167.501Z"
              stroke="black"
            />
            <path
              d="M321.5 174.001H306V193.501H321.5V174.001Z"
              stroke="black"
            />
            <path d="M269 174.001H253.5V193.501H269V174.001Z" stroke="black" />
            <path d="M322 202.001H306.5V221.501H322V202.001Z" stroke="black" />
            <path
              d="M269.5 202.001H254V221.501H269.5V202.001Z"
              stroke="black"
            />
            <path d="M343.5 123.501V248.501" stroke="black" />
            <path
              d="M341.5 911.501V789.501H232.5V911.501H341.5Z"
              stroke="black"
            />
            <path
              d="M303.5 809.001H268V870.501H303.5V809.001Z"
              stroke="black"
            />
            <path
              d="M319.5 815.501H304V835.001H319.5V815.501Z"
              stroke="black"
            />
            <path d="M267 815.501H251.5V835.001H267V815.501Z" stroke="black" />
            <path d="M320 843.501H304.5V863.001H320V843.501Z" stroke="black" />
            <path
              d="M267.5 843.501H252V863.001H267.5V843.501Z"
              stroke="black"
            />
            <path d="M303.5 954.501H268V1016H303.5V954.501Z" stroke="black" />
            <path
              d="M319.5 961.001H304V980.501H319.5V961.001Z"
              stroke="black"
            />
            <path d="M267 961.001H251.5V980.501H267V961.001Z" stroke="black" />
            <path d="M320 989.001H304.5V1008.5H320V989.001Z" stroke="black" />
            <path d="M267.5 989.001H252V1008.5H267.5V989.001Z" stroke="black" />
            <path d="M341.5 910.501V1035.5" stroke="black" />
            <path
              d="M465.5 119.501H417.5V206.501H465.5V119.501Z"
              stroke="black"
            />
            <path
              d="M414.5 131.501H404.5V153.501H414.5V131.501Z"
              stroke="black"
            />
            <path
              d="M414.5 171.501H404.5V193.501H414.5V171.501Z"
              stroke="black"
            />
            <path
              d="M464.5 827.501H416.5V914.501H464.5V827.501Z"
              stroke="black"
            />
            <path
              d="M413.5 839.501H403.5V861.501H413.5V839.501Z"
              stroke="black"
            />
            <path
              d="M413.5 879.501H403.5V901.501H413.5V879.501Z"
              stroke="black"
            />
            <path
              d="M1691.5 1028.5V980.501H1604.5V1028.5H1691.5Z"
              stroke="black"
            />
            <path
              d="M1679.5 977.501V967.501H1657.5V977.501H1679.5Z"
              stroke="black"
            />
            <path
              d="M1639.5 977.501V967.501H1617.5V977.501H1639.5Z"
              stroke="black"
            />
            <path
              d="M1605.5 155.501V203.501H1692.5V155.501H1605.5Z"
              stroke="black"
            />
            <path
              d="M1617.5 206.501V216.501H1639.5V206.501H1617.5Z"
              stroke="black"
            />
            <path
              d="M1657.5 206.501V216.501H1679.5V206.501H1657.5Z"
              stroke="black"
            />
            <path
              d="M689.5 314.501V714.501C689.5 717.262 691.739 719.501 694.5 719.501H760M803 719.501H1097.5C1100.26 719.501 1102.5 717.262 1102.5 714.501V663.001C1102.5 660.239 1104.74 658.001 1107.5 658.001H1142C1144.76 658.001 1147 660.239 1147 663.001V714.501C1147 717.262 1149.24 719.501 1152 719.501H1549.5C1552.26 719.501 1554.5 717.262 1554.5 714.501V680.501C1554.5 677.739 1556.74 675.501 1559.5 675.501H1673.5C1676.26 675.501 1678.5 677.739 1678.5 680.501V714.501C1678.5 717.262 1680.74 719.501 1683.5 719.501H1811M1851 719.501H1928M1972 719.501H2073C2075.76 719.501 2078 717.262 2078 714.501V609.001C2078 606.239 2080.24 604.001 2083 604.001H2119C2121.76 604.001 2124 606.239 2124 609.001V714.501C2124 717.262 2126.24 719.501 2129 719.501H2430M2475 719.501H2543.5M2601 719.501H2621C2623.76 719.501 2626 717.262 2626 714.501V623.501M2626 584.001V382.001M2626 344.001V320.501C2626 317.739 2623.76 315.501 2621 315.501H2525.5H2475M2430 315.501H2209M2171 315.501H2129C2126.24 315.501 2124 317.739 2124 320.501V377.001C2124 379.762 2121.76 382.001 2119 382.001H2077.5C2074.74 382.001 2072.5 379.762 2072.5 377.001V320.501C2072.5 317.739 2070.26 315.501 2067.5 315.501H1683.5C1680.74 315.501 1678.5 317.739 1678.5 320.501V349.501C1678.5 352.262 1676.26 354.501 1673.5 354.501H1559.5C1556.74 354.501 1554.5 352.262 1554.5 349.501V320.501C1554.5 317.739 1552.26 315.501 1549.5 315.501H1395M1321.5 315.501H1295.5M1259 315.501H1152C1149.24 315.501 1147 317.739 1147 320.501V427.501C1147 430.262 1144.76 432.501 1142 432.501H1107.5C1104.74 432.501 1102.5 430.262 1102.5 427.501V320.484C1102.5 317.729 1100.27 315.493 1097.52 315.484L803 314.501"
              stroke="black"
              stroke-linecap="round"
            />
            <path
              d="M2848.5 340.501H2694.5M2694.5 589.501V457.121"
              stroke="black"
            />
            <path
              d="M2737 372.001C2742.42 372.001 2747.41 375.645 2751.07 381.717C2754.72 387.78 2757 396.187 2757 405.501C2757 414.814 2754.72 423.221 2751.07 429.284C2747.41 435.356 2742.42 439.001 2737 439.001C2731.58 439.001 2726.59 435.356 2722.93 429.284C2719.28 423.221 2717 414.814 2717 405.501C2717 396.187 2719.28 387.78 2722.93 381.717C2726.59 375.645 2731.58 372.001 2737 372.001Z"
              stroke="black"
            />
            <path
              d="M2801 372.001C2806.42 372.001 2811.41 375.645 2815.07 381.717C2818.72 387.78 2821 396.187 2821 405.501C2821 414.814 2818.72 423.221 2815.07 429.284C2811.41 435.356 2806.42 439.001 2801 439.001C2795.58 439.001 2790.59 435.356 2786.93 429.284C2783.28 423.221 2781 414.814 2781 405.501C2781 396.187 2783.28 387.78 2786.93 381.717C2790.59 375.645 2795.58 372.001 2801 372.001Z"
              stroke="black"
            />
            <circle cx="2754" cy="569.001" r="8" stroke="black" />
            <path
              d="M0.5 1035V0.500549L3233.5 4.00055V1035H0.5Z"
              stroke="black"
            />
            </g>

            {/* Interactive Overlay Rectangles - DO NOT MODIFY SVG ABOVE */}
            
            {/* Work Tables UP */}

            {tableUpData.map(table => (
              <rect
                key={table.id}
                x={table.x}
                y={table.y}
                width={table.width}
                height={table.height}
                fill={getDeskColor(table.id)}
                fillOpacity="0.5"
                stroke={hoveredSection === table.id ? "#1a1a1a" : "transparent"}
                strokeWidth="3"
                style={{ cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={() => setHoveredSection(table.id)}
                onMouseLeave={() => setHoveredSection(null)}
                onClick={() => handleSectionClick(table.id)}
              />
            ))}

            {/* Work Tables DOWN */}
            {tableDownData.map(table => (
              <rect
                key={table.id}
                x={table.x}
                y={table.y}
                width={table.width}
                height={table.height}
                fill={getDeskColor(table.id)}
                fillOpacity="0.5"
                stroke={hoveredSection === table.id ? "#1a1a1a" : "transparent"}
                strokeWidth="3"
                style={{ cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={() => setHoveredSection(table.id)}
                onMouseLeave={() => setHoveredSection(null)}
                onClick={() => handleSectionClick(table.id)}
              />
            ))}

            {/* Beer Point*/}
            <path
              d="M229.195 1035.5H0.5V0.5H229.195V249.201H418.513V319.039H625.5V722.99H409.931V790.818H229.195V1035.5Z"
              fill={getDeskColor('BeerPoint')}
              fillOpacity="0.5"
              stroke={hoveredSection === 'Beer Point' ? '#1a1a1a' : 'transparent'}
              strokeWidth={3}
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={() => setHoveredSection('Beer Point')}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick('BeerPoint')}
            />

            <g
              clipPath="url(#beerPointClip)"
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={() => setHoveredSection('Beer Point')}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick('BeerPoint')}
            >
            </g>

            {/* Bubble Room1*/}
            <rect
              x="234"
              y="2"
              width="110"
              height="125" // 250
              fill={getDeskColor("BubbleRoom1")}
              fillOpacity="0.5"
              stroke={hoveredSection === "Bubble Room1" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("Bubble Room1")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("BubbleRoom1")}
            />

            {/* Bubble Room2*/}
            <rect
              x="234"
              y="127"
              width="110"
              height="125" // 250
              fill={getDeskColor("BubbleRoom2")}
              fillOpacity="0.5"
              stroke={hoveredSection === "Bubble Room2" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("Bubble Room2")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("BubbleRoom2")}
            />

            {/* Bubble Room3*/}
            <rect
              x="234"
              y="789"
              width="110"
              height="123"
              fill={getDeskColor("BubbleRoom3")}
              fillOpacity="0.5"
              stroke={hoveredSection === "Bubble Room3" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("Bubble Room3")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("BubbleRoom3")}
            />

            {/* Bubble Room4*/}
            <rect
              x="234"
              y="912" 
              width="110"
              height="123"
              fill={getDeskColor("BubbleRoom4")}
              fillOpacity="0.5"
              stroke={hoveredSection === "Bubble Room4" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("Bubble Room4")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("BubbleRoom4")}
            />

            {/* Management Office 3 - Far right top */}
            <rect
              x="3097"
              y="6"
              width="131"
              height="240"
              fill={getDeskColor("ManagementOffice3")}
              fillOpacity="0.5"
              stroke={hoveredSection === "ManagementOffice3" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("ManagementOffice3")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("ManagementOffice3")}
            />

            {/* Bubble Room5*/}
            <rect
              x="3097"
              y="246"
              width="131"
              height="91"
              fill={getDeskColor("BubbleRoom5")}
              fillOpacity="0.5"
              stroke={hoveredSection === "Bubble Room5" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("Bubble Room5")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("BubbleRoom5")}
            />

            {/* Training Office 1 - Far right middle */}
            <rect
              x="2847"
              y="337"
              width="190"
              height="363"
              fill={getDeskColor("TrainingOffice1")}
              fillOpacity="0.5"
              stroke={hoveredSection === "Training Office 1" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("Training Office 1")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("TrainingOffice1")}
            />

            {/* Training Office 2 - Far right middle */}
            <rect
              x="3037"
              y="337"
              width="190"
              height="363"
              fill={getDeskColor("TrainingOffice2")}
              fillOpacity="0.5"
              stroke={hoveredSection === "Training Office 2" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("Training Office 2")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("TrainingOffice2")}
            />

            {/* Bookster Area */}
            <rect
              x="2694"
              y="340"
              width="153"
              height="239"
              fill={getDeskColor("BooksterArea")}
              fillOpacity="0.5"
              stroke={hoveredSection === "Bookster Area" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("Bookster Area")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("BooksterArea")}
            />

            {/* Bubble Room6 */}
            <rect
              x="2694"
              y="579"
              width="153"
              height="122"
              fill={getDeskColor("BubbleRoom6")}
              fillOpacity="0.5"
              stroke={hoveredSection === "Bubble Room6" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("Bubble Room6")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("BubbleRoom6")}
            />

            {/* Cubicle 1 - TODO: see if it needs separate hitboxes for chairs*/}
            <rect
              x="417"
              y="120"
              width="48"
              height="87"
              fill={getDeskColor("Cubicle1")}
              fillOpacity="0.5"
              stroke={hoveredSection === "Cubicle 1" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("Cubicle 1")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("Cubicle1")}
            />

            {/* Cubicle 2 - TODO: see if it needs separate hitboxes for chairs*/}
            <rect
              x="417"
              y="828"
              width="48"
              height="87"
              fill={getDeskColor("Cubicle2")}
              fillOpacity="0.5"
              stroke={hoveredSection === "Cubicle 2" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("Cubicle 2")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("Cubicle2")}
            />

            {/* Cubicle 3 - TODO: see if it needs separate hitboxes for chairs*/}
            <rect
              x="1604"
              y="980"
              width="87"
              height="48"
              fill={getDeskColor("Cubicle3")}
              fillOpacity="0.5"
              stroke={hoveredSection === "Cubicle 3" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("Cubicle 3")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("Cubicle3")}
            />

            {/* Cubicle 4 - TODO: see if it needs separate hitboxes for chairs*/}
            <rect
              x="1605"
              y="155"
              width="87"
              height="48"
              fill={getDeskColor("Cubicle4")}
              fillOpacity="0.5"
              stroke={hoveredSection === "Cubicle 4" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("Cubicle 4")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("Cubicle4")}
            />

            {/* Management Office 2 - Far right middle bottom */}
            <rect
              x="3098"
              y="700"
              width="130"
              height="151"
              fill={getDeskColor("ManagementOffice2")}
              fillOpacity="0.5"
              stroke={hoveredSection === "ManagementOffice2" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("ManagementOffice2")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("ManagementOffice2")}
            />

            {/* Management Office 1 - Far right bottom */}
            <rect
              x="3098"
              y="850"
              width="130"
              height="178"
              fill={getDeskColor("ManagementOffice1")}
              fillOpacity="0.5"
              stroke={hoveredSection === "ManagementOffice1" ? "#1a1a1a" : "transparent"}
              strokeWidth="3"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHoveredSection("ManagementOffice1")}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleSectionClick("ManagementOffice1")}
            />
          </svg>
        </div>

        {/* Hovered Section Info removed per design request */}
      </div>

      {/* Booking Modal */}
      {selectedSection && (
        <BookingModal
          section={selectedSection}
          deskId={selectedSection}
          deskStatus={selectedDeskStatus ?? 'available'}
          currentTime={referenceTime}
          isLiveMode={isLiveMode}
          onClose={handleCloseModal}
          onConfirm={handleBookingConfirm}
        />
      )}
    </>
  );
};

export default FloorPlanSVG;
