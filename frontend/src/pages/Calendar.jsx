import { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import {
  ChevronLeft, ChevronRight, Calendar as CalIcon
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
         isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';

export default function CalendarView() {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart  = startOfMonth(currentDate);
  const monthEnd    = endOfMonth(currentDate);
  const calStart    = startOfWeek(monthStart);
  const calEnd      = endOfWeek(monthEnd);
  const allDays     = eachDayOfInterval({ start: calStart, end: calEnd });

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1));

  const getTasksForDay = (day) =>
    tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));

  const selectedTasks = getTasksForDay(selectedDate);

  const priorityColors = {
    urgent: '#ef4444', high: '#f59e0b',
    medium: '#6c63ff', low:  '#10b981'
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>
        📅 Calendar View
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>

        {/* ── Calendar Grid ── */}
        <div className="glass-card" style={{ padding: '24px' }}>

          {/* Month Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button onClick={prevMonth} className="btn btn-ghost" style={{ padding: '8px', borderRadius: '10px' }}>
              <ChevronLeft size={18} />
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button onClick={nextMonth} className="btn btn-ghost" style={{ padding: '8px', borderRadius: '10px' }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day Names */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px' }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{
                textAlign: 'center', fontSize: '12px', fontWeight: 600,
                color: 'var(--text-muted)', padding: '8px 0',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>{d}</div>
            ))}
          </div>

          {/* Day Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {allDays.map(day => {
              const dayTasks    = getTasksForDay(day);
              const isSelected  = isSameDay(day, selectedDate);
              const isThisMonth = isSameMonth(day, currentDate);
              const todayDay    = isToday(day);

              return (
                <button key={day.toString()} onClick={() => setSelectedDate(day)} style={{
                  padding: '8px 4px', borderRadius: '10px', border: 'none',
                  cursor: 'pointer', minHeight: '60px', textAlign: 'center',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(108,99,255,0.4), rgba(167,139,250,0.3))'
                    : todayDay
                      ? 'rgba(108,99,255,0.15)'
                      : 'transparent',
                  border: isSelected
                    ? '1px solid var(--accent-primary)'
                    : todayDay
                      ? '1px solid rgba(108,99,255,0.4)'
                      : '1px solid transparent',
                  transition: 'var(--transition)',
                  opacity: isThisMonth ? 1 : 0.3
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--glass-hover)';
                }}
                onMouseLeave={e => {
                  if (!isSelected && !todayDay) e.currentTarget.style.background = 'transparent';
                  else if (!isSelected && todayDay) e.currentTarget.style.background = 'rgba(108,99,255,0.15)';
                }}>
                  <span style={{
                    fontSize: '14px', fontWeight: todayDay ? 700 : 400,
                    color: isSelected ? 'white' : isThisMonth ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}>
                    {format(day, 'd')}
                  </span>

                  {/* Task Dots */}
                  {dayTasks.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {dayTasks.slice(0, 3).map((t, i) => (
                        <div key={i} style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: priorityColors[t.priority] || 'var(--accent-primary)'
                        }} />
                      ))}
                      {dayTasks.length > 3 && (
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>+{dayTasks.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Selected Day Tasks ── */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CalIcon size={16} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>
              {format(selectedDate, 'MMM d, yyyy')}
            </h3>
            {isToday(selectedDate) && (
              <span style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                background: 'rgba(108,99,255,0.2)', color: 'var(--accent-secondary)',
                fontWeight: 600
              }}>Today</span>
            )}
          </div>

          {selectedTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗓️</div>
              <p style={{ fontSize: '13px' }}>No tasks due on this day</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedTasks.map(task => (
                <div key={task._id} style={{
                  padding: '12px', borderRadius: '10px',
                  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  borderLeft: `3px solid ${priorityColors[task.priority]}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: task.isCompleted ? 'var(--accent-green)' : priorityColors[task.priority]
                    }} />
                    <span style={{
                      fontSize: '13px', fontWeight: 500,
                      textDecoration: task.isCompleted ? 'line-through' : 'none',
                      color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)'
                    }}>
                      {task.title}
                    </span>
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                      background: `${priorityColors[task.priority]}20`,
                      color: priorityColors[task.priority]
                    }}>
                      {task.priority}
                    </span>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                      background: 'var(--glass-bg)', color: 'var(--text-muted)'
                    }}>
                      {task.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}