import { useState, useEffect } from 'react';
import { Btn, Field } from '../components/ui';
import {
  getEventTypes, createEventType, updateEventType, deleteEventType,
  getVendorRoles, createVendorRole, updateVendorRole, deleteVendorRole,
  getVendors, createVendor, updateVendor, deleteVendor,
  getInvestorMasters, createInvestorMaster, updateInvestorMaster, deleteInvestorMaster,
} from '../api/config';

function MasterList({ title, items, onAdd, onEdit, onDelete, fields }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const startNew  = () => { setForm(Object.fromEntries(fields.map(f => [f.key, '']))); setEditing('new'); };
  const startEdit = item => { setForm(Object.fromEntries(fields.map(f => [f.key, String(item[f.key] ?? '')]))); setEditing(item.id); };
  const cancel    = () => setEditing(null);

  const save = async () => {
    const payload = Object.fromEntries(fields.map(f => [f.key, form[f.key] || (f.type === 'number' ? null : '')]));
    if (editing === 'new') await onAdd(payload);
    else await onEdit(editing, payload);
    setEditing(null);
  };

  const formContent = (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--amber)44', borderRadius: 10, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: fields.length > 1 ? '1fr 1fr' : '1fr', gap: 10, marginBottom: 12 }}>
        {fields.map(f => (
          <Field key={f.key} label={f.label} value={form[f.key] ?? ''} type={f.type || 'text'}
            onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn small onClick={save}>Save</Btn>
        <Btn small variant="ghost" onClick={cancel}>Cancel</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
        {editing !== 'new' && <Btn small onClick={startNew}>+ Add</Btn>}
      </div>

      {editing === 'new' && formContent}

      <div style={{ background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {items.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>No items yet.</div>
        )}
        {items.map((item, i) => (
          <div key={item.id}>
            {editing === item.id ? (
              <div style={{ padding: 14, background: 'var(--surface2)' }}>{formContent}</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                  {fields.filter(f => f.key !== 'name').map(f => (
                    <span key={f.key} style={{ fontSize: 10, color: 'var(--muted)', marginRight: 12 }}>
                      {f.label}: {item[f.key] != null ? `${f.prefix || ''}${Number(item[f.key]).toLocaleString()}${f.suffix || ''}` : '—'}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn small variant="ghost" onClick={() => startEdit(item)}>Edit</Btn>
                  <Btn small variant="danger" onClick={() => onDelete(item.id)}>Del</Btn>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorList({ items, vendorRoles, onAdd, onEdit, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  const startNew  = () => { setName(''); setSelectedRoles([]); setEditing('new'); };
  const startEdit = v => { setName(v.name); setSelectedRoles(v.roles || []); setEditing(v.id); };
  const cancel    = () => setEditing(null);
  const toggleRole = role => setSelectedRoles(r => r.includes(role) ? r.filter(x => x !== role) : [...r, role]);

  const save = async () => {
    if (editing === 'new') await onAdd({ name, roles: selectedRoles });
    else await onEdit(editing, { name, roles: selectedRoles });
    setEditing(null);
  };

  const roleCheckboxes = (
    <div style={{ marginTop: 12, marginBottom: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
        Roles
      </div>
      {vendorRoles.length === 0 ? (
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>No roles defined — add them in the Vendor Roles tab first.</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {vendorRoles.map(r => (
            <label key={r.id} onClick={() => toggleRole(r.name)} style={{
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              padding: '4px 12px', borderRadius: 99,
              border: `1px solid ${selectedRoles.includes(r.name) ? 'var(--amber)' : 'var(--border)'}`,
              background: selectedRoles.includes(r.name) ? 'var(--amber)18' : 'transparent',
              fontSize: 11, fontWeight: selectedRoles.includes(r.name) ? 700 : 400,
              color: selectedRoles.includes(r.name) ? 'var(--amber)' : 'var(--muted)',
              userSelect: 'none',
            }}>
              {selectedRoles.includes(r.name) && <span style={{ fontSize: 10 }}>✓</span>}
              {r.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );

  const formContent = (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--amber)44', borderRadius: 10, padding: 16, marginBottom: 12 }}>
      <Field label="Vendor Name" value={name} onChange={e => setName(e.target.value)} />
      {roleCheckboxes}
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn small onClick={save}>Save</Btn>
        <Btn small variant="ghost" onClick={cancel}>Cancel</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Vendor List</div>
        {editing !== 'new' && <Btn small onClick={startNew}>+ Add</Btn>}
      </div>

      {editing === 'new' && formContent}

      <div style={{ background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {items.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>No vendors yet.</div>
        )}
        {items.map((item, i) => (
          <div key={item.id}>
            {editing === item.id ? (
              <div style={{ padding: 14, background: 'var(--surface2)' }}>{formContent}</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                  <div style={{ marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(item.roles || []).length === 0
                      ? <span style={{ fontSize: 10, color: 'var(--muted)' }}>No roles assigned</span>
                      : (item.roles || []).map(r => (
                          <span key={r} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'var(--amber)18', color: 'var(--amber)', fontWeight: 600, border: '1px solid var(--amber)33' }}>{r}</span>
                        ))
                    }
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                  <Btn small variant="ghost" onClick={() => startEdit(item)}>Edit</Btn>
                  <Btn small variant="danger" onClick={() => onDelete(item.id)}>Del</Btn>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage({ isMobile }) {
  const [tab, setTab] = useState('vendors');
  const [eventTypes, setEventTypes]       = useState([]);
  const [vendorRoles, setVendorRoles]     = useState([]);
  const [vendors, setVendors]             = useState([]);
  const [investorMasters, setInvestorMasters] = useState([]);

  useEffect(() => {
    getEventTypes().then(setEventTypes).catch(() => {});
    getVendorRoles().then(setVendorRoles).catch(() => {});
    getVendors().then(setVendors).catch(() => {});
    getInvestorMasters().then(setInvestorMasters).catch(() => {});
  }, []);

  return (
    <div className="fu" style={{ padding: isMobile ? '16px 14px' : 32, maxWidth: 700 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700 }}>Settings</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Manage master lists</div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {[['vendors','Vendors'],['vendorroles','Vendor Roles'],['investors','Investors'],['eventtypes','Event Types']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '5px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
            fontSize: 11, fontWeight: 600,
            background: tab === id ? 'var(--amber)' : 'var(--surface2)',
            color: tab === id ? '#0d0f14' : 'var(--muted)',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'vendors' && (
        <VendorList
          items={vendors}
          vendorRoles={vendorRoles}
          onAdd={async data => { const r = await createVendor(data); setVendors(v => [...v, r]); }}
          onEdit={async (id, data) => { const r = await updateVendor(id, data); setVendors(v => v.map(x => x.id === id ? r : x)); }}
          onDelete={async id => { await deleteVendor(id); setVendors(v => v.filter(x => x.id !== id)); }}
        />
      )}

      {tab === 'vendorroles' && (
        <MasterList
          title="Vendor Role List"
          items={vendorRoles}
          fields={[{ key: 'name', label: 'Role Name' }]}
          onAdd={async data => { const r = await createVendorRole(data); setVendorRoles(v => [...v, r]); }}
          onEdit={async (id, data) => { const r = await updateVendorRole(id, data); setVendorRoles(v => v.map(x => x.id === id ? r : x)); }}
          onDelete={async id => { await deleteVendorRole(id); setVendorRoles(v => v.filter(x => x.id !== id)); }}
        />
      )}

      {tab === 'investors' && (
        <MasterList
          title="Investor Master List"
          items={investorMasters}
          fields={[
            { key: 'name',              label: 'Investor Name' },
            { key: 'defaultInvestment', label: 'Default Investment (฿)', type: 'number', prefix: '฿' },
            { key: 'defaultReturnRate', label: 'Default Return Rate (%)', type: 'number', suffix: '%' },
          ]}
          onAdd={async data => { const r = await createInvestorMaster(data); setInvestorMasters(v => [...v, r]); }}
          onEdit={async (id, data) => { const r = await updateInvestorMaster(id, data); setInvestorMasters(v => v.map(x => x.id === id ? r : x)); }}
          onDelete={async id => { await deleteInvestorMaster(id); setInvestorMasters(v => v.filter(x => x.id !== id)); }}
        />
      )}

      {tab === 'eventtypes' && (
        <MasterList
          title="Event Type List"
          items={eventTypes}
          fields={[{ key: 'name', label: 'Event Type Name' }]}
          onAdd={async data => { const r = await createEventType(data); setEventTypes(v => [...v, r]); }}
          onEdit={async (id, data) => { const r = await updateEventType(id, data); setEventTypes(v => v.map(x => x.id === id ? r : x)); }}
          onDelete={async id => { await deleteEventType(id); setEventTypes(v => v.filter(x => x.id !== id)); }}
        />
      )}
    </div>
  );
}
