import React from 'react'

export default function StatusBadge({ valid, label }) {
  const bg = valid
    ? 'rgba(74, 222, 128, 0.15)'
    : 'rgba(255, 107, 122, 0.15)'
  const color = valid ? '#4ade80' : '#ff6b7a'

  return (
    <span className="status-badge" style={{ background: bg, color }}>
      {valid ? '✅ ' : '❌ '}{label}
    </span>
  )
}
