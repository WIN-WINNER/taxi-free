import { useState, useEffect } from 'react'
import { addEntryForUser, getStoredPeople, getStoredLocations, subscribeToPeople, subscribeToLocations } from '../auth'

const MAX_VISIBLE_ITEMS = 7

export default function AddEntryPage({ onNavigate }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [people, setPeople] = useState([])
  const [selectedPerson, setSelectedPerson] = useState('')
  const [newPersonName, setNewPersonName] = useState('')
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [showMorePeople, setShowMorePeople] = useState(false)
  
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [newLocationName, setNewLocationName] = useState('')
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [showMoreLocations, setShowMoreLocations] = useState(false)
  
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 初始加載搭乘者
  useEffect(() => {
    const peopleList = getStoredPeople()
    setPeople(peopleList)
    if (peopleList.length > 0) {
      setSelectedPerson(peopleList[0])
    }
  }, [])

  // 初始加載地點
  useEffect(() => {
    const locationList = getStoredLocations()
    setLocations(locationList)
  }, [])

  // 訂閱搭乘者變化
  useEffect(() => {
    const unsubscribe = subscribeToPeople((newPeople) => {
      setPeople(newPeople)
      // 如果當前選擇的人不在列表中，選擇第一個
      if (newPeople.length > 0 && !newPeople.includes(selectedPerson)) {
        setSelectedPerson(newPeople[0])
      }
    })
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [selectedPerson])

  // 訂閱地點變化
  useEffect(() => {
    const unsubscribe = subscribeToLocations((newLocations) => {
      setLocations(newLocations)
    })
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) {
      setError('請輸入搭乘者名稱')
      return
    }

    const trimmed = newPersonName.trim()
    if (people.includes(trimmed)) {
      setError('搭乘者已存在')
      return
    }

    try {
      // 添加一個虛擬紀錄來保存搭乘者（這樣搭乘者會同步到其他設備）
      await addEntryForUser('shared', {
        date: new Date().toISOString().split('T')[0],
        person: trimmed,
        location: selectedLocation || '未知',
        amount: 0,
        notes: '[自動建立]',
      })
      
      setSelectedPerson(trimmed)
      setNewPersonName('')
      setShowAddPerson(false)
      setError('')
    } catch (error) {
      setError('添加搭乘者失敗：' + error.message)
    }
  }

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) {
      setError('請輸入地點名稱')
      return
    }

    const trimmed = newLocationName.trim()
    if (locations.includes(trimmed)) {
      setError('地點已存在')
      return
    }

    try {
      // 添加一個虛擬紀錄來保存地點（這樣地點會同步到其他設備）
      await addEntryForUser('shared', {
        date: new Date().toISOString().split('T')[0],
        person: selectedPerson || '阿龍',
        location: trimmed,
        amount: 0,
        notes: '[自動建立]',
      })
      
      setSelectedLocation(trimmed)
      setNewLocationName('')
      setShowAddLocation(false)
      setError('')
    } catch (error) {
      setError('添加地點失敗：' + error.message)
    }
  }

  const handleSave = async () => {
    if (!selectedPerson) {
      setError('請選擇搭乘者')
      return
    }

    if (!selectedLocation) {
      setError('請選擇或輸入地點')
      return
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      setError('請輸入有效的金額')
      return
    }

    try {
      setLoading(true)
      setError('')

      await addEntryForUser('shared', {
        date,
        person: selectedPerson,
        location: selectedLocation,
        amount: parseFloat(amount),
        notes: notes.trim(),
      })

      // 重置表單
      setDate(new Date().toISOString().split('T')[0])
      setAmount('')
      setNotes('')
      setError('')

      // 顯示成功提示
      alert('紀錄已保存')
    } catch (error) {
      setError('保存失敗：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 獲取顯示的搭乘者
  const displayedPeople = showMorePeople ? people : people.slice(0, MAX_VISIBLE_ITEMS)
  const hasMorePeople = people.length > MAX_VISIBLE_ITEMS

  // 獲取顯示的地點
  const displayedLocations = showMoreLocations ? locations : locations.slice(0, MAX_VISIBLE_ITEMS)
  const hasMoreLocations = locations.length > MAX_VISIBLE_ITEMS

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>新增紀錄</h1>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.formGroup}>
        <label style={styles.label}>日期</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* 搭乘者選擇 */}
      <div style={styles.formGroup}>
        <label style={styles.label}>搭乘者</label>
        <div style={styles.itemsGrid}>
          {displayedPeople.map((person) => (
            <button
              key={person}
              onClick={() => setSelectedPerson(person)}
              style={{
                ...styles.itemButton,
                ...(selectedPerson === person ? styles.itemButtonSelected : {}),
              }}
            >
              {person}
            </button>
          ))}
          <button
            onClick={() => setShowAddPerson(!showAddPerson)}
            style={styles.addButton}
          >
            + 新增
          </button>
          {hasMorePeople && (
            <button
              onClick={() => setShowMorePeople(!showMorePeople)}
              style={styles.moreButton}
            >
              {showMorePeople ? '收起' : '顯示更多'}
            </button>
          )}
        </div>

        {showAddPerson && (
          <div style={styles.addForm}>
            <input
              type="text"
              placeholder="輸入新搭乘者名稱"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              style={styles.input}
            />
            <div style={styles.formButtons}>
              <button onClick={handleAddPerson} style={styles.confirmButton}>
                確認
              </button>
              <button
                onClick={() => {
                  setShowAddPerson(false)
                  setNewPersonName('')
                }}
                style={styles.cancelButton}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 地點選擇 */}
      <div style={styles.formGroup}>
        <label style={styles.label}>地點</label>
        <div style={styles.itemsGrid}>
          {displayedLocations.map((location) => (
            <button
              key={location}
              onClick={() => setSelectedLocation(location)}
              style={{
                ...styles.itemButton,
                ...(selectedLocation === location ? styles.itemButtonSelected : {}),
              }}
            >
              {location}
            </button>
          ))}
          <button
            onClick={() => setShowAddLocation(!showAddLocation)}
            style={styles.addButton}
          >
            + 新增
          </button>
          {hasMoreLocations && (
            <button
              onClick={() => setShowMoreLocations(!showMoreLocations)}
              style={styles.moreButton}
            >
              {showMoreLocations ? '收起' : '顯示更多'}
            </button>
          )}
        </div>

        {showAddLocation && (
          <div style={styles.addForm}>
            <input
              type="text"
              placeholder="輸入新地點名稱"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              style={styles.input}
            />
            <div style={styles.formButtons}>
              <button onClick={handleAddLocation} style={styles.confirmButton}>
                確認
              </button>
              <button
                onClick={() => {
                  setShowAddLocation(false)
                  setNewLocationName('')
                }}
                style={styles.cancelButton}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 金額 */}
      <div style={styles.formGroup}>
        <label style={styles.label}>金額 (元)</label>
        <div style={styles.amountInput}>
          <span style={styles.currencySymbol}>NT$</span>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.amountField}
          />
        </div>
      </div>

      {/* 備註 */}
      <div style={styles.formGroup}>
        <label style={styles.label}>備註 (可選)</label>
        <textarea
          placeholder="例：往返、加班、出差"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={styles.textarea}
        />
      </div>

      {/* 按鈕 */}
      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          ...styles.saveButton,
          ...(loading ? styles.saveButtonDisabled : {}),
        }}
      >
        {loading ? '保存中...' : '保存紀錄'}
      </button>

      <button onClick={() => onNavigate('home')} style={styles.cancelButton}>
        取消
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
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxSizing: 'border-box',
  },
  itemsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  itemButton: {
    padding: '10px 16px',
    fontSize: '14px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  itemButtonSelected: {
    backgroundColor: '#0a7ea4',
    color: 'white',
    borderColor: '#0a7ea4',
  },
  addButton: {
    padding: '10px 16px',
    fontSize: '14px',
    border: '2px dashed #999',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#666',
    whiteSpace: 'nowrap',
  },
  moreButton: {
    padding: '10px 16px',
    fontSize: '14px',
    border: '2px solid #0a7ea4',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#0a7ea4',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  addForm: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  formButtons: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  confirmButton: {
    flex: 1,
    padding: '10px 16px',
    fontSize: '14px',
    backgroundColor: '#0a7ea4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxSizing: 'border-box',
    minHeight: '80px',
    fontFamily: 'inherit',
  },
  amountInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  currencySymbol: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
  },
  amountField: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
  saveButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#0a7ea4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '8px',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  cancelButton: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
}
