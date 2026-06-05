import React from 'react'

const LABELS = {
  flightHours: '飞行时间',
  experience: '经历时间',
  landings: '起落次数',
}

const SUB_LABELS = {
  total: '总计',
  y2026: '2026年',
  d90: '近90天',
  month: '本月',
  d7: '近7天',
}

export default function StatsCard({ data, loading, error }) {
  if (loading) return <div className="glass-card"><div className="loading">加载中...</div></div>
  if (error) return <div className="glass-card"><div className="error">数据加载失败</div></div>
  if (!data) return null

  return (
    <div className="glass-card">
      <div className="card-top-accent" />
      <div className="card-title">📊 总览统计</div>

      {Object.entries(data).map(([key, values]) => {
        if (key === 'dbRecords') return null
        return (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
              {LABELS[key] || key}
            </div>
            <div className="stats-grid">
              {Object.entries(values).map(([subKey, val]) => (
                <div key={subKey} className="stat-item">
                  <div className="label">{SUB_LABELS[subKey] || subKey}</div>
                  <div className="value">{val}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
        数据库共 {data.dbRecords || 0} 条记录
      </div>
    </div>
  )
}
