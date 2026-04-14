import { Calendar, Clock, MapPin, RefreshCw, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const CATEGORY_COLORS = {
  service:   'text-blue-400 bg-blue-500/20',
  youth:     'text-green-400 bg-green-500/20',
  prayer:    'text-purple-400 bg-purple-500/20',
  community: 'text-yellow-400 bg-yellow-500/20',
  special:   'text-red-400 bg-red-500/20',
};

const CATEGORY_DOT = {
  service:   'bg-blue-400',
  youth:     'bg-green-400',
  prayer:    'bg-purple-400',
  community: 'bg-yellow-400',
  special:   'bg-red-400',
};

function buildGoogleCalendarUrl(event) {
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(event.location || '');

  // Parse date + time
  let start = '';
  let end = '';
  if (event.date) {
    const dateStr = event.date.replace(/-/g, '');
    // Try to parse time
    const timeMatch = event.time ? event.time.match(/(\d+):(\d+)\s*(AM|PM)?/i) : null;
    if (timeMatch) {
      let h = parseInt(timeMatch[1]);
      const m = timeMatch[2].padStart(2, '0');
      const meridiem = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
      if (meridiem === 'PM' && h < 12) h += 12;
      if (meridiem === 'AM' && h === 12) h = 0;
      const hStr = String(h).padStart(2, '0');
      const endH = String(h + 1).padStart(2, '0');
      start = `${dateStr}T${hStr}${m}00`;
      end = `${dateStr}T${endH}${m}00`;
    } else {
      start = dateStr;
      end = dateStr;
    }
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

function buildOutlookUrl(event) {
  const title = encodeURIComponent(event.title);
  const body = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(event.location || '');
  const startDate = event.date || '';
  const time = event.time || '10:00 AM';
  const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  let startIso = startDate;
  if (timeMatch && startDate) {
    let h = parseInt(timeMatch[1]);
    const m = timeMatch[2].padStart(2, '0');
    const meridiem = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
    if (meridiem === 'PM' && h < 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    startIso = `${startDate}T${String(h).padStart(2,'0')}:${m}:00`;
  }
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${body}&location=${location}&startdt=${encodeURIComponent(startIso)}`;
}

export default function EventCard({ event, compact = false }) {
  const colorClass = CATEGORY_COLORS[event.category] || 'text-white/60 bg-white/10';
  const dotClass = CATEGORY_DOT[event.category] || 'bg-white/40';

  const dateLabel = event.is_recurring
    ? event.recurring_pattern
    : event.date
    ? (() => { try { return format(parseISO(event.date), 'EEEE, d MMMM yyyy'); } catch { return event.date; } })()
    : 'Date TBC';

  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1">
        <div className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
        <span className="text-white/80 text-xs font-medium truncate">{event.title}</span>
        {event.time && <span className="text-white/40 text-xs shrink-0">{event.time}</span>}
      </div>
    );
  }

  return (
    <div className="glass-panel transition-all hover:-translate-y-1 hover:border-blue-400/30">
      {event.image_url && (
        <img src={event.image_url} alt={event.title} className="h-44 w-full object-cover opacity-85" />
      )}
      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${colorClass}`}>
            {event.category}
          </span>
          {event.is_recurring && (
            <span className="flex items-center gap-1 text-xs text-cyan-400 font-medium">
              <RefreshCw className="w-3 h-3" /> Recurring
            </span>
          )}
        </div>
        <h3 className="mb-2 font-display text-2xl font-semibold text-white">{event.title}</h3>
        {event.description && (
          <p className="mb-4 line-clamp-2 text-sm leading-7 text-white/60">{event.description}</p>
        )}
        <div className="mb-5 space-y-2">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            {dateLabel}
          </div>
          {event.time && (
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              {event.time}
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              {event.location}
            </div>
          )}
        </div>

        {/* Add to Calendar */}
        {event.date && (
          <div className="flex flex-wrap gap-2">
            <a
              href={buildGoogleCalendarUrl(event)}
              target="_blank"
              rel="noreferrer"
              className="glass-action-soft flex items-center gap-1.5 px-4 text-xs font-medium text-blue-300 hover:bg-blue-500/35"
              style={{ minHeight: '2.5rem', background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.25)' }}
            >
              <ExternalLink className="w-3 h-3" /> Google Calendar
            </a>
            <a
              href={buildOutlookUrl(event)}
              target="_blank"
              rel="noreferrer"
              className="glass-action-soft flex items-center gap-1.5 px-4 text-xs font-medium text-blue-200 hover:bg-blue-500/25"
              style={{ minHeight: '2.5rem' }}
            >
              <ExternalLink className="w-3 h-3" /> Outlook
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
