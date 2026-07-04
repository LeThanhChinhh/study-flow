// Deep Focus Studio backdrop — v3.
// Single full-screen SVG (viewBox 0 0 1440 900) so nothing clips at edges.
// Timer safe zone: no bubble or node within 310 units of the halo center (720, 440).
// Decoration zones: A upper-left, B upper-right, C lower-left, D lower-right.
// Central halo uses rings and dot nodes only — no icons inside it.

const FocusDecor = () => (
  <div
    aria-hidden="true"
    className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0"
  >
    {/* Base background — slightly warmer ivory with soft lavender undertone */}
    <div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(148deg, #f8f6f1 0%, #f5f2f9 42%, #f3f6f4 100%)',
      }}
    />

    {/* Subtle dot-grid paper texture (very low opacity) */}
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle, #8b5cf6 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        opacity: 0.028,
      }}
    />

    {/* Full-screen SVG — single coordinate space */}
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Academic symbol library */}
        <symbol id="fd-timer" viewBox="0 0 24 24">
          <path d="M10 2h4"/>
          <path d="M12 14l4-4"/>
          <path d="M4.93 10A8 8 0 1 0 20 12"/>
        </symbol>
        <symbol id="fd-book" viewBox="0 0 24 24">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </symbol>
        <symbol id="fd-check" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"/>
        </symbol>
        <symbol id="fd-pencil" viewBox="0 0 24 24">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
        </symbol>
        <symbol id="fd-lightbulb" viewBox="0 0 24 24">
          <line x1="9" y1="18" x2="15" y2="18"/>
          <line x1="10" y1="22" x2="14" y2="22"/>
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
        </symbol>
        <symbol id="fd-calendar" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8"  y1="2" x2="8"  y2="6"/>
          <line x1="3"  y1="10" x2="21" y2="10"/>
        </symbol>
        <symbol id="fd-bookmark" viewBox="0 0 24 24">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </symbol>
        <symbol id="fd-list" viewBox="0 0 24 24">
          <line x1="8"  y1="6"  x2="21" y2="6"/>
          <line x1="8"  y1="12" x2="21" y2="12"/>
          <line x1="8"  y1="18" x2="21" y2="18"/>
          <line x1="3"  y1="6"  x2="3.01" y2="6"/>
          <line x1="3"  y1="12" x2="3.01" y2="12"/>
          <line x1="3"  y1="18" x2="3.01" y2="18"/>
        </symbol>

        {/* Soft radial halo behind the timer center */}
        <radialGradient id="timerHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.055"/>
          <stop offset="55%"  stopColor="#7c3aed" stopOpacity="0.02"/>
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Global micro starfield — scattered far from the timer center */}
      <g>
        <circle cx="128"  cy="148" r="1.5" fill="#7c3aed" opacity="0.12"/>
        <circle cx="320"  cy="72"  r="1"   fill="#6366f1" opacity="0.10"/>
        <circle cx="488"  cy="110" r="1.5" fill="#fb7185" opacity="0.09"/>
        <circle cx="1010" cy="88"  r="1.5" fill="#6366f1" opacity="0.10"/>
        <circle cx="1200" cy="52"  r="1"   fill="#7c3aed" opacity="0.11"/>
        <circle cx="1360" cy="130" r="1.5" fill="#fb7185" opacity="0.09"/>
        <circle cx="182"  cy="620" r="1.5" fill="#10b981" opacity="0.10"/>
        <circle cx="88"   cy="750" r="1"   fill="#7c3aed" opacity="0.09"/>
        <circle cx="1310" cy="580" r="1.5" fill="#fb7185" opacity="0.09"/>
        <circle cx="1402" cy="720" r="1"   fill="#f59e0b" opacity="0.10"/>
        <circle cx="620"  cy="820" r="1"   fill="#7c3aed" opacity="0.09"/>
        <circle cx="862"  cy="848" r="1.5" fill="#6366f1" opacity="0.09"/>
      </g>

      {/* ZONE A — Upper-left: planning orbit */}
      {/* All bubbles kept above y=380 and left of x=380 — well outside the timer safe zone */}
      <g>
        {/* Outer orbit ellipse — dashed violet */}
        <ellipse
          cx="188" cy="295" rx="248" ry="108"
          transform="rotate(-18 188 295)"
          fill="none" stroke="#7c3aed" strokeWidth="1"
          strokeDasharray="7 5" opacity="0.13"
        />
        {/* Inner orbit — solid indigo */}
        <ellipse
          cx="170" cy="272" rx="152" ry="62"
          transform="rotate(-22 170 272)"
          fill="none" stroke="#6366f1" strokeWidth="0.75"
          opacity="0.09"
        />

        {/* Dot nodes */}
        <circle cx="388" cy="218" r="2.5" fill="#7c3aed" opacity="0.19"/>
        <circle cx="312" cy="388" r="2"   fill="#7c3aed" opacity="0.15"/>
        <circle cx="38"  cy="338" r="2.5" fill="#6366f1" opacity="0.17"/>
        <circle cx="68"  cy="178" r="2"   fill="#6366f1" opacity="0.14"/>
        <circle cx="228" cy="138" r="2.5" fill="#7c3aed" opacity="0.17"/>

        {/* Bubble: Timer — top-right of orbit */}
        <g transform="translate(312 152)">
          <circle r="18" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1" opacity="0.68"/>
          <g stroke="#7c3aed" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.80">
            <use href="#fd-timer" x="-7.5" y="-7.5" width="15" height="15"/>
          </g>
        </g>

        {/* Bubble: Pencil — lower arc */}
        <g transform="translate(30 282)">
          <circle r="16" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1" opacity="0.60"/>
          <g stroke="#7c3aed" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.72">
            <use href="#fd-pencil" x="-6.5" y="-6.5" width="13" height="13"/>
          </g>
        </g>

        {/* 4-point sparkle */}
        <path
          transform="translate(382 348)"
          d="M0 -8 L2.2 -2.2 L8 0 L2.2 2.2 L0 8 L-2.2 2.2 L-8 0 L-2.2 -2.2 Z"
          fill="#a78bfa" opacity="0.30"
        />
        <path
          transform="translate(418 195)"
          d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z"
          fill="#a78bfa" opacity="0.22"
        />
      </g>

      {/* ZONE B — Upper-right: focused study corner */}
      {/* Bubbles above y=380, right of x=1060 — well outside safe zone */}
      <g>
        {/* Outer ring — dashed rose */}
        <circle cx="1305" cy="278" r="148"
          fill="none" stroke="#fb7185" strokeWidth="1"
          strokeDasharray="8 5" opacity="0.11"
        />
        {/* Inner ring */}
        <circle cx="1305" cy="278" r="96"
          fill="none" stroke="#f43f5e" strokeWidth="0.75"
          opacity="0.07"
        />

        {/* Dot nodes */}
        <circle cx="1305" cy="130" r="2.5" fill="#fb7185" opacity="0.18"/>
        <circle cx="1453" cy="278" r="2"   fill="#f43f5e" opacity="0.14"/>
        <circle cx="1305" cy="426" r="2"   fill="#fb7185" opacity="0.13"/>
        <circle cx="1157" cy="278" r="2"   fill="#f43f5e" opacity="0.12"/>

        {/* Bubble: Book — left of ring */}
        <g transform="translate(1154 278)">
          <circle r="17" fill="#fff1f2" stroke="#fb7185" strokeWidth="1" opacity="0.65"/>
          <g stroke="#f43f5e" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.76">
            <use href="#fd-book" x="-7" y="-7" width="14" height="14"/>
          </g>
        </g>

        {/* Bubble: Calendar — top of ring */}
        <g transform="translate(1305 128)">
          <circle r="16" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1" opacity="0.62"/>
          <g stroke="#7c3aed" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.74">
            <use href="#fd-calendar" x="-6.5" y="-6.5" width="13" height="13"/>
          </g>
        </g>

        {/* Sparkle */}
        <path
          transform="translate(1432 162)"
          d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z"
          fill="#fb7185" opacity="0.22"
        />
      </g>

      {/* ZONE E — Central timer halo: rings and tiny dots ONLY, no bubbles */}
      {/* Timer is approximately centered at (720, 440) on typical viewports */}
      {/* Safe exclusion: no bubble within 310 units of (720, 440) */}
      <g>
        {/* Soft radial glow under the timer */}
        <circle cx="720" cy="440" r="290" fill="url(#timerHalo)"/>

        {/* Thin concentric orbit rings */}
        <circle cx="720" cy="440" r="220"
          fill="none" stroke="#7c3aed" strokeWidth="0.8"
          strokeDasharray="5 7" opacity="0.09"
        />
        <circle cx="720" cy="440" r="172"
          fill="none" stroke="#6366f1" strokeWidth="0.7"
          opacity="0.06"
        />
        <circle cx="720" cy="440" r="260"
          fill="none" stroke="#fb7185" strokeWidth="0.65"
          strokeDasharray="3 8" opacity="0.06"
        />

        {/* Tiny dot nodes on the orbit rings — all at r ≥ 172 distance from center */}
        {/* These are small enough (r=2) that they don't visually crowd the timer */}
        <circle cx="720" cy="220" r="2"   fill="#7c3aed" opacity="0.14"/>
        <circle cx="940" cy="440" r="2"   fill="#7c3aed" opacity="0.12"/>
        <circle cx="720" cy="660" r="2"   fill="#6366f1" opacity="0.13"/>
        <circle cx="500" cy="440" r="2"   fill="#6366f1" opacity="0.11"/>
        <circle cx="875" cy="285" r="1.5" fill="#fb7185" opacity="0.10"/>
        <circle cx="875" cy="595" r="1.5" fill="#fb7185" opacity="0.10"/>
        <circle cx="563" cy="285" r="1.5" fill="#7c3aed" opacity="0.10"/>
        <circle cx="563" cy="595" r="1.5" fill="#7c3aed" opacity="0.09"/>
      </g>

      {/* ZONE C — Lower-left: streak / habit corner */}
      {/* Bubbles below y=620, left of x=390 */}
      <g>
        {/* Main path — amber */}
        <path
          d="M -15 748 C 92 718, 205 758, 318 728 C 420 700, 510 738, 605 718"
          fill="none" stroke="#f59e0b" strokeWidth="1.2"
          strokeLinecap="round" opacity="0.18"
        />
        {/* Secondary path — emerald */}
        <path
          d="M -15 768 C 105 742, 218 775, 335 755 C 440 732, 528 758, 622 742"
          fill="none" stroke="#10b981" strokeWidth="0.8"
          strokeLinecap="round" opacity="0.12"
        />

        {/* Dot nodes */}
        <circle cx="112" cy="730" r="2.5" fill="#f59e0b" opacity="0.24"/>
        <circle cx="318" cy="728" r="2"   fill="#f59e0b" opacity="0.18"/>
        <circle cx="518" cy="735" r="2.5" fill="#10b981" opacity="0.20"/>

        {/* Bubble: Book — lower left */}
        <g transform="translate(205 705)">
          <circle r="17" fill="#fffbeb" stroke="#f59e0b" strokeWidth="1" opacity="0.68"/>
          <g stroke="#d97706" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.76">
            <use href="#fd-book" x="-7" y="-7" width="14" height="14"/>
          </g>
        </g>

        {/* Bubble: Checklist — mid path */}
        <g transform="translate(418 692)">
          <circle r="16" fill="#ecfdf5" stroke="#10b981" strokeWidth="1" opacity="0.64"/>
          <g stroke="#059669" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.74">
            <use href="#fd-list" x="-6.5" y="-6.5" width="13" height="13"/>
          </g>
        </g>

        {/* Sparkle lower-left */}
        <path
          transform="translate(88 780)"
          d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z"
          fill="#f59e0b" opacity="0.24"
        />
      </g>

      {/* ZONE D — Lower-right: Active Recall trail */}
      {/* Bubbles below y=620, right of x=1030 */}
      <g>
        {/* Main recall path — violet */}
        <path
          d="M 878 808 C 985 772, 1098 788, 1218 760 C 1318 735, 1400 758, 1440 742"
          fill="none" stroke="#7c3aed" strokeWidth="1.2"
          strokeLinecap="round" opacity="0.15"
        />
        {/* Secondary path — rose */}
        <path
          d="M 895 828 C 1008 795, 1118 810, 1232 785 C 1332 762, 1408 782, 1440 768"
          fill="none" stroke="#fb7185" strokeWidth="0.8"
          strokeLinecap="round" opacity="0.09"
        />

        {/* Dot nodes */}
        <circle cx="955"  cy="795" r="2"   fill="#7c3aed" opacity="0.17"/>
        <circle cx="1135" cy="775" r="2.5" fill="#7c3aed" opacity="0.19"/>
        <circle cx="1338" cy="752" r="2"   fill="#fb7185" opacity="0.15"/>
        <circle cx="1432" cy="742" r="1.5" fill="#7c3aed" opacity="0.12"/>

        {/* Bubble: Lightbulb — recall entry */}
        <g transform="translate(1058 765)">
          <circle r="17" fill="#fff1f2" stroke="#fb7185" strokeWidth="1" opacity="0.65"/>
          <g stroke="#f43f5e" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.76">
            <use href="#fd-lightbulb" x="-7" y="-7" width="14" height="14"/>
          </g>
        </g>

        {/* Bubble: Bookmark — mid trail */}
        <g transform="translate(1258 752)">
          <circle r="15" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1" opacity="0.62"/>
          <g stroke="#6d28d9" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.72">
            <use href="#fd-bookmark" x="-6" y="-6" width="12" height="12"/>
          </g>
        </g>

        {/* Check bubble near end of trail */}
        <g transform="translate(1408 758)">
          <circle r="14" fill="#ecfdf5" stroke="#10b981" strokeWidth="1" opacity="0.58"/>
          <g stroke="#059669" strokeWidth="2" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.70">
            <use href="#fd-check" x="-5.5" y="-5.5" width="11" height="11"/>
          </g>
        </g>

        {/* Sparkle near trail start */}
        <path
          transform="translate(910 760)"
          d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z"
          fill="#7c3aed" opacity="0.22"
        />
        <path
          transform="translate(1188 825)"
          d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z"
          fill="#fb7185" opacity="0.18"
        />
      </g>

      {/* Extra scattered mid-area sparkles to fill empty space */}
      {/* Upper middle-left — between zone A and the timer */}
      <g>
        <path
          transform="translate(462 248)"
          d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z"
          fill="#a78bfa" opacity="0.20"
        />
        <circle cx="518" cy="195" r="1.5" fill="#7c3aed" opacity="0.10"/>
        <circle cx="392" cy="512" r="1.5" fill="#6366f1" opacity="0.10"/>
      </g>

      {/* Upper middle-right — between zone B and the timer */}
      <g>
        <path
          transform="translate(968 252)"
          d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z"
          fill="#fb7185" opacity="0.18"
        />
        <circle cx="1045" cy="185" r="1.5" fill="#fb7185" opacity="0.09"/>
        <circle cx="1055" cy="512" r="1.5" fill="#7c3aed" opacity="0.09"/>
      </g>

      {/* Faint dashed guide: left panel → timer area (very subtle) */}
      <path
        d="M 345 440 C 430 435, 490 440, 500 440"
        fill="none" stroke="#7c3aed" strokeWidth="0.5"
        strokeDasharray="3 8" strokeLinecap="round" opacity="0.06"
      />
      {/* Faint dashed guide: timer area → right panel */}
      <path
        d="M 940 440 C 965 440, 1010 440, 1095 440"
        fill="none" stroke="#7c3aed" strokeWidth="0.5"
        strokeDasharray="3 8" strokeLinecap="round" opacity="0.06"
      />
    </svg>
  </div>
)

export default FocusDecor
