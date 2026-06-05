const API_BASE = '/api'

export async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function del(url) {
  const res = await fetch(url, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function getOverview()      { return fetchJSON(`${API_BASE}/stats/overview`) }
export function getMonthly()       { return fetchJSON(`${API_BASE}/stats/monthly`) }
export function getAircraft()      { return fetchJSON(`${API_BASE}/stats/aircraft`) }
export function getFlights(page)   { return fetchJSON(`${API_BASE}/flights?page=${page}&limit=50`) }
export function addFlight(data)    { return postJSON(`${API_BASE}/flights`, data) }
export function deleteFlight(id)   { return del(`${API_BASE}/flights/${id}`) }
