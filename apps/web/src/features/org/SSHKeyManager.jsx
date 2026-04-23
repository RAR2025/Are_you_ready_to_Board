import { useMemo, useState } from 'react'
import { useOrgStore } from './store/orgStore'

const initialForm = {
  label: '',
  public_key: '',
}

export default function SSHKeyManager({ highlightEmptyState = false }) {
  const sshKeys = useOrgStore((state) => state.sshKeys)
  const addSSHKey = useOrgStore((state) => state.addSSHKey)
  const deleteSSHKey = useOrgStore((state) => state.deleteSSHKey)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formState, setFormState] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [deletingIds, setDeletingIds] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [lastFingerprint, setLastFingerprint] = useState(null)

  const hasKeys = sshKeys.length > 0
  const sortedKeys = useMemo(() => [...sshKeys], [sshKeys])

  async function handleAddSshKey(event) {
    event.preventDefault()

    if (!formState.label.trim() || !formState.public_key.trim()) {
      setErrorMessage('Label and public key are required')
      return
    }

    setSubmitting(true)

    try {
      const createdKey = await addSSHKey(formState.label, formState.public_key)
      setLastFingerprint(createdKey.fingerprint)
      setSuccessMessage(`SSH key added. Fingerprint: ${createdKey.fingerprint}`)
      setErrorMessage(null)
      setFormState(initialForm)
      setIsModalOpen(false)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to add SSH key')
      setSuccessMessage(null)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteSshKey(keyId) {
    const approved = window.confirm('Delete this SSH key?')

    if (!approved) {
      return
    }

    setDeletingIds((current) => [...current, keyId])

    try {
      await deleteSSHKey(keyId)
      setErrorMessage(null)
      setSuccessMessage('SSH key deleted')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete SSH key')
      setSuccessMessage(null)
    } finally {
      setDeletingIds((current) => current.filter((id) => id !== keyId))
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-5">
      <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.45em] text-rose-300/70">SSH Keys</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Register SSH keys for private repositories</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              Add deploy public keys so sync jobs can securely clone private repositories for indexing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true)
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
            className="inline-flex items-center justify-center rounded-full bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-rose-300"
          >
            Add SSH Key
          </button>
        </div>

        {errorMessage ? (
          <p className="mt-5 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{errorMessage}</p>
        ) : null}
        {successMessage ? (
          <div className="mt-5 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            <p>{successMessage}</p>
            {lastFingerprint ? <p className="mt-2 break-all font-semibold">Verify fingerprint: {lastFingerprint}</p> : null}
          </div>
        ) : null}

        {!hasKeys ? (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${highlightEmptyState ? 'border-amber-300/60 bg-amber-500/10 text-amber-100' : 'border-white/10 bg-slate-950/35 text-slate-300'}`}
          >
            {highlightEmptyState
              ? 'No SSH key exists yet. Add one now before syncing private repositories.'
              : 'No SSH keys configured yet. Add your first key to enable private repository sync.'}
          </div>
        ) : null}
      </article>

      <article className="rounded-[2rem] border border-white/10 bg-slate-900/75 p-5 backdrop-blur-xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Registered keys</p>
          <p className="text-sm font-semibold text-white">{sshKeys.length} active</p>
        </div>

        <div className="space-y-3">
          {sortedKeys.map((key) => {
            const deleting = deletingIds.includes(key.id)

            return (
              <article key={key.id} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-white">{key.label}</p>
                    <p className="break-all text-xs text-cyan-200">{key.fingerprint}</p>
                    <p className="text-xs text-slate-400">Added {new Date(key.created_at).toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDeleteSshKey(key.id)}
                    disabled={deleting}
                    className="inline-flex items-center justify-center rounded-full border border-rose-300/30 bg-rose-400/15 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </article>
            )
          })}

          {sortedKeys.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-4 text-sm text-slate-300">
              No SSH keys registered.
            </p>
          ) : null}
        </div>
      </article>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[1.75rem] border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-black/30 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-rose-300/70">Add SSH key</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Register a deploy key</h3>
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

            <div className="mt-5 rounded-2xl border border-cyan-300/30 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
              Paste your public key here (the contents of your id_rsa.pub or id_ed25519.pub file). Register this public key as a Deploy Key in your GitHub repository settings → Deploy keys. Your private key never leaves your machine.
            </div>

            <form className="mt-6 space-y-4" onSubmit={(event) => void handleAddSshKey(event)}>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Label
                <input
                  required
                  type="text"
                  value={formState.label}
                  onChange={(event) => setFormState((current) => ({ ...current, label: event.target.value }))}
                  placeholder="GitHub deploy key - main server"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-rose-400/50"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Public key
                <textarea
                  required
                  value={formState.public_key}
                  onChange={(event) => setFormState((current) => ({ ...current, public_key: event.target.value }))}
                  rows={6}
                  placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... user@machine"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-rose-400/50"
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
                  className="rounded-full bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Saving...' : 'Save key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
