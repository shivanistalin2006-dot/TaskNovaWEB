import React, { useState, useRef, useEffect } from 'react'
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

const TEXT_COLORS = [
  { id: 'default', color: 'inherit' },
  { id: 'black', color: '#1f2430' },
  { id: 'white', color: '#ffffff' },
  { id: 'red', color: '#ef4444' },
  { id: 'blue', color: '#3b82f6' },
  { id: 'purple', color: '#a855f7' },
  { id: 'green', color: '#22c55e' },
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

export default function TaskForm({ onAdd }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [titleColor, setTitleColor] = useState('default')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [color, setColor] = useState('default')
  const [emoji, setEmoji] = useState('📘')
  const [cover, setCover] = useState('none')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activePopup, setActivePopup] = useState(null) // 'color', 'cover', 'emoji', 'titleColor'

  const popupRef = useRef(null)

  useEffect(() => {
    const handleExpand = () => {
      setIsExpanded(true);
      setTimeout(() => {
        const input = document.querySelector('.title-input');
        if (input) input.focus();
      }, 50);
    };
    window.addEventListener('expand-task-form', handleExpand);
    return () => window.removeEventListener('expand-task-form', handleExpand);
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActivePopup(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() && !notes.trim()) return
    setSubmitting(true)
    
    const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0)

    await onAdd({ 
      title: title.trim(), 
      titleColor,
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
    setTitleColor('default')
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
      setActivePopup(null)
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
    backgroundImage: `url("${coverUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    zIndex: 1,
    color: '#fff'
  } : {
    background: color !== 'default' ? COLORS.find(c=>c.id===color).bg : 'var(--panel-bg)'
  }

  const togglePopup = (popupType, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePopup(activePopup === popupType ? null : popupType)
  }

  const activeTitleColor = TEXT_COLORS.find(c => c.id === titleColor)?.color || 'inherit'

  return (
    <form className={`task-form expanded color-${color} ${coverUrl ? 'has-bg-img' : ''}`} onSubmit={handleSubmit} style={formStyle} ref={popupRef}>
      {coverUrl && <div className="form-glass-overlay" />}
      
      <div className="form-content" style={{ position: 'relative', zIndex: 2 }}>
        <div className="form-header-row">
          <div className="emoji-picker-btn" onClick={(e) => togglePopup('emoji', e)}>
            {emoji}
            {activePopup === 'emoji' && (
              <div className="emoji-popup" style={{ display: 'flex' }} onClick={(e) => e.stopPropagation()}>
                {EMOJIS.map(e => (
                  <span key={e} onClick={() => { setEmoji(e); setActivePopup(null) }}>{e}</span>
                ))}
              </div>
            )}
          </div>
          <input
            className="input title-input"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ color: titleColor !== 'default' ? activeTitleColor : 'inherit' }}
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
            <div className="color-picker" onClick={(e) => togglePopup('titleColor', e)}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: titleColor !== 'default' ? activeTitleColor : 'inherit' }}>A</span>
              {activePopup === 'titleColor' && (
                <div className="color-popup" style={{ display: 'flex' }} onClick={(e) => e.stopPropagation()}>
                  {TEXT_COLORS.map(c => (
                    <div 
                      key={c.id} 
                      className={`color-circle ${titleColor === c.id ? 'selected' : ''}`}
                      style={{ background: c.color === 'inherit' ? '#ccc' : c.color, border: '1px solid #ccc' }}
                      onClick={() => { setTitleColor(c.id); setActivePopup(null) }}
                      title={`${c.id} text`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="color-picker" onClick={(e) => togglePopup('color', e)}>
              🎨
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
            
            <div className="cover-picker" onClick={(e) => togglePopup('cover', e)}>
              🖼️
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
                      alt={c.id}
                      className={`cover-thumb ${cover === c.id ? 'selected' : ''}`}
                      onClick={() => { setCover(c.id); setActivePopup(null) }}
                    />
                  ))}
                </div>
              )}
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
