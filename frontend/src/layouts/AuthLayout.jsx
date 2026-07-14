import AppBackground from '../components/background/AppBackground'

const AuthLayout = ({ children }) => (
  <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
    <AppBackground variant="auth" />

    <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
      <div className="mb-6 flex items-center gap-2.5 animate-fade-in">
        <img src="/studyflow_logo.png" alt="StudyFlow" className="h-8 w-8 object-contain" />
        <span className="text-xl font-bold text-stone-800 tracking-tight">StudyFlow</span>
      </div>

      <main
        className="relative w-full bg-white rounded-[1.25rem] border border-stone-100 shadow-card-lg animate-slide-up"
        style={{ animationDelay: '0.05s' }}
      >
        <div className="absolute top-0 left-0 h-[3px] w-full rounded-t-[1.25rem] bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-300" />

        <div className="px-8 py-8 sm:px-10 sm:py-9">
          {children}
        </div>
      </main>

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
