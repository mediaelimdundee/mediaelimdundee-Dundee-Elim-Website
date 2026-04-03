import { useMemo, useState } from 'react';
import { isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import { CalendarDays, CalendarRange, LayoutGrid } from 'lucide-react';
import CalendarMonthView from '@/components/events/CalendarMonthView';
import CalendarWeekView from '@/components/events/CalendarWeekView';
import DayPanel from '@/components/events/DayPanel';
import EventCard from '@/components/events/EventCard';
import SEOHead from '@/components/SEOHead';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { buildUpcomingEvents } from '@/content/eventUtils';
import { resolveMediaSrc } from '@/lib/siteContentUtils';
import { recurringEventCategories } from '@/lib/sitePresentation';

const specularLine = (
  <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
);

export default function Events() {
  const { content } = useSiteContent();
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list');
  const [selectedDay, setSelectedDay] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const upcomingEvents = useMemo(() => buildUpcomingEvents(content.events), [content.events]);
  const filtered = upcomingEvents.filter((event) => filter === 'all' || event.category === filter);
  const views = [
    { key: 'list', label: content.events.viewLabels.list, Icon: LayoutGrid },
    { key: 'week', label: content.events.viewLabels.week, Icon: CalendarRange },
    { key: 'month', label: content.events.viewLabels.month, Icon: CalendarDays },
  ];
  const categories = ['all', ...recurringEventCategories];

  function handleDaySelect(day) {
    setSelectedDay((current) => (current && isSameDay(current, day) ? null : day));
  }

  return (
    <div className="pb-20">
      <SEOHead title={content.events.seo.title} description={content.events.seo.description} path="/events" />

      <div className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={resolveMediaSrc(content.events.header.image)} alt={content.events.header.image.alt || 'Events at Dundee Elim'} className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        </div>
        <div className="orb w-96 h-96 bg-blue-800 top-0 right-1/3" />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <span className="text-blue-400 text-xs uppercase tracking-widest font-medium">{content.events.header.eyebrow}</span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mt-3 mb-4">
            {content.events.header.titleLead} <span className="text-gradient">{content.events.header.titleHighlight}</span>
          </h1>
          <p className="text-white/55 max-w-2xl mx-auto">{content.events.header.description}</p>
        </div>
      </div>

      <div className="px-4 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-1 rounded-2xl p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {views.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setView(key);
                  setSelectedDay(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === key ? 'text-white' : 'text-white/50 hover:text-white'}`}
                style={view === key ? { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' } : {}}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === category ? 'text-white' : 'text-white/45 hover:text-white'}`}
                style={filter === category
                  ? { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {content.events.categoryLabels[category] || category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="max-w-7xl mx-auto">
          {view === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((event, index) => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
                  <EventCard event={event} />
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <p className="col-span-3 text-center text-white/30 py-16">No events found for this category.</p>
              )}
            </div>
          )}

          {view === 'week' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <CalendarWeekView events={filtered} currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} onDaySelect={handleDaySelect} />
              </div>
              <div>
                {selectedDay
                  ? <DayPanel day={selectedDay} events={filtered} onClose={() => setSelectedDay(null)} />
                  : <div className="lg-surface rounded-2xl p-6 text-center text-white/25 text-sm h-full flex items-center justify-center relative overflow-hidden">{specularLine}Click a day to see its events</div>}
              </div>
            </div>
          )}

          {view === 'month' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <CalendarMonthView events={filtered} selectedDay={selectedDay} onDaySelect={handleDaySelect} />
              </div>
              <div>
                {selectedDay
                  ? <DayPanel day={selectedDay} events={filtered} onClose={() => setSelectedDay(null)} />
                  : <div className="lg-surface rounded-2xl p-6 text-center text-white/25 text-sm h-full flex items-center justify-center min-h-[200px] relative overflow-hidden">{specularLine}Click a day to see its events</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
