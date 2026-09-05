import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  BookOpen,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
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

// Helper clamp & lerp
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val))
const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

export function InteractiveBook() {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Reading state
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0) // 0 = title spread, 2, 4, ...
  const [isFlipping, setIsFlipping] = useState(false)
  const [paperTheme, setPaperTheme] = useState<'ivory' | 'dark'>('ivory')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isTocOpen, setIsTocOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const bookGroupRef = useRef<THREE.Group | null>(null)
  const frontPivotRef = useRef<THREE.Group | null>(null)
  const frontCoverMeshRef = useRef<THREE.Mesh | null>(null)
  const leftPageMeshRef = useRef<THREE.Mesh | null>(null)
  const rightPageMeshRef = useRef<THREE.Mesh | null>(null)
  const turningPivotRef = useRef<THREE.Group | null>(null)
  const frontLeafMeshRef = useRef<THREE.Mesh | null>(null)
  const backLeafMeshRef = useRef<THREE.Mesh | null>(null)
  const flexGeomFrontRef = useRef<THREE.PlaneGeometry | null>(null)
  const flexGeomBackRef = useRef<THREE.PlaneGeometry | null>(null)

  // Drag interaction state
  const dragRef = useRef({
    active: false,
    mode: null as 'cover-open' | 'cover-close' | 'page-next' | 'page-prev' | null,
    startX: 0,
    startY: 0,
    progress: 0,
    moved: false,
    pointerId: null as number | null,
  })

  // Animation state refs
  const animStateRef = useRef({
    openProgress: 0,
    targetOpenProgress: 0,
    flipProgress: 0,
    flipDirection: null as 'next' | 'prev' | null,
    flipDuration: 0.65,
    flipStartTime: 0,
    isHovered: false,
    ambientAngle: 0,
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
      filter.frequency.setValueAtTime(900, ctx.currentTime)
      filter.frequency.exponentialRampToValueAtTime(2600, ctx.currentTime + 0.12)
      filter.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.28)

      gain.gain.setValueAtTime(0.001, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3)

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(150, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.28)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.31)
    } catch {
      // Audio context failure gracefully ignored
    }
  }, [soundEnabled])

  // ==========================================
  // TEXTURE GENERATORS (CANVAS 2D)
  // ==========================================

  // Cover Texture
  const generateCoverTexture = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1536
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#0a0d14'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const grad = ctx.createRadialGradient(512, 768, 100, 512, 768, 900)
    grad.addColorStop(0, 'rgba(24, 28, 40, 0.4)')
    grad.addColorStop(0.7, 'rgba(10, 13, 20, 0.8)')
    grad.addColorStop(1, 'rgba(4, 5, 8, 0.98)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Outer Gilded Filigree Borders
    ctx.strokeStyle = '#cba358'
    ctx.lineWidth = 4
    ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96)

    ctx.strokeStyle = '#99732b'
    ctx.lineWidth = 1.5
    ctx.strokeRect(62, 62, canvas.width - 124, canvas.height - 124)

    // Ornate Corner Motifs
    const drawCorner = (x: number, y: number, rot: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rot)
      ctx.strokeStyle = '#d4af37'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(44, 0)
      ctx.lineTo(44, 12)
      ctx.lineTo(12, 12)
      ctx.lineTo(12, 44)
      ctx.lineTo(0, 44)
      ctx.closePath()
      ctx.stroke()
      ctx.fillStyle = '#d4af37'
      ctx.beginPath()
      ctx.arc(22, 22, 4.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    drawCorner(66, 66, 0)
    drawCorner(canvas.width - 66, 66, Math.PI / 2)
    drawCorner(canvas.width - 66, canvas.height - 66, Math.PI)
    drawCorner(66, canvas.height - 66, -Math.PI / 2)

    // Header Badge
    ctx.fillStyle = '#d4af37'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '600 20px Inter, -apple-system, sans-serif'
    ctx.letterSpacing = '6px'
    ctx.fillText('ZETAGO-AURUM  ·  EDISI MONOGRAF 2026', 512, 160)

    ctx.fillStyle = '#cba358'
    ctx.fillRect(380, 185, 264, 1.5)

    // Centerpiece Gyroscope Medallion
    const cx = 512
    const cy = 480
    ctx.save()
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 3
    for (let r = 0; r < 4; r += 1) {
      ctx.beginPath()
      ctx.arc(cx, cy, 100 + r * 26, 0, Math.PI * 2)
      ctx.globalAlpha = 0.35 + r * 0.2
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = '#f5df8b'
    ctx.font = 'bold 110px "Cinzel", "Times New Roman", serif'
    ctx.fillText('Z', cx, cy + 8)
    ctx.restore()

    // Title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 54px "Cinzel", "Times New Roman", serif'
    ctx.letterSpacing = '3px'
    ctx.fillText('KECERDASAN BUATAN', 512, 780)

    // Subtitle
    ctx.fillStyle = '#d4af37'
    ctx.font = '500 24px Inter, sans-serif'
    ctx.letterSpacing = '4px'
    ctx.fillText('FUNDAMENTAL, SEJARAH & REKAYASA MODEL GENERATIF', 512, 840)

    // Divider Line
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(256, 880)
    ctx.lineTo(768, 880)
    ctx.stroke()

    // Description text
    ctx.fillStyle = '#b3bac7'
    ctx.font = '400 21px "Times New Roman", serif'
    ctx.letterSpacing = '1px'
    ctx.fillText('Buku Pegangan Komprehensif Arsitektur AI, Jaringan Saraf,', 512, 940)
    ctx.fillText('Transformer, Siklus Pelatihan Frontier, hingga Implementasi Kode', 512, 975)

    // Author & Badge at bottom
    ctx.fillStyle = '#d4af37'
    ctx.font = '600 20px Inter, sans-serif'
    ctx.letterSpacing = '4px'
    ctx.fillText('KARYA MONOGRAF LENGKAP · 14 BAB · 158 HALAMAN', 512, 1340)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    return texture
  }, [])

  // Spine Texture
  const generateSpineTexture = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 1536
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#080a0f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Raised Leather Ribs
    ctx.fillStyle = '#1e2433'
    for (let i = 1; i <= 5; i += 1) {
      const y = (canvas.height / 6) * i
      ctx.fillRect(0, y - 8, canvas.width, 16)
      ctx.fillStyle = '#d4af37'
      ctx.fillRect(20, y - 2, canvas.width - 40, 4)
      ctx.fillStyle = '#1e2433'
    }

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(Math.PI / 2)
    ctx.fillStyle = '#f5df8b'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = 'bold 36px "Cinzel", "Times New Roman", serif'
    ctx.letterSpacing = '5px'
    ctx.fillText('ZETAGO-AURUM  ✦  KECERDASAN BUATAN  ✦  2026', 0, 0)
    ctx.restore()

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  // Back Cover Texture
  const generateBackCoverTexture = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1536
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#0a0d14'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#cba358'
    ctx.lineWidth = 3
    ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96)

    ctx.fillStyle = '#f5df8b'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = 'italic 28px "Times New Roman", serif'
    ctx.fillText('"Kecerdasan bukanlah sekadar replikasi logika manusia,', 512, 680)
    ctx.fillText('melainkan jembatan matematis yang memperluas cakrawala', 512, 730)
    ctx.fillText('pemikiran, rekayasa, dan masa depan peradaban."', 512, 780)

    ctx.fillStyle = '#d4af37'
    ctx.font = '500 20px Inter, sans-serif'
    ctx.letterSpacing = '3px'
    ctx.fillText(': ZETAGO-AURUM RESEARCH FOUNDATION :', 512, 870)

    ctx.fillStyle = '#8b949e'
    ctx.font = '400 18px Inter, sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('EDISI PERTAMA · DOKUMEN TAHUN 2026 · TERDAFTAR SECARA RESMI', 512, 1380)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  // Patterned Endpaper Texture
  const generateEndpaperTexture = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1536
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#10141f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.18)'
    ctx.lineWidth = 1.2

    const step = 48
    for (let x = 0; x < canvas.width; x += step) {
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath()
        ctx.arc(x, y, 22, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  // Crease Shadow Texture
  const generateCreaseShadowTexture = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    const grad = ctx.createLinearGradient(0, 0, 64, 0)
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)')
    grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.22)')
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.42)')
    grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.22)')
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 512)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  // Page Content Texture with Safe Gutter Margins (768x1152)
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

    // Paper edge shadow/wash for realism
    const edgeGrad = ctx.createLinearGradient(0, 0, canvas.width, 0)
    if (side === 'left') {
      edgeGrad.addColorStop(0, isDark ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)')
      edgeGrad.addColorStop(0.9, 'transparent')
      edgeGrad.addColorStop(1, isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.12)') // Spine shadow on right
    } else {
      edgeGrad.addColorStop(0, isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.12)') // Spine shadow on left
      edgeGrad.addColorStop(0.1, 'transparent')
      edgeGrad.addColorStop(1, isDark ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)')
    }
    ctx.fillStyle = edgeGrad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (!page) {
      ctx.fillStyle = subColor
      ctx.font = 'italic 20px "Times New Roman", serif'
      ctx.textAlign = 'center'
      ctx.fillText('Akhir Naskah Monograf', 384, 576)
      const emptyTex = new THREE.CanvasTexture(canvas)
      emptyTex.colorSpace = THREE.SRGBColorSpace
      return emptyTex
    }

    // Safe Book Gutter Margins
    // Left Page: outer margin left = 64px, gutter right = 92px
    // Right Page: gutter left = 92px, outer margin right = 64px
    const startX = side === 'left' ? 64 : 92
    const endX = side === 'left' ? 768 - 92 : 768 - 64
    const maxWidth = endX - startX

    // Top Running Header
    ctx.fillStyle = headerColor
    ctx.font = '600 13px Inter, sans-serif'
    ctx.letterSpacing = '2px'

    if (side === 'left') {
      ctx.textAlign = 'left'
      ctx.fillText(page.shortTitle.toUpperCase(), startX, 72)
      ctx.textAlign = 'right'
      ctx.fillText('KECERDASAN BUATAN', endX, 72)
    } else {
      ctx.textAlign = 'left'
      ctx.fillText('KECERDASAN BUATAN', startX, 72)
      ctx.textAlign = 'right'
      ctx.fillText(page.shortTitle.toUpperCase(), endX, 72)
    }

    // Rule under header
    ctx.strokeStyle = ruleColor
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(startX, 88)
    ctx.lineTo(endX, 88)
    ctx.stroke()

    // Page Content Body
    let curY = 135

    const wrapAndDraw = (text: string, fontSize: number, lineHeight: number, isItalic = false, isBold = false) => {
      ctx.font = `${isBold ? 'bold ' : ''}${isItalic ? 'italic ' : ''}${fontSize}px "Iowan Old Style", "Baskerville", "Times New Roman", serif`
      ctx.textAlign = 'left'
      const words = text.split(' ')
      let line = ''
      for (const w of words) {
        const testLine = line ? `${line} ${w}` : w
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && line) {
          ctx.fillText(line, startX, curY)
          line = w
          curY += lineHeight
          if (curY > 1050) break
        } else {
          line = testLine
        }
      }
      if (line && curY <= 1050) {
        ctx.fillText(line, startX, curY)
        curY += lineHeight
      }
    }

    page.paragraphs.forEach((p) => {
      if (curY > 1050) return

      const isSpecial = p.startsWith('Kajian Khusus:')
      const isChapterTitle = p.startsWith('BAB ') || p.startsWith('Bab ') || p.startsWith('MONOGRAF')

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
        const boxHeight = Math.max(56, countLines * 24 + 42)

        ctx.fillStyle = isDark ? 'rgba(200, 162, 72, 0.12)' : 'rgba(200, 162, 72, 0.1)'
        ctx.fillRect(startX, boxStartY, maxWidth, boxHeight)
        ctx.strokeStyle = isDark ? '#c8a248' : '#b8860b'
        ctx.lineWidth = 1.5
        ctx.strokeRect(startX, boxStartY, maxWidth, boxHeight)

        ctx.fillStyle = headerColor
        ctx.font = 'bold 11px Inter, sans-serif'
        ctx.letterSpacing = '2px'
        ctx.textAlign = 'left'
        ctx.fillText('✦ KAJIAN KHUSUS', startX + 16, boxStartY + 22)

        ctx.fillStyle = textColor
        ctx.font = '400 15.5px "Times New Roman", serif'
        let innerY = boxStartY + 44
        tempLine = ''
        for (const w of words) {
          const tLine = tempLine ? `${tempLine} ${w}` : w
          if (ctx.measureText(tLine).width > maxWidth - 36) {
            ctx.fillText(tempLine, startX + 16, innerY)
            tempLine = w
            innerY += 23
          } else {
            tempLine = tLine
          }
        }
        if (tempLine) {
          ctx.fillText(tempLine, startX + 16, innerY)
        }

        curY = boxStartY + boxHeight + 20
      } else if (isChapterTitle) {
        ctx.fillStyle = headerColor
        wrapAndDraw(p, 23, 32, false, true)
        curY += 8
      } else {
        ctx.fillStyle = textColor
        wrapAndDraw(p, 19, 29, false, false)
        curY += 14
      }
    })

    // Bottom Footer (Page Number)
    ctx.fillStyle = subColor
    ctx.font = '500 12px Inter, monospace'
    ctx.letterSpacing = '1.5px'

    if (side === 'left') {
      ctx.textAlign = 'left'
      ctx.fillText(`Hal. ${page.pageNumber}`, startX, 1105)
      ctx.textAlign = 'right'
      ctx.fillText('ZetaGo-Aurum · 2026', endX, 1105)
    } else {
      ctx.textAlign = 'left'
      ctx.fillText('ZetaGo-Aurum · 2026', startX, 1105)
      ctx.textAlign = 'right'
      ctx.fillText(`Hal. ${page.pageNumber}`, endX, 1105)
    }

    // Rule above footer
    ctx.strokeStyle = ruleColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(startX, 1085)
    ctx.lineTo(endX, 1085)
    ctx.stroke()

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
  // THREE.JS INITIALIZATION & LIFECYCLE
  // ==========================================

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || 700

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100)
    camera.position.set(0, 0.4, 5.8)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    rendererRef.current = renderer

    // Controls: ALWAYS enabled for 360 rotation!
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 2.8
    controls.maxDistance = 8.5
    controls.maxPolarAngle = Math.PI / 2 + 0.15
    controls.minPolarAngle = Math.PI / 6
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.0)
    scene.add(ambientLight)

    const mainKeyLight = new THREE.DirectionalLight(0xffe8c6, 2.0)
    mainKeyLight.position.set(3.5, 6.5, 5.5)
    scene.add(mainKeyLight)

    const fillLight = new THREE.DirectionalLight(0xd4e2f5, 0.9)
    fillLight.position.set(-4.5, 2.5, 3.8)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.4)
    rimLight.position.set(0, -3.5, -4.5)
    scene.add(rimLight)

    // ==========================================
    // BUILD PHYSICAL 3D BOOK RIG (SPINE AT X = 0)
    // ==========================================
    const bookWidth = 1.9
    const bookHeight = 2.7
    const pageBlockDepth = 0.22
    const boardThickness = 0.024
    const coverWidth = bookWidth + 0.04
    const coverHeight = bookHeight + 0.08

    const rootGroup = new THREE.Group()
    scene.add(rootGroup)
    bookGroupRef.current = rootGroup

    // Closed position: offset by -bookWidth/2 so the closed book is centered at x = 0
    rootGroup.position.set(-bookWidth / 2, 0, 0)
    rootGroup.rotation.set(0.12, -0.32, 0)

    // Textures
    const coverTex = generateCoverTexture()
    const spineTex = generateSpineTexture()
    const backCoverTex = generateBackCoverTexture()
    const endpaperTex = generateEndpaperTexture()
    const creaseTex = generateCreaseShadowTexture()

    // 1. Back Cover (Right side: x = 0 to coverWidth)
    const backCoverGeom = new RoundedBoxGeometry(coverWidth, coverHeight, boardThickness, 2, 0.008)
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x0a0d14,
      roughness: 0.75,
      metalness: 0.15,
    })
    const backCoverMesh = new THREE.Mesh(backCoverGeom, leatherMat)
    backCoverMesh.position.set(coverWidth / 2, 0, -pageBlockDepth / 2 - boardThickness / 2)
    rootGroup.add(backCoverMesh)

    const backPlaneGeom = new THREE.PlaneGeometry(coverWidth - 0.02, coverHeight - 0.02)
    const backPlaneMat = new THREE.MeshStandardMaterial({
      map: backCoverTex,
      roughness: 0.65,
      metalness: 0.2,
    })
    const backPlane = new THREE.Mesh(backPlaneGeom, backPlaneMat)
    backPlane.rotation.y = Math.PI
    backPlane.position.set(coverWidth / 2, 0, -pageBlockDepth / 2 - boardThickness - 0.001)
    rootGroup.add(backPlane)

    // 2. Spine along x = 0
    const spineGeom = new RoundedBoxGeometry(boardThickness * 1.6, coverHeight, pageBlockDepth + boardThickness * 2, 2, 0.005)
    const spineMat = new THREE.MeshStandardMaterial({
      map: spineTex,
      roughness: 0.7,
      metalness: 0.25,
    })
    const spineMesh = new THREE.Mesh(spineGeom, spineMat)
    spineMesh.position.set(-boardThickness * 0.8, 0, 0)
    rootGroup.add(spineMesh)

    // 3. Right Page Block (x = 0 to bookWidth)
    const pageBlockGeom = new RoundedBoxGeometry(bookWidth, bookHeight, pageBlockDepth, 2, 0.004)
    const edgeCanvas = document.createElement('canvas')
    edgeCanvas.width = 128
    edgeCanvas.height = 512
    const edgeCtx = edgeCanvas.getContext('2d')!
    edgeCtx.fillStyle = '#e8dec8'
    edgeCtx.fillRect(0, 0, 128, 512)
    for (let l = 0; l < 512; l += 3) {
      edgeCtx.fillStyle = l % 6 === 0 ? '#d4af37' : '#cfc4ab'
      edgeCtx.fillRect(0, l, 128, 1.5)
    }
    const edgeTex = new THREE.CanvasTexture(edgeCanvas)
    const pageEdgeMat = new THREE.MeshStandardMaterial({
      map: edgeTex,
      roughness: 0.9,
      metalness: 0.1,
    })
    const pageBlock = new THREE.Mesh(pageBlockGeom, pageEdgeMat)
    pageBlock.position.set(bookWidth / 2, 0, 0)
    rootGroup.add(pageBlock)

    // 4. Front Cover Pivot (Hinged at x = 0!)
    const frontPivot = new THREE.Group()
    frontPivot.position.set(0, 0, pageBlockDepth / 2 + boardThickness / 2)
    frontPivotRef.current = frontPivot

    const frontCoverGeom = new RoundedBoxGeometry(coverWidth, coverHeight, boardThickness, 2, 0.008)
    const frontCoverMesh = new THREE.Mesh(frontCoverGeom, leatherMat)
    frontCoverMesh.position.set(coverWidth / 2, 0, 0)
    frontPivot.add(frontCoverMesh)
    frontCoverMeshRef.current = frontCoverMesh

    // Front Cover Artwork Plane (Outside)
    const frontCoverPlaneGeom = new THREE.PlaneGeometry(coverWidth - 0.02, coverHeight - 0.02)
    const frontCoverPlaneMat = new THREE.MeshStandardMaterial({
      map: coverTex,
      roughness: 0.65,
      metalness: 0.25,
    })
    const frontCoverPlane = new THREE.Mesh(frontCoverPlaneGeom, frontCoverPlaneMat)
    frontCoverPlane.position.set(coverWidth / 2, 0, boardThickness / 2 + 0.001)
    frontPivot.add(frontCoverPlane)

    // Inside Front Endpaper Plane
    const frontEndpaperPlaneGeom = new THREE.PlaneGeometry(coverWidth - 0.03, coverHeight - 0.03)
    const frontEndpaperPlaneMat = new THREE.MeshStandardMaterial({
      map: endpaperTex,
      roughness: 0.9,
      metalness: 0.05,
    })
    const frontEndpaperPlane = new THREE.Mesh(frontEndpaperPlaneGeom, frontEndpaperPlaneMat)
    frontEndpaperPlane.rotation.y = Math.PI
    frontEndpaperPlane.position.set(coverWidth / 2, 0, -boardThickness / 2 - 0.001)
    frontPivot.add(frontEndpaperPlane)
    rootGroup.add(frontPivot)

    // 5. Open Reading Surfaces (Left: -bookWidth to 0, Right: 0 to bookWidth)
    const pageGeom = new THREE.PlaneGeometry(bookWidth, bookHeight)

    // Left Page Mesh (center at -bookWidth / 2)
    const leftPageMat = new THREE.MeshStandardMaterial({
      map: endpaperTex,
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.FrontSide,
    })
    const leftPageMesh = new THREE.Mesh(pageGeom, leftPageMat)
    leftPageMesh.position.set(-bookWidth / 2, 0, pageBlockDepth / 2 + 0.002)
    leftPageMesh.visible = false
    rootGroup.add(leftPageMesh)
    leftPageMeshRef.current = leftPageMesh

    // Right Page Mesh (center at bookWidth / 2)
    const rightPageMat = new THREE.MeshStandardMaterial({
      map: getPageTexture(aiBookPages[0], 'ivory', 'right'),
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.FrontSide,
    })
    const rightPageMesh = new THREE.Mesh(pageGeom, rightPageMat)
    rightPageMesh.position.set(bookWidth / 2, 0, pageBlockDepth / 2 + 0.002)
    rightPageMesh.visible = false
    rootGroup.add(rightPageMesh)
    rightPageMeshRef.current = rightPageMesh

    // 6. Center Spine Crease Shadow (Subtle depth, NO thick ribbon!)
    const creaseGeom = new THREE.PlaneGeometry(0.14, bookHeight)
    const creaseMat = new THREE.MeshBasicMaterial({
      map: creaseTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    })
    const creaseMesh = new THREE.Mesh(creaseGeom, creaseMat)
    creaseMesh.position.set(0, 0, pageBlockDepth / 2 + 0.003)
    rootGroup.add(creaseMesh)

    // 7. Dynamic 3D Turning Page Leaf with Flexible Vertex Curvature (Hinged at x = 0!)
    const leafPivot = new THREE.Group()
    leafPivot.position.set(0, 0, pageBlockDepth / 2 + 0.005)
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
    // ANIMATION LOOP
    // ==========================================
    let reqId = 0
    let lastTime = performance.now()

    const animate = (time: number) => {
      reqId = requestAnimationFrame(animate)
      const dt = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time

      const anim = animStateRef.current
      controls.update()

      // When not dragging cover, animate cover opening towards target
      if (!dragRef.current.active || (dragRef.current.mode !== 'cover-open' && dragRef.current.mode !== 'cover-close')) {
        anim.openProgress = lerp(anim.openProgress, anim.targetOpenProgress, dt * 7)
        const openAmount = anim.openProgress

        const hoverCrack = !isOpen && anim.isHovered ? -0.15 : 0
        const targetRotY = openAmount > 0.001
          ? (-Math.PI + 0.04) * openAmount
          : hoverCrack
        frontPivot.rotation.y = lerp(frontPivot.rotation.y, targetRotY, dt * 10)

        // Book position transition:
        // Closed = -bookWidth / 2 (centers closed book)
        // Open = 0 (centers open 2-page spread)
        const targetRootX = lerp(-bookWidth / 2, 0, openAmount)
        rootGroup.position.x = lerp(rootGroup.position.x, targetRootX, dt * 7)

        if (openAmount > 0.01) {
          rootGroup.position.y = lerp(rootGroup.position.y, 0, dt * 6)
          rootGroup.rotation.x = lerp(rootGroup.rotation.x, 0, dt * 6)
          rootGroup.rotation.y = lerp(rootGroup.rotation.y, 0, dt * 6)
          rootGroup.rotation.z = lerp(rootGroup.rotation.z, 0, dt * 6)

          leftPageMesh.visible = openAmount > 0.35
          rightPageMesh.visible = openAmount > 0.35
        } else {
          anim.ambientAngle += dt * 0.4
          const floatY = Math.sin(anim.ambientAngle * 1.5) * 0.04
          rootGroup.position.y = floatY
          leftPageMesh.visible = false
          rightPageMesh.visible = false
        }
      }

      // Page flip animation with vertex curvature
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

        // Flexible Page Curvature: arch up in the middle, lift corner
        const arch = Math.sin(progress * Math.PI) * 0.22
        const twist = Math.sin(progress * Math.PI) * 0.08

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

        // Flip finished
        if (progress >= 1) {
          const dir = anim.flipDirection
          anim.flipDirection = null
          leafPivot.visible = false
          setIsFlipping(false)

          if (dir === 'next') {
            setCurrentPage((prev) => Math.min(prev + 2, aiBookPages.length - 1))
          } else {
            setCurrentPage((prev) => Math.max(0, prev - 2))
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
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      renderer.dispose()
    }
  }, [generateCoverTexture, generateSpineTexture, generateBackCoverTexture, generateEndpaperTexture, generateCreaseShadowTexture, getPageTexture, isOpen])

  // ==========================================
  // SYNC REACT STATE WITH 3D SCENE
  // ==========================================

  // Open / Close Book state
  useEffect(() => {
    animStateRef.current.targetOpenProgress = isOpen ? 1 : 0
    if (cameraRef.current && controlsRef.current) {
      if (isOpen) {
        cameraRef.current.position.set(0, 0, 4.4)
        controlsRef.current.target.set(0, 0, 0)
      } else {
        cameraRef.current.position.set(0, 0.4, 5.8)
        controlsRef.current.target.set(0, 0, 0)
      }
    }
  }, [isOpen])

  // Sync Current Pages onto 3D Meshes
  useEffect(() => {
    if (!isOpen) return
    const leftTex = currentPage === 0
      ? generateEndpaperTexture()
      : getPageTexture(aiBookPages[currentPage - 1] || null, paperTheme, 'left')

    const rightTex = getPageTexture(aiBookPages[currentPage] || null, paperTheme, 'right')

    if (leftPageMeshRef.current) {
      (leftPageMeshRef.current.material as THREE.MeshStandardMaterial).map = leftTex
      ;(leftPageMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true
    }
    if (rightPageMeshRef.current) {
      (rightPageMeshRef.current.material as THREE.MeshStandardMaterial).map = rightTex
      ;(rightPageMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true
    }
  }, [currentPage, isOpen, paperTheme, generateEndpaperTexture, getPageTexture])

  // Flip Next Page in 3D
  const flipNext = useCallback(() => {
    if (isFlipping || !isOpen) return
    if (currentPage >= aiBookPages.length - 1) return

    setIsFlipping(true)
    playPageSound()

    const turningPivot = turningPivotRef.current
    const frontLeafMesh = frontLeafMeshRef.current
    const backLeafMesh = backLeafMeshRef.current
    const rightPageMesh = rightPageMeshRef.current

    if (!turningPivot || !frontLeafMesh || !backLeafMesh || !rightPageMesh) return

    const curRightTex = getPageTexture(aiBookPages[currentPage] || null, paperTheme, 'right')
    ;(frontLeafMesh.material as THREE.MeshStandardMaterial).map = curRightTex
    ;(frontLeafMesh.material as THREE.MeshStandardMaterial).needsUpdate = true

    const nextLeftTex = getPageTexture(aiBookPages[currentPage + 1] || null, paperTheme, 'left')
    ;(backLeafMesh.material as THREE.MeshStandardMaterial).map = nextLeftTex
    ;(backLeafMesh.material as THREE.MeshStandardMaterial).needsUpdate = true

    const nextRightTex = getPageTexture(aiBookPages[currentPage + 2] || null, paperTheme, 'right')
    ;(rightPageMesh.material as THREE.MeshStandardMaterial).map = nextRightTex
    ;(rightPageMesh.material as THREE.MeshStandardMaterial).needsUpdate = true

    turningPivot.visible = true
    turningPivot.rotation.y = 0

    animStateRef.current.flipDirection = 'next'
    animStateRef.current.flipStartTime = performance.now()
  }, [isFlipping, isOpen, currentPage, paperTheme, getPageTexture, playPageSound])

  // Flip Previous Page in 3D
  const flipPrev = useCallback(() => {
    if (isFlipping || !isOpen) return
    if (currentPage <= 0) return

    setIsFlipping(true)
    playPageSound()

    const turningPivot = turningPivotRef.current
    const frontLeafMesh = frontLeafMeshRef.current
    const backLeafMesh = backLeafMeshRef.current
    const leftPageMesh = leftPageMeshRef.current

    if (!turningPivot || !frontLeafMesh || !backLeafMesh || !leftPageMesh) return

    const prevLeftTex = currentPage - 2 === 0
      ? generateEndpaperTexture()
      : getPageTexture(aiBookPages[currentPage - 3] || null, paperTheme, 'left')
    ;(leftPageMesh.material as THREE.MeshStandardMaterial).map = prevLeftTex
    ;(leftPageMesh.material as THREE.MeshStandardMaterial).needsUpdate = true

    const curLeftTex = getPageTexture(aiBookPages[currentPage - 1] || null, paperTheme, 'left')
    ;(backLeafMesh.material as THREE.MeshStandardMaterial).map = curLeftTex
    ;(backLeafMesh.material as THREE.MeshStandardMaterial).needsUpdate = true

    const prevRightTex = getPageTexture(aiBookPages[currentPage - 2] || null, paperTheme, 'right')
    ;(frontLeafMesh.material as THREE.MeshStandardMaterial).map = prevRightTex
    ;(frontLeafMesh.material as THREE.MeshStandardMaterial).needsUpdate = true

    turningPivot.visible = true
    turningPivot.rotation.y = -Math.PI

    animStateRef.current.flipDirection = 'prev'
    animStateRef.current.flipStartTime = performance.now()
  }, [isFlipping, isOpen, currentPage, paperTheme, generateEndpaperTexture, getPageTexture, playPageSound])

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
  // DRAG-TO-OPEN & DRAG-TO-FLIP PHYSICS
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

    // Raycast hit targets
    const hits: THREE.Intersection[] = []
    if (frontCoverMeshRef.current) hits.push(...raycaster.intersectObject(frontCoverMeshRef.current, true))
    if (leftPageMeshRef.current && leftPageMeshRef.current.visible) hits.push(...raycaster.intersectObject(leftPageMeshRef.current))
    if (rightPageMeshRef.current && rightPageMeshRef.current.visible) hits.push(...raycaster.intersectObject(rightPageMeshRef.current))

    if (hits.length > 0) {
      // Hit on the book! Disable orbit controls and start book drag
      if (controlsRef.current) controlsRef.current.enabled = false

      const drag = dragRef.current
      drag.active = true
      drag.startX = e.clientX
      drag.startY = e.clientY
      drag.moved = false
      drag.pointerId = e.pointerId

      if (!isOpen) {
        drag.mode = 'cover-open'
      } else {
        const hitObj = hits[0].object
        if (hitObj === leftPageMeshRef.current) {
          drag.mode = currentPage === 0 ? 'cover-close' : 'page-prev'
        } else if (hitObj === rightPageMeshRef.current) {
          drag.mode = 'page-next'
        } else {
          drag.mode = 'cover-close'
        }
      }

      canvasRef.current.setPointerCapture?.(e.pointerId)
    } else {
      // Hit background -> Keep controls enabled for 360 rotation!
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

    const frontPivot = frontPivotRef.current
    const rootGroup = bookGroupRef.current
    if (!frontPivot || !rootGroup) return

    const bookWidth = 1.9

    if (drag.mode === 'cover-open') {
      // Drag left to open cover
      const prog = clamp(-deltaX / 240, 0, 1)
      drag.progress = prog
      frontPivot.rotation.y = (-Math.PI + 0.04) * prog
      rootGroup.position.x = lerp(-bookWidth / 2, 0, prog)
      if (leftPageMeshRef.current && rightPageMeshRef.current) {
        leftPageMeshRef.current.visible = prog > 0.35
        rightPageMeshRef.current.visible = prog > 0.35
      }
    } else if (drag.mode === 'cover-close') {
      // Drag right to close cover
      const prog = clamp(deltaX / 240, 0, 1)
      drag.progress = prog
      frontPivot.rotation.y = (-Math.PI + 0.04) * (1 - prog)
      rootGroup.position.x = lerp(0, -bookWidth / 2, prog)
      if (leftPageMeshRef.current && rightPageMeshRef.current) {
        leftPageMeshRef.current.visible = prog < 0.65
        rightPageMeshRef.current.visible = prog < 0.65
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

    if (!drag.moved) {
      // TAP / CLICK INTERACTION
      if (!isOpen) {
        setIsOpen(true)
        playPageSound()
      } else {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) {
          const clickX = e.clientX - rect.left
          const midX = rect.width / 2
          if (clickX > midX + 30) {
            flipNext()
          } else if (clickX < midX - 30) {
            flipPrev()
          }
        }
      }
      return
    }

    // DRAG RELEASE COMMIT
    if (drag.mode === 'cover-open') {
      if (drag.progress > 0.22) {
        setIsOpen(true)
        playPageSound()
      } else {
        // Cancel open
        animStateRef.current.targetOpenProgress = 0
      }
    } else if (drag.mode === 'cover-close') {
      if (drag.progress > 0.22) {
        setIsOpen(false)
        playPageSound()
      } else {
        // Cancel close
        animStateRef.current.targetOpenProgress = 1
      }
    } else if (drag.mode === 'page-next') {
      if (e.clientX - drag.startX < -40) {
        flipNext()
      }
    } else if (drag.mode === 'page-prev') {
      if (e.clientX - drag.startX > 40) {
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
        isFullscreen ? 'fixed inset-0 z-50 h-screen bg-[#07090e]' : 'min-h-[720px] sm:min-h-[820px] rounded-2xl border border-[oklch(0.72_0.13_80_/_0.25)] bg-[#07090e] shadow-2xl'
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

      {/* Luxury Ambient Top Floating Badge */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto rounded-full border border-[oklch(0.72_0.13_80_/_0.4)] bg-[#0a0d14]/85 px-3 py-1.5 backdrop-blur-md shadow-lg">
          <div className="h-2 w-2 rounded-full bg-[oklch(0.72_0.13_80)] animate-pulse" />
          <span className="font-mono text-[11px] font-semibold tracking-wider text-[oklch(0.72_0.13_80)]">
            {isOpen ? '3D MONOGRAF TERBUKA (ORBIT 360° AKTIF)' : '3D INTERACTIVE SHOWCASE (ORBIT 360°)'}
          </span>
        </div>

        {/* Top Control Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Table of Contents Button */}
          {isOpen && (
            <button
              onClick={() => setIsTocOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-border/70 bg-[#0a0d14]/85 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-md hover:border-[oklch(0.72_0.13_80)] active:scale-95 transition-all"
            >
              <Menu className="h-3.5 w-3.5 text-[oklch(0.72_0.13_80)]" />
              <span className="hidden sm:inline">Daftar Isi</span>
            </button>
          )}

          {/* Theme Toggle (Ivory / Dark) */}
          {isOpen && (
            <button
              onClick={() => setPaperTheme((t) => (t === 'ivory' ? 'dark' : 'ivory'))}
              title="Ganti Tema Kertas"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-[#0a0d14]/85 text-foreground backdrop-blur-md hover:border-[oklch(0.72_0.13_80)] active:scale-95 transition-all"
            >
              {paperTheme === 'ivory' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-[oklch(0.72_0.13_80)]" />}
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((s) => !s)}
            title={soundEnabled ? 'Matikan Suara Kertas' : 'Aktifkan Suara Kertas'}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-[#0a0d14]/85 text-foreground backdrop-blur-md hover:border-[oklch(0.72_0.13_80)] active:scale-95 transition-all"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-[oklch(0.72_0.13_80)]" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-[#0a0d14]/85 text-foreground backdrop-blur-md hover:border-[oklch(0.72_0.13_80)] active:scale-95 transition-all"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* CLOSED STATE: Bottom Hero Call-to-Action Bar */}
      {!isOpen && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 pointer-events-auto">
          <p className="text-[11px] sm:text-xs font-mono text-muted-foreground text-center bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
            Tarik sampul ke kiri untuk membuka · Drag latar untuk putar 360°
          </p>
          <button
            onClick={() => {
              setIsOpen(true)
              playPageSound()
            }}
            className="group inline-flex items-center gap-2.5 rounded-full border border-[oklch(0.72_0.13_80)] bg-[oklch(0.72_0.13_80_/_0.2)] px-6 py-3 text-sm font-bold text-[oklch(0.72_0.13_80)] backdrop-blur-xl hover:bg-[oklch(0.72_0.13_80_/_0.35)] active:scale-95 transition-all shadow-[0_0_24px_rgba(212,175,55,0.25)]"
          >
            <BookOpen className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>Buka Naskah Fisik 3D</span>
            <Sparkles className="h-3.5 w-3.5 animate-spin text-[oklch(0.72_0.13_80)]" />
          </button>
        </div>
      )}

      {/* OPEN STATE: Bottom Navigation Bar */}
      {isOpen && (
        <div className="absolute bottom-5 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <button
            onClick={flipPrev}
            disabled={currentPage <= 0 || isFlipping}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/80 bg-[#0a0d14]/90 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-md disabled:opacity-30 disabled:pointer-events-none hover:border-[oklch(0.72_0.13_80)] active:scale-95 transition-all"
          >
            <ChevronLeft className="h-4 w-4 text-[oklch(0.72_0.13_80)]" />
            <span className="hidden sm:inline">Halaman Sebelumnya</span>
            <span className="sm:hidden">Sebelumnya</span>
          </button>

          {/* Page Indicator & Reliable Close Button */}
          <div className="pointer-events-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/60 bg-[#0a0d14]/90 px-4 py-1.5 text-xs font-mono text-muted-foreground backdrop-blur-md">
              <span>Hal. {currentPage === 0 ? '1' : `${currentPage}-${currentPage + 1}`}</span>
              <span>/</span>
              <span>158</span>
            </div>

            <button
              onClick={() => {
                setIsOpen(false)
                playPageSound()
              }}
              className="flex items-center gap-1.5 rounded-full border border-[oklch(0.72_0.13_80_/_0.6)] bg-[oklch(0.72_0.13_80_/_0.2)] px-4 py-2 text-xs font-semibold text-[oklch(0.72_0.13_80)] backdrop-blur-md hover:bg-[oklch(0.72_0.13_80_/_0.35)] active:scale-95 transition-all shadow-[0_0_12px_rgba(212,175,55,0.2)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Tutup Buku</span>
            </button>
          </div>

          <button
            onClick={flipNext}
            disabled={currentPage >= aiBookPages.length - 1 || isFlipping}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-[oklch(0.72_0.13_80_/_0.6)] bg-[oklch(0.72_0.13_80_/_0.2)] px-4 py-2 text-xs font-semibold text-[oklch(0.72_0.13_80)] backdrop-blur-md disabled:opacity-30 disabled:pointer-events-none hover:bg-[oklch(0.72_0.13_80_/_0.35)] active:scale-95 transition-all"
          >
            <span className="hidden sm:inline">Halaman Selanjutnya</span>
            <span className="sm:hidden">Selanjutnya</span>
            <ChevronRight className="h-4 w-4 text-[oklch(0.72_0.13_80)]" />
          </button>
        </div>
      )}

      {/* TABLE OF CONTENTS DRAWER */}
      {isTocOpen && (
        <div className="absolute inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="h-full w-full max-w-md border-l border-border/80 bg-[#0c0f17] p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-[oklch(0.72_0.13_80)]" />
                <h3 className="font-serif text-base font-bold text-foreground">
                  Daftar Bab Monograf (14 Bab)
                </h3>
              </div>
              <button
                onClick={() => setIsTocOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground"
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
                    onClick={() => {
                      setCurrentPage(Math.max(0, targetPage - 1))
                      setIsTocOpen(false)
                      playPageSound()
                    }}
                    className="group flex w-full items-center justify-between rounded-xl border border-border/40 bg-card/40 p-3 text-left transition-all hover:border-[oklch(0.72_0.13_80)] hover:bg-[oklch(0.72_0.13_80_/_0.1)]"
                  >
                    <div>
                      <div className="font-mono text-[10px] font-bold text-[oklch(0.72_0.13_80)]">
                        Bab {idx + 1}
                      </div>
                      <div className="font-serif text-xs font-semibold text-foreground line-clamp-1">
                        {sec.title}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
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
