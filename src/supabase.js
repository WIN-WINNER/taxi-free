// 使用 Manus 數據 API 存儲數據（解決沙箱網絡限制）

const API_URL = '/api/data'

// 獲取所有紀錄
export async function getEntries() {
  try {
    const response = await fetch(`${API_URL}/entries`)
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
    const response = await fetch(`${API_URL}/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    })
    if (!response.ok) throw new Error('Failed to add entry')
    const data = await response.json()
    return data
  } catch (err) {
    console.error('Failed to add entry:', err)
    throw err
  }
}

// 刪除紀錄
export async function deleteEntry(id) {
  try {
    const response = await fetch(`${API_URL}/entries/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete entry')
  } catch (err) {
    console.error('Failed to delete entry:', err)
    throw err
  }
}

// 更新紀錄
export async function updateEntry(id, updates) {
  try {
    const response = await fetch(`${API_URL}/entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })
    if (!response.ok) throw new Error('Failed to update entry')
    const data = await response.json()
    return data
  } catch (err) {
    console.error('Failed to update entry:', err)
    throw err
  }
}
