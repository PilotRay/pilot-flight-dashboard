import React from 'react'
import { deleteFlight } from '../api.js'

export default function FlightTable({ data, loading, error, page, total, onPageChange, onRefresh }) {
  if (loading) return <div className="glass-card"><div className="loading">加载中...</div></div>
  if (error) return <div className="glass-card"><div className="error">数据加载失败</div></div>

  const entries = data || []
  const totalPages = Math.ceil((total || 0) / 50)

  const handleDelete = async id => {
    if (!confirm('确定要删除这条记录吗？')) return
    try {
      await deleteFlight(id)
      onRefresh()
    } catch (err) {
      alert('删除失败: ' + err.message)
    }
  }

  return (
    <div className="glass-card">
      <div className="card-top-accent" />
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>📋 飞行记录</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>共 {total || 0} 条</span>
      </div>

      {entries.length === 0 ? (
        <div className="empty">暂无飞行记录，点击右下角 + 按钮添加</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="flight-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>航班号</th>
                  <th>机型</th>
                  <th>航段</th>
                  <th>时长</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id}>
                    <td>{entry.date}</td>
                    <td>{entry.flight_no || '—'}</td>
                    <td>{entry.aircraft}</td>
                    <td>{entry.departure} → {entry.arrival}</td>
                    <td>{Math.floor(entry.duration_minutes / 60)}h{entry.duration_minutes % 60}m</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDelete(entry.id)}>
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>上一页</button>
              <span>{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>下一页</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
