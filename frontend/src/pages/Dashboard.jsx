import { exportAsText, exportAsPDF } from '../utils/exportTasks';
import CalendarView from './Calendar';
import { Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import PomodoroTimer from '../components/PomodoroTimer';
import {
  Plus, Search, Filter, Sparkles, BarChart2,
  CheckCircle, Clock, AlertTriangle, TrendingUp,
  Smile, Zap, Coffee, Brain
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Stats Card ──────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, glow }) {
  return (
    <div className="glass-card" style={{
      padding: '20px', display: 'flex', alignItems: 'center', gap: '16px',
      ...(glow && { boxShadow: `0 0 20px ${color}30` })
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '14px', flexShrink: 0,
        background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <p style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</p>
      </div>
    </div>
  );
}

// ── Mood Selector ────────────────────────────────────
const moods = [
  { id: 'productive', label: 'Productive', icon: Zap,    color: '#f59e0b' },
  { id: 'lazy',       label: 'Lazy',       icon: Coffee, color: '#6c63ff' },
  { id: 'stressed',   label: 'Stressed',   icon: Brain,  color: '#ef4444' },
  { id: 'balanced',   label: 'Balanced',   icon: Smile,  color: '#10b981' },
];

export default function Dashboard() {
  const { tasks, stats, loading, filters, setFilters, fetchTasks, getMoodSuggestions } = useTasks();
  const { user } = useAuth();

  const [activePage,    setActivePage]    = useState('dashboard');
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [editTask,      setEditTask]      = useState(null);
  const [searchInput,   setSearchInput]   = useState('');
  const [moodData,      setMoodData]      = useState(null);
  const [loadingMood,   setLoadingMood]   = useState(false);
  const [selectedMood,  setSelectedMood]  = useState(null);

  // Load tasks on mount and filter change
  useEffect(() => { fetchTasks(); }, []);

  // Search with debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
      fetchTasks({ search: searchInput });
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleMood = async (moodId) => {
    setSelectedMood(moodId);
    setLoadingMood(true);
    try {
      const data = await getMoodSuggestions(moodId);
      setMoodData(data);
    } catch {
      toast.error('Failed to get mood suggestions');
    } finally {
      setLoadingMood(false);
    }
  };

  const handleEditTask = (task) => { setEditTask(task); setShowAddModal(true); };
  const handleCloseModal = () => { setShowAddModal(false); setEditTask(null); fetchTasks(); };

  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Filter tasks for display
  const displayTasks = tasks.filter(t => {
    if (activePage === 'pinned')    return t.isPinned;
    if (activePage === 'tasks')     return true;
    return true;
  });

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="main-content">

        {/* ── POMODORO PAGE ── */}
        {activePage === 'pomodoro' && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>
              ⏱️ Pomodoro Timer
            </h1>
            <PomodoroTimer />
          </div>
        )}

        {/* ── CALENDAR PAGE ── */}
{activePage === 'calendar' && (
  <CalendarView />
)}

        {/* ── STATS PAGE ── */}
        {activePage === 'stats' && (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>
              📊 Statistics
            </h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <StatCard icon={CheckCircle} label="Completed"    value={stats.completed || 0} color="var(--accent-green)"   glow />
              <StatCard icon={Clock}       label="Pending"      value={stats.pending || 0}   color="var(--accent-primary)" />
              <StatCard icon={AlertTriangle} label="High Priority" value={stats.high || 0}   color="var(--priority-high)"  />
              <StatCard icon={TrendingUp}  label="Completion %" value={`${completionRate}%`} color="var(--accent-cyan)"    />
            </div>

            {/* Progress Bar */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
                Overall Progress
              </h3>
              <div style={{ background: 'var(--glass-bg)', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '8px',
                  background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                  width: `${completionRate}%`, transition: 'width 1s ease'
                }} />
              </div>
              <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {stats.completed || 0} of {stats.total || 0} tasks completed ({completionRate}%)
              </p>
            </div>
          </div>
        )}

        {/* ── MAIN DASHBOARD + TASKS + PINNED ── */}
        {(activePage === 'dashboard' || activePage === 'tasks' || activePage === 'pinned') && (
          <>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 800 }}>
                {getGreeting()}, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                {stats.pending > 0
                  ? `You have ${stats.pending} pending task${stats.pending > 1 ? 's' : ''} today`
                  : '🎉 All caught up! Great work!'}
              </p>
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px', marginBottom: '28px'
            }}>
              <StatCard icon={CheckCircle}   label="Total Tasks"    value={stats.total || 0}     color="var(--accent-cyan)"    />
              <StatCard icon={TrendingUp}    label="Completed"      value={stats.completed || 0} color="var(--accent-green)"   glow />
              <StatCard icon={Clock}         label="Pending"        value={stats.pending || 0}   color="var(--accent-primary)" />
              <StatCard icon={AlertTriangle} label="High Priority"  value={(stats.urgent || 0) + (stats.high || 0)} color="var(--priority-high)" />
            </div>

            {/* Mood Selector */}
            {activePage === 'dashboard' && (
              <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Sparkles size={16} color="var(--accent-secondary)" />
                  <h3 style={{ fontSize: '15px', fontWeight: 600 }}>How are you feeling today?</h3>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {moods.map(({ id, label, icon: Icon, color }) => (
                    <button key={id} onClick={() => handleMood(id)} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
                      border: `1px solid ${selectedMood === id ? color : 'var(--glass-border)'}`,
                      background: selectedMood === id ? `${color}20` : 'var(--glass-bg)',
                      color: selectedMood === id ? color : 'var(--text-secondary)',
                      fontSize: '13px', fontWeight: 500, transition: 'var(--transition)'
                    }}>
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Mood Result */}
                {moodData && !loadingMood && (
                  <div style={{
                    marginTop: '16px', padding: '16px', borderRadius: '12px',
                    background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)'
                  }}>
                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>{moodData.message}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>💡 {moodData.tip}</p>
                    {moodData.tasks?.length > 0 && (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Suggested: {moodData.tasks.map(t => t.title).join(' • ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Search + Filter Bar */}
            <div style={{
              display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap'
            }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={15} style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)'
                }} />
                <input className="input" placeholder="Search tasks..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  style={{ paddingLeft: '38px' }} />
              </div>

              {/* Priority Filter */}
              <select className="input" style={{ width: 'auto', minWidth: '130px' }}
                value={filters.priority}
                onChange={e => { setFilters(p => ({ ...p, priority: e.target.value })); fetchTasks({ priority: e.target.value }); }}>
                <option value="">All Priorities</option>
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🔵 Medium</option>
                <option value="low">🟢 Low</option>
              </select>

              {/* Status Filter */}
              <select className="input" style={{ width: 'auto', minWidth: '130px' }}
                value={filters.status}
                onChange={e => { setFilters(p => ({ ...p, status: e.target.value })); fetchTasks({ status: e.target.value }); }}>
                <option value="">All Status</option>
                <option value="todo">📋 To Do</option>
                <option value="in-progress">⚡ In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>

              {/* Add Task Button */}
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}
                style={{ whiteSpace: 'nowrap' }}>
                <Plus size={16} /> Add Task
              </button>
            </div>

            {/* Export Buttons */}
<button className="btn btn-ghost" onClick={() => exportAsText(tasks, user?.name)}
  title="Export as Text" style={{ padding: '10px 14px' }}>
  <Download size={15} /> TXT
</button>
<button className="btn btn-ghost" onClick={() => exportAsPDF(tasks, user?.name)}
  title="Export as PDF" style={{ padding: '10px 14px' }}>
  <Download size={15} /> PDF
</button>

            {/* Task List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <div style={{
                  width: 40, height: 40, border: '3px solid rgba(108,99,255,0.3)',
                  borderTop: '3px solid #6c63ff', borderRadius: '50%',
                  animation: 'spin 1s linear infinite', margin: '0 auto 16px'
                }} />
                Loading tasks...
              </div>
            ) : displayTasks.length === 0 ? (
              <div className="glass-card" style={{
                padding: '60px', textAlign: 'center', color: 'var(--text-muted)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  {activePage === 'pinned' ? '📌' : '✅'}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  {activePage === 'pinned' ? 'No pinned tasks' : 'No tasks yet!'}
                </h3>
                <p style={{ marginBottom: '20px' }}>
                  {activePage === 'pinned'
                    ? 'Pin important tasks to see them here'
                    : 'Create your first task to get started'}
                </p>
                {activePage !== 'pinned' && (
                  <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={16} /> Create First Task
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {displayTasks.map(task => (
                  <TaskCard key={task._id} task={task} onEdit={handleEditTask} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── CATEGORIES PAGE ── */}
        {activePage === 'categories' && (
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>
              🏷️ Categories
            </h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {['general', 'study', 'work', 'personal', 'health', 'project'].map(cat => {
                const count = tasks.filter(t => t.category === cat).length;
                const icons = { general: '📌', study: '📚', work: '💼', personal: '👤', health: '❤️', project: '🚀' };
                return (
                  <div key={cat} className="glass-card" style={{ padding: '24px', textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => { setActivePage('tasks'); setFilters(p => ({ ...p, category: cat })); fetchTasks({ category: cat }); }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>{icons[cat]}</div>
                    <h3 style={{ fontWeight: 600, textTransform: 'capitalize', marginBottom: '4px' }}>{cat}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{count} task{count !== 1 ? 's' : ''}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Add/Edit Task Modal */}
      {showAddModal && (
        <AddTaskModal onClose={handleCloseModal} editTask={editTask} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}