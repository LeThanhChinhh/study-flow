import StudyIcon from '../StudyIcon'
import './app-background.css'

const BACKGROUND_NODES = {
  dashboard: [
    { icon: 'file-text', x: 7, y: 17, size: 42, tone: 'violet', emphasis: 'primary', rotate: -8 },
    { icon: 'calendar', x: 89, y: 18, size: 44, tone: 'indigo', emphasis: 'primary', rotate: 5 },
    { icon: 'timer', x: 93, y: 57, size: 40, tone: 'rose', emphasis: 'primary', rotate: 8 },
    { icon: 'target', x: 8, y: 72, size: 38, tone: 'emerald', emphasis: 'primary', rotate: -5 },
    { icon: 'layers', x: 18, y: 43, size: 29, tone: 'violet', emphasis: 'secondary', rotate: 7 },
    { icon: 'flame', x: 31, y: 10, size: 27, tone: 'amber', emphasis: 'secondary', rotate: -7 },
    { icon: 'check-circle', x: 83, y: 42, size: 29, tone: 'emerald', emphasis: 'secondary', rotate: -6 },
    { icon: 'lightbulb', x: 73, y: 83, size: 31, tone: 'amber', emphasis: 'secondary', rotate: 5 },
    { icon: 'bar-chart', x: 43, y: 91, size: 27, tone: 'indigo', emphasis: 'secondary', rotate: -4 },
    { icon: 'trophy', x: 66, y: 9, size: 26, tone: 'rose', emphasis: 'secondary', rotate: 7 },
  ],
  planning: [
    { icon: 'file-text', x: 7, y: 19, size: 46, tone: 'violet', emphasis: 'primary', rotate: -7 },
    { icon: 'layers', x: 91, y: 24, size: 43, tone: 'indigo', emphasis: 'primary', rotate: 6 },
    { icon: 'target', x: 8, y: 72, size: 39, tone: 'rose', emphasis: 'primary', rotate: -4 },
    { icon: 'calendar', x: 92, y: 69, size: 40, tone: 'emerald', emphasis: 'primary', rotate: 7 },
    { icon: 'upload', x: 25, y: 10, size: 28, tone: 'indigo', emphasis: 'secondary', rotate: -6 },
    { icon: 'lightbulb', x: 78, y: 10, size: 29, tone: 'amber', emphasis: 'secondary', rotate: 5 },
    { icon: 'check-circle', x: 76, y: 86, size: 28, tone: 'emerald', emphasis: 'secondary', rotate: -5 },
    { icon: 'timer', x: 26, y: 88, size: 28, tone: 'rose', emphasis: 'secondary', rotate: 5 },
  ],
  calendar: [
    { icon: 'calendar', x: 6, y: 20, size: 46, tone: 'violet', emphasis: 'primary', rotate: -6 },
    { icon: 'clock', x: 93, y: 19, size: 42, tone: 'indigo', emphasis: 'primary', rotate: 6 },
    { icon: 'check-circle', x: 92, y: 73, size: 39, tone: 'emerald', emphasis: 'primary', rotate: -5 },
    { icon: 'target', x: 7, y: 76, size: 38, tone: 'rose', emphasis: 'primary', rotate: 5 },
    { icon: 'layers', x: 19, y: 44, size: 28, tone: 'violet', emphasis: 'secondary', rotate: 7 },
    { icon: 'plus', x: 82, y: 43, size: 27, tone: 'indigo', emphasis: 'secondary', rotate: -6 },
    { icon: 'timer', x: 24, y: 91, size: 27, tone: 'amber', emphasis: 'secondary', rotate: -4 },
    { icon: 'check', x: 75, y: 90, size: 26, tone: 'emerald', emphasis: 'secondary', rotate: 6 },
  ],
  focus: [
    { icon: 'timer', x: 7, y: 22, size: 47, tone: 'rose', emphasis: 'primary', rotate: -6 },
    { icon: 'book-open', x: 92, y: 21, size: 43, tone: 'violet', emphasis: 'primary', rotate: 6 },
    { icon: 'target', x: 8, y: 75, size: 39, tone: 'indigo', emphasis: 'primary', rotate: 5 },
    { icon: 'lightbulb', x: 91, y: 74, size: 40, tone: 'amber', emphasis: 'primary', rotate: -5 },
    { icon: 'coffee', x: 22, y: 47, size: 28, tone: 'amber', emphasis: 'secondary', rotate: 7 },
    { icon: 'check-circle', x: 80, y: 46, size: 28, tone: 'emerald', emphasis: 'secondary', rotate: -7 },
    { icon: 'trophy', x: 73, y: 90, size: 28, tone: 'rose', emphasis: 'secondary', rotate: 5 },
    { icon: 'flame', x: 28, y: 91, size: 27, tone: 'violet', emphasis: 'secondary', rotate: -5 },
  ],
  auth: [
    { icon: 'book-open', x: 12, y: 20, size: 45, tone: 'violet', emphasis: 'primary', rotate: -7 },
    { icon: 'layers', x: 88, y: 22, size: 42, tone: 'indigo', emphasis: 'primary', rotate: 6 },
    { icon: 'target', x: 10, y: 78, size: 38, tone: 'rose', emphasis: 'primary', rotate: 6 },
    { icon: 'calendar', x: 89, y: 76, size: 40, tone: 'emerald', emphasis: 'primary', rotate: -6 },
    { icon: 'lightbulb', x: 24, y: 48, size: 27, tone: 'amber', emphasis: 'secondary', rotate: -5 },
    { icon: 'timer', x: 77, y: 48, size: 27, tone: 'rose', emphasis: 'secondary', rotate: 5 },
  ],
}

const FlowMap = ({ variant }) => (
  <svg
    className="app-background__flow-map"
    viewBox="0 0 1440 900"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <pattern id={`studyflow-dots-${variant}`} width="34" height="34" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.15" className="app-background__pattern-dot" />
      </pattern>
      <linearGradient id={`studyflow-path-${variant}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
        <stop offset="48%" stopColor="currentColor" stopOpacity="0.22" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
      </linearGradient>
    </defs>

    <rect width="1440" height="900" fill={`url(#studyflow-dots-${variant})`} opacity="0.5" />

    <g className="app-background__flow-lines">
      <path d="M-130 250 C130 40 360 70 540 230 S920 410 1120 170 S1420 20 1560 150" />
      <path d="M-100 720 C170 540 350 585 520 710 S895 890 1100 690 S1390 520 1550 640" />
      <path d="M160 -120 C250 135 210 310 80 450 S-20 760 190 970" />
      <path d="M1260 -120 C1165 120 1210 315 1365 455 S1475 760 1260 990" />
    </g>

    <g className="app-background__flow-line app-background__flow-line--accent">
      <path
        d="M70 650 C225 535 350 580 485 510 C625 438 700 300 860 305 C1015 308 1080 470 1210 430 C1300 402 1360 330 1430 272"
        fill="none"
        stroke={`url(#studyflow-path-${variant})`}
      />
    </g>

    <g className="app-background__micro-marks">
      <circle cx="154" cy="164" r="3" />
      <circle cx="245" cy="84" r="2" />
      <circle cx="398" cy="132" r="2.5" />
      <circle cx="622" cy="78" r="2" />
      <circle cx="817" cy="112" r="2.5" />
      <circle cx="1040" cy="70" r="2" />
      <circle cx="1250" cy="128" r="3" />
      <circle cx="1338" cy="286" r="2" />
      <circle cx="118" cy="510" r="2.5" />
      <circle cx="275" cy="806" r="2" />
      <circle cx="522" cy="850" r="3" />
      <circle cx="810" cy="822" r="2" />
      <circle cx="1126" cy="846" r="2.5" />
      <circle cx="1324" cy="720" r="2" />
    </g>

    <g className="app-background__study-loop" transform="translate(544 790)">
      <circle cx="0" cy="0" r="4" />
      <path d="M10 0 H74" />
      <circle cx="86" cy="0" r="4" />
      <path d="M96 0 H160" />
      <circle cx="172" cy="0" r="4" />
      <path d="M182 0 H246" />
      <circle cx="258" cy="0" r="4" />
      <path d="M268 0 H332" />
      <circle cx="344" cy="0" r="4" />
    </g>
  </svg>
)

const DetailCluster = ({ side }) => (
  <div className={`app-background__detail-cluster app-background__detail-cluster--${side}`}>
    <span className="app-background__detail-dot app-background__detail-dot--large" />
    <span className="app-background__detail-line" />
    <span className="app-background__detail-dot" />
    <span className="app-background__detail-line app-background__detail-line--short" />
    <span className="app-background__detail-dot app-background__detail-dot--small" />
  </div>
)

const MiniCalendar = () => (
  <div className="app-background__mini-calendar">
    <div className="app-background__mini-calendar-head">
      <span />
      <span />
    </div>
    <div className="app-background__mini-calendar-grid">
      {Array.from({ length: 12 }, (_, index) => (
        <span key={index} className={index === 5 || index === 9 ? 'is-active' : ''} />
      ))}
    </div>
  </div>
)

const PlanningStack = () => (
  <div className="app-background__planning-stack">
    <span />
    <span />
    <span />
    <span />
  </div>
)

const AppBackground = ({ variant = 'dashboard', className = '' }) => {
  const safeVariant = BACKGROUND_NODES[variant] ? variant : 'dashboard'
  const nodes = BACKGROUND_NODES[safeVariant]

  return (
    <div
      className={`app-background app-background--${safeVariant} ${className}`}
      aria-hidden="true"
    >
      <div className="app-background__base" />
      <FlowMap variant={safeVariant} />

      <div className="app-background__edge-label app-background__edge-label--left">
        <span>STUDY</span><i />
      </div>
      <div className="app-background__edge-label app-background__edge-label--right">
        <i /><span>FLOW</span>
      </div>

      <DetailCluster side="top-left" />
      <DetailCluster side="bottom-right" />
      <MiniCalendar />
      <PlanningStack />

      {nodes.map((node, index) => (
        <div
          key={`${safeVariant}-${node.icon}-${index}`}
          className={`app-background__icon-node app-background__icon-node--${node.tone} app-background__icon-node--${node.emphasis}`}
          style={{
            '--node-x': `${node.x}%`,
            '--node-y': `${node.y}%`,
            '--node-size': `${node.size}px`,
            '--node-rotate': `${node.rotate}deg`,
          }}
        >
          <span className="app-background__icon-ring" />
          <span className="app-background__icon-shell">
            <StudyIcon name={node.icon} size={Math.round(node.size * 0.42)} strokeWidth={1.55} />
          </span>
          <span className="app-background__node-pin app-background__node-pin--one" />
          <span className="app-background__node-pin app-background__node-pin--two" />
        </div>
      ))}
    </div>
  )
}

export default AppBackground
