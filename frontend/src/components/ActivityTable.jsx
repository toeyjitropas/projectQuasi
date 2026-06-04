import { useState, useEffect } from 'react';
import { createActivity, updateActivity, deleteActivity } from '../api/activities';
import { getEvent } from '../api/events';
import { getVendors } from '../api/config';
import { Badge, Btn, Field } from './ui';

const EMPTY = { vendorName: '', vendorRole: '', price: '', billingDate: '', constructionDate: '', completeDate: '', isPaid: false };

export default function ActivityTable({ eventId, isMobile }) {
  const [activities, setActivities] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    getEvent(eventId).then(ev => setActivities(ev.activities || [])).catch(() => {});
    getVendors().then(setVendors).catch(() => {});
  }, [eventId]);

  const total = activities.reduce((s, a) => s + Number(a.price || 0), 0);
  const unpaid = activities.filter(a => !a.isPaid).reduce((s, a) => s + Number(a.price || 0), 0);

  const startNew = () => { setForm(EMPTY); setEditing('new'); };
  const startEdit = a => {
    setForm({
      ...a,
      price: String(a.price || ''),
      billingDate: a.billingDate?.slice(0, 10) || '',
      constructionDate: a.constructionDate?.slice(0, 10) || '',
      completeDate: a.completeDate?.slice(0, 10) || '',
    });
    setEditing(a.id);
  };
  const cancel = () => setEditing(null);

  const save = async () => {
    const payload = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      billingDate: form.billingDate || null,
      constructionDate: form.constructionDate || null,
      completeDate: form.completeDate || null,
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
    const updated = await updateActivity(a.id, { isPaid: !a.isPaid });
    setActivities(acts => acts.map(x => x.id === a.id ? updated : x));
  };

  const remove = async (id) => {
    await deleteActivity(id);
    setActivities(a => a.filter(x => x.id !== id));
  };

  return (
    <div className="fu">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          Total: <span style={{ color: 'var(--amber)', fontWeight: 700 }}>฿{total.toLocaleString()}</span>
          {unpaid > 0 && <span style={{ marginLeft: 12, color: 'var(--danger)' }}>Unpaid: ฿{unpaid.toLocaleString()}</span>}
        </div>
        {editing !== 'new' && <Btn small onClick={startNew}>+ Add</Btn>}
      </div>

      {editing && (
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--amber)44', borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em', marginBottom: 12 }}>
            {editing === 'new' ? 'ADD VENDOR' : 'EDIT VENDOR'}
          </div>
          {(() => {
            const selectedVendor = vendors.find(v => v.name === form.vendorName);
            const roleOpts = selectedVendor?.roles?.length
              ? [{ value: '', label: '— Select role —' }, ...selectedVendor.roles.map(r => ({ value: r, label: r }))]
              : [{ value: '', label: vendors.length ? '— Select vendor first —' : '— No vendors set up —' }];
            return (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <Field label="Vendor Name"
              options={[{ value: '', label: '— Select vendor —' }, ...vendors.map(v => ({ value: v.name, label: v.name }))]}
              value={form.vendorName}
              onChange={e => setForm(f => ({ ...f, vendorName: e.target.value, vendorRole: '' }))} />
            <Field label="Role" value={form.vendorRole} options={roleOpts}
              onChange={e => setForm(f => ({ ...f, vendorRole: e.target.value }))} />
            <Field label="Price (฿)" value={form.price} type="number" onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            <Field label="Billing Date" value={form.billingDate} type="date" onChange={e => setForm(f => ({ ...f, billingDate: e.target.value }))} />
            <Field label="Construction Date" value={form.constructionDate} type="date" onChange={e => setForm(f => ({ ...f, constructionDate: e.target.value }))} />
            <Field label="Complete Date" value={form.completeDate} type="date" onChange={e => setForm(f => ({ ...f, completeDate: e.target.value }))} />
          </div>
            );
          })()}
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn small onClick={save}>Save</Btn>
            <Btn small variant="ghost" onClick={cancel}>Cancel</Btn>
          </div>
        </div>
      )}

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
                    <input type="checkbox" checked={a.isPaid} onChange={() => togglePaid(a)} style={{ accentColor: 'var(--green)', width: 14, height: 14 }} />
                    <span style={{ fontSize: 10, color: a.isPaid ? 'var(--green)' : 'var(--danger)', fontWeight: 600 }}>{a.isPaid ? 'PAID' : 'UNPAID'}</span>
                  </label>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 10, color: 'var(--muted)', marginBottom: 8 }}>
                <span>Bill: {a.billingDate?.slice(0, 10) || '—'}</span>
                <span>Done: {a.completeDate?.slice(0, 10) || '—'}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn small variant="ghost" onClick={() => startEdit(a)}>Edit</Btn>
                <Btn small variant="danger" onClick={() => remove(a.id)}>Delete</Btn>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Vendor','Role','Price','Billing','Construct','Complete','Paid',''].map(h => (
                <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {activities.filter(a => a.id !== editing).map((a, i) => (
                <tr key={a.id} style={{ borderBottom: i < activities.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{a.vendorName || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{a.vendorRole ? <Badge label={a.vendorRole} color="#4a9edd" /> : '—'}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>฿{Number(a.price || 0).toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 11 }}>{a.billingDate?.slice(0, 10) || '—'}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 11 }}>{a.constructionDate?.slice(0, 10) || '—'}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 11 }}>{a.completeDate?.slice(0, 10) || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <input type="checkbox" checked={a.isPaid} onChange={() => togglePaid(a)} style={{ accentColor: 'var(--green)', width: 15, height: 15, cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn small variant="ghost" onClick={() => startEdit(a)}>Edit</Btn>
                      <Btn small variant="danger" onClick={() => remove(a.id)}>Del</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
