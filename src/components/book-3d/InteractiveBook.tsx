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
  const leftPageMeshRef = useRef<THREE.Mesh | null>(null)
  const rightPageMeshRef = useRef<THREE.Mesh | null>(null)
  const turningPivotRef = useRef<THREE.Group | null>(null)
  const frontLeafMeshRef = useRef<THREE.Mesh | null>(null)
  const backLeafMeshRef = useRef<THREE.Mesh | null>(null)
  const ribbonMeshRef = useRef<THREE.Mesh | null>(null)

  // Animation state refs
  const animStateRef = useRef({
    openProgress: 0,
    targetOpenProgress: 0,
    flipProgress: 0,
    flipDirection: null as 'next' | 'prev' | null,
    flipDuration: 0.72,
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

      // Soft paper rustle simulation
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(800, ctx.currentTime)
      filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.15)
      filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3)

      gain.gain.setValueAtTime(0.001, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32)

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(140, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.33)
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

    // Base obsidian leather background
    ctx.fillStyle = '#0a0d14'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Leather grain / noise wash
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

    // Embossed 'Z' in center
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

    // Vertical Gold Title
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

    // Gilded border
    ctx.strokeStyle = '#cba358'
    ctx.lineWidth = 3
    ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96)

    // Quotation
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

    // Lattice pattern
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

  // Page Content Texture (High Resolution 768x1152)
  const generatePageTexture = useCallback((page: BookPage | null, theme: 'ivory' | 'dark') => {
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

    // Fill background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Paper edge shadow/wash for realism
    const edgeGrad = ctx.createLinearGradient(0, 0, canvas.width, 0)
    edgeGrad.addColorStop(0, isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)')
    edgeGrad.addColorStop(0.08, 'transparent')
    edgeGrad.addColorStop(0.94, 'transparent')
    edgeGrad.addColorStop(1, isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.05)')
    ctx.fillStyle = edgeGrad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (!page) {
      // Empty end page
      ctx.fillStyle = subColor
      ctx.font = 'italic 20px "Times New Roman", serif'
      ctx.textAlign = 'center'
      ctx.fillText('Akhir Naskah Monograf', 384, 576)
      const emptyTex = new THREE.CanvasTexture(canvas)
      emptyTex.colorSpace = THREE.SRGBColorSpace
      return emptyTex
    }

    // Top Running Header
    ctx.fillStyle = headerColor
    ctx.font = '600 13px Inter, sans-serif'
    ctx.letterSpacing = '2.5px'
    ctx.textAlign = 'left'
    ctx.fillText('KECERDASAN BUATAN', 64, 72)

    ctx.textAlign = 'right'
    ctx.font = '500 12px Inter, sans-serif'
    ctx.letterSpacing = '1.5px'
    ctx.fillText(page.shortTitle.toUpperCase(), 704, 72)

    // Rule under header
    ctx.strokeStyle = ruleColor
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(64, 88)
    ctx.lineTo(704, 88)
    ctx.stroke()

    // Page Content Body
    let curY = 135
    const maxWidth = 640
    const startX = 64

    // Helper to wrap and draw text
    const wrapAndDraw = (text: string, fontSize: number, lineHeight: number, isItalic = false, isBold = false) => {
      ctx.font = `${isBold ? 'bold ' : ''}${isItalic ? 'italic ' : ''}${fontSize}px "Iowan Old Style", "Baskerville", "Times New Roman", serif`
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
        // Draw callout box
        const boxStartY = curY
        const cleanText = p.replace(/^Kajian Khusus:\s*/, '')
        ctx.font = '16px "Times New Roman", serif'

        // Estimate lines
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

        // Box background
        ctx.fillStyle = isDark ? 'rgba(200, 162, 72, 0.12)' : 'rgba(200, 162, 72, 0.1)'
        ctx.fillRect(startX, boxStartY, maxWidth, boxHeight)
        ctx.strokeStyle = isDark ? '#c8a248' : '#b8860b'
        ctx.lineWidth = 1.5
        ctx.strokeRect(startX, boxStartY, maxWidth, boxHeight)

        // Header
        ctx.fillStyle = headerColor
        ctx.font = 'bold 11px Inter, sans-serif'
        ctx.letterSpacing = '2px'
        ctx.fillText('✦ KAJIAN KHUSUS', startX + 16, boxStartY + 22)

        // Inner text
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
    ctx.textAlign = 'left'
    ctx.fillText('ZetaGo-Aurum · 2026', 64, 1105)

    ctx.textAlign = 'right'
    ctx.fillText(`Hal. ${page.pageNumber}`, 704, 1105)

    // Rule above footer
    ctx.strokeStyle = ruleColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(64, 1085)
    ctx.lineTo(704, 1085)
    ctx.stroke()

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    return texture
  }, [])

  // Helper to get or create cached texture
  const getPageTexture = useCallback((page: BookPage | null, theme: 'ivory' | 'dark') => {
    const key = `${page ? page.pageNumber : 'end'}-${theme}`
    if (!textureCacheRef.current.has(key)) {
      const tex = generatePageTexture(page, theme)
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

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 3.2
    controls.maxDistance = 8.5
    controls.maxPolarAngle = Math.PI / 2 + 0.1
    controls.minPolarAngle = Math.PI / 6
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 0.9)
    scene.add(ambientLight)

    const mainKeyLight = new THREE.DirectionalLight(0xffe8c6, 1.8)
    mainKeyLight.position.set(3.5, 6.5, 5.5)
    scene.add(mainKeyLight)

    const fillLight = new THREE.DirectionalLight(0xd4e2f5, 0.85)
    fillLight.position.set(-4.5, 2.5, 3.8)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.2)
    rimLight.position.set(0, -3.5, -4.5)
    scene.add(rimLight)

    // ==========================================
    // BUILD PHYSICAL 3D BOOK RIG
    // ==========================================
    const bookWidth = 1.95
    const bookHeight = 2.75
    const pageBlockDepth = 0.28
    const boardThickness = 0.025
    const coverOverhang = 0.045
    const coverWidth = bookWidth + coverOverhang
    const coverHeight = bookHeight + coverOverhang * 2

    const rootGroup = new THREE.Group()
    scene.add(rootGroup)
    bookGroupRef.current = rootGroup

    // Initial closed showcase rotation
    rootGroup.rotation.set(0.12, -0.32, 0)

    // Textures
    const coverTex = generateCoverTexture()
    const spineTex = generateSpineTexture()
    const backCoverTex = generateBackCoverTexture()
    const endpaperTex = generateEndpaperTexture()

    // 1. Back Cover
    const backPivot = new THREE.Group()
    backPivot.position.set(-bookWidth / 2, 0, -pageBlockDepth / 2 - boardThickness / 2)
    const backCoverGeom = new RoundedBoxGeometry(coverWidth, coverHeight, boardThickness, 2, 0.008)
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x0a0d14,
      roughness: 0.75,
      metalness: 0.15,
    })
    const backCoverMesh = new THREE.Mesh(backCoverGeom, leatherMat)
    backCoverMesh.position.set(coverWidth / 2, 0, 0)
    backPivot.add(backCoverMesh)

    // Back cover art plane
    const backPlaneGeom = new THREE.PlaneGeometry(coverWidth - 0.02, coverHeight - 0.02)
    const backPlaneMat = new THREE.MeshStandardMaterial({
      map: backCoverTex,
      roughness: 0.65,
      metalness: 0.2,
    })
    const backPlane = new THREE.Mesh(backPlaneGeom, backPlaneMat)
    backPlane.rotation.y = Math.PI
    backPlane.position.set(coverWidth / 2, 0, -boardThickness / 2 - 0.001)
    backPivot.add(backPlane)
    rootGroup.add(backPivot)

    // 2. Spine
    const spineGeom = new RoundedBoxGeometry(boardThickness, coverHeight, pageBlockDepth + boardThickness * 2, 2, 0.005)
    const spineMat = new THREE.MeshStandardMaterial({
      map: spineTex,
      roughness: 0.7,
      metalness: 0.25,
    })
    const spineMesh = new THREE.Mesh(spineGeom, spineMat)
    spineMesh.position.set(-bookWidth / 2 - boardThickness / 2, 0, 0)
    rootGroup.add(spineMesh)

    // 3. Page Block
    const pageBlockGeom = new RoundedBoxGeometry(bookWidth, bookHeight, pageBlockDepth, 2, 0.004)
    // Canvas texture for gilded/paper edges
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
    pageBlock.position.set(0, 0, 0)
    rootGroup.add(pageBlock)

    // 4. Front Cover Pivot
    const frontPivot = new THREE.Group()
    frontPivot.position.set(-bookWidth / 2, 0, pageBlockDepth / 2 + boardThickness / 2)
    frontPivotRef.current = frontPivot

    const frontCoverGeom = new RoundedBoxGeometry(coverWidth, coverHeight, boardThickness, 2, 0.008)
    const frontCoverMesh = new THREE.Mesh(frontCoverGeom, leatherMat)
    frontCoverMesh.position.set(coverWidth / 2, 0, 0)
    frontPivot.add(frontCoverMesh)

    // Front Cover Artwork Plane
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

    // 5. Open Reading Surfaces (Left & Right Pages in 3D Spread)
    const pageGeom = new THREE.PlaneGeometry(bookWidth - 0.02, bookHeight - 0.02)

    // Left Page Mesh
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

    // Right Page Mesh
    const rightPageMat = new THREE.MeshStandardMaterial({
      map: getPageTexture(aiBookPages[0], 'ivory'),
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.FrontSide,
    })
    const rightPageMesh = new THREE.Mesh(pageGeom, rightPageMat)
    rightPageMesh.position.set(bookWidth / 2, 0, pageBlockDepth / 2 + 0.002)
    rightPageMesh.visible = false
    rootGroup.add(rightPageMesh)
    rightPageMeshRef.current = rightPageMesh

    // 6. Dynamic 3D Turning Page Leaf with Flexible Vertex Curvature
    const leafPivot = new THREE.Group()
    leafPivot.position.set(0, 0, pageBlockDepth / 2 + 0.005)
    turningPivotRef.current = leafPivot
    leafPivot.visible = false

    const flexGeomFront = new THREE.PlaneGeometry(bookWidth - 0.02, bookHeight - 0.02, 18, 8)
    const flexGeomBack = new THREE.PlaneGeometry(bookWidth - 0.02, bookHeight - 0.02, 18, 8)

    const frontLeafMat = new THREE.MeshStandardMaterial({
      map: getPageTexture(aiBookPages[0], 'ivory'),
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.FrontSide,
    })
    const frontLeafMesh = new THREE.Mesh(flexGeomFront, frontLeafMat)
    frontLeafMesh.position.set((bookWidth - 0.02) / 2, 0, 0.0008)
    leafPivot.add(frontLeafMesh)
    frontLeafMeshRef.current = frontLeafMesh

    const backLeafMat = new THREE.MeshStandardMaterial({
      map: getPageTexture(aiBookPages[1], 'ivory'),
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.FrontSide,
    })
    const backLeafMesh = new THREE.Mesh(flexGeomBack, backLeafMat)
    backLeafMesh.rotation.y = Math.PI
    backLeafMesh.position.set((bookWidth - 0.02) / 2, 0, -0.0008)
    leafPivot.add(backLeafMesh)
    backLeafMeshRef.current = backLeafMesh

    rootGroup.add(leafPivot)

    // 7. Silk Ribbon Bookmark
    const ribbonGeom = new THREE.PlaneGeometry(0.05, bookHeight * 1.08, 12, 1)
    // Curvature for hanging ribbon
    const pos = ribbonGeom.attributes.position
    for (let i = 0; i < pos.count; i += 1) {
      const y = pos.getY(i)
      const u = (y + bookHeight * 0.54) / (bookHeight * 1.08)
      pos.setZ(i, Math.sin(u * Math.PI * 2) * 0.015 + (1 - u) * 0.03)
    }
    ribbonGeom.computeVertexNormals()

    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.45,
      metalness: 0.4,
      side: THREE.DoubleSide,
    })
    const ribbonMesh = new THREE.Mesh(ribbonGeom, ribbonMat)
    ribbonMesh.position.set(0, -0.06, pageBlockDepth / 2 + 0.006)
    ribbonMesh.visible = false
    rootGroup.add(ribbonMesh)
    ribbonMeshRef.current = ribbonMesh

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

      // Smooth cover opening transition
      anim.openProgress = lerp(anim.openProgress, anim.targetOpenProgress, dt * 6.5)
      const openAmount = anim.openProgress

      // Front Cover rotation: 0 (closed) to -Math.PI + 0.05 (fully open)
      const hoverCrack = !isOpen && anim.isHovered ? -0.15 : 0
      const targetRotY = openAmount > 0.001
        ? (-Math.PI + 0.05) * openAmount
        : hoverCrack
      frontPivot.rotation.y = lerp(frontPivot.rotation.y, targetRotY, dt * 10)

      // Book position & rotation transition
      if (openAmount > 0.01) {
        // Center the 2-page spread when reading
        rootGroup.position.x = lerp(rootGroup.position.x, 0, dt * 6)
        rootGroup.position.y = lerp(rootGroup.position.y, 0, dt * 6)
        rootGroup.rotation.x = lerp(rootGroup.rotation.x, 0, dt * 6)
        rootGroup.rotation.y = lerp(rootGroup.rotation.y, 0, dt * 6)
        rootGroup.rotation.z = lerp(rootGroup.rotation.z, 0, dt * 6)

        leftPageMesh.visible = openAmount > 0.4
        rightPageMesh.visible = openAmount > 0.4
        ribbonMesh.visible = openAmount > 0.7
      } else {
        // Showcase floating in closed mode
        anim.ambientAngle += dt * 0.4
        const floatY = Math.sin(anim.ambientAngle * 1.5) * 0.04
        rootGroup.position.y = floatY
        leftPageMesh.visible = false
        rightPageMesh.visible = false
        ribbonMesh.visible = false
      }

      // Page flip animation with vertex curvature
      if (anim.flipDirection !== null) {
        const elapsed = (time - anim.flipStartTime) / 1000
        const progress = clamp(elapsed / anim.flipDuration, 0, 1)
        anim.flipProgress = progress

        // Rotation across 180 degrees
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

        // Front geometry flex
        const pFront = flexGeomFront.attributes.position
        for (let i = 0; i < pFront.count; i += 1) {
          const u = (pFront.getX(i) + (bookWidth - 0.02) / 2) / (bookWidth - 0.02)
          const yNorm = pFront.getY(i) / (bookHeight * 0.5)
          const zCurve = Math.sin(u * Math.PI) * arch + u * u * twist * yNorm
          pFront.setZ(i, zCurve)
        }
        pFront.needsUpdate = true
        flexGeomFront.computeVertexNormals()

        // Back geometry flex
        const pBack = flexGeomBack.attributes.position
        for (let i = 0; i < pBack.count; i += 1) {
          const u = (pBack.getX(i) + (bookWidth - 0.02) / 2) / (bookWidth - 0.02)
          const yNorm = pBack.getY(i) / (bookHeight * 0.5)
          const zCurve = -(Math.sin(u * Math.PI) * arch + u * u * twist * yNorm)
          pBack.setZ(i, zCurve)
        }
        pBack.needsUpdate = true
        flexGeomBack.computeVertexNormals()

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

    // Resize handler
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
  }, [generateCoverTexture, generateSpineTexture, generateBackCoverTexture, generateEndpaperTexture, getPageTexture, isOpen])

  // ==========================================
  // SYNC REACT STATE WITH 3D SCENE
  // ==========================================

  // Open / Close Book
  useEffect(() => {
    animStateRef.current.targetOpenProgress = isOpen ? 1 : 0
    if (controlsRef.current && cameraRef.current) {
      if (isOpen) {
        // Glide camera straight to reading position
        cameraRef.current.position.set(0, 0, 4.4)
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.enableRotate = false // Lock rotation in reading mode so text is steady
      } else {
        // Restore orbit controls in showcase mode
        cameraRef.current.position.set(0, 0.4, 5.8)
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.enableRotate = true
      }
    }
  }, [isOpen])

  // Sync Current Pages onto 3D Meshes
  useEffect(() => {
    if (!isOpen) return
    const leftTex = currentPage === 0
      ? generateEndpaperTexture()
      : getPageTexture(aiBookPages[currentPage - 1] || null, paperTheme)

    const rightTex = getPageTexture(aiBookPages[currentPage] || null, paperTheme)

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

    // Front of turning leaf: current right page
    const curRightTex = getPageTexture(aiBookPages[currentPage] || null, paperTheme)
    ;(frontLeafMesh.material as THREE.MeshStandardMaterial).map = curRightTex
    ;(frontLeafMesh.material as THREE.MeshStandardMaterial).needsUpdate = true

    // Back of turning leaf: next left page
    const nextLeftTex = getPageTexture(aiBookPages[currentPage + 1] || null, paperTheme)
    ;(backLeafMesh.material as THREE.MeshStandardMaterial).map = nextLeftTex
    ;(backLeafMesh.material as THREE.MeshStandardMaterial).needsUpdate = true

    // Underlying right page: next right page
    const nextRightTex = getPageTexture(aiBookPages[currentPage + 2] || null, paperTheme)
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

    // Underlying left page preview
    const prevLeftTex = currentPage - 2 === 0
      ? generateEndpaperTexture()
      : getPageTexture(aiBookPages[currentPage - 3] || null, paperTheme)
    ;(leftPageMesh.material as THREE.MeshStandardMaterial).map = prevLeftTex
    ;(leftPageMesh.material as THREE.MeshStandardMaterial).needsUpdate = true

    // Turning leaf back: current left page
    const curLeftTex = getPageTexture(aiBookPages[currentPage - 1] || null, paperTheme)
    ;(backLeafMesh.material as THREE.MeshStandardMaterial).map = curLeftTex
    ;(backLeafMesh.material as THREE.MeshStandardMaterial).needsUpdate = true

    // Turning leaf front: page before that
    const prevRightTex = getPageTexture(aiBookPages[currentPage - 2] || null, paperTheme)
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

  // Raycaster click on 3D book canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cameraRef.current || !canvasRef.current) return

    // If closed: click opens the 3D book
    if (!isOpen) {
      setIsOpen(true)
      playPageSound()
      return
    }

    // If open: clicking left side flips prev, right side flips next
    const rect = canvasRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const midX = rect.width / 2

    if (clickX > midX + 40) {
      flipNext()
    } else if (clickX < midX - 40) {
      flipPrev()
    }
  }

  // Hover detection for closed book
  const handlePointerMove = () => {
    if (!isOpen) {
      animStateRef.current.isHovered = true
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
        onClick={handleCanvasClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="block h-full w-full cursor-pointer touch-none"
      />

      {/* Luxury Ambient Top Floating Badge */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto rounded-full border border-[oklch(0.72_0.13_80_/_0.4)] bg-[#0a0d14]/85 px-3 py-1.5 backdrop-blur-md shadow-lg">
          <div className="h-2 w-2 rounded-full bg-[oklch(0.72_0.13_80)] animate-pulse" />
          <span className="font-mono text-[11px] font-semibold tracking-wider text-[oklch(0.72_0.13_80)]">
            {isOpen ? '3D MONOGRAF TERBUKA' : '3D INTERACTIVE SHOWCASE'}
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
            Geser untuk memutar 360° · Klik buku atau tombol untuk membuka langsung dalam 3D
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

          {/* Page Indicator & Close Button */}
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
              className="flex items-center gap-1.5 rounded-full border border-[oklch(0.72_0.13_80_/_0.4)] bg-[oklch(0.72_0.13_80_/_0.15)] px-4 py-2 text-xs font-semibold text-[oklch(0.72_0.13_80)] backdrop-blur-md hover:bg-[oklch(0.72_0.13_80_/_0.25)] active:scale-95 transition-all"
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
                // Find page for this section
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
