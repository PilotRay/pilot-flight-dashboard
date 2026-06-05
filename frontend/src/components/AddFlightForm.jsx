import React, { useState } from 'react'
import { addFlight } from '../api.js'

export default function AddFlightForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    date: '',
    flight_no: '',
    aircraft: 'B738',
    departure: '',
    arrival: '',
    duration_minutes: '',
    experience_minutes: '',
    landing_count: 1,
  })
  const [saving, setSaving] = useState(false)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.date || !form.departure || !form.arrival || !form.duration_minutes) {
      alert('请填写必填字段：日期、出发地、到达地、飞行时长')
      return
    }
    setSaving(true)
    try {
      await addFlight({
        ...form,
        duration_minutes: parseInt(form.duration_minutes),
        experience_minutes: form.experience_minutes ? parseInt(form.experience_minutes) : 0,
        landing_count: parseInt(form.landing_count || 1),
      })
      onSuccess()
      onClose()
    } catch (err) {
      alert('保存失败: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>✈️ 新增飞行记录</h2>
        <form onSubmit={handleSubmit}>
          <label>日期 *</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required />

          <label>航班号</label>
          <input type="text" name="flight_no" value={form.flight_no} onChange={handleChange}
                 placeholder="如 CA1234" />

          <label>机型 *</label>
          <select name="aircraft" value={form.aircraft} onChange={handleChange}>
            <option value="B738">B737-800 (B738)</option>
            <option value="B38M">B737-8 (B38M)</option>
            <option value="跟飞">跟飞 (观察)</option>
            <option value="其他">其他</option>
          </select>

          <label>出发地 *</label>
          <input type="text" name="departure" value={form.departure} onChange={handleChange}
                 placeholder="如 深圳" />

          <label>到达地 *</label>
          <input type="text" name="arrival" value={form.arrival} onChange={handleChange}
                 placeholder="如 宜昌" />

          <label>飞行时长（分钟）*</label>
          <input type="number" name="duration_minutes" value={form.duration_minutes}
                 onChange={handleChange} placeholder="如 90" min={1} />

          <label>经历时间（分钟）</label>
          <input type="number" name="experience_minutes" value={form.experience_minutes}
                 onChange={handleChange} placeholder="如 45（PF 时间）" min={0} />

          <label>亲自操纵起落次数</label>
          <input type="number" name="landing_count" value={form.landing_count}
                 onChange={handleChange} min={0} max={10} />

          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? '保存中...' : '✅ 保存'}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>取消</button>
          </div>
        </form>
      </div>
    </div>
  )
}
