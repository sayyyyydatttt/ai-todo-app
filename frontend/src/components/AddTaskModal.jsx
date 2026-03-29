import { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { X, Sparkles, Mic, MicOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddTaskModal({ onClose, editTask = null }) {
  const { createTask, updateTask, analyzeWithAI } = useTasks();

  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    category: 'general', tags: '', dueDate: '', estimatedMinutes: 30
  });
  const [loading,     setLoading]     = useState(false);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiAnalysis,  setAiAnalysis]  = useState(null);
  const [listening,   setListening]   = useState(false);

  // Prefill form if editing
  useEffect(() => {
    if (editTask) {
      setForm({
        title:             editTask.title || '',
        description:       editTask.description || '',
        priority:          editTask.priority || 'medium',
        category:          editTask.category || 'general',
        tags:              editTask.tags?.join(', ') || '',
        dueDate:           editTask.dueDate ? editTask.dueDate.split('T')[0] : '',
        estimatedMinutes:  editTask.estimatedMinutes || 30
      });
    }
  }, [editTask]);

  // AI Analysis
  const handleAIAnalyze = async () => {
    if (!form.title.trim()) { toast.error('Enter a title first!'); return; }
    setAiLoading(true);
    try {
      const analysis = await analyzeWithAI(form.title, form.description);
      setAiAnalysis(analysis);
      setForm(prev => ({
        ...prev,
        priority: analysis.suggestedPriority,
        estimatedMinutes: analysis.estimatedMinutes,
        dueDate: analysis.suggestedDeadline
          ? new Date(analysis.suggestedDeadline).toISOString().split('T')[0]
          : prev.dueDate
      }));
      toast.success('✨ AI analysis complete!');
    } catch {
      toast.error('AI analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  // Voice Input
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart  = () => setListening(true);
    recognition.onend    = () => setListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setForm(prev => ({ ...prev, title: transcript }));
      toast.success(`🎤 Got it: "${transcript}"`);
    };
    recognition.onerror = () => {
      setListening(false);
      toast.error('Voice input failed. Try again.');
    };
    recognition.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Task title is required'); return; }
    setLoading(true);
    try {
      const taskData = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || null,
        aiBreakdown: aiAnalysis?.breakdown || (editTask?.aiBreakdown || [])
      };

      if (editTask) {
        await updateTask(editTask._id, taskData);
        toast.success('Task updated! ✅');
      } else {
        await createTask(taskData);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }} onClick={onClose}>
      <div className="glass-strong animate-fade-in" style={{
        width: '100%', maxWidth: '560px', padding: '32px',
        maxHeight: '90vh', overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
            {editTask ? '✏️ Edit Task' : '➕ New Task'}
          </h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px', borderRadius: '8px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Title + Voice */}
          <div style={{ position: 'relative' }}>
            <input className="input" placeholder="Task title..." value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              style={{ paddingRight: '44px', fontSize: '15px' }} />
            <button type="button" onClick={handleVoiceInput} style={{
              position: 'absolute', right: '10px', top: '50%',
              transform: 'translateY(-50%)', background: 'none', border: 'none',
              cursor: 'pointer', color: listening ? 'var(--accent-red)' : 'var(--text-muted)',
              transition: 'var(--transition)'
            }}>
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>

          {/* Description */}
          <textarea className="input" placeholder="Description (optional)..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3} style={{ resize: 'vertical', lineHeight: 1.5 }} />

          {/* AI Analyze Button */}
          <button type="button" onClick={handleAIAnalyze} disabled={aiLoading}
            className="btn btn-ghost" style={{
              justifyContent: 'center', borderColor: 'rgba(108,99,255,0.4)',
              color: 'var(--accent-secondary)'
            }}>
            {aiLoading
              ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</>
              : <><Sparkles size={14} /> Auto-detect Priority & Deadline with AI</>}
          </button>

          {/* AI Analysis Result */}
          {aiAnalysis && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(108,99,255,0.1)',
              border: '1px solid rgba(108,99,255,0.25)',
              fontSize: '13px', color: 'var(--text-secondary)'
            }}>
              <p style={{ color: 'var(--accent-secondary)', fontWeight: 600, marginBottom: '4px' }}>
                ✨ AI Suggestion Applied
              </p>
              <p>{aiAnalysis.tip}</p>
              <p style={{ marginTop: '4px' }}>
                📋 {aiAnalysis.breakdown?.length} steps generated
              </p>
            </div>
          )}

          {/* Priority + Category Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Priority
              </label>
              <select className="input" value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">🟢 Low</option>
                <option value="medium">🔵 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Category
              </label>
              <select className="input" value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="general">📌 General</option>
                <option value="study">📚 Study</option>
                <option value="work">💼 Work</option>
                <option value="personal">👤 Personal</option>
                <option value="health">❤️ Health</option>
                <option value="project">🚀 Project</option>
              </select>
            </div>
          </div>

          {/* Due Date + Time Estimate */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Due Date
              </label>
              <input className="input" type="date" value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Est. Minutes
              </label>
              <input className="input" type="number" min="5" max="480"
                value={form.estimatedMinutes}
                onChange={e => setForm({ ...form, estimatedMinutes: Number(e.target.value) })} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Tags (comma separated)
            </label>
            <input className="input" placeholder="e.g. react, assignment, urgent"
              value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
              {loading ? 'Saving...' : editTask ? '💾 Save Changes' : '✅ Create Task'}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}