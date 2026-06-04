import { useState, useEffect } from 'react';
import { trainModel, predictCost } from '../api/analytics';
import client from '../api/client';
import { Btn, Field } from '../components/ui';

const VENDOR_ROLES = ['AV & Sound','Decoration','F&B','Lighting','Photography','Security'];

export default function AnalyticsPage({ isMobile }) {
  const [eventTypes, setEventTypes] = useState([]);
  const [form, setForm] = useState({ event_type: 'Conference', participants: 100, is_major: false, activity_count: 4 });
  const [vendorRoles, setVendorRoles] = useState(['AV & Sound','F&B']);
  const [projected, setProjected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainResult, setTrainResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    client.get('/event-types').then(r => setEventTypes(r.data)).catch(() => {});
  }, []);

  const toggleRole = r => setVendorRoles(v => v.includes(r) ? v.filter(x => x !== r) : [...v, r]);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await predictCost({ ...form, vendor_roles: vendorRoles, participants: parseInt(form.participants), activity_count: parseInt(form.activity_count) });
      if (result.error === 'insufficient_data') { setError('Insufficient completed events to make a prediction. Need at least 10.'); setProjected(null); }
      else setProjected(result);
    } catch (e) {
      setError('Prediction failed. Make sure the ML service is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    setTraining(true);
    try {
      const result = await trainModel();
      setTrainResult(result);
    } catch (e) {
      setError('Training failed.');
    } finally {
      setTraining(false);
    }
  };

  const typeOptions = eventTypes.length
    ? eventTypes.map(t => t.name)
    : ['Conference','Workshop','Corporate Dinner','Team Building','Exhibition','Other'];

  return (
    <div className="fu" style={{ padding: isMobile ? '16px 14px' : 32, maxWidth: 700 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700 }}>Analytics</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>AI cost projection · GBR model</div>
      </div>

      <div style={{ padding: '12px 14px', background: 'var(--green)12', border: '1px solid var(--green)33', borderRadius: 9, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--green)' }}>◉</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--green)' }}>
              {trainResult ? `Model trained · ${trainResult.events_used} events · RMSE ${trainResult.cv_rmse?.toLocaleString()}` : 'Model Status'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>Gradient Boosting Regressor · 5-fold CV</div>
          </div>
        </div>
        <Btn small variant="success" onClick={handleTrain}>{training ? <span><span className="spin">◌</span> Training…</span> : '↻ Retrain'}</Btn>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', padding: isMobile ? 16 : 22, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 13 }}>// Project New Event</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <Field label="Event Type" value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))} options={typeOptions} />
          <Field label="Participants" value={String(form.participants)} type="number" onChange={e => setForm(f => ({ ...f, participants: e.target.value }))} />
          <Field label="Activity Count" value={String(form.activity_count)} type="number" onChange={e => setForm(f => ({ ...f, activity_count: e.target.value }))} />
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Major Event</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', background: 'var(--surface2)', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
              <input type="checkbox" checked={form.is_major} onChange={e => setForm(f => ({ ...f, is_major: e.target.checked }))} style={{ accentColor: 'var(--amber)', width: 15, height: 15 }} />
              <span style={{ fontSize: 11, color: form.is_major ? 'var(--amber)' : 'var(--muted)' }}>{form.is_major ? 'Yes — Major' : 'No'}</span>
            </div>
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Vendor Roles</div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {VENDOR_ROLES.map(r => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'var(--surface2)', borderRadius: 99, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 11 }}>
                <input type="checkbox" checked={vendorRoles.includes(r)} onChange={() => toggleRole(r)} style={{ accentColor: 'var(--amber)' }} />
                {r}
              </label>
            ))}
          </div>
        </div>
        {error && <div style={{ color: 'var(--danger)', fontSize: 11, marginBottom: 10 }}>{error}</div>}
        <Btn onClick={handlePredict} full={isMobile}>{loading ? <span><span className="spin">◌</span> Computing…</span> : '→ Project Cost'}</Btn>
      </div>

      {projected && (
        <div className="fu" style={{ background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--amber)55', padding: isMobile ? 18 : 24 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Projected Total</div>
          <div style={{ fontSize: isMobile ? 34 : 44, fontWeight: 700, color: 'var(--amber)', letterSpacing: '-0.02em' }}>฿{projected.projected_cost?.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
            CI: <span style={{ color: 'var(--text)' }}>฿{projected.confidence_interval?.[0]?.toLocaleString()} – ฿{projected.confidence_interval?.[1]?.toLocaleString()}</span>
          </div>
          <div style={{ marginTop: 16, height: 6, borderRadius: 99, background: 'var(--surface2)', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '20%', right: '15%', top: 0, bottom: 0, background: 'var(--amber)33', borderRadius: 99 }} />
            <div style={{ position: 'absolute', left: '44%', top: -3, bottom: -3, width: 3, background: 'var(--amber)', borderRadius: 2 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10, color: 'var(--muted)' }}>
            <span>฿{projected.confidence_interval?.[0]?.toLocaleString()}</span>
            <span>฿{projected.confidence_interval?.[1]?.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
