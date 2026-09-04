import {
  Github,
  Package,
  Globe,
  Palette,
  Code2,
  Sparkles,
  Layers,
  Shield,
  Terminal,
  Database,
  Film,
  Cpu,
  Music,
  Instagram,
  type LucideIcon,
} from 'lucide-react'

export interface OrbitalNode {
  id: string
  label: string
  labelId: string
  category: 'core' | 'faction' | 'package' | 'security' | 'tool'
  tagline: { en: string; id: string }
  href: string
  icon: LucideIcon
  angle: number
  ring: 1 | 2 | 3
  accent: 'gold' | 'soft' | 'bright'
  external?: boolean
}

export const orbitalNodes: OrbitalNode[] = [
  // Ring 1: Core Faction & Central Hubs
  {
    id: 'github',
    label: 'GitHub',
    labelId: 'connect.github',
    category: 'core',
    tagline: {
      en: 'Open source repositories and core architecture',
      id: 'Repositori open source dan arsitektur inti',
    },
    href: 'https://github.com/ZetaGo-Aurum',
    icon: Github,
    angle: 0,
    ring: 1,
    accent: 'gold',
    external: true,
  },
  {
    id: 'kyokonime',
    label: 'Kyokonime',
    labelId: 'nav.kyokonime',
    category: 'faction',
    tagline: {
      en: 'Curated anime media and streaming platform',
      id: 'Platform kurasi media dan streaming anime',
    },
    href: 'https://kyokonime.kyoko.biz.id',
    icon: Film,
    angle: 72,
    ring: 1,
    accent: 'bright',
    external: true,
  },
  {
    id: 'modkita',
    label: 'Mod-Kita',
    labelId: 'nav.modkita',
    category: 'faction',
    tagline: {
      en: 'Android modding and application hub',
      id: 'Hub aplikasi dan ekosistem modding Android',
    },
    href: 'https://mod-kita.kyoko.biz.id',
    icon: Cpu,
    angle: 144,
    ring: 1,
    accent: 'gold',
    external: true,
  },
  {
    id: 'npm',
    label: 'NPM Registry',
    labelId: 'connect.npm',
    category: 'core',
    tagline: {
      en: 'Published modules, sockets, and CLI engines',
      id: 'Modul terpublikasi, socket, dan CLI engine',
    },
    href: 'https://www.npmjs.com/~zetagoaurum',
    icon: Package,
    angle: 216,
    ring: 1,
    accent: 'soft',
    external: true,
  },
  {
    id: 'kyoko',
    label: 'kyoko.biz.id',
    labelId: 'nav.kyoko',
    category: 'faction',
    tagline: {
      en: 'Primary portal of the Kyoko digital network',
      id: 'Portal utama jaringan digital Kyoko',
    },
    href: 'https://kyoko.biz.id',
    icon: Globe,
    angle: 288,
    ring: 1,
    accent: 'bright',
    external: true,
  },

  // Ring 2: Key Frameworks & Security Tools
  {
    id: 'octodos',
    label: 'OctoDos',
    labelId: 'nav.octodos',
    category: 'security',
    tagline: {
      en: 'Pentest, DDoS stress-testing, recon, and data extraction toolkit',
      id: 'Toolkit pentest, stress-test DDoS, rekon, dan ekstraksi data',
    },
    href: 'https://github.com/ZetaGo-Aurum/OctoDos',
    icon: Shield,
    angle: 30,
    ring: 2,
    accent: 'gold',
    external: true,
  },
  {
    id: 'aurumbaileys',
    label: 'Aurum Baileys',
    labelId: 'nav.aurumbaileys',
    category: 'package',
    tagline: {
      en: 'Enterprise WhatsApp v7 engine with interactive A2UI',
      id: 'Engine WhatsApp v7 enterprise dengan dukungan interaktif A2UI',
    },
    href: 'https://www.npmjs.com/package/aurum-baileys',
    icon: Code2,
    angle: 105,
    ring: 2,
    accent: 'bright',
    external: true,
  },
  {
    id: 'aleopantest',
    label: 'AleoPantest',
    labelId: 'nav.aleopantest',
    category: 'security',
    tagline: {
      en: 'Advanced penetration testing suite with 548+ tools',
      id: 'Suite pengujian penetrasi canggih dengan 548+ tools',
    },
    href: 'https://www.npmjs.com/package/@zetagoaurum-dev/aleopantest',
    icon: Shield,
    angle: 180,
    ring: 2,
    accent: 'soft',
    external: true,
  },
  {
    id: 'diringkes',
    label: 'Diringkes',
    labelId: 'nav.diringkes',
    category: 'tool',
    tagline: {
      en: 'Ultra compression CLI and mobile-friendly TUI',
      id: 'Toolkit ultra kompresi CLI dan TUI mobile',
    },
    href: 'https://www.npmjs.com/package/diringkes',
    icon: Terminal,
    angle: 255,
    ring: 2,
    accent: 'gold',
    external: true,
  },
  {
    id: 'decagramton',
    label: 'Decagramton',
    labelId: 'nav.decagramton',
    category: 'package',
    tagline: {
      en: 'High-speed WhatsApp socket runtime series',
      id: 'Runtime socket WhatsApp berkecepatan tinggi',
    },
    href: 'https://www.npmjs.com/package/@zetagoaurum-socket/decagramton',
    icon: Sparkles,
    angle: 330,
    ring: 2,
    accent: 'bright',
    external: true,
  },

  // Ring 3: Specialized Scrapers & Autocorrect Runtimes
  {
    id: 'straw',
    label: 'Straw Scraper',
    labelId: 'nav.straw',
    category: 'tool',
    tagline: {
      en: 'Unified media, YouTube, and web extractor library',
      id: 'Library ekstraksi web, YouTube, dan media terpadu',
    },
    href: 'https://www.npmjs.com/package/@zetagoaurum-dev/straw',
    icon: Layers,
    angle: 60,
    ring: 3,
    accent: 'soft',
    external: true,
  },
  {
    id: 'plester',
    label: 'Plester Runtime',
    labelId: 'nav.plester',
    category: 'package',
    tagline: {
      en: 'Self-healing autocorrect and JSON repair engine',
      id: 'Engine perbaikan runtime dan pemulihan JSON mandiri',
    },
    href: 'https://www.npmjs.com/package/@zetagoaurum-dev/plester',
    icon: Palette,
    angle: 150,
    ring: 3,
    accent: 'gold',
    external: true,
  },
  {
    id: 'audiomack',
    label: 'Audiomack',
    labelId: 'nav.audiomack',
    category: 'faction',
    tagline: {
      en: 'Music releases and original tracks by ZetaGo-Aurum',
      id: 'Rilis musik dan karya orisinal dari ZetaGo-Aurum',
    },
    href: 'https://audiomack.com/deltaastra24',
    icon: Music,
    angle: 240,
    ring: 3,
    accent: 'bright',
    external: true,
  },
  {
    id: 'suno',
    label: 'Suno AI',
    labelId: 'nav.suno',
    category: 'faction',
    tagline: {
      en: 'AI-assisted music compositions and sonic experiments',
      id: 'Komposisi musik berbasis AI dan eksperimen sonik',
    },
    href: 'https://suno.com/@zetagoaurum',
    icon: Sparkles,
    angle: 320,
    ring: 3,
    accent: 'gold',
    external: true,
  },
]


export interface WorkItem {
  id: string
  title: string
  category: { en: string; id: string }
  description: { en: string; id: string }
  href: string
  year: string
  accent: 'gold' | 'soft' | 'bright'
  tags: string[]
  external?: boolean
}

export const works: WorkItem[] = [
  {
    id: 'octodos',
    title: 'OctoDos',
    category: { en: 'Security & Offensive Tools', id: 'Keamanan & Alat Ofensif' },
    description: {
      en: 'An offensive security toolkit covering pentest automation, DDoS stress-testing, network recon, and data extraction. Built for authorized security research.',
      id: 'Toolkit keamanan ofensif mencakup otomasi pentest, stress-test DDoS, rekon jaringan, dan ekstraksi data. Dirancang untuk riset keamanan yang sah.',
    },
    href: 'https://github.com/ZetaGo-Aurum/OctoDos',
    year: '2025',
    accent: 'gold',
    tags: ['Pentest', 'DDoS', 'Recon', 'Data Extraction'],
    external: true,
  },
  {
    id: 'aurum-baileys',
    title: 'Aurum-Baileys',
    category: { en: 'Communication Engine', id: 'Engine Komunikasi' },
    description: {
      en: 'Enterprise pure Baileys v7 engine featuring MessageBuilder v4.7, AIRich response, and interactive A2UI widget capabilities.',
      id: 'Engine WhatsApp enterprise Baileys v7 dengan MessageBuilder v4.7, respon AIRich, dan dukungan widget interaktif A2UI.',
    },
    href: 'https://www.npmjs.com/package/aurum-baileys',
    year: '2025',
    accent: 'bright',
    tags: ['TypeScript', 'Baileys v7', 'NPM Package'],
    external: true,
  },
  {
    id: 'aleopantest',
    title: 'AleoPantest Suite',
    category: { en: 'Cybersecurity', id: 'Keamanan Siber' },
    description: {
      en: 'Advanced penetration testing and security framework with 548+ curated tools running in an isolated virtual runtime.',
      id: 'Framework pengujian penetrasi dan audit keamanan dengan 548+ tools dalam lingkungan runtime virtual terisolasi.',
    },
    href: 'https://www.npmjs.com/package/@zetagoaurum-dev/aleopantest',
    year: '2024 - 2025',
    accent: 'soft',
    tags: ['Security', 'CLI', 'Pentest', 'Python'],
    external: true,
  },
  {
    id: 'diringkes',
    title: 'Diringkes',
    category: { en: 'Compression Toolkit', id: 'Toolkit Kompresi' },
    description: {
      en: 'Ultra compression and archive system featuring a modern CLI and mobile-friendly TUI to condense heavy workloads efficiently.',
      id: 'Sistem kompresi dan pengarsipan ultra dengan CLI modern dan TUI ramah perangkat mobile untuk efisiensi penyimpanan.',
    },
    href: 'https://www.npmjs.com/package/diringkes',
    year: '2026',
    accent: 'gold',
    tags: ['CLI', 'TUI', 'Compression', 'Linux'],
    external: true,
  },
  {
    id: 'decagramton',
    title: 'Decagramton',
    category: { en: 'Socket Architecture', id: 'Arsitektur Socket' },
    description: {
      en: 'High-performance socket execution engine with multi-threaded handler routines for zero latency operations.',
      id: 'Engine eksekusi socket performa tinggi dengan rutinitas multi-thread untuk operasional dengan latensi minimal.',
    },
    href: 'https://www.npmjs.com/package/@zetagoaurum-socket/decagramton',
    year: '2025',
    accent: 'bright',
    tags: ['Networking', 'Socket', 'TypeScript'],
    external: true,
  },
  {
    id: 'straw-scraper',
    title: 'Straw Extractor',
    category: { en: 'Data Pipeline', id: 'Pipeline Data' },
    description: {
      en: 'Unified JavaScript, TypeScript, and Python data scraping engine for web surfaces, YouTube media streams, and structured documents.',
      id: 'Engine ekstraksi data terpadu untuk JS, TS, dan Python yang mendukung konten web, stream YouTube, dan dokumen terstruktur.',
    },
    href: 'https://www.npmjs.com/package/@zetagoaurum-dev/straw',
    year: '2025',
    accent: 'soft',
    tags: ['Scraper', 'Media Pipeline', 'Python'],
    external: true,
  },
  {
    id: 'plester',
    title: 'Plester Autocorrect',
    category: { en: 'Runtime Resilience', id: 'Ketahanan Runtime' },
    description: {
      en: 'Zero-dependency self-healing engine with Damerau-Levenshtein distance, automatic JSON repair, and exception isolation.',
      id: 'Engine pemulihan mandiri tanpa dependensi dengan algoritma Damerau-Levenshtein, perbaikan JSON otomatis, dan isolasi error.',
    },
    href: 'https://www.npmjs.com/package/@zetagoaurum-dev/plester',
    year: '2025',
    accent: 'gold',
    tags: ['Algorithm', 'Self-Healing', 'Runtime'],
    external: true,
  },
  {
    id: 'kyokonime',
    title: 'Kyokonime Platform',
    category: { en: 'Media Network', id: 'Jaringan Media' },
    description: {
      en: 'Curated anime streaming and media distribution hub powered by the Kyoko faction digital infrastructure.',
      id: 'Hub distribusi media dan streaming anime pilihan yang didukung infrastruktur digital faksi Kyoko.',
    },
    href: 'https://kyokonime.kyoko.biz.id',
    year: '2026',
    accent: 'bright',
    tags: ['Next.js', 'Media', 'Kyoko Faction'],
    external: true,
  },
  {
    id: 'modkita',
    title: 'Mod-Kita Hub',
    category: { en: 'Ecosystem & Tools', id: 'Ekosistem & Tools' },
    description: {
      en: 'Flagship repository and distribution portal for custom Android utilities, modded tools, and developer builds.',
      id: 'Portal distribusi dan repositori utama untuk utilitas Android modifikasi, tool kustom, dan build pengembang.',
    },
    href: 'https://mod-kita.kyoko.biz.id',
    year: '2026',
    accent: 'gold',
    tags: ['Android', 'Mods', 'Kyoko Faction'],
    external: true,
  },
]

export interface DomainItem {
  id: string
  name: string
  purpose: { en: string; id: string }
  href: string
  status: 'live' | 'coming' | 'concept'
  accent: 'gold' | 'soft' | 'bright'
  category: string
}

export const domains: DomainItem[] = [
  {
    id: 'kyokonime',
    name: 'kyokonime.kyoko.biz.id',
    purpose: {
      en: 'Featured portal for curated anime media, streaming interfaces, and synchronized catalogs.',
      id: 'Portal unggulan untuk kurasi media anime, antarmuka streaming, dan katalog tersinkronisasi.',
    },
    href: 'https://kyokonime.kyoko.biz.id',
    status: 'live',
    accent: 'bright',
    category: 'Kyoko Faction',
  },
  {
    id: 'modkita',
    name: 'mod-kita.kyoko.biz.id',
    purpose: {
      en: 'Featured application hub for Android modifications, system tools, and community packages.',
      id: 'Hub aplikasi unggulan untuk modifikasi Android, perkakas sistem, dan paket komunitas.',
    },
    href: 'https://mod-kita.kyoko.biz.id',
    status: 'live',
    accent: 'gold',
    category: 'Kyoko Faction',
  },
  {
    id: 'kyoko',
    name: 'kyoko.biz.id',
    purpose: {
      en: 'Root domain and central station for the Kyoko digital faction and network services.',
      id: 'Domain utama dan pusat stasiun untuk faksi digital Kyoko serta layanan jaringan.',
    },
    href: 'https://kyoko.biz.id',
    status: 'live',
    accent: 'bright',
    category: 'Root Domain',
  },
  {
    id: 'zetagoaurum',
    name: 'zetagoaurum.com',
    purpose: {
      en: 'Central atelier and flagship portfolio hub where every digital architecture converges.',
      id: 'Atelier pusat dan hub portofolio utama tempat setiap arsitektur digital terhubung.',
    },
    href: 'https://zetagoaurum.com',
    status: 'live',
    accent: 'gold',
    category: 'Central Atelier',
  },
]

export interface SocialLink {
  id: string
  label: string
  labelId: string
  href: string
  icon: LucideIcon
  handle: string
  external?: boolean
}

export const socialLinks: SocialLink[] = [
  {
    id: 'github',
    label: 'GitHub',
    labelId: 'connect.github',
    href: 'https://github.com/ZetaGo-Aurum',
    icon: Github,
    handle: '@ZetaGo-Aurum',
    external: true,
  },
  {
    id: 'npm',
    label: 'NPM Registry',
    labelId: 'connect.npm',
    href: 'https://www.npmjs.com/~zetagoaurum',
    icon: Package,
    handle: '~zetagoaurum',
    external: true,
  },
  {
    id: 'kyokonime',
    label: 'Kyokonime',
    labelId: 'nav.kyokonime',
    href: 'https://kyokonime.kyoko.biz.id',
    icon: Film,
    handle: 'kyokonime.kyoko.biz.id',
    external: true,
  },
  {
    id: 'modkita',
    label: 'Mod-Kita',
    labelId: 'nav.modkita',
    href: 'https://mod-kita.kyoko.biz.id',
    icon: Cpu,
    handle: 'mod-kita.kyoko.biz.id',
    external: true,
  },
  {
    id: 'kyoko',
    label: 'Kyoko Root',
    labelId: 'brand.name',
    href: 'https://kyoko.biz.id',
    icon: Globe,
    handle: 'kyoko.biz.id',
    external: true,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    labelId: 'connect.instagram',
    href: 'https://instagram.com/kyokounerge',
    icon: Instagram,
    handle: '@kyokounerge',
    external: true,
  },
  {
    id: 'audiomack',
    label: 'Audiomack',
    labelId: 'connect.audiomack',
    href: 'https://audiomack.com/deltaastra24',
    icon: Music,
    handle: 'deltaastra24',
    external: true,
  },
  {
    id: 'suno',
    label: 'Suno AI',
    labelId: 'connect.suno',
    href: 'https://suno.com/@zetagoaurum',
    icon: Music,
    handle: '@zetagoaurum',
    external: true,
  },
]

