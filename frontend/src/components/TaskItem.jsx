import React, { useState } from 'react'
import confetti from 'canvas-confetti'

const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'DONE']

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [notes, setNotes] = useState(task.notes || '')
  const [tags, setTags] = useState(task.tags ? task.tags.join(', ') : '')
  const [status, setStatus] = useState(task.status)
  const [deleting, setDeleting] = useState(false)

  const saveEdit = async () => {
    const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    await onUpdate(task.id, { title, description, status, notes, tags: tagsArray })
    setEditing(false)
  }

  const cancelEdit = () => {
    setTitle(task.title)
    setDescription(task.description || '')
    setNotes(task.notes || '')
    setTags(task.tags ? task.tags.join(', ') : '')
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

  const toggleFavorite = () => {
    onUpdate(task.id, { isFavorite: !task.isFavorite })
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
          <textarea
            className="input notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Rich italic text notes..."
            rows="2"
          />
          <input
            className="input tags-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
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
    <li className={`task-item status-${task.status.toLowerCase()} ${deleting ? 'fading' : ''} ${task.isFavorite ? 'is-favorite' : ''}`}>
      <div className="task-left">
        <label className="check-label">
          <input type="checkbox" checked={task.status === 'DONE'} onChange={toggleDone} />
        </label>
        <button 
          className={`favorite-btn ${task.isFavorite ? 'active' : ''}`} 
          onClick={toggleFavorite}
          title="Pin / Favorite"
        >
          {task.isFavorite ? '★' : '☆'}
        </button>
      </div>

      <div className="task-content">
        <div className="task-header">
          <span className="task-title">{task.title}</span>
          <span className={`status-badge ${task.status.toLowerCase()}`}>{task.status.replace('_', ' ')}</span>
        </div>
        
        {task.description && <span className="task-desc">{task.description}</span>}
        {task.notes && <div className="task-notes"><i>{task.notes}</i></div>}
        
        {task.tags && task.tags.length > 0 && (
          <div className="task-tags">
            {task.tags.map((tag, idx) => (
              <span key={idx} className="tag-pill">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="task-actions">
        <button className="edit-btn" onClick={() => setEditing(true)}>Edit</button>
        <button className="delete-btn" onClick={handleDelete}>Delete</button>
      </div>
    </li>
  )
}
