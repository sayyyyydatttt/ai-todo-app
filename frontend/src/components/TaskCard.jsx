import { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import {
  Check, Trash2, Edit3, Pin, PinOff,
  ChevronDown, ChevronUp, Sparkles,
  Calendar, Clock, Tag, MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';

const priorityConfig = {
  urgent: { label: 'Urgent', color: 'var(--priority-urgent)', class: 'badge-urgent' },
  high:   { label: 'High',   color: 'var(--priority-high)',   class: 'badge-high' },
  medium: { label: 'Medium', color: 'var(--priority-medium)', class: 'badge-medium' },
  low:    { label: 'Low',    color: 'var(--priority-low)',    class: 'badge-low' },
};

export default function TaskCard({ task, onEdit }) {
  const { toggleTask, deleteTask, pinTask, updateTask } = useTasks();
  const [expanded, setExpanded]   = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [showMenu, setShowMenu]   = useState(false);

  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  const isOverdue = task.dueDate && !task.isCompleted &&
    new Date(task.dueDate) < new Date();

  const handleDelete = async () => {
    setDeleting(true);
    await deleteTask(task._id);
  };

  const handleToggleStep = async (stepIndex) => {
    const updatedBreakdown = task.aiBreakdown.map((s, i) =>
      i === stepIndex ? { ...s, isCompleted: !s.isCompleted } : s
    );
    await updateTask(task._id, { aiBreakdown: updatedBreakdown });
  };

  return (
    <div className="glass-card animate-fade-in" style={{
      padding: '20px',
      opacity: deleting ? 0.5 : 1,
      transition: 'var(--transition)',
      borderLeft: `3px solid ${priority.color}`,
      position: 'relative',
      ...(task.isPinned && {
        borderColor: 'var(--accent-secondary)',
        boxShadow: '0 0 20px rgba(167,139,250,0.15)'
      }),
      ...(task.isCompleted && { opacity: 0.6 })
    }}>

      {/* Top Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>

        {/* Checkbox */}
        <button onClick={() => toggleTask(task._id)} style={{
          width: 22, height: 22, borderRadius: '6px', flexShrink: 0,
          border: `2px solid ${task.isCompleted ? 'var(--accent-green)' : 'var(--glass-border)'}`,
          background: task.isCompleted ? 'var(--accent-green)' : 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', transition: 'var(--transition)', marginTop: '2px'
        }}>
          {task.isCompleted && <Check size={13} color="white" strokeWidth={3} />}
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '15px', fontWeight: 600, lineHeight: 1.4,
            textDecoration: task.isCompleted ? 'line-through' : 'none',
            color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
            marginBottom: '6px'
          }}>
            {task.isPinned && (
              <Pin size={12} style={{ marginRight: '6px', color: 'var(--accent-secondary)', display: 'inline' }} />
            )}
            {task.title}
          </h3>

          {/* Badges Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span className={`badge ${priority.class}`}>
              {priority.label}
            </span>

            {task.category && task.category !== 'general' && (
              <span className="badge" style={{
                background: 'rgba(6,182,212,0.15)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(6,182,212,0.3)'
              }}>
                <Tag size={9} /> {task.category}
              </span>
            )}

            {task.dueDate && (
              <span className="badge" style={{
                background: isOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                color: isOverdue ? 'var(--accent-red)' : 'var(--text-muted)',
                border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.3)' : 'var(--glass-border)'}`
              }}>
                <Calendar size={9} />
                {format(new Date(task.dueDate), 'MMM d')}
                {isOverdue && ' • Overdue'}
              </span>
            )}

            {task.estimatedMinutes > 0 && (
              <span className="badge" style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-muted)',
                border: '1px solid var(--glass-border)'
              }}>
                <Clock size={9} /> {task.estimatedMinutes}m
              </span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p style={{
              fontSize: '13px', color: 'var(--text-secondary)',
              marginTop: '8px', lineHeight: 1.5
            }}>
              {task.description}
            </p>
          )}

          {/* AI Breakdown */}
          {task.aiBreakdown?.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <button onClick={() => setExpanded(!expanded)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--accent-secondary)', fontSize: '12px', fontWeight: 600,
                padding: 0
              }}>
                <Sparkles size={12} />
                AI Breakdown ({task.aiBreakdown.filter(s => s.isCompleted).length}/{task.aiBreakdown.length})
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {expanded && (
                <div style={{
                  marginTop: '8px', padding: '12px',
                  background: 'rgba(108,99,255,0.05)',
                  borderRadius: '8px', border: '1px solid rgba(108,99,255,0.15)',
                  display: 'flex', flexDirection: 'column', gap: '6px'
                }}>
                  {task.aiBreakdown.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => handleToggleStep(i)} style={{
                        width: 16, height: 16, borderRadius: '4px', flexShrink: 0,
                        border: `2px solid ${step.isCompleted ? 'var(--accent-green)' : 'var(--glass-border)'}`,
                        background: step.isCompleted ? 'var(--accent-green)' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {step.isCompleted && <Check size={9} color="white" strokeWidth={3} />}
                      </button>
                      <span style={{
                        fontSize: '12px',
                        color: step.isCompleted ? 'var(--text-muted)' : 'var(--text-secondary)',
                        textDecoration: step.isCompleted ? 'line-through' : 'none'
                      }}>
                        {step.step}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
              {task.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--glass-border)'
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button onClick={() => pinTask(task._id)} title={task.isPinned ? 'Unpin' : 'Pin'}
            className="btn btn-ghost" style={{ padding: '6px', borderRadius: '8px' }}>
            {task.isPinned
              ? <PinOff size={14} style={{ color: 'var(--accent-secondary)' }} />
              : <Pin size={14} />}
          </button>
          <button onClick={() => onEdit(task)} title="Edit"
            className="btn btn-ghost" style={{ padding: '6px', borderRadius: '8px' }}>
            <Edit3 size={14} />
          </button>
          <button onClick={handleDelete} title="Delete"
            className="btn btn-danger" style={{ padding: '6px', borderRadius: '8px' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}