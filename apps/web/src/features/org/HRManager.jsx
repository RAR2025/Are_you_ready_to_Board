import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchWithAuth } from '@/lib/api'

const initialForm = {
  name: '',
  email: '',
}

export default function HRManager() {
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formState, setFormState] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [deletingIds, setDeletingIds] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const loadManagers = useCallback(async () => {
    setLoading(true)

    try {
      const response = await fetchWithAuth('/api/org/hr')
      const payload = await response.json()

      setManagers(payload.managers ?? [])
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load HR managers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadManagers()
  }, [loadManagers])

  async function handleCreateManager(event) {
    event.preventDefault()

    if (!formState.name.trim() || !formState.email.trim()) {
      setErrorMessage('Name and email are required')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetchWithAuth('/api/org/hr', {
        method: 'POST',
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim(),
        }),
      })

      const payload = await response.json()

      setManagers((current) => [payload.manager, ...current])
      setFormState(initialForm)
      setIsModalOpen(false)
      setErrorMessage(null)
      setSuccessMessage('HR manager added. Firebase reset email sent.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to add HR manager')
      setSuccessMessage(null)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDisableManager(managerId) {
    const approved = window.confirm('Disable this HR manager and remove active access?')

    if (!approved) {
      return
    }

    setDeletingIds((current) => [...current, managerId])

    try {
      const response = await fetchWithAuth(`/api/org/hr/${managerId}`, {
        method: 'DELETE',
      })

      const payload = await response.json()

      setManagers((current) => current.map((manager) => (
        manager.id === managerId ? payload.manager : manager
      )))
      setErrorMessage(null)
      setSuccessMessage('HR manager disabled')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to disable HR manager')
      setSuccessMessage(null)
    } finally {
      setDeletingIds((current) => current.filter((id) => id !== managerId))
    }
  }

  return (
    <section className="grid min-h-[calc(100vh-9rem)] gap-4 lg:min-h-[calc(100vh-8.5rem)] lg:gap-5">
      <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.45em] text-amber-300/70">HR Managers</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Manage HR access for your organization</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              Invite HR managers by email and control access status. New invites receive a Firebase password reset email to set their own password on first login.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(true)
                setErrorMessage(null)
                setSuccessMessage(null)
              }}
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Add HR
            </button>
            <Link
              to="/org"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:text-white"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-5 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{errorMessage}</p>
        ) : null}
        {successMessage ? (
          <p className="mt-5 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{successMessage}</p>
        ) : null}
      </article>

      <article className="rounded-[2rem] border border-white/10 bg-slate-900/75 p-5 backdrop-blur-xl sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr>
                <th className="px-3 text-left text-xs uppercase tracking-[0.25em] text-slate-400">Name</th>
                <th className="px-3 text-left text-xs uppercase tracking-[0.25em] text-slate-400">Email</th>
                <th className="px-3 text-left text-xs uppercase tracking-[0.25em] text-slate-400">Status</th>
                <th className="px-3 text-right text-xs uppercase tracking-[0.25em] text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-slate-300" colSpan={4}>Loading HR managers...</td>
                </tr>
              ) : null}

              {!loading && managers.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-slate-300" colSpan={4}>No HR managers yet. Add your first HR manager.</td>
                </tr>
              ) : null}

              {!loading ? managers.map((manager) => {
                const deleting = deletingIds.includes(manager.id)
                const isDisabled = manager.status === 'disabled'

                return (
                  <tr key={manager.id}>
                    <td className="rounded-l-2xl border border-white/10 border-r-0 bg-slate-950/35 px-3 py-4 text-sm text-white">{manager.name}</td>
                    <td className="border border-white/10 border-x-0 bg-slate-950/35 px-3 py-4 text-sm text-cyan-200">{manager.email}</td>
                    <td className="border border-white/10 border-x-0 bg-slate-950/35 px-3 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${isDisabled ? 'border-slate-300/30 bg-slate-300/10 text-slate-200' : 'border-emerald-300/30 bg-emerald-300/15 text-emerald-100'}`}>
                        {isDisabled ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td className="rounded-r-2xl border border-white/10 border-l-0 bg-slate-950/35 px-3 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => void handleDisableManager(manager.id)}
                        disabled={deleting || isDisabled}
                        className="inline-flex items-center justify-center rounded-full border border-rose-300/30 bg-rose-400/15 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/25 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDisabled ? 'Removed' : deleting ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                )
              }) : null}
            </tbody>
          </table>
        </div>
      </article>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[1.75rem] border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-black/30 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-amber-300/70">Add HR</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Invite a new HR manager</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false)
                  setFormState(initialForm)
                }}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:text-white"
              >
                Close
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={(event) => void handleCreateManager(event)}>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Name
                <input
                  required
                  type="text"
                  value={formState.name}
                  onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Priya Sharma"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Email
                <input
                  required
                  type="email"
                  value={formState.email}
                  onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
                  placeholder="hr.manager@company.com"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setFormState(initialForm)
                  }}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Adding...' : 'Add HR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
