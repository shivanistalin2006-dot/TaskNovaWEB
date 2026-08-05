import React, { useEffect, useState } from 'react'
import { api } from './api'
import TaskForm from './components/TaskForm.jsx'
import TaskItem from './components/TaskItem.jsx'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [theme, setTheme] = useState('light')

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

  const visibleTasks = tasks.filter((t) => {
    if (filter === 'ALL') return true
    return t.status === filter
  })

  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length
  const doneCount = tasks.filter((t) => t.status === 'DONE').length

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-dot" />
          <h1>TaskNova</h1>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <p className="tagline">Your tasks, organized and always in sync.</p>
      </header>

      <main className="app-main">
        <TaskForm onAdd={handleAdd} />

        <div className="stats-row">
          <div className="stat-pill">
            <span className="stat-number">{tasks.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-pill pending">
            <span className="stat-number">{pendingCount}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-pill done">
            <span className="stat-number">{doneCount}</span>
            <span className="stat-label">Done</span>
          </div>
          <button className="refresh-btn" onClick={loadTasks} title="Reload from database">
            ⟳ Refresh
          </button>
        </div>

        <div className="filter-row">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'DONE'].map((f) => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="empty-state">Loading your tasks…</div>
        ) : visibleTasks.length === 0 ? (
          <div className="empty-state">No tasks here yet. Add one above! ✨</div>
        ) : (
          <ul className="task-list">
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
        <span>TaskNova · FastAPI + Oracle DB + React</span>
      </footer>
    </div>
  )
}
