import React, { useMemo } from 'react'
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
import { motion } from 'framer-motion'
import { Activity, Users, Clock, PieChart as PieIcon, BarChart as BarIcon } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

const KPI = ({ title, value, icon: Icon, accent = 'from-blue-500 to-indigo-600' }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="flex-1"
  >
    <div className={`rounded-lg overflow-hidden shadow-lg bg-gradient-to-br ${accent} text-white p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs opacity-90">{title}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
        </div>
        <div className="p-2 bg-white/20 rounded">
          {Icon ? <Icon size={22} /> : <Activity size={22} />}
        </div>
      </div>
      <div className="h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
        <div className="h-2 bg-white rounded-full" style={{ width: `${Math.min(100, parseFloat(String(value)) || 0)}%` }} />
      </div>
    </div>
  </motion.div>
)

// Hardcoded demo data (nice colors, realistic numbers)
const demo = {
  occupancy: { occupied: 28, free: 12, total: 40, rate: 70 },
  zones: {
    labels: ['A', 'B', 'C', 'D'],
    occupied: [7, 6, 6, 9],
    totals: [11, 10, 10, 9],
  },
  trend: {
    labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'],
    occupancyPct: [45, 55, 60, 68, 72, 70],
  },
}

const Home = () => {
  const pieData = useMemo(() => ({
    labels: ['Occupied', 'Free'],
    datasets: [
      {
        data: [demo.occupancy.occupied, demo.occupancy.free],
        backgroundColor: ['#2563eb', '#e5e7eb'],
        borderColor: ['#1e40af', '#d1d5db'],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  }), [])

  const barData = useMemo(() => ({
    labels: demo.zones.labels,
    datasets: [
      {
        label: 'Occupied',
        data: demo.zones.occupied,
        backgroundColor: '#60a5fa',
        borderRadius: 6,
        barThickness: 28,
      },
      {
        label: 'Capacity',
        data: demo.zones.totals,
        backgroundColor: '#f3f4f6',
        barThickness: 12,
      },
    ],
  }), [])

  const lineData = useMemo(() => ({
    labels: demo.trend.labels,
    datasets: [
      {
        label: 'Occupancy %',
        data: demo.trend.occupancyPct,
        fill: true,
        backgroundColor: 'rgba(59,130,246,0.12)',
        borderColor: '#3b82f6',
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  }), [])

  const common = { animation: { duration: 900, easing: 'easeOutQuart' }, responsive: true, maintainAspectRatio: false }

  const pieOptions = {
    ...common,
    plugins: { legend: { position: 'bottom', labels: { color: '#374151' } }, title: { display: false } },
  }

  const barOptions = {
    ...common,
    plugins: { legend: { position: 'top', labels: { boxWidth: 12 } }, title: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  }

  const lineOptions = {
    ...common,
    plugins: { legend: { display: false } },
    scales: { y: { suggestedMin: 30, suggestedMax: 100 } },
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Office Analytics (Demo)</h1>

      <div className="flex gap-4 mb-6">
        <KPI title="Total Spaces" value={demo.occupancy.total} icon={Users} accent="from-sky-500 to-indigo-500" />
        <KPI title="Occupied" value={demo.occupancy.occupied} icon={Activity} accent="from-emerald-500 to-teal-500" />
        <KPI title="Free" value={demo.occupancy.free} icon={PieIcon} accent="from-gray-400 to-gray-600" />
        <KPI title="Occupancy Rate" value={`${demo.occupancy.rate}`} icon={Clock} accent="from-rose-500 to-pink-500" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -4 }} className="bg-white shadow rounded p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Occupied vs Free</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#2563eb]" /> Occupied</span>
              <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#e5e7eb]" /> Free</span>
            </div>
          </div>
          <div className="w-full h-56 flex items-center justify-center">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="md:col-span-2 bg-white shadow rounded p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Zone occupancy</h2>
            <BarIcon className="text-gray-400" />
          </div>
          <div className="w-full h-48">
            <Bar data={barData} options={barOptions} />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="md:col-span-3 bg-white shadow rounded p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today occupancy trend</h2>
            <div className="text-sm text-gray-500">Live snapshot</div>
          </div>
          <div className="w-full h-56">
            <Line data={lineData} options={lineOptions} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Home