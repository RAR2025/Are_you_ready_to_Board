import { useMemo, useState, type FormEvent } from 'react'
import { useOrgStore } from '../store/orgStore'

export default function TechStack() {
  const techStackItems = useOrgStore((state) => state.techStackItems)
  const addTechStackItem = useOrgStore((state) => state.addTechStackItem)
  const deleteTechStackItem = useOrgStore((state) => state.deleteTechStackItem)
  const error = useOrgStore((state) => state.error)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingIds, setDeletingIds] = useState<number[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const countLabel = useMemo(() => `${techStackItems.length} tracked`, [techStackItems.length])

  async function handleAddTechStackItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim()) {
      return
    }

    setSubmitting(true)

    try {
      await addTechStackItem(name, description)
      setName('')
      setDescription('')
      setSuccessMessage('Technology added')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteTechStackItem(id: number) {
    setDeletingIds((current) => [...current, id])

    try {
      await deleteTechStackItem(id)
      setSuccessMessage('Technology removed')
    } finally {
      setDeletingIds((current) => current.filter((currentId) => currentId !== id))
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-5">
      <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
        <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/70">Tech Stack</p>
        <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Track approved technologies</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
          Add technologies as chips with optional descriptions. Changes update dashboard counts immediately.
        </p>

        <form className="mt-6 space-y-3" onSubmit={(event) => void handleAddTechStackItem(event)}>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Technology name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="React, PostgreSQL, Docker"
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Description (optional)
            <input
              type="text"
              maxLength={220}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short note about usage"
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
            />
          </label>

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {submitting ? 'Saving...' : 'Add technology'}
          </button>
        </form>

        {error ? (
          <p className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>
        ) : null}

        {successMessage ? (
          <p className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{successMessage}</p>
        ) : null}
      </article>

      <aside className="rounded-[2rem] border border-white/10 bg-slate-900/75 p-6 backdrop-blur-xl sm:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Current snapshot</p>
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Approved stack items</p>
          <p className="mt-2 text-3xl font-semibold text-white">{countLabel}</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Keep this concise so onboarding content reflects what your org actually uses.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {techStackItems.length === 0 ? (
            <p className="text-sm text-slate-300">No technologies added yet.</p>
          ) : techStackItems.map((item) => {
            const deleting = deletingIds.includes(item.id)

            return (
              <div
                key={item.id}
                className="group flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/35 px-3 py-1.5 text-sm text-white"
                title={item.description || item.name}
              >
                <span>{item.name}</span>
                {item.description ? (
                  <span className="max-w-[11rem] truncate text-xs text-slate-300">{item.description}</span>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleDeleteTechStackItem(item.id)}
                  disabled={deleting}
                  className="rounded-full border border-rose-300/40 bg-rose-400/15 px-2 py-0.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? '...' : 'x'}
                </button>
              </div>
            )
          })}
        </div>
      </aside>
    </div>
  )
}
