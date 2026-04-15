import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function SignUpPage() {
  const registerOrg = useAuthStore((state) => state.registerOrg)
  const authError = useAuthStore((state) => state.error)
  const [organizationName, setOrganizationName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [formError, setFormError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    setSuccessMessage('')

    if (!organizationName || !email || !password) {
      setFormError('Please fill in all fields.')
      return
    }

    try {
      setLoading(true)
      const response = await registerOrg({ organizationName, email, password })
      setSuccessMessage(`Organization created successfully. Your Org ID is ${response.uniqueOrgId}. You can now sign in.`)
      setOrganizationName('')
      setEmail('')
      setPassword('')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to register organization')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <h1 className="text-3xl font-semibold">Create an Organization</h1>
        <p className="mt-3 text-sm text-slate-400">Register your company and first system designer account.</p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm text-slate-300">Organization name</span>
            <input
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-slate-500"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Admin email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-slate-500"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-slate-500"
            />
          </label>

          {(formError || authError || successMessage) && (
            <div className={`rounded-2xl border px-4 py-3 text-sm ${formError || authError ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-green-500/40 bg-green-500/10 text-green-100'}`}>
              {formError || authError || successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating org…' : 'Create organization'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold text-white underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
