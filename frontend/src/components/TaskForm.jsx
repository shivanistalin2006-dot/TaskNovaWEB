import React, { useState } from 'react'

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    
    // Process tags (comma separated)
    const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0)

    await onAdd({ 
      title: title.trim(), 
      description: description.trim(), 
      notes: notes.trim(),
      tags: tagsArray,
      isFavorite: false,
      status: 'PENDING' 
    })
    setTitle('')
    setDescription('')
    setNotes('')
    setTags('')
    setSubmitting(false)
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          className="input title-input"
          type="text"
          placeholder="What do you need to do?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="add-btn" type="submit" disabled={submitting || !title.trim()}>
          {submitting ? 'Adding…' : '+ Add Task'}
        </button>
      </div>
      <input
        className="input desc-input"
        type="text"
        placeholder="Add a short description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="form-row">
        <textarea
          className="input notes-input"
          placeholder="Rich italic text notes... (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="2"
        />
        <input
          className="input tags-input"
          type="text"
          placeholder="Tags (comma separated) e.g., work, urgent"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
    </form>
  )
}
