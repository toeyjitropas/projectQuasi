import { useState, useEffect } from 'react';
import client from '../api/client';
import { Badge, Field } from '../components/ui';

export default function AuditPage({ isMobile }) {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ table: '', recordId: '', from: '', to: '' });

  const load = () => {
    const params = {};
    if (filters.table) params.table = filters.table;
    if (filters.recordId) params.recordId = filters.recordId;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    client.get('/audit', { params }).then(r => setLogs(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const color = a => a === 'INSERT' ? 'var(--green)' : a === 'DELETE' ? 'var(--danger)' : 'var(--amber)';

  return (
    <div className="fu" style={{ padding: isMobile ? '16px 14px' : 32 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700 }}>Audit Log</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>All changes via Postgres triggers</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        <Field label="Table" value={filters.table} onChange={e => setFilters(f => ({ ...f, table: e.target.value }))} />
        <Field label="Record ID" value={filters.recordId} onChange={e => setFilters(f => ({ ...f, recordId: e.target.value }))} />
        <Field label="From" value={filters.from} type="date" onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
        <Field label="To" value={filters.to} type="date" onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <button onClick={load} style={{ padding: '8px 16px', borderRadius: 'var(--r)', background: 'var(--amber)', color: '#0d0f14', border: 'none', cursor: 'pointer', fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 12 }}>Apply Filters</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {logs.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No audit records.</div>}
        {logs.map(log => (
          <div key={log.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ flexShrink: 0 }}><Badge label={log.action} color={color(log.action)} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, wordBreak: 'break-all' }}>
                {log.newData ? JSON.stringify(log.newData).slice(0, 120) : log.oldData ? JSON.stringify(log.oldData).slice(0, 120) : '—'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge label={log.tableName} color="#4a9edd" />
                <span>{log.changedBy || 'system'}</span>
                <span>{new Date(log.changedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
