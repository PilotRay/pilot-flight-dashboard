import React, { useState, useEffect, useCallback } from 'react'
import StatsCard from './components/StatsCard.jsx'
import MonthlyChart from './components/MonthlyChart.jsx'
import AircraftPie from './components/AircraftPie.jsx'
import FlightTable from './components/FlightTable.jsx'
import AddFlightForm from './components/AddFlightForm.jsx'
import { getOverview, getMonthly, getAircraft, getFlights } from './api.js'

export default function App() {
  const [overview, setOverview] = useState(null)
  const [monthly, setMonthly] = useState(null)
  const [aircraft, setAircraft] = useState(null)
  const [flights, setFlights] = useState({ data: [], total: 0 })
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState({ overview: true, monthly: true, aircraft: true, flights: true })
  const [errors, setErrors] = useState({})

  const loadData = useCallback(async () => {
    try {
      const [ov, mo, ac, fl] = await Promise.all([
        getOverview(), getMonthly(), getAircraft(), getFlights(page),
      ])
      setOverview(ov)
      setMonthly(mo)
      setAircraft(ac)
      setFlights(fl)
      setLoading({ overview: false, monthly: false, aircraft: false, flights: false })
    } catch (err) {
      console.error('数据加载失败:', err)
      setErrors({ overview: true })
      setLoading({ overview: false, monthly: false, aircraft: false, flights: false })
    }
  }, [page])

  useEffect(() => { loadData() }, [loadData])

  return (
    <div className="app-container">
      {/* 标题 */}
      <div className="header">
        <h1>🛩️ 飞行员数据看板</h1>
        <div className="subtitle">个人飞行记录 · 统计 · 可视化</div>
      </div>

      {/* 总览统计 */}
      <div className="grid-full">
        <StatsCard
          data={overview}
          loading={loading.overview}
          error={errors.overview}
        />
      </div>

      {/* 图表 */}
      <div className="grid-2">
        <MonthlyChart data={monthly} loading={loading.monthly} error={errors.monthly} />
        <AircraftPie data={aircraft} loading={loading.aircraft} error={errors.aircraft} />
      </div>

      {/* 飞行记录表 */}
      <div className="grid-full">
        <FlightTable
          data={flights.data}
          loading={loading.flights}
          error={errors.flights}
          page={page}
          total={flights.total}
          onPageChange={p => setPage(p)}
          onRefresh={() => { loadData(); setPage(1) }}
        />
      </div>

      {/* 浮动新增按钮 */}
      <button className="fab" onClick={() => setShowForm(true)} title="新增飞行记录">
        ✈️
      </button>

      {/* 新增表单模态框 */}
      {showForm && (
        <AddFlightForm
          onClose={() => setShowForm(false)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  )
}
