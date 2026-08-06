import React from 'react';

export default function HeatMap({ tasks }) {
  // Generate last 84 days (12 weeks * 7 days)
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const days = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  // Count tasks per day based on task ID (creation timestamp)
  const taskCounts = {};
  tasks.forEach(t => {
    if (!t.id) return;
    const d = new Date(t.id);
    d.setHours(0,0,0,0);
    const key = d.getTime();
    taskCounts[key] = (taskCounts[key] || 0) + 1;
  });

  const getColor = (count) => {
    if (count === 0) return 'var(--heatmap-0)';
    if (count === 1) return 'var(--heatmap-1)';
    if (count === 2) return 'var(--heatmap-2)';
    if (count === 3) return 'var(--heatmap-3)';
    return 'var(--heatmap-4)';
  }

  // To display column-wise, we chunk into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h4>Productivity Heatmap</h4>
        <span className="heatmap-total">{tasks.length} Total Notes</span>
      </div>
      <div className="heatmap-grid">
        {weeks.map((week, i) => (
          <div key={i} className="heatmap-column">
            {week.map(day => {
              const count = taskCounts[day.getTime()] || 0;
              return (
                <div 
                  key={day.getTime()} 
                  className="heatmap-cell" 
                  style={{ backgroundColor: getColor(count) }}
                  title={`${day.toDateString()}: ${count} notes`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
