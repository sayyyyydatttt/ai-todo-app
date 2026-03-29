import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

export default function PomodoroTimer() {
  const [mode,      setMode]      = useState('work');   // 'work' | 'break'
  const [timeLeft,  setTimeLeft]  = useState(25 * 60);
  const [running,   setRunning]   = useState(false);
  const [sessions,  setSessions]  = useState(0);
  const intervalRef = useRef(null);

  const WORK_TIME  = 25 * 60;
  const BREAK_TIME =  5 * 60;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === 'work') {
              setSessions(s => s + 1);
              // Browser notification
              if (Notification.permission === 'granted') {
                new Notification('🍅 Pomodoro Complete!', {
                  body: 'Great work! Time for a break.'
                });
              }
              setMode('break');
              setTimeLeft(BREAK_TIME);
            } else {
              setMode('work');
              setTimeLeft(WORK_TIME);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleStart = () => {
    requestNotificationPermission();
    setRunning(true);
  };

  const handleReset = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
  };

  const switchMode = (m) => {
    setRunning(false);
    setMode(m);
    setTimeLeft(m === 'work' ? WORK_TIME : BREAK_TIME);
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');

  const progress = mode === 'work'
    ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

  const color = mode === 'work' ? 'var(--accent-primary)' : 'var(--accent-green)';

  return (
    <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
        {[
          { id: 'work',  label: 'Focus',  icon: Brain  },
          { id: 'break', label: 'Break',  icon: Coffee }
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => switchMode(id)} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 20px', borderRadius: '20px', cursor: 'pointer',
            border: `1px solid ${mode === id ? color : 'var(--glass-border)'}`,
            background: mode === id ? `${color}20` : 'transparent',
            color: mode === id ? color : 'var(--text-secondary)',
            fontSize: '14px', fontWeight: 500, transition: 'var(--transition)'
          }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 32px' }}>
        <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="110" cy="110" r="100" fill="none"
            stroke="var(--glass-border)" strokeWidth="8" />
          <circle cx="110" cy="110" r="100" fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 100}`}
            strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '52px', fontWeight: 800, letterSpacing: '-2px', color }}>
            {mins}:{secs}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {mode === 'work' ? 'Focus Time' : 'Break Time'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
        <button onClick={handleReset} className="btn btn-ghost" style={{ borderRadius: '50%', width: 48, height: 48, padding: 0, justifyContent: 'center' }}>
          <RotateCcw size={18} />
        </button>
        <button onClick={running ? () => setRunning(false) : handleStart}
          className="btn btn-primary" style={{ borderRadius: '50%', width: 64, height: 64, padding: 0, justifyContent: 'center', fontSize: '20px' }}>
          {running ? <Pause size={24} /> : <Play size={24} />}
        </button>
      </div>

      {/* Sessions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {Array.from({ length: Math.max(sessions, 4) }).map((_, i) => (
          <div key={i} style={{
            width: 12, height: 12, borderRadius: '50%',
            background: i < sessions ? 'var(--accent-primary)' : 'var(--glass-border)',
            transition: 'var(--transition)'
          }} />
        ))}
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>
          {sessions} session{sessions !== 1 ? 's' : ''} completed
        </span>
      </div>
    </div>
  );
}