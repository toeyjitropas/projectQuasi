import { useState, useEffect } from 'react';
import { createInvestor, updateInvestor, deleteInvestor } from '../api/investors';
import { getEvent } from '../api/events';
import { getInvestorMasters } from '../api/config';
import { Badge, Btn, Field } from './ui';
import { useAuth } from '../context/AuthContext';

const EMPTY = { name: '', investment: '', returnRate: '', billingDate: '', payoutDate: '', paidDate: '' };

export default function InvestorsTable({ eventId, isMobile }) {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [masters, setMasters] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    getEvent(eventId).then(ev => setRows(ev.investors || [])).catch(() => {});
    getInvestorMasters().then(setMasters).catch(() => {});
  }, [eventId]);

  const f = v => `฿${Number(v || 0).toLocaleString()}`;

  const totalInvested = rows.reduce((s, r) => s + Number(r.investment  || 0), 0);
  const totalReturn   = rows.reduce((s, r) => s + Number(r.returnAmount || 0), 0);
  const totalPayout   = rows.reduce((s, r) => s + Number(r.totalPayout  || 0), 0);
  const totalUnpaid   = rows.filter(r => !r.isPaid).reduce((s, r) => s + Number(r.totalPayout || 0), 0);

  const startNew  = () => { setForm(EMPTY); setEditing('new'); };
  const startEdit = r => {
    setForm({
      name:        r.name,
      investment:  String(r.investment),
      returnRate:  String(r.returnRate),
      billingDate: r.billingDate?.slice(0, 10) || '',
      payoutDate:  r.payoutDate?.slice(0, 10)  || '',
      paidDate:    r.paidDate?.slice(0, 10)    || '',
    });
    setEditing(r.id);
  };
  const cancel = () => setEditing(null);

  const handleInvestorSelect = (e) => {
    const name = e.target.value;
    const master = masters.find(m => m.name === name);
    setForm(f => ({
      ...f,
      name,
      ...(master && {
        investment: master.defaultInvestment != null ? String(master.defaultInvestment) : f.investment,
        returnRate: master.defaultReturnRate  != null ? String(master.defaultReturnRate)  : f.returnRate,
      }),
    }));
  };

  const save = async () => {
    const payload = {
      name:        form.name,
      investment:  parseFloat(form.investment) || 0,
      returnRate:  parseFloat(form.returnRate)  || 0,
      billingDate: form.billingDate || null,
      payoutDate:  form.payoutDate  || null,
      paidDate:    form.paidDate    || null,
    };
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
    const nowPaying = !r.isPaid;
    const updated = await updateInvestor(r.id, {
      isPaid: nowPaying,
      ...(nowPaying && !r.paidDate ? { paidDate: new Date().toISOString().slice(0, 10) } : {}),
    });
    setRows(rows => rows.map(x => x.id === r.id ? updated : x));
  };

  const remove = async (id) => {
    await deleteInvestor(id);
    setRows(r => r.filter(x => x.id !== id));
  };

  const previewInv    = parseFloat(form.investment) || 0;
  const previewRate   = parseFloat(form.returnRate)  || 0;
  const previewReturn = previewInv * previewRate / 100;
  const previewPayout = previewInv + previewReturn;

  const statusColor = r => r.isPaid ? 'var(--green)' : r.isOverdue ? 'var(--danger)' : 'var(--amber)';

  const formContent = (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--amber)44', borderRadius: 10, padding: isMobile ? 20 : 16, marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em', marginBottom: 14 }}>
        {editing === 'new' ? 'ADD INVESTOR' : 'EDIT INVESTOR'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 16 : 10, marginBottom: 16 }}>
        <Field mobile={isMobile} label="Investor Name" value={form.name}
          options={[{ value: '', label: '— Select investor —' }, ...masters.map(m => ({ value: m.name, label: m.name }))]}
          onChange={handleInvestorSelect} />
        <Field mobile={isMobile} label="Investment Amount (฿)" value={form.investment} type="number"
          onChange={e => setForm(f => ({ ...f, investment: e.target.value }))} />
        <Field mobile={isMobile} label="Return Rate (%)" value={form.returnRate} type="number"
          onChange={e => setForm(f => ({ ...f, returnRate: e.target.value }))} />
        <label style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 7 : 5 }}>
          <span style={{ fontSize: isMobile ? 11 : 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Payout Preview</span>
          <div style={{ padding: isMobile ? '12px 14px' : '9px 11px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: isMobile ? 15 : 12 }}>
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
        <Field mobile={isMobile} label="Billing Date" value={form.billingDate} type="date"
          onChange={e => setForm(f => ({ ...f, billingDate: e.target.value }))} />
        <Field mobile={isMobile} label="Payout Due Date" value={form.payoutDate} type="date"
          onChange={e => setForm(f => ({ ...f, payoutDate: e.target.value }))} />
        <Field mobile={isMobile} label="Paid Date" value={form.paidDate} type="date"
          onChange={e => setForm(f => ({ ...f, paidDate: e.target.value }))} />
      </div>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 8 }}>
        <Btn small={!isMobile} full={isMobile} onClick={save}>Save</Btn>
        <Btn small={!isMobile} full={isMobile} variant="ghost" onClick={cancel}>Cancel</Btn>
      </div>
    </div>
  );

  return (
    <div className="fu">
      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Invested',     val: f(totalInvested), color: 'var(--text)'   },
          { label: 'Returns',      val: '+' + f(totalReturn), color: 'var(--green)' },
          { label: 'Total Payout', val: f(totalPayout),   color: 'var(--amber)'  },
          { label: 'Unpaid',       val: f(totalUnpaid),   color: totalUnpaid > 0 ? 'var(--danger)' : 'var(--muted)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 14px', border: '1px solid var(--border)', flex: isMobile ? '1 1 calc(50% - 5px)' : '0 0 auto' }}>
            <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: s.color, marginTop: 2 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {isAdmin && editing !== 'new' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <Btn small onClick={startNew}>+ Add Investor</Btn>
        </div>
      )}

      {editing === 'new' && formContent}

      {rows.length === 0 && !editing ? (
        <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--muted)', fontSize: 12 }}>No investors yet.</div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(r => (
            r.id === editing ? (
              <div key={r.id}>{formContent}</div>
            ) : (
              <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, borderLeft: `3px solid ${statusColor(r)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                    {r.isOverdue && <span style={{ fontSize: 9, color: 'var(--danger)', fontWeight: 700 }}>OVERDUE</span>}
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', flexShrink: 0 }}>
                    <input type="checkbox" checked={r.isPaid} onChange={isAdmin ? () => togglePaid(r) : undefined} style={{ accentColor: 'var(--green)', width: 16, height: 16, opacity: isAdmin ? 1 : 0.5, cursor: isAdmin ? 'pointer' : 'default' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: r.isPaid ? 'var(--green)' : 'var(--danger)' }}>{r.isPaid ? 'PAID' : 'UNPAID'}</span>
                  </label>
                </div>
                <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
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
                {r.paidDate && (
                  <div style={{ fontSize: 10, color: 'var(--green)', marginBottom: 8 }}>Paid on: {r.paidDate.slice(0, 10)}</div>
                )}
                {isAdmin && <div style={{ display: 'flex', gap: 6 }}>
                  <Btn small variant="ghost" onClick={() => startEdit(r)}>Edit</Btn>
                  <Btn small variant="danger" onClick={() => remove(r.id)}>Delete</Btn>
                </div>}
              </div>
            )
          ))}
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Investor','Investment','Rate','Return','Total Payout','Billing','Due Date','Paid On','Paid',''].map(h => (
                <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                r.id === editing ? (
                  <tr key={r.id}><td colSpan={10} style={{ padding: 0 }}>{formContent}</td></tr>
                ) : (
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
                    <td style={{ padding: '10px 12px', fontSize: 11, color: r.paidDate ? 'var(--green)' : 'var(--muted)' }}>{r.paidDate?.slice(0, 10) || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <input type="checkbox" checked={r.isPaid} onChange={isAdmin ? () => togglePaid(r) : undefined} style={{ accentColor: 'var(--green)', width: 15, height: 15, opacity: isAdmin ? 1 : 0.5, cursor: isAdmin ? 'pointer' : 'default' }} />
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {isAdmin && <div style={{ display: 'flex', gap: 6 }}>
                        <Btn small variant="ghost" onClick={() => startEdit(r)}>Edit</Btn>
                        <Btn small variant="danger" onClick={() => remove(r.id)}>Del</Btn>
                      </div>}
                    </td>
                  </tr>
                )
              ))}
            </tbody>
            <tfoot><tr style={{ borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
              <td style={{ padding: '10px 12px', fontWeight: 700, fontSize: 11 }}>TOTAL</td>
              <td style={{ padding: '10px 12px', fontWeight: 600 }}>{f(totalInvested)}</td>
              <td />
              <td style={{ padding: '10px 12px', color: 'var(--green)', fontWeight: 700 }}>+{f(totalReturn)}</td>
              <td style={{ padding: '10px 12px', color: 'var(--amber)', fontWeight: 700 }}>{f(totalPayout)}</td>
              <td colSpan={5} />
            </tr></tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
