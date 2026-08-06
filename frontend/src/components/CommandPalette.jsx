import React, { useEffect, useState, useRef } from 'react';

export default function CommandPalette({ isOpen, onClose, SPACES, setActiveSpace, toggleTheme, onNewNote, tasks, setTagSearch }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    { id: 'new-note', name: 'Create New Note', emoji: '📝', action: () => { onNewNote(); onClose(); } },
    { id: 'toggle-theme', name: 'Toggle Theme (Dark/Light)', emoji: '🌙', action: () => { toggleTheme(); onClose(); } },
  ];

  SPACES.forEach(s => {
    if (s.id !== 'all') {
      actions.push({ id: `space-${s.id}`, name: `Go to ${s.name} Space`, emoji: s.emoji, action: () => { setActiveSpace(s.id); onClose(); } });
    }
  });

  const filteredActions = actions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));
  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5);

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-palette" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          className="cmd-input"
          placeholder="Search commands, notes, or spaces... (Ctrl+K)"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="cmd-results">
          {query && (
            <div className="cmd-section">
              <h4>🔍 Search Notes</h4>
              {filteredTasks.length > 0 ? filteredTasks.map(t => (
                <div key={t.id} className="cmd-item" onClick={() => { setTagSearch(t.title); onClose(); }}>
                  <span>{t.emoji || '📘'}</span> {t.title}
                </div>
              )) : <div className="cmd-empty">No notes found for "{query}"</div>}
            </div>
          )}
          
          <div className="cmd-section">
            <h4>⚡ Quick Actions</h4>
            {filteredActions.map(a => (
              <div key={a.id} className="cmd-item" onClick={a.action}>
                <span>{a.emoji}</span> {a.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
