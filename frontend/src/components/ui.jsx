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

export const Field = ({ label, value, onChange, type = 'text', readOnly, options, rows, mobile }) => {
  const pad  = mobile ? '12px 14px' : '9px 11px';
  const fs   = mobile ? 16 : 12;
  const base = { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: pad, color: 'var(--text)', fontSize: fs, outline: 'none' };
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 7 : 5 }}>
      <span style={{ fontSize: mobile ? 11 : 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      {options ? (
        <select value={value} onChange={onChange} style={{ ...base, fontFamily: 'var(--mono)' }}>
          {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : rows ? (
        <textarea rows={rows} value={value} onChange={onChange} style={{ ...base, resize: 'vertical', fontFamily: 'var(--mono)' }} />
      ) : (
        <input type={type} value={value ?? ''} onChange={onChange || (() => {})} readOnly={readOnly} style={{
          ...base, width: '100%',
          background: readOnly ? 'var(--bg)' : 'var(--surface2)',
          color: readOnly ? 'var(--muted)' : 'var(--text)',
        }} />
      )}
    </label>
  );
};
