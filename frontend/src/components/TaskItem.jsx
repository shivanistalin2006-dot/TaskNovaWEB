import React, { useState, useRef, useEffect } from 'react'
import DOMPurify from 'dompurify'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import confetti from 'canvas-confetti'
import { compressImage } from '../utils/imageUtils'

const COLORS = [
  { id: 'default', bg: 'var(--task-bg)' },
  { id: 'yellow', bg: '#fef08a' },
  { id: 'green', bg: '#bbf7d0' },
  { id: 'blue', bg: '#bfdbfe' },
  { id: 'pink', bg: '#fbcfe8' },
  { id: 'dark', bg: '#374151' },
]

const EMOJIS = ['📘', '💡', '🎯', '🎵', '🎬']
const COVERS = [
  { id: 'none', url: '' },
  { id: 'mountain', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop' },
  { id: 'sakura', url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=600&auto=format&fit=crop' },
  { id: 'ocean', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=600&auto=format&fit=crop' },
  { id: 'space', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop' }
]

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'bullet'}, { 'list': 'check' }],
    ['code-block'],
    ['clean']
  ],
}

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title || '')
  const [notes, setNotes] = useState(task.notes || '')
  const [tags, setTags] = useState(task.tags ? task.tags.join(', ') : '')
  const [color, setColor] = useState(task.color || 'default')
  const [emoji, setEmoji] = useState(task.emoji || '📘')
  const [cover, setCover] = useState(task.cover || 'none')
  const [dueDate, setDueDate] = useState(task.dueDate || '')
  const [status, setStatus] = useState(task.status)
  const [deleting, setDeleting] = useState(false)
  const [activePopup, setActivePopup] = useState(null)

  const popupRef = useRef(null)

  useEffect(() => {
    setTitle(task.title || '')
    setNotes(task.notes || '')
    setTags(task.tags ? task.tags.join(', ') : '')
    setColor(task.color || 'default')
    setEmoji(task.emoji || '📘')
    setCover(task.cover || 'none')
    setDueDate(task.dueDate || '')
    setStatus(task.status)
  }, [task])

  useEffect(() => {
    if (!editing) return;
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActivePopup(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editing])

  const saveEdit = async () => {
    const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    await onUpdate(task.id, { title, status, notes, tags: tagsArray, color, emoji, cover, dueDate })
    setEditing(false)
  }

  const cancelEdit = () => {
    setTitle(task.title || '')
    setNotes(task.notes || '')
    setTags(task.tags ? task.tags.join(', ') : '')
    setColor(task.color || 'default')
    setEmoji(task.emoji || '📘')
    setCover(task.cover || 'none')
    setDueDate(task.dueDate || '')
    setStatus(task.status)
    setEditing(false)
  }

  const toggleDone = () => {
    const newStatus = task.status === 'DONE' ? 'PENDING' : 'DONE'
    onUpdate(task.id, { status: newStatus })
    if (newStatus === 'DONE') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const base64 = await compressImage(file)
      setCover(base64)
      setActivePopup(null)
    } catch (err) {
      console.error('Image compression failed', err)
    }
  }

  const toggleFavorite = () => onUpdate(task.id, { isFavorite: !task.isFavorite })
  const togglePin = () => onUpdate(task.id, { isPinned: !task.isPinned })
  const handleDelete = async () => { setDeleting(true); await onDelete(task.id) }

  const coverUrl = COVERS.find(c => c.id === task.cover)?.url || (task.cover !== 'none' ? task.cover : null)
  const editCoverUrl = COVERS.find(c => c.id === cover)?.url || (cover !== 'none' ? cover : null)

  const cardStyle = {
    background: coverUrl ? `url("${coverUrl}") center/cover` : (color !== 'default' ? COLORS.find(c => c.id === color)?.bg : 'var(--task-bg)'),
    color: (color === 'dark' || coverUrl) ? '#fff' : 'inherit',
    position: 'relative',
    overflow: 'hidden' // Important for background overlay
  }

  const editStyle = {
    background: editCoverUrl ? `url("${editCoverUrl}") center/cover` : (color !== 'default' ? COLORS.find(c => c.id === color)?.bg : 'var(--task-bg)'),
    color: (color === 'dark' || editCoverUrl) ? '#fff' : 'inherit',
    position: 'relative',
    overflow: 'visible' // Let popups overflow
  }

  const togglePopup = (popupType, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePopup(activePopup === popupType ? null : popupType)
  }

  if (editing) {
    return (
      <li className={`task-item editing ${editCoverUrl ? 'has-bg-img' : ''}`} style={editStyle} ref={popupRef}>
        {editCoverUrl && <div className="card-glass-overlay" />}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="edit-fields">
            <div style={{display: 'flex', gap: '8px'}}>
              <input className="input title-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={{flex: 1}} />
              <input type="date" className="input date-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{width: 'auto'}} />
            </div>
            <div className="rich-editor-wrapper">
              <ReactQuill theme="snow" value={notes} onChange={setNotes} modules={modules} />
            </div>
            <input className="input tags-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" />
            
            <div className="form-toolbar">
              <div className="toolbar-group">
                <div className="color-picker" onClick={(e) => togglePopup('color', e)}>🎨
                  {activePopup === 'color' && (
                    <div className="color-popup" style={{ display: 'flex' }} onClick={(e) => e.stopPropagation()}>
                      {COLORS.map(c => (
                        <div 
                          key={c.id} 
                          className={`color-circle ${color === c.id ? 'selected' : ''}`} 
                          style={{ background: c.bg === 'var(--task-bg)' ? '#fff' : c.bg, border: '1px solid #ccc' }} 
                          onClick={() => { setColor(c.id); setActivePopup(null) }} 
                          title={c.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="cover-picker" onClick={(e) => togglePopup('cover', e)}>🖼️
                  {activePopup === 'cover' && (
                    <div className="cover-popup" style={{ display: 'flex' }} onClick={(e) => e.stopPropagation()}>
                      <div className="cover-thumb none" onClick={() => { setCover('none'); setActivePopup(null) }}>❌</div>
                      <label className="cover-thumb upload" title="Upload custom image">
                        📁
                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{display: 'none'}} onClick={(e) => e.stopPropagation()} />
                      </label>
                      {COVERS.filter(c => c.id !== 'none').map(c => (
                        <img 
                          key={c.id} 
                          src={c.url} 
                          className={`cover-thumb ${cover === c.id ? 'selected' : ''}`} 
                          onClick={() => { setCover(c.id); setActivePopup(null) }} 
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="emoji-picker-btn" onClick={(e) => togglePopup('emoji', e)}>{emoji}
                  {activePopup === 'emoji' && (
                    <div className="emoji-popup" style={{ display: 'flex' }} onClick={(e) => e.stopPropagation()}>
                      {EMOJIS.map(e => <span key={e} onClick={() => { setEmoji(e); setActivePopup(null) }}>{e}</span>)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="task-actions">
            <button className="save-btn" onClick={saveEdit}>Save</button>
            <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      </li>
    )
  }

  const sanitizedNotes = DOMPurify.sanitize(task.notes || '')
  
  return (
    <li className={`task-item status-${task.status.toLowerCase()} ${deleting ? 'fading' : ''} ${task.isPinned ? 'is-pinned' : ''} ${coverUrl ? 'has-bg-img' : ''}`} style={cardStyle}>
      {coverUrl && <div className="card-glass-overlay" />}
      
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="task-header-actions">
          <button className={`pin-btn ${task.isPinned ? 'active' : ''}`} onClick={togglePin} title="Pin Note">📌</button>
          <button className={`favorite-btn ${task.isFavorite ? 'active' : ''}`} onClick={toggleFavorite} title="Favorite">⭐</button>
        </div>

        <div className="task-main-content">
          <div className="task-header">
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <span className="task-emoji">{task.emoji || '📘'}</span>
              <span className="task-title">{task.title}</span>
            </div>
            {task.dueDate && <span className="task-due-date" style={{fontSize: '12px', opacity: 0.8, fontWeight: 600}}>📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
          </div>
          
          {sanitizedNotes && (
            <div className="task-rich-notes ql-editor" dangerouslySetInnerHTML={{ __html: sanitizedNotes }} />
          )}
          
          {task.tags && task.tags.length > 0 && (
            <div className="task-tags">
              {task.tags.map((tag, idx) => (
                <span key={idx} className="tag-pill">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="task-footer">
          <label className="check-label">
            <input type="checkbox" checked={task.status === 'DONE'} onChange={toggleDone} /> 
            <span className="done-text">{task.status === 'DONE' ? 'Completed' : 'Mark done'}</span>
          </label>
          <div className="task-actions">
            <button className="edit-btn" onClick={() => setEditing(true)}>Edit</button>
            <button className="delete-btn" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </div>
    </li>
  )
}
