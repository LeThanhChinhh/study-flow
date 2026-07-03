import StudyIcon from '../components/StudyIcon'

/* 
   BACKGROUND DECORATION (Study Constellation)
    */
const StudyOrbitDecor = () => (
  <div
    className="fixed inset-0 pointer-events-none select-none overflow-hidden bg-[#faf9f7]"
    aria-hidden="true"
  >

    {/*  Orbital Flow Line (Large swooping curve)  */}
    <svg
      className="absolute top-0 left-0 w-full h-full text-violet-200"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
      fill="none"
    >
      <path
        d="M -10,110 C 30,70 60,30 110,-10"
        stroke="currentColor"
        strokeWidth="0.2"
        opacity="0.6"
        strokeDasharray="2 2"
      />
      <path
        d="M -10,80 C 40,90 80,40 110,10"
        stroke="currentColor"
        strokeWidth="0.1"
        opacity="0.4"
      />
    </svg>

    {/*  Node on the orbital line  */}
    <div
      className="absolute left-[30%] top-[45%] w-2 h-2 rounded-full bg-violet-300 opacity-50 animate-pulse-soft"
    />
    <div
      className="absolute right-[25%] top-[25%] w-1.5 h-1.5 rounded-full bg-amber-300 opacity-60 animate-pulse-soft"
      style={{ animationDelay: '1s' }}
    />

    {/*  Twinkling Sparkles (Stars)  */}
    <svg
      className="absolute top-24 left-24 text-amber-400 animate-twinkle"
      width="16" height="16" viewBox="0 0 24 24" fill="none"
    >
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" opacity="0.3" />
    </svg>
    <svg
      className="absolute bottom-40 right-32 text-violet-400 animate-twinkle"
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      style={{ animationDelay: '1.5s' }}
    >
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" opacity="0.4" />
    </svg>
    <svg
      className="absolute top-1/3 right-[15%] text-emerald-400 animate-twinkle"
      width="10" height="10" viewBox="0 0 24 24" fill="none"
      style={{ animationDelay: '3s' }}
    >
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" opacity="0.3" />
    </svg>

    {/*  Line-art Learning Glyphs (Drifting)  */}
    {/* Open Book */}
    <div className="absolute top-[20%] left-[15%] text-stone-300 opacity-40 animate-drift">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    </div>
    
    {/* Flashcards / Notes */}
    <div className="absolute bottom-[20%] left-[25%] text-stone-300 opacity-40 animate-drift" style={{ animationDelay: '2s' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="-rotate-12">
        <rect x="3" y="3" width="14" height="14" rx="2" ry="2" />
        <path d="M7 21h14a2 2 0 0 0 2-2V7" />
      </svg>
    </div>

    {/* Target / Focus */}
    <div className="absolute bottom-[30%] right-[20%] text-stone-300 opacity-30 animate-drift" style={{ animationDelay: '4s' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="rotate-12">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    </div>

    {/*  Dot Grid Patch  */}
    <svg
      className="absolute top-1/4 right-1/4 text-stone-300 opacity-20"
      width="60" height="60"
      viewBox="0 0 60 60"
    >
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={col * 15 + 7.5}
            cy={row * 15 + 7.5}
            r="1"
            fill="currentColor"
          />
        ))
      )}
    </svg>
  </div>
)

/* 
   AUTH LAYOUT WRAPPER
    */
const AuthLayout = ({ children }) => (
  <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
    <StudyOrbitDecor />

    {/* Foreground Container */}
    <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
      
      {/*  Logo directly above card  */}
      <div className="mb-6 flex items-center gap-2.5 animate-fade-in">
        <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm">
          <StudyIcon name="layers" size={16} className="text-white" />
        </div>
        <span className="text-xl font-bold text-stone-800 tracking-tight">StudyFlow</span>
      </div>

      {/*  The Auth Card  */}
      <main
        className="relative w-full bg-white rounded-[1.25rem] border border-stone-100 shadow-card-lg animate-slide-up"
        style={{ animationDelay: '0.05s' }}
      >
        {/* Very subtle top accent line */}
        <div className="absolute top-0 left-0 h-[3px] w-full rounded-t-[1.25rem] bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-300" />
        
        <div className="px-8 py-8 sm:px-10 sm:py-9">
          {children}
        </div>
      </main>

      {/*  Subtle Footer Tagline  */}
      <footer
        className="mt-8 text-[13px] text-stone-400 font-medium animate-fade-in tracking-wide"
        style={{ animationDelay: '0.2s' }}
      >
        Your personal learning desk — study smarter, not harder.
      </footer>
    </div>
  </div>
)

export default AuthLayout
