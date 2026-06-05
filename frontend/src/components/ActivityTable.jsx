import { useState, useEffect } from 'react';
import { createActivity, updateActivity, deleteActivity } from '../api/activities';
import { getEvent } from '../api/events';
import { getVendors } from '../api/config';
import { Badge, Btn, Field } from './ui';
import { useAuth } from '../context/AuthContext';

const EMPTY = { vendorName: '', vendorRole: '', price: '', billingDate: '', constructionDate: '', completeDate: '', isPaid: false, paidDate: '' };

export default function ActivityTable({ eventId, isMobile }) {
  const { isAdmin } = useAuth();
  const [activities, setActivities] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    getEvent(eventId).then(ev => setActivities(ev.activities || [])).catch(() => {});
    getVendors().then(setVendors).catch(() => {});
  }, [eventId]);

  const total  = activities.reduce((s, a) => s + Number(a.price || 0), 0);
  const unpaid = activities.filter(a => !a.isPaid).reduce((s, a) => s + Number(a.price || 0), 0);

  const startNew  = () => { setForm(EMPTY); setEditing('new'); };
  const startEdit = a => {
    setForm({
      ...a,
      price:            String(a.price || ''),
      billingDate:      a.billingDate?.slice(0, 10)      || '',
      constructionDate: a.constructionDate?.slice(0, 10) || '',
      completeDate:     a.completeDate?.slice(0, 10)     || '',
      paidDate:         a.paidDate?.slice(0, 10)         || '',
    });
    setEditing(a.id);
  };
  const cancel = () => setEditing(null);

  const save = async () => {
    const payload = {
      ...form,
      price:            form.price ? parseFloat(form.price) : null,
      billingDate:      form.billingDate      || null,
      constructionDate: form.constructionDate || null,
      completeDate:     form.completeDate     || null,
      paidDate:         form.paidDate         || null,
    };
    if (editing === 'new') {
      const created = await createActivity(eventId, payload);
      setActivities(a => [...a, created]);
    } else {
      const updated = await updateActivity(editing, payload);
      setActivities(a => a.map(x => x.id === editing ? updated : x));
    }
    setEditing(null);
  };

  const togglePaid = async (a) => {
    const nowPaying = !a.isPaid;
    const updated = await updateActivity(a.id, {
      isPaid: nowPaying,
      ...(nowPaying && !a.paidDate ? { paidDate: new Date().toISOString().slice(0, 10) } : {}),
    });
    setActivities(acts => acts.map(x => x.id === a.id ? updated : x));
  };

  const remove = async (id) => {
    await deleteActivity(id);
    setActivities(a => a.filter(x => x.id !== id));
  };

  const selectedVendor = vendors.find(v => v.name === form.vendorName);
  const roleOpts = selectedVendor?.roles?.length
    ? [{ value: '', label: '— Select role —' }, ...selectedVendor.roles.map(r => ({ value: r, label: r }))]
    : [{ value: '', label: vendors.length ? '— Select vendor first —' : '— No vendors set up —' }];

  const formContent = (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--amber)44', borderRadius: 10, padding: isMobile ? 20 : 16, marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em', marginBottom: 14 }}>
        {editing === 'new' ? 'ADD VENDOR' : 'EDIT VENDOR'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 16 : 10, marginBottom: 16 }}>
        <Field mobile={isMobile} label="Vendor Name"
          options={[{ value: '', label: '— Select vendor —' }, ...vendors.map(v => ({ value: v.name, label: v.name }))]}
          value={form.vendorName}
          onChange={e => setForm(f => ({ ...f, vendorName: e.target.value, vendorRole: '' }))} />
        <Field mobile={isMobile} label="Role" value={form.vendorRole} options={roleOpts}
          onChange={e => setForm(f => ({ ...f, vendorRole: e.target.value }))} />
        <Field mobile={isMobile} label="Price (฿)" value={form.price} type="number"
          onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
        <Field mobile={isMobile} label="Billing Date" value={form.billingDate} type="date"
          onChange={e => setForm(f => ({ ...f, billingDate: e.target.value }))} />
        <Field mobile={isMobile} label="Construction Date" value={form.constructionDate} type="date"
          onChange={e => setForm(f => ({ ...f, constructionDate: e.target.value }))} />
        <Field mobile={isMobile} label="Complete Date" value={form.completeDate} type="date"
          onChange={e => setForm(f => ({ ...f, completeDate: e.target.value }))} />
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          Total: <span style={{ color: 'var(--amber)', fontWeight: 700 }}>฿{total.toLocaleString()}</span>
          {unpaid > 0 && <span style={{ marginLeft: 12, color: 'var(--danger)' }}>Unpaid: ฿{unpaid.toLocaleString()}</span>}
        </div>
        {isAdmin && editing !== 'new' && <Btn small onClick={startNew}>+ Add</Btn>}
      </div>

      {editing === 'new' && formContent}

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {activities.filter(a => a.id !== editing).map(a => (
            <div key={a.id} className="fu" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, borderLeft: `3px solid ${a.isPaid ? 'var(--green)' : 'var(--danger)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.vendorName || '—'}</div>
                  {a.vendorRole && <Badge label={a.vendorRole} color="#4a9edd" />}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--amber)', fontSize: 14 }}>฿{Number(a.price || 0).toLocaleString()}</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, cursor: 'pointer', justifyContent: 'flex-end' }}>
                    <input type="checkbox" checked={a.isPaid} onChange={isAdmin ? () => togglePaid(a) : undefined} style={{ accentColor: 'var(--green)', width: 16, height: 16, opacity: isAdmin ? 1 : 0.5, cursor: isAdmin ? 'pointer' : 'default' }} />
                    <span style={{ fontSize: 10, color: a.isPaid ? 'var(--green)' : 'var(--danger)', fontWeight: 600 }}>{a.isPaid ? 'PAID' : 'UNPAID'}</span>
                  </label>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 10, color: 'var(--muted)', marginBottom: 8 }}>
                <span>Bill: {a.billingDate?.slice(0, 10) || '—'}</span>
                <span>Done: {a.completeDate?.slice(0, 10) || '—'}</span>
                {a.paidDate && <span style={{ color: 'var(--green)' }}>Paid on: {a.paidDate.slice(0, 10)}</span>}
              </div>
              {isAdmin && <div style={{ display: 'flex', gap: 6 }}>
                <Btn small variant="ghost" onClick={() => startEdit(a)}>Edit</Btn>
                <Btn small variant="danger" onClick={() => remove(a.id)}>Delete</Btn>
              </div>}
            </div>
          ))}
          {activities.filter(a => a.id === editing && editing !== 'new').map(() => formContent)}
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Vendor','Role','Price','Billing','Construct','Complete','Paid On','Paid',''].map(h => (
                <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {activities.map((a, i) => (
                a.id === editing ? (
                  <tr key={a.id}><td colSpan={9} style={{ padding: 0 }}>{formContent}</td></tr>
                ) : (
                  <tr key={a.id} style={{ borderBottom: i < activities.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{a.vendorName || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>{a.vendorRole ? <Badge label={a.vendorRole} color="#4a9edd" /> : '—'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>฿{Number(a.price || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 11 }}>{a.billingDate?.slice(0, 10) || '—'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 11 }}>{a.constructionDate?.slice(0, 10) || '—'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 11 }}>{a.completeDate?.slice(0, 10) || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: a.paidDate ? 'var(--green)' : 'var(--muted)' }}>{a.paidDate?.slice(0, 10) || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <input type="checkbox" checked={a.isPaid} onChange={isAdmin ? () => togglePaid(a) : undefined} style={{ accentColor: 'var(--green)', width: 15, height: 15, opacity: isAdmin ? 1 : 0.5, cursor: isAdmin ? 'pointer' : 'default' }} />
                    </td>
                    {isAdmin && <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn small variant="ghost" onClick={() => startEdit(a)}>Edit</Btn>
                        <Btn small variant="danger" onClick={() => remove(a.id)}>Del</Btn>
                      </div>
                    </td>}
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
