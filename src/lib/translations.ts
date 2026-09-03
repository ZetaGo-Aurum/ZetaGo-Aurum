export type Language = 'en' | 'id'

export type TranslationKey =
  | 'brand.name'
  | 'brand.tagline'
  | 'nav.home'
  | 'nav.works'
  | 'nav.domains'
  | 'nav.connect'
  | 'nav.menu'
  | 'nav.close'
  | 'nav.kyoko'
  | 'nav.web'
  | 'nav.journal'
  | 'nav.lab'
  | 'nav.cosmos'
  | 'nav.aurum'
  | 'hero.eyebrow'
  | 'hero.title.line1'
  | 'hero.title.line2'
  | 'hero.philosophy'
  | 'hero.subtitle'
  | 'hero.cta.explore'
  | 'hero.cta.connect'
  | 'hero.scroll'
  | 'orbital.title'
  | 'orbital.subtitle'
  | 'orbital.center.label'
  | 'works.title'
  | 'works.subtitle'
  | 'works.viewAll'
  | 'works.explore'
  | 'domains.title'
  | 'domains.subtitle'
  | 'domains.visit'
  | 'domains.active'
  | 'connect.title'
  | 'connect.subtitle'
  | 'connect.github'
  | 'connect.npm'
  | 'connect.email'
  | 'connect.follow'
  | 'footer.rights'
  | 'footer.philosophy'
  | 'footer.built'
  | 'theme.toggle'
  | 'lang.toggle'
  | 'section.about'

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    'brand.name': 'ZetAgo Aurum',
    'brand.tagline': 'Crafting Gold-Standard Digital Works',
    'nav.home': 'Home',
    'nav.works': 'Works',
    'nav.domains': 'Domains',
    'nav.connect': 'Connect',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'nav.kyoko': 'kyoko.biz.id',
    'nav.web': 'Web Works',
    'nav.journal': 'Journal',
    'nav.lab': 'Lab',
    'nav.cosmos': 'Cosmos',
    'nav.aurum': 'Aurum',
    'hero.eyebrow': 'Personal Hub · Est. MMXXV',
    'hero.title.line1': 'Moving Forward,',
    'hero.title.line2': 'Innovating Endlessly',
    'hero.philosophy':
      'Stepping forward, endlessly innovating, producing works as beautiful as gold.',
    'hero.subtitle':
      'A central atelier for every creation — designs, domains, code, and ideas. Each piece refined with patience, polished to a golden standard.',
    'hero.cta.explore': 'Explore the Universe',
    'hero.cta.connect': 'Connect with Me',
    'hero.scroll': 'Scroll to discover',
    'orbital.title': 'The Constellation',
    'orbital.subtitle':
      'Each node orbits the same core. Tap any planet to travel to its world.',
    'orbital.center.label': 'Atelier',
    'works.title': 'Featured Works',
    'works.subtitle':
      'A curated selection of creations — design, web, tools, and experiments in code.',
    'works.viewAll': 'View All',
    'works.explore': 'Explore',
    'domains.title': 'Domains & Worlds',
    'domains.subtitle':
      'A constellation of digital estates, each with its own purpose and identity.',
    'domains.visit': 'Visit',
    'domains.active': 'Live',
    'connect.title': 'Connect',
    'connect.subtitle':
      'Find me where the code lives. Open to collaboration, conversation, and curiosity.',
    'connect.github': 'GitHub',
    'connect.npm': 'NPM',
    'connect.email': 'Email',
    'connect.follow': 'Follow',
    'footer.rights': 'All rights reserved.',
    'footer.philosophy': 'Forward. Endlessly. Like gold.',
    'footer.built': 'Designed & built with intent.',
    'theme.toggle': 'Toggle theme',
    'lang.toggle': 'Switch language',
    'section.about': 'About',
  },
  id: {
    'brand.name': 'ZetAgo Aurum',
    'brand.tagline': 'Mengukir Karya Digital Bernilai Emas',
    'nav.home': 'Beranda',
    'nav.works': 'Karya',
    'nav.domains': 'Domain',
    'nav.connect': 'Terhubung',
    'nav.menu': 'Menu',
    'nav.close': 'Tutup',
    'nav.kyoko': 'kyoko.biz.id',
    'nav.web': 'Karya Web',
    'nav.journal': 'Jurnal',
    'nav.lab': 'Lab',
    'nav.cosmos': 'Kosmos',
    'nav.aurum': 'Aurum',
    'hero.eyebrow': 'Hub Personal · Est. MMXXV',
    'hero.title.line1': 'Melangkah Maju,',
    'hero.title.line2': 'Terus Berinovasi',
    'hero.philosophy':
      'Melangkah maju, terus berinovasi, menghasilkan karya yang indah seperti emas.',
    'hero.subtitle':
      'Sebuah atelier pusat untuk setiap karya — desain, domain, kode, dan ide. Setiap karya diperhalus dengan kesabaran, dipoles hingga standar emas.',
    'hero.cta.explore': 'Jelajahi Semesta',
    'hero.cta.connect': 'Terhubung Denganku',
    'hero.scroll': 'Gulir untuk menemukan',
    'orbital.title': 'Konstelasi',
    'orbital.subtitle':
      'Setiap titik mengorbit inti yang sama. Sentuh planet mana pun untuk menuju dunianya.',
    'orbital.center.label': 'Atelier',
    'works.title': 'Karya Pilihan',
    'works.subtitle':
      'Pilihan kurasi karya — desain, web, alat, dan eksperimen dalam kode.',
    'works.viewAll': 'Lihat Semua',
    'works.explore': 'Jelajahi',
    'domains.title': 'Domain & Dunia',
    'domains.subtitle':
      'Konstelasi perkebunan digital, masing-masing dengan tujuan dan identitasnya sendiri.',
    'domains.visit': 'Kunjungi',
    'domains.active': 'Aktif',
    'connect.title': 'Terhubung',
    'connect.subtitle':
      'Temukan aku di tempat kode itu hidup. Terbuka untuk kolaborasi, percakapan, dan rasa ingin tahu.',
    'connect.github': 'GitHub',
    'connect.npm': 'NPM',
    'connect.email': 'Email',
    'connect.follow': 'Ikuti',
    'footer.rights': 'Hak cipta dilindungi.',
    'footer.philosophy': 'Maju. Terus. Seperti emas.',
    'footer.built': 'Didesain & dibangun dengan niat.',
    'theme.toggle': 'Ganti tema',
    'lang.toggle': 'Ganti bahasa',
    'section.about': 'Tentang',
  },
}
