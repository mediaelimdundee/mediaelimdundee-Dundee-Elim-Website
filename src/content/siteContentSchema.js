import { z } from 'zod';

export const mediaAssetRefSchema = z.object({
  path: z.string().default(''),
  url: z.string().default(''),
  alt: z.string().default(''),
});

export const seoFieldsSchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
});

const linkFieldsSchema = z.object({
  label: z.string().default(''),
  href: z.string().default(''),
});

const textItemSchema = z.object({
  label: z.string().default(''),
  value: z.string().default(''),
});

const quickInfoItemSchema = z.object({
  kind: z.enum(['service', 'location', 'kids']).default('service'),
  title: z.string().default(''),
  sub: z.string().default(''),
});

const homeBeliefItemSchema = z.object({
  kind: z.enum(['worship', 'bible', 'community']).default('worship'),
  title: z.string().default(''),
  description: z.string().default(''),
});

const homeStatItemSchema = z.object({
  value: z.string().default(''),
  label: z.string().default(''),
});

const weeklyRhythmItemSchema = z.object({
  day: z.string().default(''),
  time: z.string().default(''),
  name: z.string().default(''),
});

const sermonVideoSchema = z.object({
  id: z.string().default(''),
  title: z.string().default(''),
  speaker: z.string().default(''),
  series: z.string().default(''),
  date: z.string().default(''),
  description: z.string().default(''),
  thumbnailUrl: z.string().default(''),
  status: z.enum(['draft', 'published']).default('published'),
  publishedAt: z.string().default(''),
});

const audioSermonSchema = z.object({
  id: z.string().default(''),
  title: z.string().default(''),
  speaker: z.string().default(''),
  series: z.string().default(''),
  date: z.string().default(''),
  description: z.string().default(''),
  audio_url: z.string().default(''),
  thumbnailUrl: z.string().default(''),
  youtube_url: z.string().default(''),
  start_time: z.string().default(''),
  end_time: z.string().default(''),
  scripture_reference: z.string().default(''),
  episode_number: z.number().int().nullable().default(null),
  show_notes: z.string().default(''),
  transcript: z.string().default(''),
  duration_seconds: z.number().int().nullable().default(null),
  status: z.enum(['draft', 'ready', 'published']).default('draft'),
  publishedAt: z.string().default(''),
});

const podcastSettingsSchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
  churchName: z.string().default(''),
  author: z.string().default(''),
  email: z.string().default(''),
  website: z.string().default(''),
  category: z.string().default('Religion & Spirituality'),
  language: z.string().default('en'),
  copyright: z.string().default(''),
  coverArt: mediaAssetRefSchema.default({}),
});

const recurringEventTemplateSchema = z.object({
  id: z.string().default(''),
  title: z.string().default(''),
  description: z.string().default(''),
  location: z.string().default(''),
  category: z.enum(['service', 'prayer', 'youth', 'community', 'special']).default('service'),
  weekday: z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']).default('sunday'),
  time: z.string().default(''),
  intervalWeeks: z.number().int().min(1).default(1),
  startDate: z.string().default(''),
  recurringLabel: z.string().default(''),
  status: z.enum(['draft', 'published']).default('published'),
  publishedAt: z.string().default(''),
});

const specialEventSchema = z.object({
  id: z.string().default(''),
  title: z.string().default(''),
  description: z.string().default(''),
  location: z.string().default(''),
  category: z.enum(['service', 'prayer', 'youth', 'community', 'special']).default('community'),
  date: z.string().default(''),
  time: z.string().default(''),
  image: mediaAssetRefSchema.optional(),
  status: z.enum(['draft', 'published']).default('published'),
  publishedAt: z.string().default(''),
});

const ministryItemSchema = z.object({
  id: z.string().default(''),
  title: z.string().default(''),
  tag: z.enum(['Discover', 'Community', 'Children', 'Serve']).default('Discover'),
  summary: z.string().default(''),
  body: z.string().default(''),
  details: z.array(z.string()).default([]),
  linkLabel: z.string().default(''),
  linkUrl: z.string().default(''),
  contactEmail: z.string().default(''),
  contactPhone: z.string().default(''),
  iconKey: z.enum(['heart', 'users', 'zap', 'star', 'church', 'book-open', 'utensils-crossed', 'baby', 'music']).default('users'),
  theme: z.enum(['red', 'orange', 'blue', 'green', 'pink', 'indigo', 'amber', 'yellow', 'purple']).default('blue'),
  status: z.enum(['draft', 'published']).default('published'),
  publishedAt: z.string().default(''),
});

const giveMethodSchema = z.object({
  kind: z.enum(['online', 'bank', 'inperson']).default('online'),
  title: z.string().default(''),
  description: z.string().default(''),
  ctaLabel: z.string().default(''),
  ctaUrl: z.string().default(''),
  contactEmail: z.string().default(''),
  contactPhone: z.string().default(''),
  addressLines: z.array(z.string()).default([]),
});

const impactItemSchema = z.object({
  label: z.string().default(''),
  icon: z.string().default(''),
});

const infoCardSchema = z.object({
  kind: z.enum(['address', 'contact', 'service']).default('address'),
  title: z.string().default(''),
  descriptionLines: z.array(z.string()).default([]),
  items: z.array(textItemSchema).default([]),
  linkLabel: z.string().default(''),
  linkUrl: z.string().default(''),
});

const resourceCardSchema = z.object({
  kind: z.enum(['elim', 'report', 'policy']).default('elim'),
  title: z.string().default(''),
  description: z.string().default(''),
  ctaLabel: z.string().default(''),
  ctaUrl: z.string().default(''),
});

export const siteContentSchema = z.object({
  settings: z.object({
    siteName: z.string().default(''),
    shortName: z.string().default(''),
    tagline: z.string().default(''),
    footerDescription: z.string().default(''),
    contact: z.object({
      email: z.string().default(''),
      phoneDisplay: z.string().default(''),
      phoneHref: z.string().default(''),
      addressLine1: z.string().default(''),
      addressLine2: z.string().default(''),
      addressShort: z.string().default(''),
    }),
    links: z.object({
      mapsUrl: z.string().default(''),
      mapsEmbedUrl: z.string().default(''),
      youtubeChannelId: z.string().default(''),
      youtubeUrl: z.string().default(''),
      facebookUrl: z.string().default(''),
      elimUrl: z.string().default(''),
      onlineGivingUrl: z.string().default(''),
      giftAidFormUrl: z.string().default(''),
      safeguardingPolicyUrl: z.string().default(''),
      safeguardingConcernUrl: z.string().default(''),
      elimSafeguardingUrl: z.string().default(''),
    }),
    branding: z.object({
      logo: mediaAssetRefSchema,
    }),
    seo: z.object({
      siteUrl: z.string().default(''),
      defaultTitle: z.string().default(''),
      defaultDescription: z.string().default(''),
      defaultImage: mediaAssetRefSchema,
    }),
  }),
  home: z.object({
    seo: seoFieldsSchema,
    hero: z.object({
      eyebrow: z.string().default(''),
      titleLead: z.string().default(''),
      titleHighlight: z.string().default(''),
      description: z.string().default(''),
      primaryCtaLabel: z.string().default(''),
      primaryCtaPath: z.string().default(''),
      secondaryCtaLabel: z.string().default(''),
      secondaryCtaPath: z.string().default(''),
      serviceBadgeLabel: z.string().default(''),
      serviceBadgeDay: z.string().default(''),
      serviceBadgeTime: z.string().default(''),
      scrollLabel: z.string().default(''),
      slides: z.array(z.object({
        image: mediaAssetRefSchema,
        caption: z.string().default(''),
      })).default([]),
    }),
    quickInfo: z.object({
      items: z.array(quickInfoItemSchema).default([]),
    }),
    pastors: z.object({
      eyebrow: z.string().default(''),
      titleLead: z.string().default(''),
      titleHighlight: z.string().default(''),
      paragraphs: z.array(z.string()).default([]),
      image: mediaAssetRefSchema,
      imageTitle: z.string().default(''),
      imageSubtitle: z.string().default(''),
      stats: z.array(homeStatItemSchema).default([]),
      ctaLabel: z.string().default(''),
      ctaPath: z.string().default(''),
    }),
    beliefs: z.object({
      eyebrow: z.string().default(''),
      title: z.string().default(''),
      items: z.array(homeBeliefItemSchema).default([]),
    }),
    gallery: z.object({
      eyebrow: z.string().default(''),
      title: z.string().default(''),
      topImages: z.array(mediaAssetRefSchema).default([]),
      bottomImages: z.array(mediaAssetRefSchema).default([]),
    }),
    media: z.object({
      eyebrow: z.string().default(''),
      title: z.string().default(''),
      subscribeLabel: z.string().default(''),
      viewAllLabel: z.string().default(''),
      viewAllPath: z.string().default(''),
    }),
    weeklyRhythm: z.object({
      title: z.string().default(''),
      items: z.array(weeklyRhythmItemSchema).default([]),
      footerLabel: z.string().default(''),
      footerPath: z.string().default(''),
    }),
    prayerRequest: z.object({
      eyebrow: z.string().default(''),
      title: z.string().default(''),
      description: z.string().default(''),
      successTitle: z.string().default(''),
      successDescription: z.string().default(''),
      resetLabel: z.string().default(''),
      privacyLabel: z.string().default(''),
      privacyDescription: z.string().default(''),
      submitLabel: z.string().default(''),
    }),
    cta: z.object({
      title: z.string().default(''),
      description: z.string().default(''),
      primaryLabel: z.string().default(''),
      primaryPath: z.string().default(''),
      secondaryLabel: z.string().default(''),
      secondaryUrl: z.string().default(''),
    }),
  }),
  about: z.object({
    seo: seoFieldsSchema,
    header: z.object({
      eyebrow: z.string().default(''),
      titleLead: z.string().default(''),
      titleHighlight: z.string().default(''),
      description: z.string().default(''),
      image: mediaAssetRefSchema,
    }),
    pastors: z.object({
      eyebrow: z.string().default(''),
      titleLead: z.string().default(''),
      titleHighlight: z.string().default(''),
      paragraphs: z.array(z.string()).default([]),
      image: mediaAssetRefSchema,
    }),
    sundayExpectations: z.object({
      title: z.string().default(''),
      description: z.string().default(''),
      items: z.array(z.object({
        number: z.string().default(''),
        title: z.string().default(''),
        description: z.string().default(''),
      })).default([]),
      note: z.string().default(''),
    }),
    gettingHere: z.object({
      title: z.string().default(''),
      cards: z.array(z.object({
        kind: z.enum(['address', 'car', 'bus']).default('address'),
        title: z.string().default(''),
        description: z.string().default(''),
        linkLabel: z.string().default(''),
        linkUrl: z.string().default(''),
      })).default([]),
      mapEmbedUrl: z.string().default(''),
    }),
    network: z.object({
      title: z.string().default(''),
      description: z.string().default(''),
      linkLabel: z.string().default(''),
      linkUrl: z.string().default(''),
    }),
  }),
  sermons: z.object({
    seo: seoFieldsSchema,
    header: z.object({
      eyebrow: z.string().default(''),
      titleLead: z.string().default(''),
      titleHighlight: z.string().default(''),
      description: z.string().default(''),
      image: mediaAssetRefSchema,
    }),
    subscribeCard: z.object({
      title: z.string().default(''),
      description: z.string().default(''),
      linkLabel: z.string().default(''),
    }),
    tabs: z.object({
      live: z.string().default(''),
      video: z.string().default(''),
      audio: z.string().default(''),
    }),
    live: z.object({
      liveTitle: z.string().default(''),
      offlineTitle: z.string().default(''),
      liveDescription: z.string().default(''),
      offlineDescription: z.string().default(''),
      buttonLabel: z.string().default(''),
    }),
    videoSection: z.object({
      title: z.string().default(''),
    }),
    videoSermons: z.array(sermonVideoSchema).default([]),
    audioSermons: z.array(audioSermonSchema).default([]),
    podcast: podcastSettingsSchema.default({}),
  }),
  events: z.object({
    seo: seoFieldsSchema,
    header: z.object({
      eyebrow: z.string().default(''),
      titleLead: z.string().default(''),
      titleHighlight: z.string().default(''),
      description: z.string().default(''),
      image: mediaAssetRefSchema,
    }),
    viewLabels: z.object({
      list: z.string().default(''),
      week: z.string().default(''),
      month: z.string().default(''),
    }),
    categoryLabels: z.object({
      all: z.string().default('All'),
      service: z.string().default('Service'),
      prayer: z.string().default('Prayer'),
      youth: z.string().default('Youth'),
      community: z.string().default('Community'),
      special: z.string().default('Special'),
    }),
    recurringTemplates: z.array(recurringEventTemplateSchema).default([]),
    specialEvents: z.array(specialEventSchema).default([]),
  }),
  ministries: z.object({
    seo: seoFieldsSchema,
    header: z.object({
      eyebrow: z.string().default(''),
      titleLead: z.string().default(''),
      titleHighlight: z.string().default(''),
      description: z.string().default(''),
      image: mediaAssetRefSchema,
    }),
    items: z.array(ministryItemSchema).default([]),
    photoStrip: z.array(mediaAssetRefSchema).default([]),
  }),
  give: z.object({
    seo: seoFieldsSchema,
    header: z.object({
      eyebrow: z.string().default(''),
      titleLead: z.string().default(''),
      titleHighlight: z.string().default(''),
      quote: z.string().default(''),
      quoteCitation: z.string().default(''),
      image: mediaAssetRefSchema,
    }),
    scripture: z.object({
      quote: z.string().default(''),
      citation: z.string().default(''),
    }),
    methodsTitle: z.string().default(''),
    methods: z.array(giveMethodSchema).default([]),
    giftAid: z.object({
      title: z.string().default(''),
      description: z.string().default(''),
      ctaLabel: z.string().default(''),
      ctaUrl: z.string().default(''),
    }),
    impact: z.object({
      title: z.string().default(''),
      items: z.array(impactItemSchema).default([]),
    }),
    contactCta: z.object({
      title: z.string().default(''),
      description: z.string().default(''),
    }),
  }),
  contact: z.object({
    seo: seoFieldsSchema,
    header: z.object({
      eyebrow: z.string().default(''),
      titleLead: z.string().default(''),
      titleHighlight: z.string().default(''),
      description: z.string().default(''),
      image: mediaAssetRefSchema,
    }),
    infoCards: z.array(infoCardSchema).default([]),
    form: z.object({
      title: z.string().default(''),
      successTitle: z.string().default(''),
      successDescription: z.string().default(''),
      resetLabel: z.string().default(''),
      submitLabel: z.string().default(''),
    }),
    mapEmbedUrl: z.string().default(''),
  }),
  safeguarding: z.object({
    seo: seoFieldsSchema,
    header: z.object({
      eyebrow: z.string().default(''),
      titleLead: z.string().default(''),
      titleHighlight: z.string().default(''),
      description: z.string().default(''),
      image: mediaAssetRefSchema,
    }),
    statement: z.object({
      title: z.string().default(''),
      paragraphs: z.array(z.string()).default([]),
    }),
    resourcesTitle: z.string().default(''),
    resources: z.array(resourceCardSchema).default([]),
    contact: z.object({
      title: z.string().default(''),
      description: z.string().default(''),
      buttonLabel: z.string().default(''),
    }),
  }),
});

export function parseSiteContent(content) {
  return siteContentSchema.parse(content);
}

export function safeParseSiteContent(content) {
  return siteContentSchema.safeParse(content);
}
