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
    <div className="glass-card rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all">
      {event.image_url && (
        <img src={event.image_url} alt={event.title} className="w-full h-40 object-cover opacity-80" />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${colorClass}`}>
            {event.category}
          </span>
          {event.is_recurring && (
            <span className="flex items-center gap-1 text-xs text-cyan-400 font-medium">
              <RefreshCw className="w-3 h-3" /> Recurring
            </span>
          )}
        </div>
        <h3 className="text-white font-display text-xl font-semibold mb-2">{event.title}</h3>
        {event.description && (
          <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-2">{event.description}</p>
        )}
        <div className="space-y-1.5 mb-5">
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
          <div className="flex gap-2 flex-wrap">
            <a
              href={buildGoogleCalendarUrl(event)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Google Calendar
            </a>
            <a
              href={buildOutlookUrl(event)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-200 hover:bg-blue-500/30 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Outlook
            </a>
          </div>
        )}
      </div>
    </div>
  );
}