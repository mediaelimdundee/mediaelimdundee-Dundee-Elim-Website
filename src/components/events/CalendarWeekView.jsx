import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfWeek, endOfWeek, addDays, addWeeks, subWeeks,
  format, parseISO, isSameDay, isToday,
} from 'date-fns';

const CATEGORY_COLORS = {
  service:   'bg-blue-500/30 border-blue-400/50 text-blue-200',
  youth:     'bg-green-500/30 border-green-400/50 text-green-200',
  prayer:    'bg-purple-500/30 border-purple-400/50 text-purple-200',
  community: 'bg-yellow-500/30 border-yellow-400/50 text-yellow-200',
  special:   'bg-red-500/30 border-red-400/50 text-red-200',
};

export default function CalendarWeekView({ events, currentWeek, setCurrentWeek, onDaySelect }) {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function eventsForDay(day) {
    return events.filter(e => {
      if (!e.date) return false;
      try { return isSameDay(parseISO(e.date), day); } catch { return false; }
    });
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button
          onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          className="p-2 rounded-lg glass-light text-white/60 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="font-display text-lg font-bold text-white">
          {format(weekStart, 'd MMM')} – {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'd MMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          className="p-2 rounded-lg glass-light text-white/60 hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Week columns */}
      <div className="grid grid-cols-7 divide-x divide-white/10 min-h-[300px]">
        {days.map((day, i) => {
          const dayEvents = eventsForDay(day);
          const today = isToday(day);
          return (
            <button
              key={i}
              onClick={() => onDaySelect(day)}
              className="flex flex-col p-2 sm:p-3 hover:bg-white/5 transition-colors text-left"
            >
              {/* Day header */}
              <div className="text-center mb-2">
                <div className="text-white/40 text-xs uppercase tracking-wider">{format(day, 'EEE')}</div>
                <div className={`
                  mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-semibold
                  ${today ? 'bg-primary text-white' : 'text-white/80'}
                `}>
                  {format(day, 'd')}
                </div>
              </div>

              {/* Events */}
              <div className="flex-1 space-y-1">
                {dayEvents.map((e, ei) => (
                  <div
                    key={ei}
                    className={`rounded-lg px-2 py-1 border-l-2 text-xs font-medium truncate ${CATEGORY_COLORS[e.category] || 'bg-white/10 border-white/30 text-white/60'}`}
                  >
                    <div className="truncate">{e.title}</div>
                    {e.time && <div className="opacity-70 text-xs">{e.time}</div>}
                  </div>
                ))}
                {dayEvents.length === 0 && (
                  <div className="text-white/20 text-xs text-center mt-2">—</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}