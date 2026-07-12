import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  CloudUpload,
  Coffee,
  Eye,
  EyeOff,
  FastForward,
  FileText,
  Flame,
  Info,
  Layers3,
  Lightbulb,
  LoaderCircle,
  LogOut,
  Menu,
  MoonStar,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Square,
  SunMedium,
  Target,
  Timer,
  Trash2,
  Trophy,
  UserRound,
  X,
  Zap,
} from 'lucide-react'

/**
 * Central icon registry for StudyFlow.
 *
 * Keeping the existing string API avoids touching business components while
 * moving the product to a consistent Lucide visual language.
 */
const ICONS = {
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'arrow-right': ArrowRight,
  'bar-chart': BarChart3,
  'book-open': BookOpen,
  bookmark: Bookmark,
  calendar: CalendarDays,
  check: Check,
  'check-circle': CheckCircle2,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  circle: Circle,
  clock: Clock3,
  coffee: Coffee,
  'eye-off': EyeOff,
  eye: Eye,
  'fast-forward': FastForward,
  'file-text': FileText,
  flame: Flame,
  info: Info,
  layers: Layers3,
  lightbulb: Lightbulb,
  loader: LoaderCircle,
  'log-out': LogOut,
  menu: Menu,
  moon: MoonStar,
  pause: Pause,
  pencil: Pencil,
  play: Play,
  plus: Plus,
  'refresh-cw': RefreshCw,
  square: Square,
  sun: SunMedium,
  target: Target,
  timer: Timer,
  trash: Trash2,
  'trash-2': Trash2,
  trophy: Trophy,
  upload: CloudUpload,
  user: UserRound,
  x: X,
  zap: Zap,
}

/**
 * @param {string} name - Icon key from ICONS.
 * @param {number} size - Width and height in pixels.
 * @param {number} strokeWidth - Lucide stroke width.
 * @param {string} className - Tailwind/CSS classes.
 */
const StudyIcon = ({
  name,
  size = 20,
  strokeWidth = 1.8,
  className = '',
  ...rest
}) => {
  const Icon = ICONS[name]

  if (!Icon) {
    if (import.meta.env.DEV) {
      console.warn(
        `[StudyIcon] Icon "${name}" not found. Available: ${Object.keys(ICONS).join(', ')}`,
      )
    }
    return null
  }

  return (
    <Icon
      aria-hidden="true"
      focusable="false"
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      {...rest}
    />
  )
}

/**
 * Soft icon badge used across section headers and compact stat cards.
 */
export const IconBadge = ({
  name,
  size = 18,
  bg = 'bg-violet-100',
  icon = 'text-violet-600',
  badgeSize = 'w-10 h-10',
  radius = 'rounded-xl',
  className = '',
}) => (
  <div
    className={`inline-flex items-center justify-center shrink-0 ${badgeSize} ${radius} ${bg} ${className}`}
  >
    <StudyIcon name={name} size={size} className={icon} />
  </div>
)

export default StudyIcon
