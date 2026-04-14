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

      <div className="page-hero">
        <div className="page-hero-media">
          <img src={resolveMediaSrc(content.events.header.image)} alt={content.events.header.image.alt || 'Events at Dundee Elim'} className="w-full h-full object-cover opacity-20" />
          <div className="page-hero-overlay" />
        </div>
        <div className="page-hero-inner">
          <span className="page-eyebrow">{content.events.header.eyebrow}</span>
          <h1 className="page-title">
            {content.events.header.titleLead} <span className="text-gradient">{content.events.header.titleHighlight}</span>
          </h1>
          <p className="page-description">{content.events.header.description}</p>
        </div>
      </div>

      <div className="px-4 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="glass-chip-set">
            {views.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setView(key);
                    setSelectedDay(null);
                  }}
                  className={`glass-chip flex items-center gap-2 ${view === key ? 'glass-chip-active' : ''}`}
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
                className={`glass-chip ${filter === category ? 'glass-chip-active' : ''}`}
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
                <p className="col-span-3 glass-panel py-16 text-center text-white/35">No events found for this category.</p>
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
                  : <div className="glass-panel flex h-full items-center justify-center p-6 text-center text-sm text-white/35">{specularLine}Click a day to see its events</div>}
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
                  : <div className="glass-panel flex min-h-[200px] h-full items-center justify-center p-6 text-center text-sm text-white/35">{specularLine}Click a day to see its events</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
