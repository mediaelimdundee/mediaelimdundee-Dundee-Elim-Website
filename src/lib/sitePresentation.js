import {
  AlertTriangle,
  Baby,
  BookOpen,
  Building2,
  Bus,
  Car,
  Church,
  Clock,
  CreditCard,
  FileText,
  Globe,
  Heart,
  Mail,
  MapPin,
  Music,
  ShieldCheck,
  Star,
  Users,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';

export const quickInfoConfig = {
  service: { Icon: Clock, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
  location: { Icon: MapPin, color: 'text-cyan-400', bg: 'rgba(6,182,212,0.1)' },
  kids: { Icon: Users, color: 'text-violet-400', bg: 'rgba(139,92,246,0.1)' },
};

export const beliefConfig = {
  worship: { Icon: Heart, color: 'text-red-400', bg: 'rgba(239,68,68,0.1)' },
  bible: { Icon: BookOpen, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
  community: { Icon: Users, color: 'text-green-400', bg: 'rgba(34,197,94,0.1)' },
};

export const aboutTravelConfig = {
  address: { Icon: MapPin, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
  car: { Icon: Car, color: 'text-cyan-400', bg: 'rgba(6,182,212,0.1)' },
  bus: { Icon: Bus, color: 'text-violet-400', bg: 'rgba(139,92,246,0.1)' },
};

export const ministryIconMap = {
  heart: Heart,
  users: Users,
  zap: Zap,
  star: Star,
  church: Church,
  'book-open': BookOpen,
  'utensils-crossed': UtensilsCrossed,
  baby: Baby,
  music: Music,
};

export const ministryThemeMap = {
  red: { color: 'text-red-400', bg: 'rgba(239,68,68,0.1)' },
  orange: { color: 'text-orange-400', bg: 'rgba(249,115,22,0.1)' },
  blue: { color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
  green: { color: 'text-green-400', bg: 'rgba(34,197,94,0.1)' },
  pink: { color: 'text-pink-400', bg: 'rgba(236,72,153,0.1)' },
  indigo: { color: 'text-indigo-400', bg: 'rgba(99,102,241,0.1)' },
  amber: { color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
  yellow: { color: 'text-yellow-400', bg: 'rgba(234,179,8,0.1)' },
  purple: { color: 'text-purple-400', bg: 'rgba(168,85,247,0.1)' },
};

export const ministryTagStyles = {
  Discover: { bg: 'rgba(59,130,246,0.15)', text: 'text-blue-300', border: 'rgba(59,130,246,0.2)' },
  Community: { bg: 'rgba(34,197,94,0.15)', text: 'text-green-300', border: 'rgba(34,197,94,0.2)' },
  Children: { bg: 'rgba(234,179,8,0.15)', text: 'text-yellow-300', border: 'rgba(234,179,8,0.2)' },
  Serve: { bg: 'rgba(168,85,247,0.15)', text: 'text-purple-300', border: 'rgba(168,85,247,0.2)' },
};

export const giveMethodConfig = {
  online: { Icon: CreditCard, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
  bank: { Icon: Building2, color: 'text-cyan-400', bg: 'rgba(6,182,212,0.1)' },
  inperson: { Icon: Heart, color: 'text-violet-400', bg: 'rgba(139,92,246,0.1)' },
};

export const contactInfoConfig = {
  address: { Icon: MapPin, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
  contact: { Icon: Mail, color: 'text-cyan-400', bg: 'rgba(6,182,212,0.1)' },
  service: { Icon: Clock, color: 'text-violet-400', bg: 'rgba(139,92,246,0.1)' },
};

export const safeguardingResourceConfig = {
  elim: { Icon: ShieldCheck, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
  report: { Icon: AlertTriangle, color: 'text-yellow-400', bg: 'rgba(234,179,8,0.1)' },
  policy: { Icon: FileText, color: 'text-green-400', bg: 'rgba(34,197,94,0.1)' },
};

export const safeguardingActionStyles = {
  elim: {
    className: 'lg-btn-primary',
    style: undefined,
  },
  report: {
    className: 'text-yellow-300 hover:text-white',
    style: { background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.2)' },
  },
  policy: {
    className: 'text-green-300 hover:text-white',
    style: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' },
  },
};

export const recurringEventCategories = ['service', 'prayer', 'youth', 'community', 'special'];
