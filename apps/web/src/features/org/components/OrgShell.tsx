import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'

export default function OrgShell() {
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin')
  }

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.16),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,1))]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">System Designer</p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Organization control center</h1>
            <p className="mt-1 text-sm text-slate-300">
              {user.email} · Org {user.organizationId}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-slate-900/80 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/40 hover:bg-slate-800"
          >
            Sign out
          </button>
        </header>

        <main className="flex-1 pt-4 sm:pt-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}