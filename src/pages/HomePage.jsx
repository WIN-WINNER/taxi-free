import { useState, useEffect } from 'react'
import { getEntries } from '../supabase'

export default function HomePage({ onNavigate }) {
  const [summary, setSummary] = useState({
    total: 0,
    people: {},
    entries: 0,
    byMonth: {},
  })
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7))

  useEffect(() => {
    loadSummary()
    // 每 3 秒刷新一次
    const interval = setInterval(loadSummary, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadSummary = async () => {
    try {
      const entries = await getEntries()
      
      let total = 0
      const people = {}
      const peopleCount = {} // 計算每個搭乘者的筆數
      const byMonth = {} // 按月份統計
      
      entries.forEach(entry => {
        if (entry.amount && entry.amount > 0) {
          total += entry.amount
          if (!people[entry.person]) {
            people[entry.person] = 0
            peopleCount[entry.person] = 0
          }
          people[entry.person] += entry.amount
          peopleCount[entry.person] += 1
          
          // 按月份統計
          const month = entry.date.substring(0, 7)
          if (!byMonth[month]) {
            byMonth[month] = {}
          }
          if (!byMonth[month][entry.person]) {
            byMonth[month][entry.person] = 0
          }
          byMonth[month][entry.person] += 1
        }
      })
      
      // 只計算金額 > 0 的紀錄
      const validEntries = entries.filter(e => e.amount && e.amount > 0)
      
      setSummary({
        total,
        people,
        peopleCount,
        entries: validEntries.length,
        byMonth,
      })
    } catch (err) {
      console.error('Failed to load summary:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingText}>加載中...</div>
      </div>
    )
  }

  // 獲取當月的月份統計
  const currentMonthData = summary.byMonth[selectedMonth] || {}
  const currentMonthTotal = Object.values(currentMonthData).reduce((sum, val) => sum + val, 0)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>🚕 TAXI FREE</div>
        <div style={styles.subtitle}>車資記帳應用</div>
      </div>

      {/* 月份選擇 */}
      <div style={styles.monthSelector}>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={styles.monthInput}
        />
      </div>

      {/* 本月總計 */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>{selectedMonth} 月份總計</div>
        <div style={styles.totalAmount}>NT$ {summary.total.toFixed(2)}</div>
      </div>

      {/* 搭乘者統計 */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>搭乘者統計</div>
        <div style={styles.peopleList}>
          {Object.entries(summary.people).length === 0 ? (
            <div style={styles.emptyText}>暫無數據</div>
          ) : (
            Object.entries(summary.people).map(([person, amount]) => {
              const count = summary.peopleCount[person] || 0
              const monthCount = currentMonthData[person] || 0
              return (
                <div key={person} style={styles.personRow}>
                  <div style={styles.personInfo}>
                    <span style={styles.personName}>{person}</span>
                    <span style={styles.personCount}>共 {count} 筆</span>
                  </div>
                  <div style={styles.personDetails}>
                    <div style={styles.personAmount}>NT$ {amount.toFixed(2)}</div>
                    <div style={styles.monthCount}>本月 {monthCount} 筆</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 統計摘要 */}
      <div style={styles.card}>
        <div style={styles.statsGrid}>
          <div style={styles.statItem}>
            <div style={styles.statLabel}>總紀錄數</div>
            <div style={styles.statValue}>{summary.entries}</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statLabel}>搭乘者數</div>
            <div style={styles.statValue}>{Object.keys(summary.people).length}</div>
          </div>
        </div>
      </div>

      <button onClick={() => onNavigate('add')} style={styles.addButton}>
        ➕ 新增紀錄
      </button>
      <button onClick={() => onNavigate('records')} style={styles.viewButton}>
        📋 查看紀錄
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
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
  },
  monthSelector: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  monthInput: {
    padding: '10px 16px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '200px',
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    border: '1px solid #ddd',
  },
  cardTitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  peopleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  personRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #eee',
  },
  personInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  personName: {
    fontWeight: '600',
    color: '#333',
    fontSize: '16px',
  },
  personCount: {
    fontSize: '12px',
    color: '#999',
  },
  personDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  personAmount: {
    color: '#0a7ea4',
    fontWeight: '600',
    fontSize: '14px',
  },
  monthCount: {
    fontSize: '12px',
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: '20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  statItem: {
    textAlign: 'center',
    padding: '12px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #eee',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  addButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#0a7ea4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '12px',
  },
  viewButton: {
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
