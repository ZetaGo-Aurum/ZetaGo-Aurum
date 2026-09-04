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
  | 'nav.kyokonime'
  | 'nav.modkita'
  | 'nav.sawitdb'
  | 'nav.aurumbaileys'
  | 'nav.aleopantest'
  | 'nav.diringkes'
  | 'nav.decagramton'
  | 'nav.straw'
  | 'nav.plester'
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
  | 'orbital.hint.pc'
  | 'orbital.hint.mobile'
  | 'orbital.filter.all'
  | 'orbital.filter.faction'
  | 'orbital.filter.packages'
  | 'orbital.filter.security'
  | 'orbital.filter.tools'
  | 'orbital.reset'
  | 'orbital.autoOrbit'
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
    'brand.name': 'ZetaGo-Aurum',
    'brand.tagline': 'Crafting Gold-Standard Digital Works',
    'nav.home': 'Home',
    'nav.works': 'Works',
    'nav.domains': 'Domains',
    'nav.connect': 'Connect',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'nav.kyoko': 'kyoko.biz.id',
    'nav.kyokonime': 'Kyokonime',
    'nav.modkita': 'Mod-Kita',
    'nav.sawitdb': 'SawitDB',
    'nav.aurumbaileys': 'Aurum Baileys',
    'nav.aleopantest': 'AleoPantest',
    'nav.diringkes': 'Diringkes',
    'nav.decagramton': 'Decagramton',
    'nav.straw': 'Straw',
    'nav.plester': 'Plester',
    'nav.web': 'Web Works',
    'nav.journal': 'Journal',
    'nav.lab': 'Lab',
    'nav.cosmos': 'Cosmos',
    'nav.aurum': 'Aurum',
    'hero.eyebrow': 'Personal Hub · Est. 2019',
    'hero.title.line1': 'Moving Forward,',
    'hero.title.line2': 'Innovating Endlessly',
    'hero.philosophy':
      'Stepping forward, endlessly innovating, producing works as beautiful as gold.',
    'hero.subtitle':
      'A central atelier for every creation: designs, faction domains, socket engines, and autonomous systems. Each piece refined with patience, polished to a golden standard.',
    'hero.cta.explore': 'Explore 3D Constellation',
    'hero.cta.connect': 'Connect with Me',
    'hero.scroll': 'Scroll to discover',
    'orbital.title': '3D Orbital Constellation',
    'orbital.subtitle':
      'Interactive 3D navigation system. Drag to rotate in 360 degrees or scroll with wheel on PC, swipe in any direction on Android and touch devices.',
    'orbital.center.label': 'Atelier Core',
    'orbital.hint.pc': 'Scroll wheel / Drag to rotate 3D orbit · Click node to launch',
    'orbital.hint.mobile': 'Swipe to spin · Tap node to see detail · Tap link to visit',
    'orbital.filter.all': 'All Worlds',
    'orbital.filter.faction': 'Kyoko Faction',
    'orbital.filter.packages': 'NPM Engines',
    'orbital.filter.security': 'Security & Pentest',
    'orbital.filter.tools': 'Core Tools',
    'orbital.reset': 'Reset Angle',
    'orbital.autoOrbit': 'Auto Orbit',
    'works.title': 'Featured Works',
    'works.subtitle':
      'A curated portfolio of engineering feats: databases, communication engines, security suites, and high-performance tools.',
    'works.viewAll': 'View All Repositories',
    'works.explore': 'Explore',
    'domains.title': 'Kyoko Faction & Domains',
    'domains.subtitle':
      'A network of digital platforms and flagships, each built for sovereign operations and media distribution.',
    'domains.visit': 'Visit Platform',
    'domains.active': 'Online',
    'connect.title': 'Open Channels',
    'connect.subtitle':
      'Direct contact points for engineering, architecture inquiries, and collaboration across the network.',
    'connect.github': 'GitHub',
    'connect.npm': 'NPM Registry',
    'connect.email': 'Direct Email',
    'connect.instagram': 'Instagram',
    'connect.audiomack': 'Audiomack',
    'connect.suno': 'Suno AI',
    'connect.follow': 'Inspect',
    'footer.rights': 'All rights reserved.',
    'footer.philosophy': 'Forward. Endlessly. Like gold.',
    'footer.built': 'Designed and built with architectural intent.',
    'theme.toggle': 'Toggle theme',
    'lang.toggle': 'Switch language',
    'section.about': 'About',
    'nav.octodos': 'OctoDos',
    'nav.audiomack': 'Audiomack',
    'nav.suno': 'Suno AI',
  },
  id: {
    'brand.name': 'ZetaGo-Aurum',
    'brand.tagline': 'Mengukir Karya Digital Bernilai Emas',
    'nav.home': 'Beranda',
    'nav.works': 'Karya',
    'nav.domains': 'Domain',
    'nav.connect': 'Terhubung',
    'nav.menu': 'Menu',
    'nav.close': 'Tutup',
    'nav.kyoko': 'kyoko.biz.id',
    'nav.kyokonime': 'Kyokonime',
    'nav.modkita': 'Mod-Kita',
    'nav.sawitdb': 'SawitDB',
    'nav.aurumbaileys': 'Aurum Baileys',
    'nav.aleopantest': 'AleoPantest',
    'nav.diringkes': 'Diringkes',
    'nav.decagramton': 'Decagramton',
    'nav.straw': 'Straw',
    'nav.plester': 'Plester',
    'nav.web': 'Karya Web',
    'nav.journal': 'Jurnal',
    'nav.lab': 'Lab',
    'nav.cosmos': 'Kosmos',
    'nav.aurum': 'Aurum',
    'hero.eyebrow': 'Hub Personal · Est. 2019',
    'hero.title.line1': 'Melangkah Maju,',
    'hero.title.line2': 'Terus Berinovasi',
    'hero.philosophy':
      'Melangkah maju, terus berinovasi, menghasilkan karya yang indah seperti emas.',
    'hero.subtitle':
      'Sebuah atelier pusat untuk setiap karya: desain, domain faksi, engine socket, dan sistem otonom. Setiap karya diperhalus dengan kesabaran, dipoles hingga standar emas.',
    'hero.cta.explore': 'Jelajahi Konstelasi 3D',
    'hero.cta.connect': 'Terhubung Denganku',
    'hero.scroll': 'Gulir untuk menemukan',
    'orbital.title': 'Konstelasi Orbital 3D',
    'orbital.subtitle':
      'Sistem navigasi 3D interaktif. Drag untuk putar 360 derajat atau scroll dengan mouse di PC, geser ke segala arah di Android dan layar sentuh.',
    'orbital.center.label': 'Inti Atelier',
    'orbital.hint.pc': 'Scroll mouse / Drag untuk memutar orbit 3D · Klik titik untuk membuka',
    'orbital.hint.mobile': 'Geser untuk memutar · Ketuk titik untuk lihat detail · Ketuk link untuk kunjungi',
    'orbital.filter.all': 'Semua Dunia',
    'orbital.filter.faction': 'Faksi Kyoko',
    'orbital.filter.packages': 'Engine NPM',
    'orbital.filter.security': 'Keamanan & Pentest',
    'orbital.filter.tools': 'Perkakas Utama',
    'orbital.reset': 'Reset Sudut',
    'orbital.autoOrbit': 'Orbit Otomatis',
    'works.title': 'Karya Pilihan',
    'works.subtitle':
      'Portofolio kurasi dari rekayasa perangkat lunak: database, engine komunikasi, suite keamanan, dan perkakas berkinerja tinggi.',
    'works.viewAll': 'Lihat Semua Repositori',
    'works.explore': 'Jelajahi',
    'domains.title': 'Faksi Kyoko & Domain',
    'domains.subtitle':
      'Jaringan platform digital dan layanan unggulan, dibangun untuk kedaulatan operasional dan distribusi media.',
    'domains.visit': 'Kunjungi Platform',
    'domains.active': 'Aktif',
    'connect.title': 'Saluran Terbuka',
    'connect.subtitle':
      'Titik kontak langsung untuk konsultasi rekayasa arsitektur, kode, dan kolaborasi dalam jaringan.',
    'connect.github': 'GitHub',
    'connect.npm': 'NPM Registry',
    'connect.email': 'Email Langsung',
    'connect.instagram': 'Instagram',
    'connect.audiomack': 'Audiomack',
    'connect.suno': 'Suno AI',
    'connect.follow': 'Periksa',
    'footer.rights': 'Hak cipta dilindungi.',
    'footer.philosophy': 'Maju. Terus. Seperti emas.',
    'footer.built': 'Didesain dan dibangun dengan niat arsitektur matang.',
    'theme.toggle': 'Ganti tema',
    'lang.toggle': 'Ganti bahasa',
    'section.about': 'Tentang',
    'nav.octodos': 'OctoDos',
    'nav.audiomack': 'Audiomack',
    'nav.suno': 'Suno AI',
  },
}
