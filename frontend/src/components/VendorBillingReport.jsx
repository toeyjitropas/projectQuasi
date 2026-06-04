import { useState, useMemo, useEffect } from 'react';
import { getVendorBilling } from '../api/reports';
import { Badge } from './ui';

const pad = n => String(n).padStart(2, '0');
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const weekOfMonth = dateStr => {
  const d = new Date(dateStr);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return Math.ceil((d.getDate() + first.getDay()) / 7);
};

export default function VendorBillingReport({ isMobile }) {
  const today = new Date();
  const [mode, setMode] = useState('month');
  const [selYear, setSelYear] = useState(today.getFullYear());
  const [selMonth, setSelMonth] = useState(today.getMonth() + 1);
  const [selDate, setSelDate] = useState(today.toISOString().slice(0, 10));
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const params = mode === 'date'
      ? { mode: 'date', date: selDate }
      : { mode: 'month', year: selYear, month: selMonth };
    getVendorBilling(params).then(setActivities).catch(() => {});
  }, [mode, selYear, selMonth, selDate]);

  const todayStr = today.toISOString().slice(0, 10);
  const grandTotal = activities.reduce((s, a) => s + Number(a.price || 0), 0);
  const unpaidTotal = activities.filter(a => !a.isPaid).reduce((s, a) => s + Number(a.price || 0), 0);
  const paidTotal = grandTotal - unpaidTotal;

  const byWeek = useMemo(() => {
    if (mode !== 'month') return null;
    const weeks = {};
    activities.forEach(a => {
      const w = weekOfMonth(a.billingDate);
      if (!weeks[w]) weeks[w] = [];
      weeks[w].push(a);
    });
    return weeks;
  }, [activities, mode]);

  const daysInMonth = new Date(selYear, selMonth, 0).getDate();
  const billedDays = useMemo(() => activities.map(a => a.billingDate?.slice(0, 10)), [activities]);

  const WeekGroup = ({ weekNum, acts }) => {
    const monthFirst = new Date(selYear, selMonth - 1, 1);
    const weekStart = new Date(selYear, selMonth - 1, 1 + (weekNum - 1) * 7 - monthFirst.getDay());
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
    const rangeLabel = `${pad(weekStart.getDate())}–${pad(Math.min(weekEnd.getDate(), daysInMonth))} ${SHORT_MONTHS[selMonth - 1]}`;
    const wTotal = acts.reduce((s, a) => s + Number(a.price || 0), 0);
    const wUnpaid = acts.filter(a => !a.isPaid).reduce((s, a) => s + Number(a.price || 0), 0);

    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: 'var(--surface2)', borderRadius: 8, marginBottom: 8, border: '1px solid var(--border)' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--amber)' }}>Week {weekNum}</span>
            <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 8 }}>{rangeLabel}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
            <span style={{ color: 'var(--green)' }}>฿{(wTotal - wUnpaid).toLocaleString()} paid</span>
            {wUnpaid > 0 && <span style={{ color: 'var(--danger)' }}>฿{wUnpaid.toLocaleString()} due</span>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: isMobile ? 0 : 8 }}>
          {acts.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)', borderLeft: `3px solid ${a.isPaid ? 'var(--green)' : 'var(--danger)'}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.vendorName}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {a.vendorRole && <Badge label={a.vendorRole} color="#4a9edd" />}
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>{a.billingDate?.slice(0, 10)}</span>
                  {a.event?.name && <span style={{ fontSize: 10, color: 'var(--muted)' }}>· {a.event.name}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>฿{Number(a.price || 0).toLocaleString()}</div>
                <Badge label={a.isPaid ? 'Paid' : 'Unpaid'} color={a.isPaid ? 'var(--green)' : 'var(--danger)'} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fu">
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[['month', 'By Month'], ['date', 'By Date']].map(([v, l]) => (
          <button key={v} onClick={() => setMode(v)} style={{
            padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
            background: mode === v ? 'var(--amber)' : 'var(--surface2)',
            color: mode === v ? '#0d0f14' : 'var(--muted)',
          }}>{l}</button>
        ))}
      </div>

      {mode === 'month' ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 10 }}>
            <button onClick={() => { setSelYear(today.getFullYear()); setSelMonth(today.getMonth() + 1); }} style={{ padding: '5px 12px', borderRadius: 99, border: '1px solid var(--amber)55', cursor: 'pointer', fontSize: 11, fontWeight: 700, flexShrink: 0, background: 'var(--amber)18', color: 'var(--amber)' }}>Today's Month</button>
            {[-1, 0, 1, 2].map(offset => {
              const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
              const y = d.getFullYear(); const m = d.getMonth() + 1;
              const active = y === selYear && m === selMonth;
              return (
                <button key={offset} onClick={() => { setSelYear(y); setSelMonth(m); }} style={{ padding: '5px 12px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, flexShrink: 0, background: active ? 'var(--amber)' : 'var(--surface2)', color: active ? '#0d0f14' : 'var(--muted)' }}>{SHORT_MONTHS[m - 1]} {y}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setSelMonth(m => { if (m === 1) { setSelYear(y => y - 1); return 12; } return m - 1; })} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', cursor: 'pointer', padding: '4px 10px', fontSize: 13 }}>‹</button>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', minWidth: 120, textAlign: 'center' }}>{MONTH_NAMES[selMonth - 1]} {selYear}</span>
            <button onClick={() => setSelMonth(m => { if (m === 12) { setSelYear(y => y + 1); return 1; } return m + 1; })} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', cursor: 'pointer', padding: '4px 10px', fontSize: 13 }}>›</button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 4 }}>
            <button onClick={() => { setSelDate(todayStr); setSelYear(today.getFullYear()); setSelMonth(today.getMonth() + 1); }} style={{ padding: '5px 12px', borderRadius: 99, border: '1px solid var(--amber)55', cursor: 'pointer', fontSize: 11, fontWeight: 700, flexShrink: 0, background: 'var(--amber)18', color: 'var(--amber)' }}>Today</button>
            {[-1, 0, 1, 2].map(offset => {
              const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
              const y = d.getFullYear(); const m = d.getMonth() + 1;
              const active = y === selYear && m === selMonth;
              return (
                <button key={offset} onClick={() => { setSelYear(y); setSelMonth(m); }} style={{ padding: '5px 12px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, flexShrink: 0, background: active ? 'var(--blue)22' : 'var(--surface2)', color: active ? 'var(--blue)' : 'var(--muted)' }}>{SHORT_MONTHS[m - 1]} {y}</button>
              );
            })}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{SHORT_MONTHS[selMonth - 1]} {selYear} — pick a date</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = `${selYear}-${pad(selMonth)}-${pad(i + 1)}`;
              const hasBilling = billedDays.includes(d);
              const isSelected = d === selDate;
              const isTod = d === todayStr;
              return (
                <button key={d} onClick={() => setSelDate(d)} style={{
                  width: 36, height: 36, borderRadius: 'var(--r)', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: isSelected || isTod ? 700 : 400,
                  background: isSelected ? 'var(--amber)' : isTod ? 'var(--amber)22' : hasBilling ? 'var(--blue)22' : 'var(--surface2)',
                  color: isSelected ? '#0d0f14' : isTod ? 'var(--amber)' : hasBilling ? 'var(--blue)' : 'var(--muted)',
                  position: 'relative', outline: isTod && !isSelected ? '1px solid var(--amber)66' : 'none',
                }}>
                  {i + 1}
                  {hasBilling && !isSelected && <span style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: 'var(--blue)', display: 'block' }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activities.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', val: `฿${grandTotal.toLocaleString()}`, color: 'var(--text)' },
            { label: 'Paid', val: `฿${paidTotal.toLocaleString()}`, color: 'var(--green)' },
            { label: 'Unpaid', val: `฿${unpaidTotal.toLocaleString()}`, color: 'var(--danger)' },
            { label: 'Items', val: String(activities.length), color: 'var(--muted)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 14px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: s.color, marginTop: 2 }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)', fontSize: 12 }}>
          No billing records for this {mode === 'month' ? 'month' : 'date'}.
        </div>
      ) : mode === 'month' && byWeek ? (
        Object.keys(byWeek).sort((a, b) => a - b).map(w => (
          <WeekGroup key={w} weekNum={Number(w)} acts={byWeek[w]} />
        ))
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{selDate}</div>
          {activities.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--surface)', borderRadius: 9, border: '1px solid var(--border)', borderLeft: `3px solid ${a.isPaid ? 'var(--green)' : 'var(--danger)'}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a.vendorName}</div>
                {a.vendorRole && <div style={{ display: 'flex', gap: 6, marginTop: 4 }}><Badge label={a.vendorRole} color="#4a9edd" /></div>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>฿{Number(a.price || 0).toLocaleString()}</div>
                <Badge label={a.isPaid ? 'Paid' : 'Unpaid'} color={a.isPaid ? 'var(--green)' : 'var(--danger)'} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
