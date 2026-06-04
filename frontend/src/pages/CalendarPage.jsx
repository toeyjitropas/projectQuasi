import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../api/events';
import { Btn } from '../components/ui';

const pad = n => String(n).padStart(2, '0');
const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const sc = s => ({ confirmed: '#3ecf82', draft: '#5a6282', completed: '#f0a83c' }[s] || '#5a6282');

export default function CalendarPage({ isMobile }) {
  const navigate = useNavigate();
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [events, setEvents] = useState([]);
  const { year, month } = cursor;

  useEffect(() => {
    getEvents().then(setEvents).catch(() => {});
  }, []);

  const prevMonth = () => setCursor(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 });
  const nextMonth = () => setCursor(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 });
  const goToday = () => setCursor({ year: today.getFullYear(), month: today.getMonth() });

  const isCurrentMonth = cursor.year === today.getFullYear() && cursor.month === today.getMonth();
  const first = new Date(year, month, 1).getDay();
  const daysInMo = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: daysInMo }, (_, i) => i + 1)];
  const DAYS = isMobile ? ['S','M','T','W','T','F','S'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const monthKey = `${year}-${pad(month + 1)}`;
  const calEvents = {};
  events.forEach(ev => {
    if (ev.date && ev.date.startsWith(monthKey)) {
      const key = ev.date.slice(0, 10);
      if (!calEvents[key]) calEvents[key] = [];
      calEvents[key].push({ name: ev.name, color: sc(ev.status), id: ev.id });
    }
  });

  const monthEvents = Object.entries(calEvents);

  return (
    <div className="fu" style={{ padding: isMobile ? '16px 14px' : 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: isMobile ? 17 : 22, fontWeight: 700, color: 'var(--amber)' }}>
            {MONTH_NAMES[month]} {year}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{monthEvents.length} events</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Btn small variant="ghost" onClick={prevMonth}>‹</Btn>
          <Btn small variant={isCurrentMonth ? 'active' : 'ghost'} onClick={goToday}>Today</Btn>
          <Btn small variant="ghost" onClick={nextMonth}>›</Btn>
          <Btn small onClick={() => navigate('/events/new')}>+ Event</Btn>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid var(--border)' }}>
          {DAYS.map((d, i) => (
            <div key={i} style={{ padding: isMobile ? '6px 4px' : '9px 12px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textAlign: 'center', letterSpacing: '0.05em' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
          {cells.map((day, i) => {
            const key = day ? `${year}-${pad(month + 1)}-${pad(day)}` : null;
            const evs = key ? (calEvents[key] || []) : [];
            const isToday = key === fmt(today);
            const isPast = key && new Date(key) < today && !isToday;
            return (
              <div key={i} onClick={() => day && navigate('/events/new')} style={{
                minHeight: isMobile ? 50 : 78,
                padding: isMobile ? '5px 3px' : '8px 10px',
                borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                borderBottom: i < cells.length - 7 ? '1px solid var(--border)' : 'none',
                background: isToday ? 'var(--amber-lo)' : 'transparent',
                cursor: day ? 'pointer' : 'default',
                opacity: isPast ? 0.45 : 1,
                transition: 'background 120ms',
              }}
                onMouseEnter={e => day && (e.currentTarget.style.background = isToday ? 'var(--amber)22' : 'var(--surface2)')}
                onMouseLeave={e => e.currentTarget.style.background = isToday ? 'var(--amber-lo)' : 'transparent'}
              >
                {day && (
                  <>
                    <div style={{
                      fontSize: isMobile ? 11 : 12, fontWeight: isToday ? 700 : 400,
                      color: isToday ? 'var(--amber)' : 'var(--text)',
                      width: isMobile ? 20 : 24, height: isMobile ? 20 : 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '50%', background: isToday ? 'var(--amber)33' : 'transparent',
                    }}>{day}</div>
                    {evs.map((ev, j) => (
                      <div key={j} onClick={e => { e.stopPropagation(); navigate(`/events/${ev.id}`); }} style={{
                        marginTop: 3, fontSize: isMobile ? 0 : 9, fontWeight: 600,
                        padding: isMobile ? '3px' : '2px 5px', borderRadius: 3,
                        background: ev.color + '22', height: isMobile ? 5 : 'auto',
                        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                        color: ev.color, cursor: 'pointer', borderLeft: `2px solid ${ev.color}`,
                      }}>{isMobile ? '' : ev.name}</div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isMobile && monthEvents.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>This Month</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {monthEvents.map(([date, evs]) => evs.map((ev, i) => (
              <div key={date + i} onClick={() => navigate(`/events/${ev.id}`)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer',
              }}>
                <div style={{ width: 3, height: 32, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{ev.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{date}</div>
                </div>
              </div>
            )))}
          </div>
        </div>
      )}
    </div>
  );
}
