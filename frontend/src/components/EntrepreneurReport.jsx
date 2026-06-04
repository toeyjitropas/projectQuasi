import { useState, useEffect, useMemo } from 'react';
import { getInvestorReport } from '../api/reports';
import { Badge } from './ui';

const f = v => `฿${Number(v || 0).toLocaleString()}`;

const statusColor = r => r.isPaid ? 'var(--green)' : r.isOverdue ? 'var(--danger)' : 'var(--amber)';
const statusLabel = r => r.isPaid ? 'Paid' : r.isOverdue ? 'Overdue' : 'Pending';

const TH = ['Investor','Event','Investment','Rate','Return','Payout','Billing','Due Date','Status'];

export default function EntrepreneurReport({ isMobile }) {
  const [rows, setRows] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [groupBy, setGroupBy] = useState('investor');

  useEffect(() => {
    getInvestorReport({ name: filterName || undefined, status: filterStatus }).then(setRows).catch(() => {});
  }, [filterName, filterStatus]);

  const totInvested = rows.reduce((s, r) => s + Number(r.investment || 0), 0);
  const totReturn = rows.reduce((s, r) => s + Number(r.returnAmount || 0), 0);
  const totPayout = rows.reduce((s, r) => s + Number(r.totalPayout || 0), 0);
  const totUnpaid = rows.filter(r => !r.isPaid).reduce((s, r) => s + Number(r.totalPayout || 0), 0);
  const totOverdue = rows.filter(r => r.isOverdue).reduce((s, r) => s + Number(r.totalPayout || 0), 0);

  const byInvestor = useMemo(() => {
    const map = {};
    rows.forEach(r => { if (!map[r.name]) map[r.name] = []; map[r.name].push(r); });
    return map;
  }, [rows]);

  const byEvent = useMemo(() => {
    const map = {};
    rows.forEach(r => {
      const eid = r.eventId;
      if (!map[eid]) map[eid] = { eventName: r.event?.name || '—', eventDate: r.event?.date?.slice(0, 10) || '—', rows: [] };
      map[eid].rows.push(r);
    });
    return map;
  }, [rows]);

  const InvCard = ({ r }) => (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, borderLeft: `3px solid ${statusColor(r)}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 12 }}>{r.name}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{r.event?.name || '—'} · {r.event?.date?.slice(0, 10) || '—'}</div>
        </div>
        <Badge label={statusLabel(r)} color={statusColor(r)} />
      </div>
      <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, textAlign: 'center' }}>
          {[
            { label: 'Invested', val: f(r.investment), color: 'var(--text)' },
            { label: `+${r.returnRate}%`, val: f(r.returnAmount), color: 'var(--green)' },
            { label: 'Payout', val: f(r.totalPayout), color: 'var(--amber)' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontWeight: 700, fontSize: 11, color: s.color, marginTop: 2 }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: 10, color: 'var(--muted)', gap: 4 }}>
        <span>Bill: {r.billingDate?.slice(0, 10) || '—'}</span>
        <span style={{ color: r.isOverdue ? 'var(--danger)' : 'var(--muted)' }}>Due: {r.payoutDate?.slice(0, 10) || '—'}</span>
      </div>
    </div>
  );

  const TableRows = ({ items }) => items.map((r, i) => (
    <tr key={r.id} style={{ borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none', background: r.isOverdue ? 'var(--danger)08' : 'transparent' }}>
      <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 12 }}>{r.name}</td>
      <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--muted)' }}>
        <div>{r.event?.name || '—'}</div>
        <div style={{ fontSize: 9, marginTop: 1 }}>{r.event?.date?.slice(0, 10) || '—'}</div>
      </td>
      <td style={{ padding: '10px 12px' }}>{f(r.investment)}</td>
      <td style={{ padding: '10px 12px', color: 'var(--green)' }}>{r.returnRate}%</td>
      <td style={{ padding: '10px 12px', color: 'var(--green)', fontWeight: 600 }}>+{f(r.returnAmount)}</td>
      <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--amber)' }}>{f(r.totalPayout)}</td>
      <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--muted)' }}>{r.billingDate?.slice(0, 10) || '—'}</td>
      <td style={{ padding: '10px 12px', fontSize: 11, color: r.isOverdue ? 'var(--danger)' : 'var(--muted)', fontWeight: r.isOverdue ? 700 : 400 }}>{r.payoutDate?.slice(0, 10) || '—'}</td>
      <td style={{ padding: '10px 12px' }}><Badge label={statusLabel(r)} color={statusColor(r)} /></td>
    </tr>
  ));

  return (
    <div className="fu">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Invested', val: f(totInvested), color: 'var(--text)' },
          { label: 'Total Return', val: '+' + f(totReturn), color: 'var(--green)' },
          { label: 'Total Payout', val: f(totPayout), color: 'var(--amber)' },
          { label: 'Unpaid', val: f(totUnpaid), color: totUnpaid > 0 ? 'var(--danger)' : 'var(--muted)' },
          { label: 'Overdue', val: f(totOverdue), color: totOverdue > 0 ? 'var(--danger)' : 'var(--muted)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 14px', border: '1px solid var(--border)', flex: isMobile ? '1 1 calc(50% - 4px)' : '0 0 auto' }}>
            <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: s.color, marginTop: 2 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: isMobile ? '1 1 100%' : '1 1 180px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Search Investor</span>
            <input value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="Name…" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '8px 11px', color: 'var(--text)', fontSize: 12, outline: 'none', fontFamily: 'var(--mono)' }} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {[['all','All'],['paid','Paid'],['unpaid','Pending'],['overdue','Overdue']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)} style={{ padding: '8px 12px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, flexShrink: 0, background: filterStatus === v ? 'var(--amber)' : 'var(--surface2)', color: filterStatus === v ? '#0d0f14' : 'var(--muted)' }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'flex-end' }}>
          {[['investor','By Investor'],['event','By Event'],['flat','Flat']].map(([v, l]) => (
            <button key={v} onClick={() => setGroupBy(v)} style={{ padding: '8px 12px', borderRadius: 'var(--r)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 11, fontWeight: 600, flexShrink: 0, background: groupBy === v ? 'var(--surface2)' : 'transparent', color: groupBy === v ? 'var(--amber)' : 'var(--muted)' }}>{l}</button>
          ))}
        </div>
      </div>

      {rows.length === 0 && <div style={{ textAlign: 'center', padding: 36, color: 'var(--muted)', fontSize: 12 }}>No records match.</div>}

      {rows.length > 0 && groupBy === 'investor' && (
        isMobile ? (
          Object.entries(byInvestor).map(([name, items]) => (
            <div key={name} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 12 }}>{name}</span>
                <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 700 }}>{f(items.reduce((s, r) => s + Number(r.totalPayout || 0), 0))} total</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{items.map(r => <InvCard key={r.id} r={r} />)}</div>
            </div>
          ))
        ) : (
          Object.entries(byInvestor).map(([name, items]) => (
            <div key={name} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: 'var(--surface2)', borderRadius: '8px 8px 0 0', border: '1px solid var(--border)', borderBottom: 'none' }}>
                <span style={{ fontWeight: 700, fontSize: 12 }}>{name}</span>
                <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
                  <span style={{ color: 'var(--muted)' }}>{items.length} event{items.length > 1 ? 's' : ''}</span>
                  <span style={{ color: 'var(--green)' }}>+{f(items.reduce((s, r) => s + Number(r.returnAmount || 0), 0))} return</span>
                  <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{f(items.reduce((s, r) => s + Number(r.totalPayout || 0), 0))} payout</span>
                </div>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>{TH.map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
                  <tbody><TableRows items={items} /></tbody>
                </table>
              </div>
            </div>
          ))
        )
      )}

      {rows.length > 0 && groupBy === 'event' && (
        isMobile ? (
          Object.entries(byEvent).map(([eid, g]) => (
            <div key={eid} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 8 }}>
                <div><div style={{ fontWeight: 700, fontSize: 12 }}>{g.eventName}</div><div style={{ fontSize: 10, color: 'var(--muted)' }}>{g.eventDate}</div></div>
                <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 700 }}>{f(g.rows.reduce((s, r) => s + Number(r.totalPayout || 0), 0))} total</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{g.rows.map(r => <InvCard key={r.id} r={r} />)}</div>
            </div>
          ))
        ) : (
          Object.entries(byEvent).map(([eid, g]) => (
            <div key={eid} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: 'var(--surface2)', borderRadius: '8px 8px 0 0', border: '1px solid var(--border)', borderBottom: 'none' }}>
                <div><span style={{ fontWeight: 700, fontSize: 12 }}>{g.eventName}</span><span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 10 }}>{g.eventDate}</span></div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
                  <span style={{ color: 'var(--muted)' }}>{g.rows.length} investor{g.rows.length > 1 ? 's' : ''}</span>
                  <span style={{ color: 'var(--green)' }}>+{f(g.rows.reduce((s, r) => s + Number(r.returnAmount || 0), 0))} return</span>
                  <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{f(g.rows.reduce((s, r) => s + Number(r.totalPayout || 0), 0))} payout</span>
                </div>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>{TH.map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
                  <tbody><TableRows items={g.rows} /></tbody>
                </table>
              </div>
            </div>
          ))
        )
      )}

      {rows.length > 0 && groupBy === 'flat' && (
        isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{rows.map(r => <InvCard key={r.id} r={r} />)}</div>
        ) : (
          <div style={{ background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>{TH.map(h => <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
              <tbody><TableRows items={rows} /></tbody>
              <tfoot><tr style={{ borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
                <td colSpan={2} style={{ padding: '10px 12px', fontWeight: 700, fontSize: 11 }}>TOTAL</td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{f(totInvested)}</td>
                <td />
                <td style={{ padding: '10px 12px', color: 'var(--green)', fontWeight: 700 }}>+{f(totReturn)}</td>
                <td style={{ padding: '10px 12px', color: 'var(--amber)', fontWeight: 700 }}>{f(totPayout)}</td>
                <td colSpan={3} />
              </tr></tfoot>
            </table>
          </div>
        )
      )}
    </div>
  );
}
