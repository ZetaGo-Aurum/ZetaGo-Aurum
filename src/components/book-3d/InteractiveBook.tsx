import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bookmark,
  Sun,
  Moon,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { aiBookData, aiBookPages, BookPage } from '@/data/ai-book'
import { useLanguage } from '@/components/language-provider'

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val))
const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

export function InteractiveBook() {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Reading state
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0) // 0 = title spread, 2, 4, 34, ...
  const currentPageRef = useRef(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [paperTheme, setPaperTheme] = useState<'ivory' | 'dark'>('ivory')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isTocOpen, setIsTocOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Synchronize ref with state
  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const bookGroupRef = useRef<THREE.Group | null>(null)

  // Hardcover, Headbands & Spine meshes
  const frontPivotRef = useRef<THREE.Group | null>(null)
  const frontCoverMeshRef = useRef<THREE.Mesh | null>(null)
  const rightCoverBaseRef = useRef<THREE.Mesh | null>(null)
  const spineMeshRef = useRef<THREE.Mesh | null>(null)
  const headbandTopRef = useRef<THREE.Mesh | null>(null)
  const headbandBottomRef = useRef<THREE.Mesh | null>(null)
  const isOpenRef = useRef(false)

  // Dynamic Physical Paper Thickness Meshes & Subdivided Gutter Geometries
  const leftBlockMeshRef = useRef<THREE.Mesh | null>(null)
  const rightBlockMeshRef = useRef<THREE.Mesh | null>(null)
  const leftPageMeshRef = useRef<THREE.Mesh | null>(null)
  const rightPageMeshRef = useRef<THREE.Mesh | null>(null)
  const leftBlockGeomRef = useRef<THREE.BoxGeometry | null>(null)
  const rightBlockGeomRef = useRef<THREE.BoxGeometry | null>(null)
  const leftPageGeomRef = useRef<THREE.PlaneGeometry | null>(null)
  const rightPageGeomRef = useRef<THREE.PlaneGeometry | null>(null)

  // Turning leaf refs
  const turningPivotRef = useRef<THREE.Group | null>(null)
  const frontLeafMeshRef = useRef<THREE.Mesh | null>(null)
  const backLeafMeshRef = useRef<THREE.Mesh | null>(null)
  const flexGeomFrontRef = useRef<THREE.PlaneGeometry | null>(null)
  const flexGeomBackRef = useRef<THREE.PlaneGeometry | null>(null)

  // Drag interaction state
  const dragRef = useRef({
    active: false,
    mode: null as 'cover-open' | 'page-next' | 'page-prev' | null,
    startX: 0,
    startY: 0,
    progress: 0,
    moved: false,
    pointerId: null as number | null,
  })

  // Animation & Dynamic Thickness Physics State
  const animStateRef = useRef({
    openProgress: 0,
    targetOpenProgress: 0,
    flipProgress: 0,
    flipDirection: null as 'next' | 'prev' | null,
    flipDuration: 0.60,
    flipStartTime: 0,
    isHovered: false,
    ambientAngle: 0,
    // Real physical paper thickness
    totalStackDepth: 0.24,
    minThickness: 0.008,
    leftThickness: 0.008,
    rightThickness: 0.24,
    targetLeftThickness: 0.008,
    targetRightThickness: 0.24,
  })

  // Texture cache map
  const textureCacheRef = useRef<Map<string, THREE.CanvasTexture>>(new Map())

  // Sound generator using Web Audio API
  const playPageSound = useCallback(() => {
    if (!soundEnabled) return
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(800, ctx.currentTime)
      filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.1)
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.26)

      gain.gain.setValueAtTime(0.001, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28)

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(140, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.26)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.29)
    } catch {
      // Audio context failure gracefully ignored
    }
  }, [soundEnabled])

  // ==========================================
  // TEXTURE GENERATORS (HIGH RESOLUTION CANVAS)
  // ==========================================

  const generateCoverTexture = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 1800
    const ctx = canvas.getContext('2d')!

    // 1. Deep Obsidian Velvet Base with soft radial vignette
    ctx.fillStyle = '#07080c'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const grad = ctx.createRadialGradient(600, 680, 80, 600, 680, 950)
    grad.addColorStop(0, 'rgba(22, 28, 44, 0.45)')
    grad.addColorStop(0.55, 'rgba(10, 13, 20, 0.85)')
    grad.addColorStop(1, 'rgba(4, 5, 8, 0.98)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Micro leather grain stippling
    ctx.fillStyle = 'rgba(212, 175, 55, 0.015)'
    for (let i = 0; i < 2800; i += 1) {
      const rx = (Math.sin(i * 997) * 0.5 + 0.5) * canvas.width
      const ry = (Math.cos(i * 613) * 0.5 + 0.5) * canvas.height
      ctx.fillRect(rx, ry, 1.5, 1.5)
    }

    // 2. Gold Foil Framing
    // Outer hairline
    ctx.strokeStyle = '#cba358'
    ctx.lineWidth = 2
    ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84)

    // Inner hairline
    ctx.strokeStyle = '#856424'
    ctx.lineWidth = 1.2
    ctx.strokeRect(54, 54, canvas.width - 108, canvas.height - 108)

    // Main sculpted gold border
    ctx.strokeStyle = '#f5df8b'
    ctx.lineWidth = 3.5
    ctx.strokeRect(68, 68, canvas.width - 136, canvas.height - 136)

    // Classical Art-Deco Corner Filigrees
    const drawCornerOrnament = (x: number, y: number, rot: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rot)
      ctx.strokeStyle = '#f5df8b'
      ctx.lineWidth = 2.5

      // Stepped corner bracket
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(52, 0)
      ctx.lineTo(52, 14)
      ctx.lineTo(14, 14)
      ctx.lineTo(14, 52)
      ctx.lineTo(0, 52)
      ctx.closePath()
      ctx.stroke()

      // Inner diagonal flourish
      ctx.strokeStyle = '#cba358'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(22, 22)
      ctx.lineTo(44, 44)
      ctx.stroke()

      // Corner diamond stud
      ctx.fillStyle = '#f5df8b'
      ctx.beginPath()
      ctx.moveTo(28, 22)
      ctx.lineTo(34, 28)
      ctx.lineTo(28, 34)
      ctx.lineTo(22, 28)
      ctx.closePath()
      ctx.fill()

      ctx.restore()
    }

    drawCornerOrnament(72, 72, 0)
    drawCornerOrnament(canvas.width - 72, 72, Math.PI / 2)
    drawCornerOrnament(canvas.width - 72, canvas.height - 72, Math.PI)
    drawCornerOrnament(72, canvas.height - 72, -Math.PI / 2)

    // 3. Header Colophon
    ctx.fillStyle = '#f5df8b'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '600 22px Inter, -apple-system, sans-serif'
    ctx.letterSpacing = '8px'
    ctx.fillText('Z E T A G O - A U R U M', 600, 160)

    ctx.fillStyle = '#cba358'
    ctx.font = 'italic 15px "Times New Roman", serif'
    ctx.letterSpacing = '4px'
    ctx.fillText('MONOGRAPHIA SYSTEMATIS ARTIFICIALIS', 600, 195)

    // Gilded divider with center diamond
    ctx.strokeStyle = '#a3853b'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(420, 225)
    ctx.lineTo(580, 225)
    ctx.moveTo(620, 225)
    ctx.lineTo(780, 225)
    ctx.stroke()

    ctx.fillStyle = '#f5df8b'
    ctx.beginPath()
    ctx.moveTo(600, 220)
    ctx.lineTo(606, 225)
    ctx.lineTo(600, 230)
    ctx.lineTo(594, 225)
    ctx.closePath()
    ctx.fill()

    // 4. Center Celestial Astrolabe Medallion
    const cx = 600
    const cy = 560

    // Outer dotted orbit ring
    ctx.save()
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 6])
    ctx.beginPath()
    ctx.arc(cx, cy, 190, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // Chronometer radial tick marks ring
    ctx.strokeStyle = '#cba358'
    ctx.lineWidth = 1.5
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 36) {
      const isMajor = Math.round((angle / (Math.PI / 18))) % 2 === 0
      const r1 = 168
      const r2 = isMajor ? 180 : 174
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1)
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2)
      ctx.stroke()
    }

    // Inner solid ring
    ctx.strokeStyle = '#f5df8b'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(cx, cy, 160, 0, Math.PI * 2)
    ctx.stroke()

    // 14 Roman Numerals around ring representing 14 Chapters
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV']
    ctx.fillStyle = '#d4af37'
    ctx.font = 'bold 13px Inter, sans-serif'
    romanNumerals.forEach((rom, idx) => {
      const theta = (idx / 14) * Math.PI * 2 - Math.PI / 2
      const rx = cx + Math.cos(theta) * 140
      const ry = cy + Math.sin(theta) * 140
      ctx.fillText(rom, rx, ry)
    })

    // Glowing golden medallion disc
    const sunGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 105)
    sunGrad.addColorStop(0, '#fef1b8')
    sunGrad.addColorStop(0.5, '#d4af37')
    sunGrad.addColorStop(0.9, '#8c6b2d')
    sunGrad.addColorStop(1, '#4a3814')
    ctx.fillStyle = sunGrad
    ctx.beginPath()
    ctx.arc(cx, cy, 100, 0, Math.PI * 2)
    ctx.fill()

    // Inner obsidian core
    ctx.fillStyle = '#080a10'
    ctx.beginPath()
    ctx.arc(cx, cy, 90, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#f5df8b'
    ctx.lineWidth = 2
    ctx.stroke()

    // Sculpted Gold Monogram 'Z'
    const zGrad = ctx.createLinearGradient(cx - 50, cy - 60, cx + 50, cy + 60)
    zGrad.addColorStop(0, '#ffffff')
    zGrad.addColorStop(0.3, '#fbe396')
    zGrad.addColorStop(0.7, '#d4af37')
    zGrad.addColorStop(1, '#8c6b2d')
    ctx.fillStyle = zGrad
    ctx.font = 'bold 125px "Cinzel", "Playfair Display", "Times New Roman", serif'
    ctx.fillText('Z', cx, cy + 12)
    ctx.restore()

    // 5. Grand Typography
    const titleGrad = ctx.createLinearGradient(200, 870, 1000, 870)
    titleGrad.addColorStop(0, '#e2be58')
    titleGrad.addColorStop(0.5, '#ffffff')
    titleGrad.addColorStop(1, '#e2be58')
    ctx.fillStyle = titleGrad
    ctx.font = 'bold 58px "Cinzel", "Times New Roman", serif'
    ctx.letterSpacing = '5px'
    ctx.fillText('KECERDASAN BUATAN', 600, 890)

    ctx.fillStyle = '#f5df8b'
    ctx.font = '600 24px Inter, sans-serif'
    ctx.letterSpacing = '4px'
    ctx.fillText('FUNDAMENTAL, SEJARAH & REKAYASA MODEL GENERATIF', 600, 955)

    // Ornamental flourish
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(340, 995)
    ctx.lineTo(860, 995)
    ctx.stroke()

    ctx.fillStyle = '#b3bac7'
    ctx.font = '400 22px "Times New Roman", serif'
    ctx.letterSpacing = '1px'
    ctx.fillText('Buku Pegangan Komprehensif Arsitektur AI, Jaringan Saraf,', 600, 1055)
    ctx.fillText('Transformer, Frontier Training Loop, hingga Implementasi Kode', 600, 1095)

    // 6. Bottom Colophon Seal Box
    const badgeW = 720
    const badgeH = 76
    const badgeX = (canvas.width - badgeW) / 2
    const badgeY = 1570

    ctx.fillStyle = 'rgba(18, 22, 34, 0.7)'
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH)
    ctx.strokeStyle = '#cba358'
    ctx.lineWidth = 1.5
    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH)

    ctx.fillStyle = '#f5df8b'
    ctx.font = '600 17px Inter, sans-serif'
    ctx.letterSpacing = '4px'
    ctx.fillText('KARYA MONOGRAF LENGKAP · 14 BAB · 158 HALAMAN', 600, badgeY + 28)

    ctx.fillStyle = '#a3853b'
    ctx.font = '500 13px Inter, sans-serif'
    ctx.letterSpacing = '3px'
    ctx.fillText('MMXXVI · TERBITAN RESMI RESEARCH FOUNDATION', 600, badgeY + 54)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    return texture
  }, [])

  const generateSpineTexture = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 360
    canvas.height = 1800
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#07090e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Raised gilded ribbing bands
    for (let i = 1; i <= 5; i += 1) {
      const y = (canvas.height / 6) * i
      ctx.fillStyle = '#181d2a'
      ctx.fillRect(0, y - 10, canvas.width, 20)

      ctx.fillStyle = '#d4af37'
      ctx.fillRect(24, y - 2.5, canvas.width - 48, 5)
    }

    // Top logo
    ctx.fillStyle = '#f5df8b'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = 'bold 28px "Cinzel", serif'
    ctx.fillText('✦ Z ✦', canvas.width / 2, 140)

    // Vertical book title
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(Math.PI / 2)
    ctx.fillStyle = '#f5df8b'
    ctx.font = 'bold 38px "Cinzel", "Times New Roman", serif'
    ctx.letterSpacing = '6px'
    ctx.fillText('ZETAGO-AURUM  ✦  KECERDASAN BUATAN  ✦  MMXXVI', 0, 0)
    ctx.restore()

    // Bottom colophon
    ctx.fillStyle = '#cba358'
    ctx.font = '600 15px Inter, sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('14 BAB · 158 HALAMAN', canvas.width / 2, canvas.height - 140)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  const generateBackCoverTexture = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 1800
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#07080c'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Framing
    ctx.strokeStyle = '#cba358'
    ctx.lineWidth = 2
    ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84)

    ctx.strokeStyle = '#f5df8b'
    ctx.lineWidth = 3.5
    ctx.strokeRect(68, 68, canvas.width - 136, canvas.height - 136)

    // Philosophical Quote
    ctx.fillStyle = '#f5df8b'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = 'italic 32px "Times New Roman", serif'
    ctx.fillText('"Kecerdasan bukanlah sekadar replikasi logika manusia,', 600, 780)
    ctx.fillText('melainkan jembatan matematis yang memperluas cakrawala', 600, 835)
    ctx.fillText('pemikiran, rekayasa, dan masa depan peradaban."', 600, 890)

    ctx.fillStyle = '#d4af37'
    ctx.font = '600 22px Inter, sans-serif'
    ctx.letterSpacing = '4px'
    ctx.fillText(': ZETAGO-AURUM RESEARCH FOUNDATION :', 600, 990)

    ctx.fillStyle = '#8b949e'
    ctx.font = '400 18px Inter, sans-serif'
    ctx.letterSpacing = '3px'
    ctx.fillText('EDISI PERTAMA · DOKUMEN TAHUN 2026 · TERDAFTAR SECARA RESMI', 600, 1600)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  const generateEndpaperTexture = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1536
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#0d101a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.16)'
    ctx.lineWidth = 1.2

    const step = 56
    for (let x = 0; x < canvas.width; x += step) {
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath()
        ctx.arc(x, y, 24, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  const generatePageTexture = useCallback((page: BookPage | null, theme: 'ivory' | 'dark', side: 'left' | 'right') => {
    const canvas = document.createElement('canvas')
    canvas.width = 768
    canvas.height = 1152
    const ctx = canvas.getContext('2d')!

    const isDark = theme === 'dark'
    const bgColor = isDark ? '#11141c' : '#fbf9f4'
    const textColor = isDark ? '#f4eee6' : '#231f1d'
    const headerColor = isDark ? '#c8a248' : '#8c6b2d'
    const subColor = isDark ? '#8892b0' : '#736d67'
    const ruleColor = isDark ? 'rgba(200, 162, 72, 0.3)' : 'rgba(140, 107, 45, 0.25)'

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Inner binding shadow gradient (spine crease shadow)
    const edgeGrad = ctx.createLinearGradient(0, 0, canvas.width, 0)
    if (side === 'left') {
      edgeGrad.addColorStop(0, isDark ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)')
      edgeGrad.addColorStop(0.85, 'transparent')
      edgeGrad.addColorStop(0.96, isDark ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.08)')
      edgeGrad.addColorStop(1, isDark ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.20)')
    } else {
      edgeGrad.addColorStop(0, isDark ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.20)')
      edgeGrad.addColorStop(0.04, isDark ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.08)')
      edgeGrad.addColorStop(0.15, 'transparent')
      edgeGrad.addColorStop(1, isDark ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)')
    }
    ctx.fillStyle = edgeGrad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Subtle spine crease line right at the binding edge
    ctx.strokeStyle = isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(90, 70, 45, 0.25)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    if (side === 'left') {
      ctx.moveTo(canvas.width - 0.75, 0)
      ctx.lineTo(canvas.width - 0.75, canvas.height)
    } else {
      ctx.moveTo(0.75, 0)
      ctx.lineTo(0.75, canvas.height)
    }
    ctx.stroke()

    if (!page) {
      ctx.fillStyle = subColor
      ctx.font = 'italic 22px "Times New Roman", serif'
      ctx.textAlign = 'center'
      ctx.fillText('Akhir Naskah Monograf', 384, 576)
      const emptyTex = new THREE.CanvasTexture(canvas)
      emptyTex.colorSpace = THREE.SRGBColorSpace
      return emptyTex
    }

    // Wide, spacious margins (Gutter side is 108px, outer side is 88px)
    const startX = side === 'left' ? 88 : 108
    const endX = side === 'left' ? 768 - 108 : 768 - 88
    const maxWidth = endX - startX

    // Running Header
    ctx.fillStyle = headerColor
    ctx.font = '600 13px Inter, sans-serif'
    ctx.letterSpacing = '2px'

    if (side === 'left') {
      ctx.textAlign = 'left'
      ctx.fillText(page.shortTitle.toUpperCase(), startX, 70)
      ctx.textAlign = 'right'
      ctx.fillText('KECERDASAN BUATAN', endX, 70)
    } else {
      ctx.textAlign = 'left'
      ctx.fillText('KECERDASAN BUATAN', startX, 70)
      ctx.textAlign = 'right'
      ctx.fillText(page.shortTitle.toUpperCase(), endX, 70)
    }

    ctx.strokeStyle = ruleColor
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(startX, 86)
    ctx.lineTo(endX, 86)
    ctx.stroke()

    let curY = 138
    const maxTextY = 960

    const wrapAndDraw = (
      text: string,
      fontSize: number,
      lineHeight: number,
      isItalic = false,
      isBold = false,
      indent = 0
    ) => {
      ctx.font = `${isBold ? 'bold ' : ''}${isItalic ? 'italic ' : ''}${fontSize}px "Iowan Old Style", "Baskerville", "Times New Roman", serif`
      ctx.textAlign = 'left'
      const words = text.split(' ')
      let line = ''
      let isFirstLine = indent > 0

      for (const w of words) {
        const testLine = line ? `${line} ${w}` : w
        const currentIndent = isFirstLine ? indent : 0
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth - currentIndent && line) {
          if (curY + lineHeight > maxTextY) {
            ctx.fillText(line.replace(/[,.;]?$/, '...'), startX + currentIndent, curY)
            curY += lineHeight
            return false
          }
          ctx.fillText(line, startX + currentIndent, curY)
          line = w
          curY += lineHeight
          isFirstLine = false
        } else {
          line = testLine
        }
      }

      if (line && curY <= maxTextY) {
        const currentIndent = isFirstLine ? indent : 0
        ctx.fillText(line, startX + currentIndent, curY)
        curY += lineHeight
        return true
      }
      return false
    }

    page.paragraphs.forEach((p) => {
      if (curY > maxTextY - 20) return

      const isSpecial = p.startsWith('Kajian Khusus:')
      const isChapterTitle = p.startsWith('BAB ') || p.startsWith('Bab ') || p.startsWith('MONOGRAF')
      const isSubtitle = /^\d+(\.\d+)*\s+/.test(p) || p.startsWith('Tabel:') || p.startsWith('Dimensi Perbandingan')

      if (isSpecial) {
        const boxStartY = curY
        const cleanText = p.replace(/^Kajian Khusus:\s*/, '')
        ctx.font = '16px "Times New Roman", serif'

        const words = cleanText.split(' ')
        let countLines = 1
        let tempLine = ''
        for (const w of words) {
          const tLine = tempLine ? `${tempLine} ${w}` : w
          if (ctx.measureText(tLine).width > maxWidth - 36) {
            countLines += 1
            tempLine = w
          } else {
            tempLine = tLine
          }
        }
        const boxHeight = Math.min(countLines * 25 + 46, maxTextY - boxStartY - 10)

        ctx.fillStyle = isDark ? 'rgba(200, 162, 72, 0.10)' : 'rgba(200, 162, 72, 0.08)'
        ctx.fillRect(startX, boxStartY, maxWidth, boxHeight)
        ctx.strokeStyle = isDark ? '#c8a248' : '#b8860b'
        ctx.lineWidth = 1.2
        ctx.strokeRect(startX, boxStartY, maxWidth, boxHeight)

        ctx.fillStyle = headerColor
        ctx.font = 'bold 11px Inter, sans-serif'
        ctx.letterSpacing = '2px'
        ctx.textAlign = 'left'
        ctx.fillText('✦ KAJIAN KHUSUS', startX + 16, boxStartY + 20)

        ctx.fillStyle = textColor
        ctx.font = '400 16px "Times New Roman", serif'
        let innerY = boxStartY + 44
        tempLine = ''
        for (const w of words) {
          const tLine = tempLine ? `${tempLine} ${w}` : w
          if (ctx.measureText(tLine).width > maxWidth - 36) {
            if (innerY + 24 <= boxStartY + boxHeight - 8) {
              ctx.fillText(tempLine, startX + 16, innerY)
            }
            tempLine = w
            innerY += 24
          } else {
            tempLine = tLine
          }
        }
        if (tempLine && innerY <= boxStartY + boxHeight - 8) {
          ctx.fillText(tempLine, startX + 16, innerY)
        }

        curY = boxStartY + boxHeight + 22
      } else if (isChapterTitle) {
        ctx.fillStyle = headerColor
        wrapAndDraw(p, 25, 34, false, true, 0)
        curY += 16
      } else if (isSubtitle) {
        ctx.fillStyle = headerColor
        wrapAndDraw(p, 19, 28, true, true, 0)
        curY += 10
      } else {
        const labelMatch = p.match(/^(\d+\.\s*[^:]+:)\s*(.*)$/)
        if (labelMatch) {
          const headingLabel = labelMatch[1]
          const bodyText = labelMatch[2]

          ctx.fillStyle = headerColor
          wrapAndDraw(headingLabel, 19, 28, false, true, 0)
          curY += 6

          if (bodyText) {
            ctx.fillStyle = textColor
            wrapAndDraw(bodyText, 21.5, 35, false, false, 28)
            curY += 16
          }
        } else {
          ctx.fillStyle = textColor
          wrapAndDraw(p, 21.5, 35, false, false, 28)
          curY += 16
        }
      }
    })

    ctx.strokeStyle = ruleColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(startX, 1076)
    ctx.lineTo(endX, 1076)
    ctx.stroke()

    ctx.fillStyle = subColor
    ctx.font = '500 12px Inter, monospace'
    ctx.letterSpacing = '1.5px'

    if (side === 'left') {
      ctx.textAlign = 'left'
      ctx.fillText(`Hal. ${page.pageNumber}`, startX, 1102)
      ctx.textAlign = 'right'
      ctx.fillText('ZetaGo-Aurum · 2026', endX, 1102)
    } else {
      ctx.textAlign = 'left'
      ctx.fillText('ZetaGo-Aurum · 2026', startX, 1102)
      ctx.textAlign = 'right'
      ctx.fillText(`Hal. ${page.pageNumber}`, endX, 1102)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    return texture
  }, [])

  const getPageTexture = useCallback((page: BookPage | null, theme: 'ivory' | 'dark', side: 'left' | 'right') => {
    const key = `${page ? page.pageNumber : 'end'}-${theme}-${side}`
    if (!textureCacheRef.current.has(key)) {
      const tex = generatePageTexture(page, theme, side)
      textureCacheRef.current.set(key, tex)
    }
    return textureCacheRef.current.get(key)!
  }, [generatePageTexture])

  // ==========================================
  // THREE.JS INITIALIZATION & SCENE RIGGING
  // ==========================================

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || 700
    const isMobile = width < 768

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera: Stable natural distance (NO forced auto-zoom)
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100)
    camera.position.set(0, 0.25, isMobile ? 6.2 : 5.2)
    cameraRef.current = camera

    // Renderer (Safely initialized with fallback guard)
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch (err) {
      console.warn('WebGL initialization failed or context unavailable:', err)
      return
    }
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    rendererRef.current = renderer

    // Controls: ALWAYS enabled for free 360 orbit
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 2.8
    controls.maxDistance = 9.0
    controls.maxPolarAngle = Math.PI / 2 + 0.15
    controls.minPolarAngle = Math.PI / 6
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff9ef, 1.1)
    scene.add(ambientLight)

    const mainKeyLight = new THREE.DirectionalLight(0xffe8c6, 2.2)
    mainKeyLight.position.set(3.5, 6.5, 5.5)
    scene.add(mainKeyLight)

    const fillLight = new THREE.DirectionalLight(0xd4e2f5, 0.85)
    fillLight.position.set(-4.5, 2.5, 3.8)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.5)
    rimLight.position.set(0, -3.5, -4.5)
    scene.add(rimLight)

    // ==========================================
    // BUILD PHYSICAL 3D BOOK RIG (SPINE AT X = 0)
    // ==========================================
    const bookWidth = 1.85
    const bookHeight = 2.65
    const totalStackDepth = 0.24
    // Substantial luxury hardcover binding boards with square overhang
    const boardThickness = 0.046
    const coverOverhangX = 0.04
    const coverOverhangY = 0.05
    const coverWidth = bookWidth + coverOverhangX * 2
    const coverHeight = bookHeight + coverOverhangY * 2
    const coverRadius = 0.009

    const rootGroup = new THREE.Group()
    scene.add(rootGroup)
    bookGroupRef.current = rootGroup

    rootGroup.position.set(-bookWidth / 2, 0, 0)
    rootGroup.rotation.set(0.12, -0.32, 0)

    // Textures
    const coverTex = generateCoverTexture()
    const spineTex = generateSpineTexture()
    const backCoverTex = generateBackCoverTexture()
    const endpaperTex = generateEndpaperTexture()

    // Materials
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x07080c,
      roughness: 0.74,
      metalness: 0.18,
    })

    // Turn-in strips generator framing inside pastedown endpaper
    const addInsideTurnIns = (
      parentMesh: THREE.Group | THREE.Mesh,
      w: number,
      h: number,
      zPos: number,
      isFront: boolean
    ) => {
      const border = 0.026
      const stripDepth = 0.002
      const xCenter = isFront ? w / 2 : 0

      // Head strip (top edge)
      const headStrip = new THREE.Mesh(new THREE.BoxGeometry(w, border, stripDepth), leatherMat)
      headStrip.position.set(xCenter, h / 2 - border / 2, zPos)
      parentMesh.add(headStrip)

      // Tail strip (bottom edge)
      const tailStrip = new THREE.Mesh(new THREE.BoxGeometry(w, border, stripDepth), leatherMat)
      tailStrip.position.set(xCenter, -h / 2 + border / 2, zPos)
      parentMesh.add(tailStrip)

      // Fore edge strip (outer edge)
      const foreStrip = new THREE.Mesh(new THREE.BoxGeometry(border, h, stripDepth), leatherMat)
      const foreX = isFront ? w - border / 2 : w / 2 - border / 2
      foreStrip.position.set(foreX, 0, zPos)
      parentMesh.add(foreStrip)

      // Spine edge strip (inner edge)
      const spineStrip = new THREE.Mesh(new THREE.BoxGeometry(border, h, stripDepth), leatherMat)
      const spineX = isFront ? border / 2 : -w / 2 + border / 2
      spineStrip.position.set(spineX, 0, zPos)
      parentMesh.add(spineStrip)
    }

    // 1. Right Cover Base (Underneath right pages at Z = -boardThickness / 2)
    const coverGeom = new RoundedBoxGeometry(coverWidth, coverHeight, boardThickness, 3, coverRadius)
    const rightCoverBase = new THREE.Mesh(coverGeom, leatherMat)
    rightCoverBase.position.set(coverWidth / 2, 0, -boardThickness / 2)
    rootGroup.add(rightCoverBase)
    rightCoverBaseRef.current = rightCoverBase

    // Back cover artwork plane on underside of right cover base (-Z facing downwards)
    const backPlaneGeom = new THREE.PlaneGeometry(coverWidth - 0.02, coverHeight - 0.02)
    const backPlaneMat = new THREE.MeshStandardMaterial({
      map: backCoverTex,
      roughness: 0.65,
      metalness: 0.2,
    })
    const backPlane = new THREE.Mesh(backPlaneGeom, backPlaneMat)
    backPlane.rotation.y = Math.PI
    backPlane.position.set(0, 0, -boardThickness / 2 - 0.001)
    rightCoverBase.add(backPlane)

    // Back inside endpaper on top surface of right cover base (+Z facing upwards)
    const backEndpaperGeom = new THREE.PlaneGeometry(coverWidth - 0.048, coverHeight - 0.048)
    const backEndpaperMat = new THREE.MeshStandardMaterial({
      map: endpaperTex,
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.FrontSide,
    })
    const backEndpaper = new THREE.Mesh(backEndpaperGeom, backEndpaperMat)
    backEndpaper.position.set(0, 0, boardThickness / 2 + 0.001)
    rightCoverBase.add(backEndpaper)

    // 4 Leather turn-in strips framing the back inside endpaper
    addInsideTurnIns(rightCoverBase, coverWidth, coverHeight, boardThickness / 2 + 0.0015, false)

    // 2. Spine Headband ribbons at head and tail of the book
    const headbandGeom = new THREE.CylinderGeometry(0.013, 0.013, 0.09, 16)
    const headbandMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // gold silk
      roughness: 0.52,
      metalness: 0.28,
    })
    const headbandTop = new THREE.Mesh(headbandGeom, headbandMat)
    headbandTop.rotation.x = Math.PI * 0.5
    headbandTop.position.set(-0.01, bookHeight / 2 - 0.002, totalStackDepth / 2)
    rootGroup.add(headbandTop)
    headbandTopRef.current = headbandTop

    const headbandBottom = new THREE.Mesh(headbandGeom, headbandMat)
    headbandBottom.rotation.x = Math.PI * 0.5
    headbandBottom.position.set(-0.01, -bookHeight / 2 + 0.002, totalStackDepth / 2)
    rootGroup.add(headbandBottom)
    headbandBottomRef.current = headbandBottom

    // 3. Dynamic Spine (Shrinks to flat base under gutter when open)
    const spineGeom = new RoundedBoxGeometry(boardThickness * 1.5, coverHeight, 1, 2, 0.005)
    const spineMat = new THREE.MeshStandardMaterial({
      map: spineTex,
      roughness: 0.7,
      metalness: 0.25,
    })
    const spineMesh = new THREE.Mesh(spineGeom, spineMat)
    spineMesh.position.set(-boardThickness * 0.75, 0, totalStackDepth / 2)
    spineMesh.scale.set(1, 1, totalStackDepth + boardThickness)
    rootGroup.add(spineMesh)
    spineMeshRef.current = spineMesh

    // 4. Dynamic Gilded Paper Stack Edge Texture
    const edgeCanvas = document.createElement('canvas')
    edgeCanvas.width = 256
    edgeCanvas.height = 1024
    const edgeCtx = edgeCanvas.getContext('2d')!
    edgeCtx.fillStyle = '#f0e8d8'
    edgeCtx.fillRect(0, 0, 256, 1024)
    for (let l = 0; l < 1024; l += 2) {
      if (l % 8 === 0) {
        edgeCtx.fillStyle = '#d4af37' // gold leaf
        edgeCtx.fillRect(0, l, 256, 1.8)
      } else if (l % 4 === 0) {
        edgeCtx.fillStyle = '#c5a048' // antique gold
        edgeCtx.fillRect(0, l, 256, 1.2)
      } else {
        edgeCtx.fillStyle = '#dfd3be' // individual paper sheets
        edgeCtx.fillRect(0, l, 256, 1.0)
      }
    }
    const edgeTex = new THREE.CanvasTexture(edgeCanvas)
    edgeTex.wrapS = THREE.RepeatWrapping
    edgeTex.wrapT = THREE.RepeatWrapping
    const pageEdgeMat = new THREE.MeshStandardMaterial({
      map: edgeTex,
      roughness: 0.75,
      metalness: 0.25,
    })

    // Inner paper tone material (Real paper color, NOT pitch black!)
    const paperToneMat = new THREE.MeshStandardMaterial({
      color: paperTheme === 'dark' ? 0x141824 : 0xf2ece1,
      roughness: 0.95,
      metalness: 0.02,
    })

    const seamZ = 0.006
    const gutterWidth = 0.38

    // Subdivided paper block geometries (28 segments along X to curve smoothly into gutter)
    const rightBlockGeom = new THREE.BoxGeometry(bookWidth, bookHeight, 1, 28, 1, 1)
    rightBlockGeom.translate(bookWidth / 2, 0, 0.5)
    const rightOrigZ = new Float32Array(rightBlockGeom.attributes.position.count)
    for (let i = 0; i < rightOrigZ.length; i += 1) {
      rightOrigZ[i] = rightBlockGeom.attributes.position.getZ(i)
    }
    rightBlockGeom.userData.origZ = rightOrigZ
    rightBlockGeomRef.current = rightBlockGeom

    // Right block materials: +X is outer (gilded), -X is inner spine (paper tone)
    const rightBlockMats = [pageEdgeMat, paperToneMat, pageEdgeMat, pageEdgeMat, paperToneMat, leatherMat]
    const rightBlockMesh = new THREE.Mesh(rightBlockGeom, rightBlockMats)
    rightBlockMesh.position.set(0, 0, 0)
    rootGroup.add(rightBlockMesh)
    rightBlockMeshRef.current = rightBlockMesh

    // Left block geometry
    const leftBlockGeom = new THREE.BoxGeometry(bookWidth, bookHeight, 1, 28, 1, 1)
    leftBlockGeom.translate(-bookWidth / 2, 0, 0.5)
    const leftOrigZ = new Float32Array(leftBlockGeom.attributes.position.count)
    for (let i = 0; i < leftOrigZ.length; i += 1) {
      leftOrigZ[i] = leftBlockGeom.attributes.position.getZ(i)
    }
    leftBlockGeom.userData.origZ = leftOrigZ
    leftBlockGeomRef.current = leftBlockGeom

    // Left block materials: +X is inner spine (paper tone), -X is outer (gilded)
    const leftBlockMats = [paperToneMat, pageEdgeMat, pageEdgeMat, pageEdgeMat, paperToneMat, leatherMat]
    const leftBlockMesh = new THREE.Mesh(leftBlockGeom, leftBlockMats)
    leftBlockMesh.position.set(0, 0, 0)
    leftBlockMesh.visible = false
    rootGroup.add(leftBlockMesh)
    leftBlockMeshRef.current = leftBlockMesh

    // 5. Swinging Front Cover (Permanent physical board, stays visible in all states)
    const frontPivot = new THREE.Group()
    frontPivot.position.set(0, 0, totalStackDepth + boardThickness / 2)
    frontPivotRef.current = frontPivot

    const frontCoverMesh = new THREE.Mesh(coverGeom, leatherMat)
    frontCoverMesh.position.set(coverWidth / 2, 0, 0)
    frontPivot.add(frontCoverMesh)
    frontCoverMeshRef.current = frontCoverMesh

    // Front Cover Artwork Plane (Facing outside +Z when closed, underside -Z when open)
    const frontCoverPlaneGeom = new THREE.PlaneGeometry(coverWidth - 0.02, coverHeight - 0.02)
    const frontCoverPlaneMat = new THREE.MeshStandardMaterial({
      map: coverTex,
      roughness: 0.62,
      metalness: 0.25,
    })
    const frontCoverPlane = new THREE.Mesh(frontCoverPlaneGeom, frontCoverPlaneMat)
    frontCoverPlane.position.set(coverWidth / 2, 0, boardThickness / 2 + 0.001)
    frontPivot.add(frontCoverPlane)

    // Front inside endpaper (Pastedown flyleaf facing inside -Z when closed, top surface +Z when open)
    const frontEndpaperGeom = new THREE.PlaneGeometry(coverWidth - 0.048, coverHeight - 0.048)
    const frontEndpaperMat = new THREE.MeshStandardMaterial({
      map: endpaperTex,
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.FrontSide,
    })
    const frontEndpaper = new THREE.Mesh(frontEndpaperGeom, frontEndpaperMat)
    frontEndpaper.rotation.y = Math.PI
    frontEndpaper.position.set(coverWidth / 2, 0, -boardThickness / 2 - 0.001)
    frontPivot.add(frontEndpaper)

    // 4 Leather turn-in strips framing the front inside endpaper
    addInsideTurnIns(frontPivot, coverWidth, coverHeight, -boardThickness / 2 - 0.0015, true)

    rootGroup.add(frontPivot)

    // 6. Left Page Mesh (Subdivided surface matching gutter curve)
    const leftPageGeom = new THREE.PlaneGeometry(bookWidth, bookHeight, 28, 2)
    leftPageGeom.translate(-bookWidth / 2, 0, 0)
    leftPageGeomRef.current = leftPageGeom

    const leftPageMat = new THREE.MeshStandardMaterial({
      map: endpaperTex,
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.FrontSide,
    })
    const leftPageMesh = new THREE.Mesh(leftPageGeom, leftPageMat)
    leftPageMesh.position.set(0, 0, 0)
    leftPageMesh.visible = false
    rootGroup.add(leftPageMesh)
    leftPageMeshRef.current = leftPageMesh

    // 7. Right Page Mesh (Subdivided surface matching gutter curve)
    const rightPageGeom = new THREE.PlaneGeometry(bookWidth, bookHeight, 28, 2)
    rightPageGeom.translate(bookWidth / 2, 0, 0)
    rightPageGeomRef.current = rightPageGeom

    const rightPageMat = new THREE.MeshStandardMaterial({
      map: getPageTexture(aiBookPages[0], 'ivory', 'right'),
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.FrontSide,
    })
    const rightPageMesh = new THREE.Mesh(rightPageGeom, rightPageMat)
    rightPageMesh.position.set(0, 0, 0)
    rightPageMesh.visible = false
    rootGroup.add(rightPageMesh)
    rightPageMeshRef.current = rightPageMesh

    // 9. Dynamic 3D Turning Page Leaf with Flexible Vertex Curvature
    const leafPivot = new THREE.Group()
    leafPivot.position.set(0, 0, totalStackDepth + 0.004)
    turningPivotRef.current = leafPivot
    leafPivot.visible = false

    const flexGeomFront = new THREE.PlaneGeometry(bookWidth, bookHeight, 18, 8)
    const flexGeomBack = new THREE.PlaneGeometry(bookWidth, bookHeight, 18, 8)
    flexGeomFrontRef.current = flexGeomFront
    flexGeomBackRef.current = flexGeomBack

    const frontLeafMat = new THREE.MeshStandardMaterial({
      map: getPageTexture(aiBookPages[0], 'ivory', 'right'),
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.FrontSide,
    })
    const frontLeafMesh = new THREE.Mesh(flexGeomFront, frontLeafMat)
    frontLeafMesh.position.set(bookWidth / 2, 0, 0.0008)
    leafPivot.add(frontLeafMesh)
    frontLeafMeshRef.current = frontLeafMesh

    const backLeafMat = new THREE.MeshStandardMaterial({
      map: getPageTexture(aiBookPages[1], 'ivory', 'left'),
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.FrontSide,
    })
    const backLeafMesh = new THREE.Mesh(flexGeomBack, backLeafMat)
    backLeafMesh.rotation.y = Math.PI
    backLeafMesh.position.set(bookWidth / 2, 0, -0.0008)
    leafPivot.add(backLeafMesh)
    backLeafMeshRef.current = backLeafMesh

    rootGroup.add(leafPivot)

    // ==========================================
    // ANIMATION & REALISTIC THICKNESS PHYSICS LOOP
    // ==========================================
    let reqId = 0
    let lastTime = performance.now()

    const animate = (time: number) => {
      reqId = requestAnimationFrame(animate)
      const dt = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time

      const anim = animStateRef.current
      controls.update()

      // Physical Paper Thickness Physics Calculation
      // Read current page directly from ref to avoid stale closures!
      const curPg = currentPageRef.current
      const totalPages = aiBookPages.length
      const progressRatio = clamp(curPg / (totalPages - 1), 0, 1)

      if (isOpenRef.current) {
        anim.targetLeftThickness = anim.minThickness + progressRatio * (anim.totalStackDepth - anim.minThickness)
        anim.targetRightThickness = anim.minThickness + (1 - progressRatio) * (anim.totalStackDepth - anim.minThickness)
      } else {
        anim.targetLeftThickness = anim.minThickness
        anim.targetRightThickness = anim.totalStackDepth
      }

      // Smooth physical thickness interpolation
      anim.leftThickness = lerp(anim.leftThickness, anim.targetLeftThickness, dt * 7)
      anim.rightThickness = lerp(anim.rightThickness, anim.targetRightThickness, dt * 7)

      // Update Right Page Block and Page Mesh vertex heights (Hermite gutter curve down to seamZ at x=0)
      if (rightBlockGeomRef.current) {
        const rGeom = rightBlockGeomRef.current
        const pos = rGeom.attributes.position
        const origZ = rGeom.userData.origZ as Float32Array
        for (let i = 0; i < pos.count; i += 1) {
          if (origZ[i] <= 0.5) {
            pos.setZ(i, 0)
          } else {
            const vx = pos.getX(i)
            const u = clamp(vx / gutterWidth, 0, 1)
            const sT = u * u * (3 - 2 * u)
            const curvedH = seamZ + (anim.rightThickness - seamZ) * sT
            const h = lerp(anim.rightThickness, curvedH, anim.openProgress)
            pos.setZ(i, h)
          }
        }
        pos.needsUpdate = true
        rGeom.computeVertexNormals()
      }

      if (rightPageGeomRef.current) {
        const rpGeom = rightPageGeomRef.current
        const pos = rpGeom.attributes.position
        for (let i = 0; i < pos.count; i += 1) {
          const vx = pos.getX(i)
          const u = clamp(vx / gutterWidth, 0, 1)
          const sT = u * u * (3 - 2 * u)
          const curvedH = seamZ + (anim.rightThickness - seamZ) * sT
          const h = lerp(anim.rightThickness, curvedH, anim.openProgress)
          pos.setZ(i, h + 0.0008)
        }
        pos.needsUpdate = true
        rpGeom.computeVertexNormals()
      }

      // Update Left Page Block and Page Mesh vertex heights (Hermite gutter curve down to seamZ at x=0)
      if (leftBlockGeomRef.current) {
        const lGeom = leftBlockGeomRef.current
        const pos = lGeom.attributes.position
        const origZ = lGeom.userData.origZ as Float32Array
        for (let i = 0; i < pos.count; i += 1) {
          if (origZ[i] <= 0.5) {
            pos.setZ(i, 0)
          } else {
            const vx = Math.abs(pos.getX(i))
            const u = clamp(vx / gutterWidth, 0, 1)
            const sT = u * u * (3 - 2 * u)
            const curvedH = seamZ + (anim.leftThickness - seamZ) * sT
            const h = lerp(anim.leftThickness, curvedH, anim.openProgress)
            pos.setZ(i, h)
          }
        }
        pos.needsUpdate = true
        lGeom.computeVertexNormals()
      }

      if (leftPageGeomRef.current) {
        const lpGeom = leftPageGeomRef.current
        const pos = lpGeom.attributes.position
        for (let i = 0; i < pos.count; i += 1) {
          const vx = Math.abs(pos.getX(i))
          const u = clamp(vx / gutterWidth, 0, 1)
          const sT = u * u * (3 - 2 * u)
          const curvedH = seamZ + (anim.leftThickness - seamZ) * sT
          const h = lerp(anim.leftThickness, curvedH, anim.openProgress)
          pos.setZ(i, h + 0.0008)
        }
        pos.needsUpdate = true
        lpGeom.computeVertexNormals()
      }

      // Smooth Open/Close Animation Loop
      if (!dragRef.current.active || dragRef.current.mode !== 'cover-open') {
        anim.openProgress = lerp(anim.openProgress, anim.targetOpenProgress, dt * 7.5)
        const openAmount = anim.openProgress

        // Headbands positioning at spine head & tail
        if (headbandTopRef.current && headbandBottomRef.current) {
          const hX = lerp(-0.01, 0, openAmount)
          const hZ = lerp(anim.totalStackDepth / 2, 0.006, openAmount)
          headbandTopRef.current.position.set(hX, bookHeight / 2 - 0.002, hZ)
          headbandBottomRef.current.position.set(hX, -bookHeight / 2 + 0.002, hZ)
        }

        // When openAmount is near 1 (Fully open reading state)
        if (openAmount > 0.98) {
          // Front swinging cover is VISIBLE, resting on the left side!
          frontPivot.visible = true
          frontPivot.rotation.y = -Math.PI
          frontPivot.position.set(0, 0, -boardThickness / 2)

          leftBlockMesh.visible = curPg > 0
          leftPageMesh.visible = true
          rightPageMesh.visible = true

          // Spine is flat at base underneath gutter
          spineMesh.position.set(0, 0, -boardThickness / 2)
          spineMesh.scale.set(1, 1, boardThickness)

          // Center spread in viewport
          rootGroup.position.x = lerp(rootGroup.position.x, 0, dt * 8)
          rootGroup.position.y = lerp(rootGroup.position.y, 0, dt * 8)
          rootGroup.rotation.x = lerp(rootGroup.rotation.x, 0, dt * 8)
          rootGroup.rotation.y = lerp(rootGroup.rotation.y, 0, dt * 8)
          rootGroup.rotation.z = lerp(rootGroup.rotation.z, 0, dt * 8)
        } else if (openAmount < 0.02) {
          // Closed state
          frontPivot.visible = true
          leftBlockMesh.visible = false
          leftPageMesh.visible = false
          rightPageMesh.visible = false

          // Spine wraps left edge
          spineMesh.position.set(-boardThickness * 0.75, 0, anim.totalStackDepth / 2)
          spineMesh.scale.set(1, 1, anim.totalStackDepth + boardThickness)

          const hoverCrack = !isOpenRef.current && anim.isHovered ? -0.14 : 0
          frontPivot.rotation.y = lerp(frontPivot.rotation.y, hoverCrack, dt * 10)
          frontPivot.position.set(0, 0, anim.totalStackDepth + boardThickness / 2)

          anim.ambientAngle += dt * 0.4
          const floatY = Math.sin(anim.ambientAngle * 1.5) * 0.035
          rootGroup.position.set(-bookWidth / 2, floatY, 0)
          rootGroup.rotation.set(0.12, -0.32, 0)
        } else {
          // In transition between closed and open
          frontPivot.visible = true
          frontPivot.rotation.y = -Math.PI * openAmount
          frontPivot.position.z = lerp(anim.totalStackDepth + boardThickness / 2, -boardThickness / 2, openAmount)

          // Spine smoothly flattens down to base
          spineMesh.scale.z = lerp(anim.totalStackDepth + boardThickness, boardThickness, openAmount)
          spineMesh.position.z = lerp(anim.totalStackDepth / 2, -boardThickness / 2, openAmount)
          spineMesh.position.x = lerp(-boardThickness * 0.75, 0, openAmount)

          // Root group centers smoothly
          rootGroup.position.x = lerp(-bookWidth / 2, 0, openAmount)
          rootGroup.position.y = lerp(0, 0, openAmount)
          rootGroup.rotation.x = lerp(0.12, 0, openAmount)
          rootGroup.rotation.y = lerp(-0.32, 0, openAmount)
          rootGroup.rotation.z = lerp(0, 0, openAmount)

          rightPageMesh.visible = openAmount > 0.25
          leftBlockMesh.visible = openAmount > 0.65 && curPg > 0
          leftPageMesh.visible = openAmount > 0.65
        }
      }

      // Page flip animation with vertex curvature and dynamic height transition
      if (anim.flipDirection !== null) {
        const elapsed = (time - anim.flipStartTime) / 1000
        const progress = clamp(elapsed / anim.flipDuration, 0, 1)
        anim.flipProgress = progress

        let leafRotY = 0
        if (anim.flipDirection === 'next') {
          leafRotY = -Math.PI * progress
        } else {
          leafRotY = -Math.PI + Math.PI * progress
        }
        leafPivot.rotation.y = leafRotY

        // Dynamic Z height transition across physical paper stacks
        const startZ = (anim.flipDirection === 'next' ? anim.rightThickness : anim.leftThickness) + 0.003
        const endZ = (anim.flipDirection === 'next' ? anim.leftThickness : anim.rightThickness) + 0.003
        leafPivot.position.z = lerp(startZ, endZ, progress)

        const arch = Math.sin(progress * Math.PI) * 0.22
        const twist = Math.sin(progress * Math.PI) * 0.07

        if (flexGeomFrontRef.current) {
          const pFront = flexGeomFrontRef.current.attributes.position
          for (let i = 0; i < pFront.count; i += 1) {
            const u = (pFront.getX(i) + bookWidth / 2) / bookWidth
            const yNorm = pFront.getY(i) / (bookHeight * 0.5)
            const zCurve = Math.sin(u * Math.PI) * arch + u * u * twist * yNorm
            pFront.setZ(i, zCurve)
          }
          pFront.needsUpdate = true
          flexGeomFrontRef.current.computeVertexNormals()
        }

        if (flexGeomBackRef.current) {
          const pBack = flexGeomBackRef.current.attributes.position
          for (let i = 0; i < pBack.count; i += 1) {
            const u = (pBack.getX(i) + bookWidth / 2) / bookWidth
            const yNorm = pBack.getY(i) / (bookHeight * 0.5)
            const zCurve = -(Math.sin(u * Math.PI) * arch + u * u * twist * yNorm)
            pBack.setZ(i, zCurve)
          }
          pBack.needsUpdate = true
          flexGeomBackRef.current.computeVertexNormals()
        }

        // Flip finished: synchronously assign final texture BEFORE hiding leaf to avoid flicker!
        if (progress >= 1) {
          const dir = anim.flipDirection
          anim.flipDirection = null

          if (dir === 'next') {
            const next = Math.min(currentPageRef.current + 2, aiBookPages.length - 1)
            currentPageRef.current = next

            // Synchronously update leftPageMesh texture to match backLeafMesh texture immediately
            if (leftPageMeshRef.current && backLeafMeshRef.current) {
              const backMat = backLeafMeshRef.current.material as THREE.MeshStandardMaterial
              ;(leftPageMeshRef.current.material as THREE.MeshStandardMaterial).map = backMat.map
            }

            leafPivot.visible = false
            setIsFlipping(false)
            setCurrentPage(next)
          } else {
            const prev = Math.max(0, currentPageRef.current - 2)
            currentPageRef.current = prev

            // Synchronously update rightPageMesh texture to match frontLeafMesh texture immediately
            if (rightPageMeshRef.current && frontLeafMeshRef.current) {
              const frontMat = frontLeafMeshRef.current.material as THREE.MeshStandardMaterial
              ;(rightPageMeshRef.current.material as THREE.MeshStandardMaterial).map = frontMat.map
            }

            leafPivot.visible = false
            setIsFlipping(false)
            setCurrentPage(prev)
          }
        }
      }

      renderer.render(scene, camera)
    }

    reqId = requestAnimationFrame(animate)

    const handleResize = () => {
      if (!container || !renderer || !camera) return
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || 700
      const mob = w < 768
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      if (controls) {
        controls.minDistance = mob ? 3.0 : 2.8
        controls.maxDistance = mob ? 10.0 : 9.0
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('resize', handleResize)
      controls?.dispose()
      renderer?.dispose()
    }
  }, [generateCoverTexture, generateSpineTexture, generateBackCoverTexture, generateEndpaperTexture, getPageTexture])

  // ==========================================
  // SYNC REACT STATE WITH 3D SCENE
  // ==========================================

  useEffect(() => {
    isOpenRef.current = isOpen
    animStateRef.current.targetOpenProgress = isOpen ? 1 : 0
  }, [isOpen])

  // Sync Current Pages onto 3D Meshes (Only when not actively in mid-flip)
  useEffect(() => {
    if (isFlipping) return
    const leftTex = currentPage === 0
      ? generateEndpaperTexture()
      : getPageTexture(aiBookPages[currentPage - 1] || null, paperTheme, 'left')

    const rightTex = getPageTexture(aiBookPages[currentPage] || null, paperTheme, 'right')

    if (leftPageMeshRef.current) {
      (leftPageMeshRef.current.material as THREE.MeshStandardMaterial).map = leftTex
      leftPageMeshRef.current.material.needsUpdate = true
    }
    if (rightPageMeshRef.current) {
      (rightPageMeshRef.current.material as THREE.MeshStandardMaterial).map = rightTex
      rightPageMeshRef.current.material.needsUpdate = true
    }
  }, [currentPage, paperTheme, isFlipping, generateEndpaperTexture, getPageTexture])

  // Flip Next Page in 3D (Zero-flicker pre-bound textures)
  const flipNext = useCallback(() => {
    if (isFlipping || !isOpen) return
    const cur = currentPageRef.current
    if (cur >= aiBookPages.length - 1) return

    setIsFlipping(true)
    playPageSound()

    const turningPivot = turningPivotRef.current
    const frontLeafMesh = frontLeafMeshRef.current
    const backLeafMesh = backLeafMeshRef.current
    const rightPageMesh = rightPageMeshRef.current

    if (!turningPivot || !frontLeafMesh || !backLeafMesh || !rightPageMesh) return

    // 1. Front of turning leaf is the page being lifted (Hal. cur + 1)
    const curRightTex = getPageTexture(aiBookPages[cur] || null, paperTheme, 'right')
    ;(frontLeafMesh.material as THREE.MeshStandardMaterial).map = curRightTex

    // 2. Back of turning leaf is the new left page (Hal. cur + 2)
    const nextLeftTex = getPageTexture(aiBookPages[cur + 1] || null, paperTheme, 'left')
    ;(backLeafMesh.material as THREE.MeshStandardMaterial).map = nextLeftTex

    // 3. Right static page underneath reveals the upcoming right page (Hal. cur + 3)
    const nextRightTex = getPageTexture(aiBookPages[cur + 2] || null, paperTheme, 'right')
    ;(rightPageMesh.material as THREE.MeshStandardMaterial).map = nextRightTex

    turningPivot.visible = true
    turningPivot.rotation.y = 0

    // Set target page to start paper stack depth transition
    const nextTarget = Math.min(cur + 2, aiBookPages.length - 1)
    currentPageRef.current = nextTarget

    animStateRef.current.flipDirection = 'next'
    animStateRef.current.flipStartTime = performance.now()
  }, [isFlipping, isOpen, paperTheme, getPageTexture, playPageSound])

  // Flip Previous Page in 3D (Zero-flicker pre-bound textures)
  const flipPrev = useCallback(() => {
    if (isFlipping || !isOpen) return
    const cur = currentPageRef.current
    if (cur <= 0) return

    setIsFlipping(true)
    playPageSound()

    const turningPivot = turningPivotRef.current
    const frontLeafMesh = frontLeafMeshRef.current
    const backLeafMesh = backLeafMeshRef.current
    const leftPageMesh = leftPageMeshRef.current

    if (!turningPivot || !frontLeafMesh || !backLeafMesh || !leftPageMesh) return

    // 1. Static left page reveals the previous left page underneath
    const prevLeftTex = cur - 2 === 0
      ? generateEndpaperTexture()
      : getPageTexture(aiBookPages[cur - 3] || null, paperTheme, 'left')
    ;(leftPageMesh.material as THREE.MeshStandardMaterial).map = prevLeftTex

    // 2. Back of turning leaf is the current left page being picked up
    const curLeftTex = getPageTexture(aiBookPages[cur - 1] || null, paperTheme, 'left')
    ;(backLeafMesh.material as THREE.MeshStandardMaterial).map = curLeftTex

    // 3. Front of turning leaf is the previous right page landing on right stack
    const prevRightTex = getPageTexture(aiBookPages[cur - 2] || null, paperTheme, 'right')
    ;(frontLeafMesh.material as THREE.MeshStandardMaterial).map = prevRightTex

    turningPivot.visible = true
    turningPivot.rotation.y = -Math.PI

    // Set target page to start paper stack depth transition
    const prevTarget = Math.max(0, cur - 2)
    currentPageRef.current = prevTarget

    animStateRef.current.flipDirection = 'prev'
    animStateRef.current.flipStartTime = performance.now()
  }, [isFlipping, isOpen, paperTheme, generateEndpaperTexture, getPageTexture, playPageSound])

  // Direct Jump to Chapter Page
  const goToPage = useCallback((targetIndex: number) => {
    const validTarget = clamp(targetIndex, 0, aiBookPages.length - 1)
    const evenTarget = validTarget % 2 === 0 ? validTarget : Math.max(0, validTarget - 1)
    currentPageRef.current = evenTarget
    setCurrentPage(evenTarget)
    setIsTocOpen(false)
    playPageSound()

    // Immediately sync page textures
    const leftTex = evenTarget === 0
      ? generateEndpaperTexture()
      : getPageTexture(aiBookPages[evenTarget - 1] || null, paperTheme, 'left')
    const rightTex = getPageTexture(aiBookPages[evenTarget] || null, paperTheme, 'right')

    if (leftPageMeshRef.current) {
      (leftPageMeshRef.current.material as THREE.MeshStandardMaterial).map = leftTex
      leftPageMeshRef.current.material.needsUpdate = true
    }
    if (rightPageMeshRef.current) {
      (rightPageMeshRef.current.material as THREE.MeshStandardMaterial).map = rightTex
      rightPageMeshRef.current.material.needsUpdate = true
    }
  }, [playPageSound, generateEndpaperTexture, getPageTexture, paperTheme])

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }, [])

  // ==========================================
  // DRAG & POINTER INTERACTIONS
  // ==========================================

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!cameraRef.current || !canvasRef.current || isFlipping) return

    const rect = canvasRef.current.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, cameraRef.current)

    const hits: THREE.Intersection[] = []
    if (!isOpen && frontCoverMeshRef.current) {
      hits.push(...raycaster.intersectObject(frontCoverMeshRef.current, true))
    }
    if (isOpen) {
      if (leftPageMeshRef.current && leftPageMeshRef.current.visible) hits.push(...raycaster.intersectObject(leftPageMeshRef.current))
      if (rightPageMeshRef.current && rightPageMeshRef.current.visible) hits.push(...raycaster.intersectObject(rightPageMeshRef.current))
    }

    if (hits.length > 0) {
      const drag = dragRef.current
      drag.active = true
      drag.startX = e.clientX
      drag.startY = e.clientY
      drag.moved = false
      drag.pointerId = e.pointerId

      if (!isOpen) {
        drag.mode = 'cover-open'
        if (controlsRef.current) controlsRef.current.enabled = false
      } else {
        const hitObj = hits[0].object
        if (hitObj === leftPageMeshRef.current) {
          drag.mode = 'page-prev'
        } else if (hitObj === rightPageMeshRef.current) {
          drag.mode = 'page-next'
        }
      }

      canvasRef.current.setPointerCapture?.(e.pointerId)
    } else {
      dragRef.current.active = false
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current
    if (!drag.active) {
      if (!isOpen) animStateRef.current.isHovered = true
      return
    }

    const deltaX = e.clientX - drag.startX
    const deltaY = e.clientY - drag.startY
    if (Math.hypot(deltaX, deltaY) > 8) {
      drag.moved = true
    }

    if (drag.mode === 'cover-open') {
      const prog = clamp(-deltaX / 220, 0, 1)
      drag.progress = prog
      animStateRef.current.openProgress = prog
      const frontPivot = frontPivotRef.current
      const rootGroup = bookGroupRef.current
      if (frontPivot && rootGroup) {
        const bookWidth = 1.85
        const boardThickness = 0.046
        frontPivot.rotation.y = -Math.PI * prog
        frontPivot.position.z = lerp(animStateRef.current.totalStackDepth + boardThickness / 2, -boardThickness / 2, prog)
        rootGroup.position.x = lerp(-bookWidth / 2, 0, prog)
        rootGroup.rotation.x = lerp(0.12, 0, prog)
        rootGroup.rotation.y = lerp(-0.32, 0, prog)
      }
    }
  }

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current
    if (controlsRef.current) controlsRef.current.enabled = true

    if (!drag.active) return
    drag.active = false

    if (drag.pointerId !== null && canvasRef.current?.hasPointerCapture?.(drag.pointerId)) {
      canvasRef.current.releasePointerCapture(drag.pointerId)
    }

    // Tap / Click Handler
    if (!drag.moved) {
      if (!isOpen) {
        setIsOpen(true)
        playPageSound()
      } else {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) {
          const clickX = e.clientX - rect.left
          const midX = rect.width / 2
          if (clickX > midX + 25) {
            flipNext()
          } else if (clickX < midX - 25) {
            flipPrev()
          }
        }
      }
      return
    }

    // Drag Handler
    if (drag.mode === 'cover-open') {
      if (drag.progress > 0.22) {
        setIsOpen(true)
        playPageSound()
      } else {
        animStateRef.current.targetOpenProgress = 0
      }
    } else if (drag.mode === 'page-next') {
      if (e.clientX - drag.startX < -35) {
        flipNext()
      }
    } else if (drag.mode === 'page-prev') {
      if (e.clientX - drag.startX > 35) {
        flipPrev()
      }
    }
  }

  const handlePointerLeave = () => {
    animStateRef.current.isHovered = false
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault()
        flipNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        flipPrev()
      } else if (e.key === 'Escape') {
        if (isTocOpen) setIsTocOpen(false)
        else setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isTocOpen, flipNext, flipPrev])

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden transition-colors duration-500 select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen bg-[#06080d]'
          : 'h-[76vh] min-h-[560px] sm:min-h-[660px] max-h-[820px] rounded-2xl border border-[oklch(0.72_0.13_80_/_0.2)] bg-[#06080d] shadow-2xl'
      }`}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={handlePointerLeave}
        className="block h-full w-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Minimalist Action Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        {isOpen && (
          <button
            onClick={() => setIsTocOpen(true)}
            title="Daftar Bab"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-zinc-300 hover:bg-black/70 hover:text-white backdrop-blur-md transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {isOpen && (
          <button
            onClick={() => setPaperTheme((t) => (t === 'ivory' ? 'dark' : 'ivory'))}
            title="Ganti Tema Kertas"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-zinc-300 hover:bg-black/70 hover:text-white backdrop-blur-md transition-colors"
          >
            {paperTheme === 'ivory' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-[oklch(0.72_0.13_80)]" />}
          </button>
        )}

        <button
          onClick={() => setSoundEnabled((s) => !s)}
          title={soundEnabled ? 'Matikan Suara Kertas' : 'Aktifkan Suara Kertas'}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-zinc-300 hover:bg-black/70 hover:text-white backdrop-blur-md transition-colors"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4 text-[oklch(0.72_0.13_80)]" /> : <VolumeX className="h-4 w-4 text-zinc-500" />}
        </button>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-zinc-300 hover:bg-black/70 hover:text-white backdrop-blur-md transition-colors"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* CLOSED STATE: Minimalist Bottom Text Link */}
      {!isOpen && (
        <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center pointer-events-none px-3">
          <button
            onClick={() => {
              setIsOpen(true)
              playPageSound()
            }}
            className="pointer-events-auto group flex items-center gap-2 rounded-xl border border-[oklch(0.72_0.13_80_/_0.35)] bg-black/60 px-4 py-1.5 text-xs font-mono tracking-wider text-[oklch(0.72_0.13_80)] backdrop-blur-md hover:border-[oklch(0.72_0.13_80)] hover:text-white transition-all shadow-lg"
          >
            <span>Buka Monograf</span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-400 group-hover:text-zinc-200">Orbit 360°</span>
          </button>
        </div>
      )}

      {/* OPEN STATE: Sleek Single-Bar Bottom Navigation */}
      {isOpen && (
        <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center pointer-events-none px-3">
          <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 rounded-xl border border-white/10 bg-black/60 px-2 sm:px-3 py-1 backdrop-blur-md shadow-xl text-xs font-mono">
            <button
              onClick={flipPrev}
              disabled={currentPage <= 0 || isFlipping}
              title="Halaman Sebelumnya"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-2 text-zinc-300 text-[11px] sm:text-xs select-none">
              Hal. {currentPage === 0 ? '1' : `${currentPage} · ${currentPage + 1}`} <span className="text-zinc-500">/ 158</span>
            </span>

            <span className="text-zinc-600">|</span>

            <button
              onClick={() => {
                setIsOpen(false)
                playPageSound()
              }}
              className="px-2 py-0.5 rounded-md text-[11px] sm:text-xs text-[oklch(0.72_0.13_80)] hover:bg-[oklch(0.72_0.13_80_/_0.15)] hover:underline transition-colors"
            >
              Tutup
            </button>

            <button
              onClick={flipNext}
              disabled={currentPage >= aiBookPages.length - 1 || isFlipping}
              title="Halaman Selanjutnya"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* TABLE OF CONTENTS DRAWER */}
      {isTocOpen && (
        <div className="absolute inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="h-full w-full max-w-md border-l border-white/10 bg-[#0b0e17] p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-[oklch(0.72_0.13_80)]" />
                <h3 className="font-serif text-base font-bold text-white">
                  Daftar Bab Monograf (14 Bab)
                </h3>
              </div>
              <button
                onClick={() => setIsTocOpen(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-2">
              {aiBookData.sections.map((sec, idx) => {
                const targetPage = aiBookPages.find((p) => p.chapterIndex === idx)?.pageNumber || 1
                return (
                  <button
                    key={sec.id}
                    onClick={() => goToPage(Math.max(0, targetPage - 1))}
                    className="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:border-[oklch(0.72_0.13_80)] hover:bg-[oklch(0.72_0.13_80_/_0.08)]"
                  >
                    <div>
                      <div className="font-mono text-[10px] font-bold text-[oklch(0.72_0.13_80)]">
                        Bab {idx + 1}
                      </div>
                      <div className="font-serif text-xs font-semibold text-zinc-200 line-clamp-1">
                        {sec.title}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400">
                      Hal. {targetPage}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
