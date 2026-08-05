import React, { useState } from 'react'
import confetti from 'canvas-confetti'

const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'DONE']

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [status, setStatus] = useState(task.status)
  const [deleting, setDeleting] = useState(false)

  const saveEdit = async () => {
    await onUpdate(task.id, { title, description, status })
    setEditing(false)
  }

  const cancelEdit = () => {
    setTitle(task.title)
    setDescription(task.description || '')
    setStatus(task.status)
    setEditing(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(task.id)
  }

  const toggleDone = () => {
    const newStatus = task.status === 'DONE' ? 'PENDING' : 'DONE'
    onUpdate(task.id, { status: newStatus })
    if (newStatus === 'DONE') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }

  if (editing) {
    return (
      <li className="task-item editing">
        <div className="edit-fields">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />
          <input
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          <select className="input status-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="task-actions">
          <button className="save-btn" onClick={saveEdit}>Save</button>
          <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
        </div>
      </li>
    )
  }

  return (
    <li className={`task-item status-${task.status.toLowerCase()} ${deleting ? 'fading' : ''}`}>
      <label className="check-label">
        <input type="checkbox" checked={task.status === 'DONE'} onChange={toggleDone} />
      </label>

      <div className="task-content">
        <span className="task-title">{task.title}</span>
        {task.description && <span className="task-desc">{task.description}</span>}
        <span className={`status-badge ${task.status.toLowerCase()}`}>{task.status.replace('_', ' ')}</span>
      </div>

      <div className="task-actions">
        <button className="edit-btn" onClick={() => setEditing(true)}>Edit</button>
        <button className="delete-btn" onClick={handleDelete}>Delete</button>
      </div>
    </li>
  )
}
