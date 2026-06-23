// 直接連接 Supabase（不需要後端服務器）
const SUPABASE_URL = 'https://bybfdcirosxmzrxtuprq.supabase.co'
const SUPABASE_KEY = 'sb_publishable_JTGtwgQplTkhF0gmPhB0GQ_JchGL4Us'
const TABLE_NAME = 'entries'

// 獲取所有紀錄
export async function getEntries() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?order=date.desc`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    if (!response.ok) throw new Error('Failed to fetch entries')
    const data = await response.json()
    return data || []
  } catch (err) {
    console.error('Failed to fetch entries:', err)
    return []
  }
}

// 新增紀錄
export async function addEntry(entry) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE_NAME}`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(entry),
      }
    )
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to add entry')
    }
    const data = await response.json()
    return data[0] || data
  } catch (err) {
    console.error('Failed to add entry:', err)
    throw err
  }
}

// 刪除紀錄
export async function deleteEntry(id) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    if (!response.ok) throw new Error('Failed to delete entry')
  } catch (err) {
    console.error('Failed to delete entry:', err)
    throw err
  }
}

// 更新紀錄
export async function updateEntry(id, updates) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updates),
      }
    )
    if (!response.ok) throw new Error('Failed to update entry')
    const data = await response.json()
    return data[0] || data
  } catch (err) {
    console.error('Failed to update entry:', err)
    throw err
  }
}
