import { useState, useEffect } from 'react';
import { getEventSummary, getPayoutSummary } from '../api/reports';
import { Badge, Btn, sc, sz } from '../components/ui';
import VendorBillingReport from '../components/VendorBillingReport';
import EntrepreneurReport from '../components/EntrepreneurReport';

function exportCSV(data, filename) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const rows = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export default function ReportsPage({ isMobile }) {
  const [tab, setTab] = useState('summary');
  const [events, setEvents] = useState([]);
  const [payouts, setPayouts] = useState([]);

  useEffect(() => {
    if (tab === 'summary') getEventSummary().then(setEvents).catch(() => {});
    if (tab === 'payout') getPayoutSummary().then(setPayouts).catch(() => {});
  }, [tab]);

  const totalCost = events.reduce((s, e) => s + Number(e.totalCost || 0), 0);

  return (
    <div className="fu" style={{ padding: isMobile ? '16px 14px' : 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700 }}>Reports</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Filter · Export · Print</div>
        </div>
        {!isMobile && tab === 'summary' && (
          <div className="no-print" style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" small onClick={() => window.print()}>🖨 Print</Btn>
            <Btn variant="ghost" small onClick={() => exportCSV(events, 'event-summary.csv')}>↓ CSV</Btn>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {[['summary','Event Summary'],['payout','Payout'],['vendor','Vendor Billing'],['entrepreneur','Investors']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '5px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
            fontSize: 11, fontWeight: 600,
            background: tab === id ? 'var(--amber)' : 'var(--surface2)',
            color: tab === id ? '#0d0f14' : 'var(--muted)',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'summary' && (
        isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {events.map(ev => (
              <div key={ev.id} className="fu" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, borderLeft: `3px solid ${sc(ev.status)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 12 }}>{ev.isMajor ? '★ ' : ''}{ev.name}</span>
                  <Badge label={ev.status} color={sc(ev.status)} />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  {ev.eventType && <Badge label={ev.eventType.name} color="#4a9edd" />}
                  {ev.size && <Badge label={ev.size} color={sz(ev.size)} />}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
                  <span>📅 {ev.date?.slice(0, 10) || '—'}</span>
                  <span>👥 {ev.participants || '—'}</span>
                </div>
                <div style={{ marginTop: 8, fontWeight: 700, color: 'var(--amber)', fontSize: 14 }}>฿{Number(ev.totalCost || 0).toLocaleString()}</div>
              </div>
            ))}
            <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 12 }}>TOTAL</span>
              <span style={{ fontWeight: 700, color: 'var(--amber)' }}>฿{totalCost.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Event','Type','Size','Date','Pax','Cost','Status'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {events.map((ev, i) => (
                  <tr key={ev.id} style={{ borderBottom: i < events.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 500 }}>{ev.isMajor && <span style={{ color: 'var(--amber)' }}>★ </span>}{ev.name}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--muted)', fontSize: 11 }}>{ev.eventType?.name || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>{ev.size ? <Badge label={ev.size} color={sz(ev.size)} /> : '—'}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--muted)', fontSize: 11 }}>{ev.date?.slice(0, 10) || '—'}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--muted)' }}>{ev.participants || '—'}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 600 }}>฿{Number(ev.totalCost || 0).toLocaleString()}</td>
                    <td style={{ padding: '11px 14px' }}><Badge label={ev.status} color={sc(ev.status)} /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr style={{ borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
                <td colSpan={5} style={{ padding: '10px 14px', fontWeight: 700, fontSize: 11 }}>TOTAL</td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--amber)' }}>฿{totalCost.toLocaleString()}</td>
                <td />
              </tr></tfoot>
            </table>
          </div>
        )
      )}

      {tab === 'payout' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {payouts.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No payout data.</div>}
          {payouts.map(g => (
            <div key={g.month} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{g.month}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{g.event_count} events</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--amber)' }}>฿{Number(g.total_cost || 0).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'entrepreneur' && <EntrepreneurReport isMobile={isMobile} />}
      {tab === 'vendor' && <VendorBillingReport isMobile={isMobile} />}
    </div>
  );
}
