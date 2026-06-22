import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// 中間件
app.use(cors())
app.use(express.json())

// 數據文件路徑
const dataDir = path.join(__dirname, 'data')
const usersFile = path.join(dataDir, 'users.json')
const entriesFile = path.join(dataDir, 'entries.json')

// 確保數據目錄存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// 初始化數據文件
function initializeDataFiles() {
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([]))
  }
  if (!fs.existsSync(entriesFile)) {
    fs.writeFileSync(entriesFile, JSON.stringify([]))
  }
}

initializeDataFiles()

// 讀取用戶數據
function getUsers() {
  try {
    return JSON.parse(fs.readFileSync(usersFile, 'utf-8'))
  } catch {
    return []
  }
}

// 保存用戶數據
function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
}

// 讀取紀錄數據
function getEntries() {
  try {
    return JSON.parse(fs.readFileSync(entriesFile, 'utf-8'))
  } catch {
    return []
  }
}

// 保存紀錄數據
function saveEntries(entries) {
  fs.writeFileSync(entriesFile, JSON.stringify(entries, null, 2))
}

// JWT 密鑰
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// 驗證 Token 中間件
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// 註冊
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const users = getUsers()
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const hashedPassword = await bcryptjs.hash(password, 10)
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    saveUsers(users)

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, userId: newUser.id, email: newUser.email })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// 登入
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const users = getUsers()
    const user = users.find((u) => u.email === email)

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, userId: user.id, email: user.email })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// 獲取用戶的所有紀錄
app.get('/api/entries', verifyToken, (req, res) => {
  try {
    const entries = getEntries()
    const userEntries = entries.filter((e) => e.userId === req.userId)
    res.json(userEntries)
  } catch (error) {
    console.error('Get entries error:', error)
    res.status(500).json({ error: 'Failed to fetch entries' })
  }
})

// 新增紀錄
app.post('/api/entries', verifyToken, (req, res) => {
  try {
    const { date, person, location, amount, notes } = req.body

    if (!date || !person || !location || amount === undefined || amount === null || amount === '') {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const entries = getEntries()
    const newEntry = {
      id: Date.now().toString(),
      userId: req.userId,
      date,
      person,
      location,
      amount: amount === 0 ? 0 : parseFloat(amount),
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    entries.push(newEntry)
    saveEntries(entries)

    res.json(newEntry)
  } catch (error) {
    console.error('Add entry error:', error)
    res.status(500).json({ error: 'Failed to add entry' })
  }
})

// 刪除紀錄
app.delete('/api/entries/:id', verifyToken, (req, res) => {
  try {
    const entries = getEntries()
    const entry = entries.find((e) => e.id === req.params.id)

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' })
    }

    if (entry.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const filtered = entries.filter((e) => e.id !== req.params.id)
    saveEntries(filtered)

    res.json({ success: true })
  } catch (error) {
    console.error('Delete entry error:', error)
    res.status(500).json({ error: 'Failed to delete entry' })
  }
})

// 更新紀錄
app.put('/api/entries/:id', verifyToken, (req, res) => {
  try {
    const entries = getEntries()
    const entry = entries.find((e) => e.id === req.params.id)

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' })
    }

    if (entry.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const updated = {
      ...entry,
      ...req.body,
      updatedAt: new Date().toISOString(),
    }

    const index = entries.findIndex((e) => e.id === req.params.id)
    entries[index] = updated
    saveEntries(entries)

    res.json(updated)
  } catch (error) {
    console.error('Update entry error:', error)
    res.status(500).json({ error: 'Failed to update entry' })
  }
})

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
