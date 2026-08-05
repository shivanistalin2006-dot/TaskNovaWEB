import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { api } from './api'
import TaskForm from './components/TaskForm.jsx'
import TaskItem from './components/TaskItem.jsx'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [tagSearch, setTagSearch] = useState('')
  const [theme, setTheme] = useState('light')
  const [viewMode, setViewMode] = useState('grid')
  const [calendarDate, setCalendarDate] = useState(new Date())

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme'
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  const loadTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.list()
      setTasks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleAdd = async (task) => {
    try {
      const created = await api.create(task)
      setTasks((prev) => [created, ...prev])
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdate = async (id, updates) => {
    try {
      const updated = await api.update(id, updates)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.remove(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const pad = n => n.toString().padStart(2, '0')
  const calDateString = `${calendarDate.getFullYear()}-${pad(calendarDate.getMonth() + 1)}-${pad(calendarDate.getDate())}`

  const visibleTasks = tasks.filter((t) => {
    if (viewMode === 'calendar') {
      if (!t.dueDate || t.dueDate !== calDateString) return false
    }

    if (filter === 'FAVORITES') {
      if (!t.isFavorite) return false
    } else if (filter === 'PINNED') {
      if (!t.isPinned) return false
    } else if (filter !== 'ALL') {
      if (t.status !== filter) return false
    }

    if (tagSearch.trim() !== '') {
      const search = tagSearch.toLowerCase().replace('#', '').trim()
      if (!t.tags || !t.tags.some(tag => tag.toLowerCase().includes(search))) {
        return false
      }
    }
    return true
  }).sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    return 0
  })

  // Determine days that have tasks for calendar highlights
  const datesWithTasks = new Set(tasks.filter(t => t.dueDate).map(t => t.dueDate))

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-dot" />
          <h1>TaskNova Notes</h1>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      <main className="app-main">
        <TaskForm onAdd={handleAdd} />

        <div className="filter-bar">
          <div className="filter-row">
            {['ALL', 'FAVORITES', 'PINNED', 'PENDING', 'DONE'].map((f) => (
              <button
                key={f}
                className={`filter-chip ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'FAVORITES' ? '⭐ Favorites' : f === 'PINNED' ? '📌 Pinned' : f.replace('_', ' ')}
              </button>
            ))}
          </div>
          
          <div className="filter-row-right">
            <div className="view-toggle">
              <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>⊞ Grid</button>
              <button className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`} onClick={() => setViewMode('calendar')}>📅 Calendar</button>
            </div>

            <div className="search-box">
              <input 
                type="text" 
                placeholder="🔍 Search tags" 
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="tag-search-input"
              />
            </div>
          </div>
        </div>

        {viewMode === 'calendar' && (
          <div className="calendar-container">
            <Calendar 
              onChange={setCalendarDate} 
              value={calendarDate} 
              tileClassName={({ date, view }) => {
                if (view === 'month') {
                  const dStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
                  if (datesWithTasks.has(dStr)) return 'has-task'
                }
                return null
              }}
            />
            <div className="calendar-selected-header">
              <h3>Notes for {calendarDate.toLocaleDateString()}</h3>
            </div>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="empty-state">Loading your notes…</div>
        ) : visibleTasks.length === 0 ? (
          <div className="empty-state">No notes found for this view. ✨</div>
        ) : (
          <ul className="notes-grid">
            {visibleTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </main>

      <footer className="app-footer">
        <span>TaskNova Notes · Built with React & Vite</span>
      </footer>
    </div>
  )
}
