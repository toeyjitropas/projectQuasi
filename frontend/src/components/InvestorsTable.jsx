import { useState, useEffect } from 'react';
import { createInvestor, updateInvestor, deleteInvestor } from '../api/investors';
import { getEvent } from '../api/events';
import { Badge, Btn, Field } from './ui';

const fmt = d => d ? new Date().toISOString().slice(0, 10) : '';
const TODAY = new Date().toISOString().slice(0, 10);

const EMPTY = { name: '', investment: '', returnRate: '', billingDate: '', payoutDate: '' };

export default function InvestorsTable({ eventId, isMobile }) {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    getEvent(eventId).then(ev => setRows(ev.investors || [])).catch(() => {});
  }, [eventId]);

  const f = v => `฿${Number(v || 0).toLocaleString()}`;

  const totalInvested = rows.reduce((s, r) => s + Number(r.investment || 0), 0);
  const totalReturn = rows.reduce((s, r) => s + Number(r.returnAmount || 0), 0);
  const totalPayout = rows.reduce((s, r) => s + Number(r.totalPayout || 0), 0);
  const totalUnpaid = rows.filter(r => !r.isPaid).reduce((s, r) => s + Number(r.totalPayout || 0), 0);

  const startNew = () => { setForm(EMPTY); setEditing('new'); };
  const startEdit = r => { setForm({ name: r.name, investment: String(r.investment), returnRate: String(r.returnRate), billingDate: r.billingDate?.slice(0, 10) || '', payoutDate: r.payoutDate?.slice(0, 10) || '' }); setEditing(r.id); };
  const cancel = () => setEditing(null);

  const save = async () => {
    const payload = { name: form.name, investment: parseFloat(form.investment) || 0, returnRate: parseFloat(form.returnRate) || 0, billingDate: form.billingDate || null, payoutDate: form.payoutDate || null };
    if (editing === 'new') {
      const created = await createInvestor(eventId, payload);
      setRows(r => [...r, created]);
    } else {
      const updated = await updateInvestor(editing, payload);
      setRows(r => r.map(x => x.id === editing ? updated : x));
    }
    setEditing(null);
  };

  const togglePaid = async (r) => {
    const updated = await updateInvestor(r.id, { isPaid: !r.isPaid });
    setRows(rows => rows.map(x => x.id === r.id ? updated : x));
  };

  const remove = async (id) => {
    await deleteInvestor(id);
    setRows(r => r.filter(x => x.id !== id));
  };

  const previewInv = parseFloat(form.investment) || 0;
  const previewRate = parseFloat(form.returnRate) || 0;
  const previewReturn = previewInv * previewRate / 100;
  const previewPayout = previewInv + previewReturn;

  const InlineForm = () => (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--amber)44', borderRadius: 10, padding: 16, marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em', marginBottom: 12 }}>
        {editing === 'new' ? 'ADD INVESTOR' : 'EDIT INVESTOR'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <Field label="Investor Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Field label="Investment Amount (฿)" value={form.investment} type="number" onChange={e => setForm(f => ({ ...f, investment: e.target.value }))} />
        <Field label="Return Rate (%)" value={form.returnRate} type="number" onChange={e => setForm(f => ({ ...f, returnRate: e.target.value }))} />
        <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Payout Preview</span>
          <div style={{ padding: '9px 11px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 12 }}>
            {previewInv > 0 ? (
              <span>
                <span style={{ color: 'var(--muted)' }}>฿{previewInv.toLocaleString()}</span>
                <span style={{ color: 'var(--muted)' }}> + </span>
                <span style={{ color: 'var(--green)' }}>฿{previewReturn.toLocaleString()}</span>
                <span style={{ color: 'var(--muted)' }}> = </span>
                <span style={{ color: 'var(--amber)', fontWeight: 700 }}>฿{previewPayout.toLocaleString()}</span>
              </span>
            ) : <span style={{ color: 'var(--muted)' }}>—</span>}
          </div>
        </label>
        <Field label="Billing Date" value={form.billingDate} type="date" onChange={e => setForm(f => ({ ...f, billingDate: e.target.value }))} />
        <Field label="Payout Due Date" value={form.payoutDate} type="date" onChange={e => setForm(f => ({ ...f, payoutDate: e.target.value }))} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn small onClick={save}>Save</Btn>
        <Btn small variant="ghost" onClick={cancel}>Cancel</Btn>
      </div>
    </div>
  );

  const statusColor = r => r.isPaid ? 'var(--green)' : r.isOverdue ? 'var(--danger)' : 'var(--amber)';

  return (
    <div className="fu">
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Invested', val: f(totalInvested), color: 'var(--text)' },
          { label: 'Returns', val: '+' + f(totalReturn), color: 'var(--green)' },
          { label: 'Total Payout', val: f(totalPayout), color: 'var(--amber)' },
          { label: 'Unpaid', val: f(totalUnpaid), color: totalUnpaid > 0 ? 'var(--danger)' : 'var(--muted)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 14px', border: '1px solid var(--border)', flex: isMobile ? '1 1 calc(50% - 5px)' : '0 0 auto' }}>
            <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: s.color, marginTop: 2 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {editing !== 'new' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <Btn small onClick={startNew}>+ Add Investor</Btn>
        </div>
      )}

      {editing && <InlineForm />}

      {rows.length === 0 && !editing ? (
        <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--muted)', fontSize: 12 }}>No investors yet.</div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.filter(r => r.id !== editing).map(r => (
            <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, borderLeft: `3px solid ${statusColor(r)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                  {r.isOverdue && <span style={{ fontSize: 9, color: 'var(--danger)', fontWeight: 700 }}>OVERDUE</span>}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', flexShrink: 0 }}>
                  <input type="checkbox" checked={r.isPaid} onChange={() => togglePaid(r)} style={{ accentColor: 'var(--green)', width: 14, height: 14 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: r.isPaid ? 'var(--green)' : 'var(--danger)' }}>{r.isPaid ? 'PAID' : 'UNPAID'}</span>
                </label>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
                  {[
                    { label: 'Invested', val: f(r.investment), color: 'var(--text)' },
                    { label: `Return ${r.returnRate}%`, val: '+' + f(r.returnAmount), color: 'var(--green)' },
                    { label: 'Total Payout', val: f(r.totalPayout), color: 'var(--amber)' },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 12, color: s.color, marginTop: 3 }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn small variant="ghost" onClick={() => startEdit(r)}>Edit</Btn>
                <Btn small variant="danger" onClick={() => remove(r.id)}>Delete</Btn>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Investor','Investment','Rate','Return','Total Payout','Billing','Due Date','Paid',''].map(h => (
                <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.filter(r => r.id !== editing).map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none', background: r.isOverdue ? 'var(--danger)08' : 'transparent' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                    {r.isOverdue && <span style={{ fontSize: 9, color: 'var(--danger)', fontWeight: 700, display: 'block' }}>OVERDUE</span>}
                    {r.name}
                  </td>
                  <td style={{ padding: '10px 12px' }}>{f(r.investment)}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--green)' }}>{r.returnRate}%</td>
                  <td style={{ padding: '10px 12px', color: 'var(--green)', fontWeight: 600 }}>+{f(r.returnAmount)}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--amber)' }}>{f(r.totalPayout)}</td>
                  <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--muted)' }}>{r.billingDate?.slice(0, 10) || '—'}</td>
                  <td style={{ padding: '10px 12px', fontSize: 11, color: r.isOverdue ? 'var(--danger)' : 'var(--muted)', fontWeight: r.isOverdue ? 700 : 400 }}>{r.payoutDate?.slice(0, 10) || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <input type="checkbox" checked={r.isPaid} onChange={() => togglePaid(r)} style={{ accentColor: 'var(--green)', width: 15, height: 15, cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn small variant="ghost" onClick={() => startEdit(r)}>Edit</Btn>
                      <Btn small variant="danger" onClick={() => remove(r.id)}>Del</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr style={{ borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
              <td style={{ padding: '10px 12px', fontWeight: 700, fontSize: 11 }}>TOTAL</td>
              <td style={{ padding: '10px 12px', fontWeight: 600 }}>{f(totalInvested)}</td>
              <td />
              <td style={{ padding: '10px 12px', color: 'var(--green)', fontWeight: 700 }}>+{f(totalReturn)}</td>
              <td style={{ padding: '10px 12px', color: 'var(--amber)', fontWeight: 700 }}>{f(totalPayout)}</td>
              <td colSpan={4} />
            </tr></tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
