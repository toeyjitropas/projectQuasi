import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from '../api/events';
import { Badge, Btn, Field, sc, sz } from '../components/ui';
import ActivityTable from '../components/ActivityTable';
import InvestorsTable from '../components/InvestorsTable';
import ImageUploader from '../components/ImageUploader';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const EVENT_TYPES = ['Conference','Workshop','Corporate Dinner','Team Building','Exhibition','Other'];

function deriveSize(p) {
  if (!p) return '';
  p = parseInt(p);
  if (p <= 30) return 'S';
  if (p <= 100) return 'M';
  if (p <= 300) return 'L';
  return 'XL';
}

const EventCard = ({ ev, onClick }) => (
  <div onClick={onClick} className="fu" style={{
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
    padding: 16, cursor: 'pointer', borderLeft: `3px solid ${sc(ev.status)}`,
    transition: 'border-color 150ms',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
      <div style={{ flex: 1, marginRight: 10 }}>
        {ev.isMajor && <span style={{ fontSize: 9, color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: 3 }}>★ MAJOR</span>}
        <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{ev.name}</div>
      </div>
      <Badge label={ev.status} color={sc(ev.status)} />
    </div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
      <Badge label={ev.eventType?.name || '—'} color="#4a9edd" />
      {ev.size && <Badge label={ev.size} color={sz(ev.size)} />}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: 11 }}>
      <span>📅 {ev.date?.slice(0, 10) || '—'}</span>
      <span>👥 {ev.participants?.toLocaleString() || '—'}</span>
    </div>
  </div>
);

function EventsList({ isMobile }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { getEvents().then(setEvents).catch(() => {}); }, []);

  const shown = filter === 'all' ? events : events.filter(e => e.status === filter);

  return (
    <div className="fu" style={{ padding: isMobile ? '16px 14px' : 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700 }}>Events</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{events.length} total</div>
        </div>
        {isAdmin && <Btn small onClick={() => navigate('/events/new')}>+ New</Btn>}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {['all','confirmed','draft','completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
            fontSize: 11, fontWeight: 600, transition: 'all 120ms',
            background: filter === f ? 'var(--amber)' : 'var(--surface2)',
            color: filter === f ? '#0d0f14' : 'var(--muted)',
          }}>{f.toUpperCase()}</button>
        ))}
      </div>
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shown.map(ev => <EventCard key={ev.id} ev={ev} onClick={() => navigate(`/events/${ev.id}`)} />)}
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Event Name','Type','Size','Date','Participants','Status',''].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {shown.map((ev, i) => (
                <tr key={ev.id} style={{ borderBottom: i < shown.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 120ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      {ev.isMajor && <span style={{ fontSize: 9, color: 'var(--amber)', fontWeight: 700 }}>★</span>}
                      <span style={{ fontWeight: 500 }}>{ev.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--muted)', fontSize: 11 }}>{ev.eventType?.name || '—'}</td>
                  <td style={{ padding: '12px 14px' }}>{ev.size ? <Badge label={ev.size} color={sz(ev.size)} /> : '—'}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--muted)', fontSize: 11 }}>{ev.date?.slice(0, 10) || '—'}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--muted)' }}>{ev.participants?.toLocaleString() || '—'}</td>
                  <td style={{ padding: '12px 14px' }}><Badge label={ev.status} color={sc(ev.status)} /></td>
                  <td style={{ padding: '12px 14px' }}><Btn small variant="ghost" onClick={() => navigate(`/events/${ev.id}`)}>Open →</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EventDetail({ id, isMobile }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const isNew = id === 'new';
  const [ev, setEv] = useState(null);
  const [tab, setTab] = useState('details');
  const [form, setForm] = useState({ name: '', eventTypeId: '', status: 'draft', participants: '', date: '', billingDate: '', payoutDate: '', isMajor: false, review: '' });
  const [eventTypes, setEventTypes] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client.get('/event-types').then(r => setEventTypes(r.data)).catch(() => {});
    if (!isNew) {
      getEvent(id).then(data => {
        setEv(data);
        setForm({
          name: data.name || '',
          eventTypeId: data.eventTypeId || '',
          status: data.status || 'draft',
          participants: data.participants || '',
          date: data.date?.slice(0, 10) || '',
          billingDate: data.billingDate?.slice(0, 10) || '',
          payoutDate: data.payoutDate?.slice(0, 10) || '',
          isMajor: data.isMajor || false,
          review: data.review || '',
        });
      }).catch(() => {});
    }
  }, [id]);

  const size = deriveSize(form.participants);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        eventTypeId: form.eventTypeId ? parseInt(form.eventTypeId) : null,
        participants: form.participants ? parseInt(form.participants) : null,
        date: form.date || null,
        billingDate: form.billingDate || null,
        payoutDate: form.payoutDate || null,
      };
      if (isNew) {
        const created = await createEvent(payload);
        navigate(`/events/${created.id}`);
      } else {
        await updateEvent(id, payload);
        getEvent(id).then(setEv);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event?')) return;
    await deleteEvent(id);
    navigate('/events');
  };

  const TABS = isNew ? ['details'] : ['details','activities','investors','images','audit'];

  return (
    <div className="fu" style={{ padding: isMobile ? '14px 14px' : 32, maxWidth: 960 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => navigate('/events')} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', color: 'var(--muted)', cursor: 'pointer', padding: '6px 10px', fontSize: 14 }}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: isMobile ? 15 : 20, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isNew ? 'New Event' : (ev?.name || '…')}
          </div>
          {!isNew && ev && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{ev.eventType?.name} · {ev.date?.slice(0, 10)}</div>}
        </div>
        {!isNew && ev && !isMobile && (
          <div style={{ display: 'flex', gap: 6 }}>
            <Badge label={ev.status} color={sc(ev.status)} />
            {ev.isMajor && <Badge label="★ Major" color="var(--amber)" />}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: isMobile ? '8px 14px' : '8px 18px', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
            fontSize: isMobile ? 11 : 12, fontWeight: tab === t ? 700 : 400, color: tab === t ? 'var(--amber)' : 'var(--muted)',
            borderBottom: tab === t ? '2px solid var(--amber)' : '2px solid transparent',
            marginBottom: -1, fontFamily: 'var(--mono)', transition: 'color 120ms',
          }}>{t.toUpperCase()}</button>
        ))}
      </div>

      {tab === 'details' && (
        <div className="fu">
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Field label="Event Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Field label="Event Type" value={form.eventTypeId} onChange={e => setForm(f => ({ ...f, eventTypeId: e.target.value }))} options={[{ value: '', label: '— Select —' }, ...eventTypes.map(t => ({ value: t.id, label: t.name }))]} />
            <Field label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} options={['draft','confirmed','completed']} />
            <Field label="Participants" value={form.participants} type="number" onChange={e => setForm(f => ({ ...f, participants: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Field label="Size (auto)" value={size || '—'} readOnly />
            <Field label="Event Date" value={form.date} type="date" onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Field label="Billing Date" value={form.billingDate} type="date" onChange={e => setForm(f => ({ ...f, billingDate: e.target.value }))} />
            <Field label="Payout Date" value={form.payoutDate} type="date" onChange={e => setForm(f => ({ ...f, payoutDate: e.target.value }))} />
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Major Event</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', background: 'var(--surface2)', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
                <input type="checkbox" checked={form.isMajor} onChange={e => setForm(f => ({ ...f, isMajor: e.target.checked }))} style={{ accentColor: 'var(--amber)', width: 15, height: 15 }} />
                <span style={{ fontSize: 11, color: form.isMajor ? 'var(--amber)' : 'var(--muted)' }}>{form.isMajor ? 'Yes — Major' : 'No'}</span>
              </div>
            </label>
          </div>
          <Field label="Review" value={form.review} rows={isMobile ? 3 : 4} onChange={e => setForm(f => ({ ...f, review: e.target.value }))} />
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {isAdmin && <Btn onClick={save} full={isMobile}>{saving ? 'Saving…' : 'Save Changes'}</Btn>}
            {!isMobile && <Btn variant="ghost" onClick={() => navigate('/events')}>Cancel</Btn>}
            {isAdmin && !isNew && <Btn variant="danger" onClick={handleDelete}>Delete</Btn>}
          </div>
        </div>
      )}

      {tab === 'activities' && ev && <ActivityTable eventId={id} isMobile={isMobile} />}
      {tab === 'investors' && ev && <InvestorsTable eventId={id} isMobile={isMobile} />}
      {tab === 'images' && ev && <ImageUploader eventId={id} images={ev.images || []} isMobile={isMobile} />}
      {tab === 'audit' && ev && <AuditTab eventId={id} isMobile={isMobile} />}
    </div>
  );
}

function AuditTab({ eventId }) {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    client.get('/audit', { params: { recordId: eventId } }).then(r => setLogs(r.data)).catch(() => {});
  }, [eventId]);

  const color = a => a === 'INSERT' ? 'var(--green)' : 'var(--amber)';

  return (
    <div className="fu" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {logs.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No audit records.</div>}
      {logs.map(log => (
        <div key={log.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '11px 14px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <Badge label={log.action} color={color(log.action)} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{JSON.stringify(log.newData || log.oldData)}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{log.changedBy || 'system'} · {new Date(log.changedAt).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EventFormPage({ isMobile, listMode }) {
  const { id } = useParams();
  if (listMode || (!id && !window.location.pathname.includes('/new'))) return <EventsList isMobile={isMobile} />;
  const eventId = id || 'new';
  return <EventDetail id={eventId} isMobile={isMobile} />;
}
