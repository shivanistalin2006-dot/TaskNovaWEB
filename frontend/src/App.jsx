import React, { useEffect, useState, useRef } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { api } from './api'
import TaskForm from './components/TaskForm.jsx'
import TaskItem from './components/TaskItem.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import HeatMap from './components/HeatMap.jsx'
import NovaCanvas from './components/NovaCanvas.jsx'

const getInitialTheme = () => {
  const hour = new Date().getHours();
  // Sleep Mode: After 11 PM or before 6 AM
  if (hour >= 23 || hour < 6) return 'dark';
  return 'light';
}

const SPACES = [
  { id: 'all', name: 'All Spaces', emoji: '🌌', theme: 'light', bgUrl: '' },
  { id: 'study', name: 'Study', emoji: '🎓', theme: 'light', bgUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1920&auto=format&fit=crop' },
  { id: 'work', name: 'Work', emoji: '💼', theme: 'dark', bgUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop' },
  { id: 'home', name: 'Home', emoji: '🏡', theme: 'light', bgUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1920&auto=format&fit=crop' },
  { id: 'personal', name: 'Personal', emoji: '❤️', theme: 'light', bgUrl: 'https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9d?q=80&w=1920&auto=format&fit=crop' },
  { id: 'ideas', name: 'Ideas', emoji: '🚀', theme: 'dark', bgUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop' },
]

export default function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [tagSearch, setTagSearch] = useState('')
  const [theme, setTheme] = useState(getInitialTheme)
  const [activeSpace, setActiveSpace] = useState('all')
  const [cmdOpen, setCmdOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'canvas'
  
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarFilter, setCalendarFilter] = useState(null)

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme'
  }, [theme])

  useEffect(() => {
    const space = SPACES.find(s => s.id === activeSpace)
    if (space) {
      if (space.bgUrl) {
        document.body.style.backgroundImage = `url("${space.bgUrl}")`
        document.body.style.backgroundSize = 'cover'
        document.body.style.backgroundAttachment = 'fixed'
        document.body.style.backgroundPosition = 'center'
      } else {
        document.body.style.backgroundImage = 'none'
      }
      if (space.id !== 'all') {
        setTheme(space.theme)
      }
    }
  }, [activeSpace])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
      if (e.key === 'Escape') setCmdOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [])

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
      const taskWithSpace = { 
        ...task, 
        space: activeSpace === 'all' ? 'personal' : activeSpace 
      }
      const created = await api.create(taskWithSpace)
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

  const visibleTasks = tasks.filter((t) => {
    if (activeSpace !== 'all') {
      const taskSpace = t.space || 'personal';
      if (taskSpace !== activeSpace) return false;
    }

    if (calendarFilter) {
      const calDateString = `${calendarFilter.getFullYear()}-${pad(calendarFilter.getMonth() + 1)}-${pad(calendarFilter.getDate())}`
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

  const datesWithTasks = new Set(tasks.filter(t => t.dueDate).map(t => t.dueDate))

  const displayDate = calendarFilter || new Date()
  const iconText = `${displayDate.getDate()}/${displayDate.getMonth() + 1}`

  const hour = new Date().getHours();
  const isSleepMode = (hour >= 23 || hour < 6);

  const today = new Date();
  const memoryTask = tasks.find(t => {
    if (!t.id) return false;
    const taskDate = new Date(t.id); // Assuming ID is a timestamp Date.now()
    return taskDate.getMonth() === today.getMonth() && 
           taskDate.getDate() === today.getDate() && 
           taskDate.getFullYear() < today.getFullYear();
  });

  return (
    <div className="app-shell" style={{ background: activeSpace !== 'all' ? (theme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)') : 'transparent', backdropFilter: activeSpace !== 'all' ? 'blur(10px)' : 'none', minHeight: '100vh', transition: 'all 0.5s ease' }}>
      
      <CommandPalette 
        isOpen={cmdOpen} 
        onClose={() => setCmdOpen(false)} 
        SPACES={SPACES} 
        setActiveSpace={setActiveSpace}
        toggleTheme={toggleTheme}
        onNewNote={() => {
          window.dispatchEvent(new Event('expand-task-form'))
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        tasks={tasks}
        setTagSearch={setTagSearch}
      />

      <header className="app-header">
        <div className="brand">
          <span className="brand-dot" />
          <h1>TaskNova Notes</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isSleepMode && <span className="sleep-mode-badge" title="Sleep Mode Activated 🌙">🌙</span>}
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      <div className="spaces-nav">
        {SPACES.map(s => (
          <button 
            key={s.id} 
            className={`space-btn ${activeSpace === s.id ? 'active' : ''}`}
            onClick={() => setActiveSpace(s.id)}
          >
            {s.emoji} <span className="space-name">{s.name}</span>
          </button>
        ))}
      </div>

      <main className="app-main">
        <TaskForm onAdd={handleAdd} />
        <HeatMap tasks={tasks} />

        <div className="view-toggle-bar">
          <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>🗂️ Grid View</button>
          <button className={`view-btn ${viewMode === 'canvas' ? 'active' : ''}`} onClick={() => setViewMode('canvas')}>💎 Canvas View</button>
        </div>

        <div className="filter-bar">
          <div className="filter-row">
            {['ALL', 'FAVORITES', 'PINNED', 'PENDING', 'DONE'].map((f) => (
              <button
                key={f}
                className={`filter-chip ${filter === f ? 'active' : ''}`}
                onClick={() => {
                  setFilter(f)
                  if (f === 'ALL') setCalendarFilter(null)
                }}
              >
                {f === 'FAVORITES' ? '⭐ Favorites' : f === 'PINNED' ? '📌 Pinned' : f.replace('_', ' ')}
              </button>
            ))}
          </div>
          
          <div className="filter-row-right">
            <div className="floating-calendar-wrapper">
              {calendarFilter && (
                <button className="clear-cal-btn" onClick={() => setCalendarFilter(null)} title="Clear Date Filter">✖</button>
              )}
              <button 
                className={`floating-calendar-btn ${calendarFilter ? 'active-filter' : ''}`} 
                onClick={() => setShowCalendar(!showCalendar)}
                title="Select a Date"
              >
                <span className="cal-icon">📅</span>
                <span className="cal-text">{iconText}</span>
              </button>
              
              {showCalendar && (
                <div className="floating-calendar-popup">
                  <Calendar 
                    onChange={(date) => { setCalendarFilter(date); setShowCalendar(false); }} 
                    value={displayDate} 
                    tileClassName={({ date, view }) => {
                      if (view === 'month') {
                        const dStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
                        if (datesWithTasks.has(dStr)) return 'has-task'
                      }
                      return null
                    }}
                  />
                </div>
              )}
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

        {calendarFilter && (
          <div className="filter-active-banner">
            Showing notes for <strong>{calendarFilter.toLocaleDateString()}</strong> ✨
          </div>
        )}

        {memoryTask && (
          <div className="memory-banner">
            <div className="memory-icon">🌸</div>
            <div className="memory-content">
              <h4>On this day, {today.getFullYear() - new Date(memoryTask.id).getFullYear()} year(s) ago...</h4>
              <p>You wrote: <strong>{memoryTask.title}</strong></p>
            </div>
            <button className="memory-view-btn" onClick={() => { setTagSearch(memoryTask.title); window.scrollTo({top: 500, behavior: 'smooth'}); }}>View Note</button>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="empty-state">Loading your notes…</div>
        ) : visibleTasks.length === 0 ? (
          <div className="empty-state-beautiful">
            <div className="empty-emoji">✨</div>
            <h3>Your ideas are waiting in this space.</h3>
            <p>Create your first note here. Or press Ctrl+K to search.</p>
          </div>
        ) : viewMode === 'canvas' ? (
          <NovaCanvas tasks={visibleTasks} onUpdate={handleUpdate} onDelete={handleDelete} />
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
        <span>Just to remember your plan</span>
      </footer>
    </div>
  )
}
