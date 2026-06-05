import React from 'react'
import ReactECharts from 'echarts-for-react'

export default function AircraftPie({ data, loading, error }) {
  if (loading) return <div className="glass-card"><div className="loading">加载中...</div></div>
  if (error) return <div className="glass-card"><div className="error">数据加载失败</div></div>

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(20, 20, 40, 0.9)',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#e8e8f0' },
      formatter: params => {
        const hours = (params.value / 60).toFixed(1)
        return `${params.name}<br/>${hours}h (${params.percent}%)`
      },
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: (data || []).map(d => ({
        name: d.aircraft,
        value: d.minutes,
      })),
      label: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        formatter: params => {
          const hours = (params.value / 60).toFixed(1)
          return `${params.name}\n${hours}h`
        },
      },
      itemStyle: {
        borderRadius: 4,
        borderColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    }],
  }

  return (
    <div className="glass-card">
      <div className="card-top-accent" />
      <div className="card-title">🛩️ 机型分布</div>
      {(!data || data.length === 0) ? (
        <div className="empty">暂无机型数据</div>
      ) : (
        <ReactECharts option={option} style={{ height: 240 }} />
      )}
    </div>
  )
}
