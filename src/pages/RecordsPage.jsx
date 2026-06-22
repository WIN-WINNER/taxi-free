import { useState, useEffect } from 'react'
import { getEntries } from '../supabase'

export default function RecordsPage({ onNavigate }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadRecords()
    // 每 3 秒刷新一次
    const interval = setInterval(loadRecords, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadRecords = async () => {
    try {
      const entries = await getEntries()
      // 按日期倒序排列
      const sorted = entries.sort((a, b) => new Date(b.date) - new Date(a.date))
      setRecords(sorted)
    } catch (err) {
      console.error('Failed to load records:', err)
    } finally {
      setLoading(false)
    }
  }

  // 過濾記錄（排除金額為 0 的自動建立紀錄）
  const filteredRecords = records.filter(record => {
    if (filter === 'all') {
      return record.amount > 0
    }
    return record.person === filter && record.amount > 0
  })

  // 獲取唯一的搭乘者列表
  const people = [...new Set(records.filter(r => r.amount > 0).map(r => r.person))]

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingText}>加載中...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>紀錄</h1>

      {/* 過濾按鈕 */}
      <div style={styles.filterGroup}>
        <button
          onClick={() => setFilter('all')}
          style={{
            ...styles.filterButton,
            ...(filter === 'all' ? styles.filterButtonActive : {}),
          }}
        >
          全部
        </button>
        {people.map(person => (
          <button
            key={person}
            onClick={() => setFilter(person)}
            style={{
              ...styles.filterButton,
              ...(filter === person ? styles.filterButtonActive : {}),
            }}
          >
            {person}
          </button>
        ))}
      </div>

      {/* 紀錄列表 */}
      <div style={styles.recordsList}>
        {filteredRecords.length === 0 ? (
          <div style={styles.emptyText}>暫無紀錄</div>
        ) : (
          filteredRecords.map((record, index) => (
            <div key={index} style={styles.recordItem}>
              <div style={styles.recordHeader}>
                <div style={styles.recordPerson}>{record.person}</div>
                <div style={styles.recordAmount}>NT$ {record.amount.toFixed(2)}</div>
              </div>
              <div style={styles.recordDetails}>
                <span style={styles.recordLocation}>{record.location}</span>
                <span style={styles.recordDate}>{record.date}</span>
              </div>
              {record.notes && (
                <div style={styles.recordNotes}>{record.notes}</div>
              )}
            </div>
          ))
        )}
      </div>

      <button onClick={() => onNavigate('home')} style={styles.backButton}>
        返回首頁
      </button>
    </div>
  )
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
  },
  filterGroup: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    overflowX: 'auto',
    paddingBottom: '8px',
  },
  filterButton: {
    padding: '8px 16px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  filterButtonActive: {
    backgroundColor: '#0a7ea4',
    color: 'white',
    borderColor: '#0a7ea4',
  },
  recordsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  recordItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #ddd',
  },
  recordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  recordPerson: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#333',
  },
  recordAmount: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#0a7ea4',
  },
  recordDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px',
  },
  recordLocation: {
    fontWeight: '500',
  },
  recordDate: {
    color: '#999',
  },
  recordNotes: {
    fontSize: '13px',
    color: '#999',
    fontStyle: 'italic',
    marginTop: '8px',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: '40px 20px',
  },
  backButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
}
