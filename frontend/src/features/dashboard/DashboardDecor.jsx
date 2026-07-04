export const StudyOrbitBackdrop = () => (
  <div
    aria-hidden="true"
    className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0"
  >
    {/* Warm ivory → soft lavender mist → pale mint gradient */}
    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(140deg, #f9f7f3 0%, #f5f3f9 48%, #f3f6f5 100%)' }}
    />

    {/* Main full-screen SVG for definitions and scattered micro-dots */}
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <symbol id="sf-book" viewBox="0 0 24 24">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </symbol>
        <symbol id="sf-pencil" viewBox="0 0 24 24">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
        </symbol>
        <symbol id="sf-timer" viewBox="0 0 24 24">
          <path d="M10 2h4"/>
          <path d="M12 14l4-4"/>
          <path d="M4.93 10A8 8 0 1 0 20 12"/>
        </symbol>
        <symbol id="sf-play" viewBox="0 0 24 24">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </symbol>
        <symbol id="sf-flame" viewBox="0 0 24 24">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </symbol>
        <symbol id="sf-check" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"/>
        </symbol>
        <symbol id="sf-calendar" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </symbol>
        <symbol id="sf-bookmark" viewBox="0 0 24 24">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </symbol>
        <symbol id="sf-lightbulb" viewBox="0 0 24 24">
          <line x1="9" y1="18" x2="15" y2="18"/>
          <line x1="10" y1="22" x2="14" y2="22"/>
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
        </symbol>
      </defs>

      {/* Scattered micro-dots (subtle starfield depth) */}
      <g>
        <circle cx="520"  cy="88"  r="1.5" fill="#7c3aed" opacity="0.13"/>
        <circle cx="680"  cy="145" r="1"   fill="#6366f1" opacity="0.11"/>
        <circle cx="820"  cy="55"  r="1.5" fill="#fb7185" opacity="0.11"/>
        <circle cx="975"  cy="118" r="1"   fill="#7c3aed" opacity="0.10"/>
        <circle cx="1105" cy="62"  r="1.5" fill="#6366f1" opacity="0.12"/>
        <circle cx="752"  cy="192" r="1"   fill="#f59e0b" opacity="0.12"/>
        <circle cx="605"  cy="720" r="1.5" fill="#10b981" opacity="0.12"/>
        <circle cx="755"  cy="792" r="1"   fill="#7c3aed" opacity="0.11"/>
        <circle cx="840"  cy="665" r="1.5" fill="#fb7185" opacity="0.10"/>
        <circle cx="698"  cy="862" r="1"   fill="#f59e0b" opacity="0.11"/>
      </g>
    </svg>

    {/* ZONE A — Planning Orbit (top-left) */}
    <svg
      className="absolute top-0 left-0 w-[450px] h-[350px]"
      viewBox="0 0 450 350"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        {/* Outer orbit — dashed violet */}
        <ellipse
          cx="185" cy="192" rx="248" ry="118"
          transform="rotate(-16 185 192)"
          fill="none" stroke="#7c3aed" strokeWidth="1"
          strokeDasharray="7 5" opacity="0.15"
        />
        {/* Inner orbit — solid indigo */}
        <ellipse
          cx="168" cy="172" rx="152" ry="66"
          transform="rotate(-22 168 172)"
          fill="none" stroke="#6366f1" strokeWidth="0.8"
          opacity="0.11"
        />
        {/* Dot nodes along orbits */}
        <circle cx="378" cy="138" r="2.5" fill="#7c3aed" opacity="0.22"/>
        <circle cx="308" cy="272" r="2"   fill="#7c3aed" opacity="0.18"/>
        <circle cx="42"  cy="228" r="2.5" fill="#6366f1" opacity="0.20"/>
        <circle cx="78"  cy="108" r="2"   fill="#6366f1" opacity="0.16"/>
        <circle cx="222" cy="55"  r="2.5" fill="#7c3aed" opacity="0.19"/>

        {/* Bubble: Open Book — top arc of outer orbit */}
        <g transform="translate(298 82)">
          <circle r="17" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1" opacity="0.68"/>
          <g stroke="#7c3aed" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.80">
            <use href="#sf-book" x="-7" y="-7" width="14" height="14"/>
          </g>
        </g>

        {/* Bubble: Pencil — left arc */}
        <g transform="translate(30 197)">
          <circle r="15.5" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1" opacity="0.62"/>
          <g stroke="#7c3aed" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.76">
            <use href="#sf-pencil" x="-6" y="-6" width="12" height="12"/>
          </g>
        </g>

        {/* 4-pointed sparkle — orbit accent */}
        <path
          transform="translate(358 252)"
          d="M0 -8 L2.2 -2.2 L8 0 L2.2 2.2 L0 8 L-2.2 2.2 L-8 0 L-2.2 -2.2 Z"
          fill="#a78bfa" opacity="0.36"
        />
        {/* Smaller sparkle */}
        <path
          transform="translate(392 110)"
          d="M0 -5.5 L1.5 -1.5 L5.5 0 L1.5 1.5 L0 5.5 L-1.5 1.5 L-5.5 0 L-1.5 -1.5 Z"
          fill="#a78bfa" opacity="0.26"
        />
      </g>
    </svg>

    {/* ZONE B — Focus Ring (right-middle) */}
    <svg
      className="absolute top-[20%] right-0 w-[350px] h-[320px]"
      viewBox="1100 200 350 320"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        {/* Outer ring — dashed rose */}
        <circle cx="1292" cy="368" r="128"
          fill="none" stroke="#fb7185" strokeWidth="1"
          strokeDasharray="8 5" opacity="0.14"
        />
        {/* Middle ring — solid faint */}
        <circle cx="1292" cy="368" r="82"
          fill="none" stroke="#f43f5e" strokeWidth="0.75"
          opacity="0.10"
        />
        {/* Inner ring — dashed small */}
        <circle cx="1292" cy="368" r="37"
          fill="none" stroke="#fb7185" strokeWidth="0.75"
          strokeDasharray="3 3" opacity="0.13"
        />
        {/* Ring dot nodes */}
        <circle cx="1292" cy="240" r="3"   fill="#fb7185" opacity="0.26"/>
        <circle cx="1420" cy="368" r="2.5" fill="#f43f5e" opacity="0.20"/>
        <circle cx="1292" cy="496" r="2.5" fill="#fb7185" opacity="0.18"/>
        <circle cx="1164" cy="368" r="2"   fill="#f43f5e" opacity="0.15"/>
        <circle cx="1384" cy="278" r="2"   fill="#fb7185" opacity="0.17"/>
        <circle cx="1200" cy="278" r="2"   fill="#f43f5e" opacity="0.15"/>

        {/* Bubble: Timer — top of outer ring */}
        <g transform="translate(1292 237)">
          <circle r="17" fill="#fff1f2" stroke="#fb7185" strokeWidth="1" opacity="0.72"/>
          <g stroke="#f43f5e" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.80">
            <use href="#sf-timer" x="-7" y="-7" width="14" height="14"/>
          </g>
        </g>

        {/* Bubble: Play — rightmost of outer ring */}
        <g transform="translate(1425 368)">
          <circle r="15" fill="#fff1f2" stroke="#fb7185" strokeWidth="1" opacity="0.68"/>
          <g stroke="#f43f5e" strokeWidth="2" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.78">
            <use href="#sf-play" x="-6" y="-6" width="12" height="12"/>
          </g>
        </g>
      </g>
    </svg>

    {/* ZONE C — Streak Path (lower-left) */}
    <svg
      className="absolute bottom-0 left-0 w-[680px] h-[130px]"
      viewBox="-20 750 680 130"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        {/* Main streak path — amber */}
        <path
          d="M -15 838 C 78 802, 192 848, 315 810 C 428 775, 535 822, 640 802"
          fill="none" stroke="#f59e0b" strokeWidth="1.2"
          strokeLinecap="round" opacity="0.20"
        />
        {/* Secondary path — emerald */}
        <path
          d="M -15 860 C 98 832, 215 865, 338 845 C 450 825, 558 852, 658 838"
          fill="none" stroke="#10b981" strokeWidth="0.8"
          strokeLinecap="round" opacity="0.14"
        />
        {/* Dot nodes */}
        <circle cx="108" cy="825" r="2.5" fill="#f59e0b" opacity="0.26"/>
        <circle cx="308" cy="815" r="2"   fill="#f59e0b" opacity="0.20"/>
        <circle cx="520" cy="825" r="2.5" fill="#10b981" opacity="0.24"/>
        <circle cx="635" cy="804" r="2"   fill="#10b981" opacity="0.18"/>

        {/* Bubble: Flame */}
        <g transform="translate(188 812)">
          <circle r="16" fill="#fffbeb" stroke="#f59e0b" strokeWidth="1" opacity="0.70"/>
          <g stroke="#d97706" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.78">
            <use href="#sf-flame" x="-6.5" y="-6.5" width="13" height="13"/>
          </g>
        </g>

        {/* Bubble: Check */}
        <g transform="translate(420 782)">
          <circle r="15" fill="#ecfdf5" stroke="#10b981" strokeWidth="1" opacity="0.66"/>
          <g stroke="#059669" strokeWidth="2" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.78">
            <use href="#sf-check" x="-6" y="-6" width="12" height="12"/>
          </g>
        </g>
      </g>
    </svg>

    {/* ZONE D — Recall Trail (lower-right) */}
    <svg
      className="absolute bottom-0 right-0 w-[620px] h-[90px]"
      viewBox="840 810 620 90"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        {/* Main recall path — violet */}
        <path
          d="M 852 892 C 968 858, 1082 875, 1205 848 C 1305 824, 1385 850, 1458 835"
          fill="none" stroke="#7c3aed" strokeWidth="1.2"
          strokeLinecap="round" opacity="0.16"
        />
        {/* Secondary path — mint */}
        <path
          d="M 875 875 C 998 848, 1112 862, 1228 838 C 1328 818, 1400 842, 1458 828"
          fill="none" stroke="#10b981" strokeWidth="0.75"
          strokeLinecap="round" opacity="0.12"
        />
        {/* Dot nodes */}
        <circle cx="932"  cy="880" r="2"   fill="#7c3aed" opacity="0.18"/>
        <circle cx="1115" cy="862" r="2.5" fill="#7c3aed" opacity="0.22"/>
        <circle cx="1322" cy="840" r="2"   fill="#10b981" opacity="0.19"/>
        <circle cx="1448" cy="832" r="2"   fill="#7c3aed" opacity="0.15"/>

        {/* Bubble: Calendar */}
        <g transform="translate(1042 855)">
          <circle r="16" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1" opacity="0.66"/>
          <g stroke="#6d28d9" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.76">
            <use href="#sf-calendar" x="-7" y="-7" width="14" height="14"/>
          </g>
        </g>

        {/* Bubble: Bookmark */}
        <g transform="translate(1238 842)">
          <circle r="15" fill="#f0fdf4" stroke="#10b981" strokeWidth="1" opacity="0.62"/>
          <g stroke="#059669" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.76">
            <use href="#sf-bookmark" x="-6" y="-6" width="12" height="12"/>
          </g>
        </g>

        {/* Bubble: Lightbulb (study recall) */}
        <g transform="translate(1392 836)">
          <circle r="15" fill="#fff1f2" stroke="#fb7185" strokeWidth="1" opacity="0.62"/>
          <g stroke="#f43f5e" strokeWidth="1.8" fill="none"
             strokeLinecap="round" strokeLinejoin="round" opacity="0.75">
            <use href="#sf-lightbulb" x="-6" y="-6" width="12" height="12"/>
          </g>
        </g>

        {/* Small sparkle near zone entry */}
        <path
          transform="translate(890 851)"
          d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z"
          fill="#7c3aed" opacity="0.26"
        />
      </g>
    </svg>
  </div>
)
