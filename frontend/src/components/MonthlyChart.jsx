import React from 'react'
import ReactECharts from 'echarts-for-react'

export default function MonthlyChart({ data, loading, error }) {
  if (loading) return <div className="glass-card"><div className="loading">加载中...</div></div>
  if (error) return <div className="glass-card"><div className="error">数据加载失败</div></div>

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(20, 20, 40, 0.9)',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#e8e8f0' },
      formatter: params => {
        const p = params[0]
        const hours = (p.value / 60).toFixed(1)
        return `${p.axisValue}<br/>${hours}h (${p.value}分钟)`
      },
    },
    grid: { left: 50, right: 16, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: (data || []).map(d => d.month ? d.month.slice(5) : ''),
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    yAxis: {
      type: 'value',
      name: '分钟',
      nameTextStyle: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    },
    series: [{
      type: 'bar',
      data: (data || []).map(d => d.minutes),
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#00f0ff' },
            { offset: 1, color: '#a855f7' },
          ],
        },
      },
    }],
  }

  return (
    <div className="glass-card">
      <div className="card-top-accent" />
      <div className="card-title">📈 月度飞行时长</div>
      {(!data || data.length === 0) ? (
        <div className="empty">暂无月度数据</div>
      ) : (
        <ReactECharts option={option} style={{ height: 240 }} />
      )}
    </div>
  )
}
