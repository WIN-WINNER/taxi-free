const API_URL = import.meta.env.VITE_API_URL || 'https://taxi-free-api-production.up.railway.app/api'

export async function register(email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Registration failed')
  }

  return response.json()
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Login failed')
  }

  return response.json()
}

export async function getEntries(token) {
  const response = await fetch(`${API_URL}/entries`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch entries')
  }

  return response.json()
}

export async function addEntry(token, entry) {
  const response = await fetch(`${API_URL}/entries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(entry),
  })

  if (!response.ok) {
    throw new Error('Failed to add entry')
  }

  return response.json()
}

export async function deleteEntry(token, id) {
  const response = await fetch(`${API_URL}/entries/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error('Failed to delete entry')
  }

  return response.json()
}

export async function updateEntry(token, id, updates) {
  const response = await fetch(`${API_URL}/entries/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error('Failed to update entry')
  }

  return response.json()
}
