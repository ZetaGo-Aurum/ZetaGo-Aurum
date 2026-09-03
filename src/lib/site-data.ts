import {
  Github,
  Package,
  Globe,
  Palette,
  Code2,
  Sparkles,
  PenTool,
  Layers,
  type LucideIcon,
} from 'lucide-react'

export interface OrbitalNode {
  id: string
  label: string
  labelId: string
  href: string
  icon: LucideIcon
  /** angle in degrees, used for placement on desktop */
  angle: number
  /** ring index 1 (inner) | 2 (outer) */
  ring: 1 | 2
  accent?: 'gold' | 'soft' | 'bright'
  external?: boolean
}

export const orbitalNodes: OrbitalNode[] = [
  // Inner ring — primary destinations
  { id: 'github', label: 'GitHub', labelId: 'connect.github', href: 'https://github.com/zetago', icon: Github, angle: 0, ring: 1, accent: 'gold', external: true },
  { id: 'npm', label: 'NPM', labelId: 'connect.npm', href: 'https://www.npmjs.com/~zetago', icon: Package, angle: 60, ring: 1, accent: 'soft', external: true },
  { id: 'kyoko', label: 'kyoko.biz.id', labelId: 'nav.kyoko', href: 'https://kyoko.biz.id', icon: Globe, angle: 120, ring: 1, accent: 'bright', external: true },
  { id: 'design', label: 'Design Lab', labelId: 'nav.works', href: '#works', icon: Palette, angle: 180, ring: 1, accent: 'gold' },
  { id: 'domains', label: 'Domains', labelId: 'nav.domains', href: '#domains', icon: Layers, angle: 240, ring: 1, accent: 'soft' },
  { id: 'connect', label: 'Connect', labelId: 'nav.connect', href: '#connect', icon: Sparkles, angle: 300, ring: 1, accent: 'bright' },

  // Outer ring — short labels only (these render as small pills)
  { id: 'web', label: 'Web Works', labelId: 'nav.web', href: '#works', icon: Code2, angle: 30, ring: 2, accent: 'soft' },
  { id: 'pen', label: 'Journal', labelId: 'nav.journal', href: '#about', icon: PenTool, angle: 90, ring: 2, accent: 'gold' },
  { id: 'lab', label: 'Lab', labelId: 'nav.lab', href: '#works', icon: Sparkles, angle: 150, ring: 2, accent: 'bright' },
  { id: 'atelier', label: 'Atelier', labelId: 'orbital.center.label', href: '#about', icon: Palette, angle: 210, ring: 2, accent: 'soft' },
  { id: 'cosmos', label: 'Cosmos', labelId: 'nav.cosmos', href: '#domains', icon: Globe, angle: 270, ring: 2, accent: 'gold' },
  { id: 'aurum', label: 'Aurum', labelId: 'nav.aurum', href: '#home', icon: Sparkles, angle: 330, ring: 2, accent: 'bright' },
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
    id: 'kyoko',
    title: 'Kyoko',
    category: { en: 'Web Platform', id: 'Platform Web' },
    description: {
      en: 'A personal domain platform showcasing curated content, built with elegant typography and a focused reading experience.',
      id: 'Platform domain personal yang menampilkan konten kurasi, dibangun dengan tipografi elegan dan pengalaman membaca yang fokus.',
    },
    href: 'https://kyoko.biz.id',
    year: '2025',
    accent: 'gold',
    tags: ['Next.js', 'Typography', 'Content'],
    external: true,
  },
  {
    id: 'aurum-design',
    title: 'Aurum Design System',
    category: { en: 'Design System', id: 'Sistem Desain' },
    description: {
      en: 'A premium design language built around the gold accent — components, typography, motion, and a calm but confident voice.',
      id: 'Bahasa desain premium yang dibangun di sekitar aksen emas — komponen, tipografi, gerak, dan suara yang tenang namun percaya diri.',
    },
    href: '#',
    year: '2025',
    accent: 'bright',
    tags: ['Design', 'Tokens', 'Motion'],
  },
  {
    id: 'orbital-ui',
    title: 'Orbital Navigation',
    category: { en: 'Interaction', id: 'Interaksi' },
    description: {
      en: 'An unconventional navigation pattern where destinations orbit a central core, inviting exploration over hierarchy.',
      id: 'Pola navigasi tidak konvensional di mana tujuan mengorbit inti pusat, mengajak menjelajah alih-alih hierarki.',
    },
    href: '#',
    year: '2025',
    accent: 'soft',
    tags: ['Framer Motion', 'React', 'Motion Design'],
  },
  {
    id: 'npm-pkg',
    title: 'Open Source Packages',
    category: { en: 'Code', id: 'Kode' },
    description: {
      en: 'A growing collection of small, well-tested utilities published on NPM — focused on developer ergonomics and clarity.',
      id: 'Koleksi utilitas kecil yang teruji dan terus berkembang, dipublikasikan di NPM — fokus pada ergonomi dan kejelasan pengembang.',
    },
    href: 'https://www.npmjs.com/~zetago',
    year: '2024 — 2025',
    accent: 'gold',
    tags: ['TypeScript', 'NPM', 'DX'],
    external: true,
  },
  {
    id: 'motion-lab',
    title: 'Motion Lab',
    category: { en: 'Experiment', id: 'Eksperimen' },
    description: {
      en: 'A playground for interaction ideas — easing curves, micro-interactions, and small visual studies in gold and shadow.',
      id: 'Tempat bermain untuk ide interaksi — kurva easing, mikro-interaksi, dan studi visual kecil dalam emas dan bayangan.',
    },
    href: '#',
    year: '2025',
    accent: 'bright',
    tags: ['Framer Motion', 'CSS', 'Studies'],
  },
  {
    id: 'typography',
    title: 'Type Studies',
    category: { en: 'Typography', id: 'Tipografi' },
    description: {
      en: 'An ongoing series of typographic experiments — pairing serifs with sans, exploring rhythm, weight, and breathing room.',
      id: 'Seri eksperimen tipografi berkelanjutan — memasangkan serif dengan sans, menjelajah ritme, bobot, dan ruang napas.',
    },
    href: '#',
    year: '2024 — 2025',
    accent: 'soft',
    tags: ['Type', 'Layout', 'Detail'],
  },
]

export interface DomainItem {
  id: string
  name: string
  purpose: { en: string; id: string }
  href: string
  status: 'live' | 'coming' | 'concept'
  accent: 'gold' | 'soft' | 'bright'
}

export const domains: DomainItem[] = [
  {
    id: 'zetagoaurum',
    name: 'zetagoaurum.com',
    purpose: {
      en: 'Central hub — this site. The atelier where every work begins and returns.',
      id: 'Hub pusat — situs ini. Atelier tempat setiap karya dimulai dan kembali.',
    },
    href: 'https://zetagoaurum.com',
    status: 'coming',
    accent: 'gold',
  },
  {
    id: 'kyoko',
    name: 'kyoko.biz.id',
    purpose: {
      en: 'A focused content domain — curated writing, quiet reading, careful typography.',
      id: 'Domain konten yang fokus — tulisan kurasi, bacaan tenang, tipografi hati-hati.',
    },
    href: 'https://kyoko.biz.id',
    status: 'live',
    accent: 'bright',
  },
  {
    id: 'lab',
    name: 'lab.zetagoaurum.com',
    purpose: {
      en: 'Experimental subdomain — prototypes, motion studies, half-finished ideas.',
      id: 'Subdomain eksperimental — prototipe, studi gerak, ide setengah jadi.',
    },
    href: '#',
    status: 'concept',
    accent: 'soft',
  },
  {
    id: 'design',
    name: 'design.zetagoaurum.com',
    purpose: {
      en: 'Design archive — case studies, color systems, and component documentation.',
      id: 'Arsip desain — studi kasus, sistem warna, dan dokumentasi komponen.',
    },
    href: '#',
    status: 'concept',
    accent: 'gold',
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
    href: 'https://github.com/zetago',
    icon: Github,
    handle: '@zetago',
    external: true,
  },
  {
    id: 'npm',
    label: 'NPM',
    labelId: 'connect.npm',
    href: 'https://www.npmjs.com/~zetago',
    icon: Package,
    handle: '~zetago',
    external: true,
  },
  {
    id: 'kyoko',
    label: 'Kyoko',
    labelId: 'brand.name',
    href: 'https://kyoko.biz.id',
    icon: Globe,
    handle: 'kyoko.biz.id',
    external: true,
  },
]
