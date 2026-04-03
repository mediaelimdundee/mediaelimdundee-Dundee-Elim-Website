import { format, isSameDay, parseISO } from 'date-fns';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EventCard from './EventCard';

export default function DayPanel({ day, events, onClose }) {
  const dayEvents = events.filter(e => {
    if (!e.date) return false;
    try { return isSameDay(parseISO(e.date), day); } catch { return false; }
  });

  return (
    <AnimatePresence>
      {day && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.25 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl font-bold text-white">
              {format(day, 'EEEE, d MMMM')}
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg glass-light text-white/60 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {dayEvents.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-10">No events on this day.</p>
          ) : (
            <div className="space-y-4">
              {dayEvents.map(e => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}