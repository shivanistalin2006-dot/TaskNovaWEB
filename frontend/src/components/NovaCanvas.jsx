import React, { useState, useRef } from 'react';
import TaskItem from './TaskItem.jsx';

export default function NovaCanvas({ tasks, onUpdate, onDelete }) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  return (
    <div 
      className="canvas-container" 
      onPointerDown={e => {
        if (e.target.className === 'canvas-container' || e.target.className === 'canvas-board') {
          setIsPanning(true);
          e.target.setPointerCapture(e.pointerId);
        }
      }}
      onPointerUp={e => {
        setIsPanning(false);
        if (e.target.hasPointerCapture(e.pointerId)) {
          e.target.releasePointerCapture(e.pointerId);
        }
      }}
      onPointerMove={e => {
        if (isPanning) {
          setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
        }
      }}
    >
      <div className="canvas-board" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
        {tasks.map((task, i) => (
          <DraggableTask 
            key={task.id} 
            task={task} 
            index={i}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
      <div className="canvas-hint">Canvas Mode: Drag empty space to pan. Drag notes to arrange.</div>
    </div>
  );
}

function DraggableTask({ task, index, onUpdate, onDelete }) {
  const initialX = task.canvasX ?? (index % 4) * 340 + 50;
  const initialY = task.canvasY ?? Math.floor(index / 4) * 320 + 50;

  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div 
      className="draggable-task-wrapper"
      style={{ left: pos.x, top: pos.y, zIndex: isDragging ? 1000 : 10 }}
    >
      <div 
        className="drag-handle" 
        onPointerDown={(e) => {
          setIsDragging(true);
          e.target.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          setIsDragging(false);
          e.target.releasePointerCapture(e.pointerId);
          if (pos.x !== initialX || pos.y !== initialY) {
            onUpdate(task.id, { canvasX: pos.x, canvasY: pos.y });
          }
        }}
        onPointerMove={(e) => {
          if (isDragging) {
            setPos(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
          }
        }}
      >
        <span style={{opacity: 0.5}}>⠿</span> Drag
      </div>
      <TaskItem task={task} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  );
}
