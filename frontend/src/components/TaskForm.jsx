import React, { useState } from 'react'

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    await onAdd({ title: title.trim(), description: description.trim(), status: 'PENDING' })
    setTitle('')
    setDescription('')
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
    </form>
  )
}
