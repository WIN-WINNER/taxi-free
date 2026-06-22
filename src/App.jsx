import { useState, useEffect } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import AddEntryPage from './pages/AddEntryPage'
import RecordsPage from './pages/RecordsPage'
import SummaryPage from './pages/SummaryPage'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 簡單延遲以顯示載入狀態
    setTimeout(() => setLoading(false), 500)
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--background)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚕</div>
          <div style={{ color: 'var(--muted)' }}>TAXI FREE</div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="app-content">
        {currentPage === 'home' && (
          <HomePage onNavigate={setCurrentPage} />
        )}
        {currentPage === 'add-entry' && (
          <AddEntryPage onNavigate={setCurrentPage} />
        )}
        {currentPage === 'records' && (
          <RecordsPage onNavigate={setCurrentPage} />
        )}
        {currentPage === 'summary' && (
          <SummaryPage onNavigate={setCurrentPage} />
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentPage('home')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">首頁</span>
        </button>
        <button
          className={`nav-button ${currentPage === 'add-entry' ? 'active' : ''}`}
          onClick={() => setCurrentPage('add-entry')}
        >
          <span className="nav-icon">➕</span>
          <span className="nav-label">新增</span>
        </button>
        <button
          className={`nav-button ${currentPage === 'records' ? 'active' : ''}`}
          onClick={() => setCurrentPage('records')}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-label">紀錄</span>
        </button>
        <button
          className={`nav-button ${currentPage === 'summary' ? 'active' : ''}`}
          onClick={() => setCurrentPage('summary')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">統計</span>
        </button>
      </nav>
    </div>
  )
}
