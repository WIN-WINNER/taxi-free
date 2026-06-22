// 使用後端 API 進行數據存儲和跨設備同步
import { register, login, getEntries, addEntry, deleteEntry } from './api.js'

// 全局狀態
let currentToken = localStorage.getItem('taxi-free-token') || null
let currentUserId = localStorage.getItem('taxi-free-userId') || null
let entriesCache = []
let peopleCache = ['阿龍', '阿大', '阿鐵']
let locationsCache = []

// 訂閱者列表
const entrySubscribers = []
const peopleSubscribers = []
const locationSubscribers = []

// 自動登入共享帳號
async function ensureLoggedIn() {
  if (currentToken && currentUserId) {
    return { token: currentToken, userId: currentUserId }
  }

  try {
    // 嘗試登入共享帳號
    const result = await login('happy@taxi-free.local', '123456')
    currentToken = result.token
    currentUserId = result.userId
    
    // 保存到本地存儲
    localStorage.setItem('taxi-free-token', currentToken)
    localStorage.setItem('taxi-free-userId', currentUserId)
    
    return { token: currentToken, userId: currentUserId }
  } catch (error) {
    console.error('Failed to login:', error)
    // 如果登入失敗，嘗試註冊
    try {
      const result = await register('happy@taxi-free.local', '123456')
      currentToken = result.token
      currentUserId = result.userId
      
      localStorage.setItem('taxi-free-token', currentToken)
      localStorage.setItem('taxi-free-userId', currentUserId)
      
      return { token: currentToken, userId: currentUserId }
    } catch (registerError) {
      console.error('Failed to register:', registerError)
      throw new Error('無法連接到服務器')
    }
  }
}

// 添加紀錄
export async function addEntryForUser(userId, entry) {
  try {
    const { token } = await ensureLoggedIn()
    const newEntry = await addEntry(token, entry)
    
    // 更新緩存
    entriesCache.push(newEntry)
    notifyEntrySubscribers(entriesCache)
    
    // 更新搭乘者和地點列表
    updatePeopleCache()
    updateLocationsCache()
    
    return newEntry
  } catch (error) {
    throw new Error('Failed to add entry: ' + error.message)
  }
}

// 獲取所有紀錄
export async function getEntriesForUser(userId) {
  try {
    const { token } = await ensureLoggedIn()
    const entries = await getEntries(token)
    entriesCache = entries
    updatePeopleCache()
    updateLocationsCache()
    return entries
  } catch (error) {
    throw new Error('Failed to get entries: ' + error.message)
  }
}

// 刪除紀錄
export async function deleteEntryForUser(entryId) {
  try {
    const { token } = await ensureLoggedIn()
    await deleteEntry(token, entryId)
    
    // 更新緩存
    entriesCache = entriesCache.filter(e => e.id !== entryId)
    notifyEntrySubscribers(entriesCache)
    
    // 更新搭乘者和地點列表
    updatePeopleCache()
    updateLocationsCache()
    
    return true
  } catch (error) {
    throw new Error('Failed to delete entry: ' + error.message)
  }
}

// 更新搭乘者緩存（從紀錄中提取）
function updatePeopleCache() {
  const people = new Set(['阿龍', '阿大', '阿鐵'])
  entriesCache.forEach(entry => {
    if (entry.person) {
      people.add(entry.person)
    }
  })
  peopleCache = Array.from(people).sort()
  notifyPeopleSubscribers(peopleCache)
}

// 更新地點緩存（從紀錄中提取）
function updateLocationsCache() {
  const locations = new Set()
  entriesCache.forEach(entry => {
    if (entry.location && entry.location !== '未知') {
      locations.add(entry.location)
    }
  })
  locationsCache = Array.from(locations).sort()
  notifyLocationSubscribers(locationsCache)
}

// 獲取存儲的搭乘者
export function getStoredPeople() {
  return peopleCache.length > 0 ? peopleCache : ['阿龍', '阿大', '阿鐵']
}

// 獲取存儲的地點
export function getStoredLocations() {
  return locationsCache
}

// 添加新搭乘者
export function addPerson(name) {
  if (!name || name.trim() === '') {
    throw new Error('搭乘者名稱不能為空')
  }
  
  const people = getStoredPeople()
  if (people.includes(name)) {
    throw new Error('搭乘者已存在')
  }
  
  // 新搭乘者會在添加紀錄時自動添加到列表
  return [...people, name].sort()
}

// 通知訂閱者 - 紀錄變化
function notifyEntrySubscribers(data) {
  entrySubscribers.forEach(callback => {
    try {
      callback(data)
    } catch (error) {
      console.error('Error in entry subscriber:', error)
    }
  })
}

// 通知訂閱者 - 搭乘者變化
function notifyPeopleSubscribers(data) {
  peopleSubscribers.forEach(callback => {
    try {
      callback(data)
    } catch (error) {
      console.error('Error in people subscriber:', error)
    }
  })
}

// 通知訂閱者 - 地點變化
function notifyLocationSubscribers(data) {
  locationSubscribers.forEach(callback => {
    try {
      callback(data)
    } catch (error) {
      console.error('Error in location subscriber:', error)
    }
  })
}

// 訂閱紀錄變化
export function subscribeToEntries(callback) {
  // 初始加載
  getEntriesForUser('shared')
    .then(data => callback(data))
    .catch(error => console.error('Error loading entries:', error))

  // 添加到訂閱者列表
  entrySubscribers.push(callback)

  // 定期刷新（每 3 秒檢查一次）
  const interval = setInterval(() => {
    getEntriesForUser('shared')
      .then(data => callback(data))
      .catch(error => console.error('Error refreshing entries:', error))
  }, 3000)

  // 返回取消訂閱函數
  return () => {
    clearInterval(interval)
    const index = entrySubscribers.indexOf(callback)
    if (index > -1) {
      entrySubscribers.splice(index, 1)
    }
  }
}

// 訂閱搭乘者變化
export function subscribeToPeople(callback) {
  // 初始加載
  const people = getStoredPeople()
  callback(people)

  // 添加到訂閱者列表
  peopleSubscribers.push(callback)

  // 定期刷新（每 3 秒檢查一次）
  const interval = setInterval(() => {
    const people = getStoredPeople()
    callback(people)
  }, 3000)

  // 返回取消訂閱函數
  return () => {
    clearInterval(interval)
    const index = peopleSubscribers.indexOf(callback)
    if (index > -1) {
      peopleSubscribers.splice(index, 1)
    }
  }
}

// 訂閱地點變化
export function subscribeToLocations(callback) {
  // 初始加載
  const locations = getStoredLocations()
  callback(locations)

  // 添加到訂閱者列表
  locationSubscribers.push(callback)

  // 定期刷新（每 3 秒檢查一次）
  const interval = setInterval(() => {
    const locations = getStoredLocations()
    callback(locations)
  }, 3000)

  // 返回取消訂閱函數
  return () => {
    clearInterval(interval)
    const index = locationSubscribers.indexOf(callback)
    if (index > -1) {
      locationSubscribers.splice(index, 1)
    }
  }
}

// 初始化 - 自動登入
ensureLoggedIn().catch(error => {
  console.error('Failed to initialize auth:', error)
})
