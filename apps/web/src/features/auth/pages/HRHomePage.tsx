import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function HRHomePage() {
  const { user, signOut } = useAuthStore((state) => ({ user: state.user, signOut: state.signOut }))
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">HR</p>
            <h1 className="mt-4 text-4xl font-semibold">Welcome back, {user?.email}</h1>
            <p className="mt-3 text-slate-300">View onboarding progress and employee status across your organization.</p>
          </div>
          <button onClick={handleSignOut} className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700">
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
