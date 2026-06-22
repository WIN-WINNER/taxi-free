import { useState, useEffect } from 'react'
import { getEntries } from '../supabase'

export default function SummaryPage({ onNavigate }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7))
  const [people, setPeople] = useState([])
  const [summary, setSummary] = useState({})

  useEffect(() => {
    loadData()
    // 每 3 秒刷新一次
    const interval = setInterval(loadData, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const data = await getEntries()
      setEntries(data)
      
      // 提取唯一的搭乘者
      const uniquePeople = [...new Set(data.map(e => e.person))].filter(p => p)
      setPeople(uniquePeople)
      
      // 計算每個搭乘者的統計信息
      const summary = {}
      uniquePeople.forEach(person => {
        const personEntries = data.filter(e => e.person === person && e.amount > 0)
        const total = personEntries.reduce((sum, e) => sum + e.amount, 0)
        summary[person] = {
          total,
          count: personEntries.length,
        }
      })
      setSummary(summary)
      
      setLoading(false)
    } catch (err) {
      console.error('Failed to load data:', err)
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

  // 獲取選中搭乘者在選中月份的詳細記錄
  const selectedPersonEntries = selectedPerson 
    ? entries.filter(e => 
        e.person === selectedPerson && 
        e.amount > 0 && 
        e.date.substring(0, 7) === selectedMonth
      ).sort((a, b) => new Date(b.date) - new Date(a.date))
    : []

  const selectedPersonTotal = selectedPersonEntries.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>統計</h1>

      {/* 月份選擇 */}
      <div style={styles.monthSelector}>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={styles.monthInput}
        />
      </div>

      {/* 搭乘者列表 */}
      <div style={styles.peopleGrid}>
        {people.map(person => {
          const personEntries = entries.filter(e => 
            e.person === person && 
            e.amount > 0 && 
            e.date.substring(0, 7) === selectedMonth
          )
          const monthCount = personEntries.length
          
          return (
            <button
              key={person}
              onClick={() => setSelectedPerson(selectedPerson === person ? null : person)}
              style={{
                ...styles.personButton,
                ...(selectedPerson === person ? styles.personButtonSelected : {}),
                ...(monthCount === 0 ? styles.personButtonDisabled : {}),
              }}
              disabled={monthCount === 0}
            >
              <div style={styles.personButtonName}>{person}</div>
              <div style={styles.personButtonCount}>
                {monthCount} 筆
              </div>
            </button>
          )
        })}
      </div>

      {/* 詳細表格 */}
      {selectedPerson && selectedPersonEntries.length > 0 && (
        <div style={styles.detailSection}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>{selectedPerson}</div>
          </div>

          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.tableHeadCell}>日期</th>
                <th style={styles.tableHeadCell}>地點</th>
                <th style={styles.tableHeadCell}>備註</th>
                <th style={styles.tableHeadCell}>金額(元)</th>
              </tr>
            </thead>
            <tbody>
              {selectedPersonEntries.map((entry, idx) => (
                <tr key={entry.id || idx} style={styles.tableRow}>
                  <td style={styles.tableCell}>{entry.date}</td>
                  <td style={styles.tableCell}>{entry.location || '-'}</td>
                  <td style={styles.tableCell}>{entry.notes || '-'}</td>
                  <td style={styles.tableCell}>{entry.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.tableFooter}>
            <div style={styles.footerLabel}>加總</div>
            <div style={styles.footerTotal}>{selectedPersonTotal.toFixed(0)}</div>
          </div>
        </div>
      )}

      {selectedPerson && selectedPersonEntries.length === 0 && (
        <div style={styles.emptyMessage}>
          {selectedMonth} 月份無該搭乘者的紀錄
        </div>
      )}

      <button onClick={() => onNavigate('home')} style={styles.backButton}>
        返回首頁
      </button>
    </div>
  )
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    padding: '40px',
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
  peopleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  personButton: {
    padding: '16px 12px',
    fontSize: '14px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  personButtonSelected: {
    backgroundColor: '#0a7ea4',
    color: 'white',
    borderColor: '#0a7ea4',
  },
  personButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  personButtonName: {
    fontWeight: '600',
    fontSize: '16px',
  },
  personButtonCount: {
    fontSize: '12px',
    opacity: 0.8,
  },
  detailSection: {
    marginBottom: '24px',
    border: '2px solid #333',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#fff',
    padding: '16px',
    textAlign: 'center',
    borderBottom: '2px solid #333',
  },
  tableTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
  },
  tableHeadRow: {
    backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #333',
  },
  tableHeadCell: {
    padding: '12px 8px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '14px',
    border: '1px solid #ddd',
  },
  tableRow: {
    borderBottom: '1px solid #ddd',
  },
  tableCell: {
    padding: '12px 8px',
    textAlign: 'center',
    fontSize: '14px',
    border: '1px solid #ddd',
  },
  tableFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderTop: '2px solid #333',
    backgroundColor: '#f5f5f5',
    fontWeight: '600',
  },
  footerLabel: {
    fontSize: '14px',
  },
  footerTotal: {
    fontSize: '18px',
    color: '#0a7ea4',
  },
  emptyMessage: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#999',
    marginBottom: '24px',
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
