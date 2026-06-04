export const sc = s => ({ confirmed: '#3ecf82', draft: '#5a6282', completed: '#f0a83c' }[s] || '#5a6282');
export const sz = s => ({ S: '#5a6282', M: '#4a9edd', L: '#f0a83c', XL: '#e05c5c' }[s] || '#5a6282');

export const Badge = ({ label, color }) => (
  <span style={{
    display: 'inline-block', padding: '2px 7px', borderRadius: 99, fontSize: 10,
    fontWeight: 700, letterSpacing: '0.05em', background: color + '22', color,
    border: `1px solid ${color}44`,
  }}>{label}</span>
);

export const Btn = ({ children, onClick, variant = 'primary', small, full, type = 'button' }) => {
  const v = {
    primary: { background: 'var(--amber)', color: '#0d0f14', border: 'none' },
    ghost:   { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' },
    active:  { background: 'var(--amber)22', color: 'var(--amber)', border: '1px solid var(--amber)55' },
    danger:  { background: 'var(--danger)1a', color: 'var(--danger)', border: '1px solid var(--danger)44' },
    success: { background: 'var(--green)1a', color: 'var(--green)', border: '1px solid var(--green)44' },
  };
  return (
    <button type={type} onClick={onClick} style={{
      ...v[variant], borderRadius: 'var(--r)', cursor: 'pointer',
      padding: small ? '5px 11px' : '9px 18px',
      fontSize: small ? 11 : 12, fontWeight: 600,
      width: full ? '100%' : 'auto', transition: 'opacity 120ms', flexShrink: 0,
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >{children}</button>
  );
};

export const Field = ({ label, value, onChange, type = 'text', readOnly, options, rows }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
    {options ? (
      <select value={value} onChange={onChange} style={{
        background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
        padding: '9px 11px', color: 'var(--text)', fontSize: 12, outline: 'none',
      }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    ) : rows ? (
      <textarea rows={rows} value={value} onChange={onChange} style={{
        background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
        padding: '9px 11px', color: 'var(--text)', fontSize: 12, resize: 'vertical', outline: 'none', fontFamily: 'var(--mono)',
      }} />
    ) : (
      <input type={type} value={value ?? ''} onChange={onChange || (() => {})} readOnly={readOnly} style={{
        background: readOnly ? 'var(--bg)' : 'var(--surface2)',
        border: '1px solid var(--border)', borderRadius: 'var(--r)',
        padding: '9px 11px', color: readOnly ? 'var(--muted)' : 'var(--text)',
        fontSize: 12, outline: 'none', width: '100%',
      }} />
    )}
  </label>
);
