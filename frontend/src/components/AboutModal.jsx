import { X, Code2, Sparkles, GraduationCap, Heart } from 'lucide-react';

export default function AboutModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '20px'
    }} onClick={onClose}>

      <div className="glass-strong animate-fade-in" style={{
        width: '100%', maxWidth: '620px',
        padding: '40px', position: 'relative',
        maxHeight: '90vh', overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>

        {/* Close Button */}
        <button onClick={onClose} className="btn btn-ghost" style={{
          position: 'absolute', top: '16px', right: '16px',
          padding: '6px', borderRadius: '8px'
        }}>
          <X size={18} />
        </button>

        {/* Avatar + Name */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6c63ff, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
            fontSize: '36px', fontWeight: 800, color: 'white'
          }}>
            S
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>
            <span className="text-gradient">Suryansh Thakur</span>
          </h2>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 14px', borderRadius: '20px',
            background: 'rgba(108,99,255,0.15)',
            border: '1px solid rgba(108,99,255,0.3)',
            fontSize: '13px', color: 'var(--accent-secondary)'
          }}>
            <GraduationCap size={14} />
            B.Tech CSE — 1st Year
          </div>
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* About Paragraph */}
        <div style={{ margin: '24px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '8px', marginBottom: '12px'
          }}>
            <Sparkles size={16} color="var(--accent-secondary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>About Me</h3>
          </div>

          <p style={{
            color: 'var(--text-secondary)', lineHeight: 1.8,
            fontSize: '14px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px', padding: '16px'
          }}>
            {/* ✏️ REPLACE THIS TEXT WITH YOUR OWN PARAGRAPH */}
            Hi! I'm a first-year B.Tech Computer Science Engineering student
            with a passion for building real-world applications. This AI-powered
            Todo App was built as part of my college project to demonstrate
            full-stack development skills using modern technologies like React,
            Node.js, MongoDB, and cloud deployment. I enjoy solving problems
            through code and am always eager to learn new technologies.
          </p>
        </div>

        {/* Project Info */}
        <div style={{ margin: '24px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '8px', marginBottom: '12px'
          }}>
            <Code2 size={16} color="var(--accent-secondary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>About This Project</h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}>
            {[
              { label: 'Frontend',  value: 'React.js + Vite' },
              { label: 'Backend',   value: 'Node.js + Express' },
              { label: 'Database',  value: 'MongoDB Atlas' },
              { label: 'Auth',      value: 'JWT + bcrypt' },
              { label: 'AI Logic',  value: 'Custom NLP Engine' },
              { label: 'Deployed',  value: 'Netlify + Render' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: '12px 14px', borderRadius: '10px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                display: 'flex', flexDirection: 'column', gap: '4px'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {label}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '6px',
          marginTop: '20px', color: 'var(--text-muted)', fontSize: '13px'
        }}>
          <span>Made with</span>
          <Heart size={13} color="#ec4899" fill="#ec4899" />
          <span>for college evaluation</span>
        </div>

      </div>
    </div>
  );
}