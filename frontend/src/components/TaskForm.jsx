import React, { useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
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
    [{ 'list': 'bullet'}, { 'list': 'check' }],
    ['code-block'],
    ['clean']
  ],
}

export default function TaskForm({ onAdd }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [color, setColor] = useState('default')
  const [emoji, setEmoji] = useState('📘')
  const [cover, setCover] = useState('none')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() && !notes.trim()) return
    setSubmitting(true)
    
    const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0)

    await onAdd({ 
      title: title.trim(), 
      description: '',
      notes: notes,
      tags: tagsArray,
      color,
      emoji,
      cover,
      dueDate,
      isFavorite: false,
      isPinned: false,
      status: 'PENDING' 
    })
    
    setTitle('')
    setNotes('')
    setTags('')
    setColor('default')
    setEmoji('📘')
    setCover('none')
    setDueDate('')
    setIsExpanded(false)
    setSubmitting(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const base64 = await compressImage(file)
      setCover(base64)
    } catch (err) {
      console.error('Image compression failed', err)
    }
  }

  if (!isExpanded) {
    return (
      <div className="task-form-collapsed" onClick={() => setIsExpanded(true)}>
        <span className="add-icon">+</span> Take a note...
      </div>
    )
  }

  const coverUrl = COVERS.find(c => c.id === cover)?.url || (cover !== 'none' ? cover : null)
  
  const formStyle = coverUrl ? {
    backgroundImage: `url(${coverUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    zIndex: 1,
    color: '#fff'
  } : {
    background: color !== 'default' ? COLORS.find(c=>c.id===color).bg : 'var(--panel-bg)'
  }

  return (
    <form className={`task-form expanded color-${color} ${coverUrl ? 'has-bg-img' : ''}`} onSubmit={handleSubmit} style={formStyle}>
      {coverUrl && <div className="form-glass-overlay" />}
      
      <div className="form-content" style={{ position: 'relative', zIndex: 2 }}>
        <div className="form-header-row">
          <div className="emoji-picker-btn">
            {emoji}
            <div className="emoji-popup">
              {EMOJIS.map(e => <span key={e} onClick={() => setEmoji(e)}>{e}</span>)}
            </div>
          </div>
          <input
            className="input title-input"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input 
            type="date" 
            className="input date-input" 
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)} 
            title="Due Date"
          />
        </div>

        <div className="rich-editor-wrapper">
          <ReactQuill 
            theme="snow" 
            value={notes} 
            onChange={setNotes} 
            modules={modules}
            placeholder="Write your note... (Markdown / Rich Text)"
          />
        </div>

        <input
          className="input tags-input"
          type="text"
          placeholder="Add tags (comma separated) e.g. College, Shopping"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <div className="form-toolbar">
          <div className="toolbar-group">
            <div className="color-picker">
              🎨
              <div className="color-popup">
                {COLORS.map(c => (
                  <div 
                    key={c.id} 
                    className={`color-circle ${color === c.id ? 'selected' : ''}`}
                    style={{ background: c.bg === 'var(--task-bg)' ? '#fff' : c.bg, border: '1px solid #ccc' }}
                    onClick={() => setColor(c.id)}
                    title={c.id}
                  />
                ))}
              </div>
            </div>
            
            <div className="cover-picker">
              🖼️
              <div className="cover-popup">
                <div className="cover-thumb none" onClick={() => setCover('none')}>❌</div>
                <label className="cover-thumb upload" title="Upload custom image">
                  📁
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{display: 'none'}} />
                </label>
                {COVERS.filter(c => c.id !== 'none').map(c => (
                  <img 
                    key={c.id} 
                    src={c.url} 
                    alt={c.id}
                    className={`cover-thumb ${cover === c.id ? 'selected' : ''}`}
                    onClick={() => setCover(c.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="toolbar-actions">
            <button type="button" className="cancel-btn" onClick={() => setIsExpanded(false)}>Close</button>
            <button className="add-btn" type="submit" disabled={submitting || (!title.trim() && !notes.trim())}>
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
