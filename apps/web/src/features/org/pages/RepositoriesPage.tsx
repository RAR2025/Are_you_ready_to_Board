import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { OrgRepoMutationResponse, OrgReposResponse, RepositoryRecord } from '@shared-types'
import { fetchWithAuth } from '@/lib/api'
import { useOrgStore } from '../store/orgStore'

type AddRepoFormState = {
  githubUrl: string
  name: string
  isPrivate: boolean
}

const initialForm: AddRepoFormState = {
  githubUrl: '',
  name: '',
  isPrivate: false,
}

export default function RepositoriesPage() {
  const refreshRepositoriesCount = useOrgStore((state) => state.refreshRepositoriesCount)
  const [repositories, setRepositories] = useState<RepositoryRecord[]>([])
  const [sshKeyConfigured, setSshKeyConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formState, setFormState] = useState<AddRepoFormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [syncingIds, setSyncingIds] = useState<number[]>([])
  const [deletingIds, setDeletingIds] = useState<number[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const privateRepositories = useMemo(
    () => repositories.filter((repository) => repository.is_private).length,
    [repositories],
  )

  const loadRepositories = useCallback(async () => {
    setLoading(true)

    try {
      const response = await fetchWithAuth('/api/org/repos')
      const payload = (await response.json()) as OrgReposResponse

      setRepositories(payload.repositories)
      setSshKeyConfigured(payload.sshKeyConfigured)
      setErrorMessage(null)
      void refreshRepositoriesCount()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load repositories')
    } finally {
      setLoading(false)
    }
  }, [refreshRepositoriesCount])

  useEffect(() => {
    void loadRepositories()
  }, [loadRepositories])

  async function handleCreateRepository(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!formState.githubUrl.trim()) {
      setErrorMessage('Repository URL is required')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetchWithAuth('/api/org/repos', {
        method: 'POST',
        body: JSON.stringify({
          githubUrl: formState.githubUrl.trim(),
          name: formState.name.trim(),
          isPrivate: formState.isPrivate,
        }),
      })

      const payload = (await response.json()) as OrgRepoMutationResponse

      setRepositories((current) => [payload.repository, ...current])
      setSshKeyConfigured(payload.sshKeyConfigured)
      setFormState(initialForm)
      setIsModalOpen(false)
      setErrorMessage(null)
      setSuccessMessage('Repository added successfully')
      void refreshRepositoriesCount()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to add repository')
      setSuccessMessage(null)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteRepository(repositoryId: number) {
    const approved = window.confirm('Delete this repository from your organization list?')

    if (!approved) {
      return
    }

    setDeletingIds((current) => [...current, repositoryId])

    try {
      await fetchWithAuth(`/api/org/repos/${repositoryId}`, {
        method: 'DELETE',
      })

      setRepositories((current) => current.filter((repository) => repository.id !== repositoryId))
      setErrorMessage(null)
      setSuccessMessage('Repository removed')
      void refreshRepositoriesCount()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete repository')
      setSuccessMessage(null)
    } finally {
      setDeletingIds((current) => current.filter((id) => id !== repositoryId))
    }
  }

  async function handleSyncRepository(repositoryId: number) {
    setSyncingIds((current) => [...current, repositoryId])

    try {
      const response = await fetchWithAuth(`/api/org/repos/${repositoryId}/sync`, {
        method: 'POST',
      })

      const payload = (await response.json()) as OrgRepoMutationResponse

      setRepositories((current) => current.map((repository) => (
        repository.id === repositoryId ? payload.repository : repository
      )))
      setSshKeyConfigured(payload.sshKeyConfigured)
      setErrorMessage(null)
      setSuccessMessage('Repository synced')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sync repository')
      setSuccessMessage(null)
    } finally {
      setSyncingIds((current) => current.filter((id) => id !== repositoryId))
    }
  }

  return (
    <section className="grid min-h-[calc(100vh-9rem)] gap-4 lg:min-h-[calc(100vh-8.5rem)] lg:gap-5">
      <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/70">Repositories</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Manage the company repositories</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              Track source repositories that power onboarding context and indexing. Public repositories are validated through
              the GitHub REST API before they are saved.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null)
                setSuccessMessage(null)
                setIsModalOpen(true)
              }}
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Add repository
            </button>
            <Link
              to="/org"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:text-white"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tracked repositories</p>
            <p className="mt-2 text-2xl font-semibold text-white">{repositories.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Private repositories</p>
            <p className="mt-2 text-2xl font-semibold text-white">{privateRepositories}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">SSH readiness</p>
            <p className="mt-2 text-sm font-semibold text-white">{sshKeyConfigured ? 'SSH key detected' : 'No SSH key configured'}</p>
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
                <th className="px-3 text-left text-xs uppercase tracking-[0.25em] text-slate-400">Repository</th>
                <th className="px-3 text-left text-xs uppercase tracking-[0.25em] text-slate-400">URL</th>
                <th className="px-3 text-left text-xs uppercase tracking-[0.25em] text-slate-400">Last indexed</th>
                <th className="px-3 text-right text-xs uppercase tracking-[0.25em] text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-slate-300" colSpan={4}>Loading repositories...</td>
                </tr>
              ) : null}

              {!loading && repositories.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-slate-300" colSpan={4}>No repositories yet. Add your first repository to start indexing.</td>
                </tr>
              ) : null}

              {!loading ? repositories.map((repository) => {
                const syncing = syncingIds.includes(repository.id)
                const deleting = deletingIds.includes(repository.id)
                const showPrivateWarning = repository.is_private && !sshKeyConfigured

                return (
                  <tr key={repository.id}>
                    <td className="rounded-l-2xl border border-white/10 border-r-0 bg-slate-950/35 px-3 py-4 text-sm text-white">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{repository.name}</span>
                        {repository.is_private ? (
                          <span
                            title={showPrivateWarning ? 'Add an SSH key first to index private repos' : 'Private repository'}
                            className="inline-flex items-center rounded-full border border-amber-300/30 bg-amber-300/15 px-2 py-0.5 text-xs font-semibold text-amber-100"
                          >
                            <span className="mr-1" aria-hidden="true">lock</span>
                            Private
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="border border-white/10 border-x-0 bg-slate-950/35 px-3 py-4 text-sm text-cyan-200">
                      <a
                        href={repository.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all underline decoration-cyan-300/40 underline-offset-4 transition hover:text-cyan-100"
                      >
                        {repository.github_url}
                      </a>
                    </td>
                    <td className="border border-white/10 border-l-0 bg-slate-950/35 px-3 py-4 text-sm text-slate-300">
                      {repository.last_indexed_at ? new Date(repository.last_indexed_at).toLocaleString() : 'Never'}
                    </td>
                    <td className="rounded-r-2xl border border-white/10 border-l-0 bg-slate-950/35 px-3 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => void handleSyncRepository(repository.id)}
                          disabled={syncing}
                          title={showPrivateWarning ? 'Add an SSH key first to index private repos' : 'Sync repository'}
                          className="inline-flex items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {syncing ? 'Syncing...' : 'Sync'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteRepository(repository.id)}
                          disabled={deleting}
                          className="inline-flex items-center justify-center rounded-full border border-rose-300/30 bg-rose-400/15 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/25 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
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
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Add repository</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Connect a GitHub repository</h3>
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

            <form className="mt-6 space-y-4" onSubmit={(event) => void handleCreateRepository(event)}>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                GitHub URL
                <input
                  required
                  type="url"
                  value={formState.githubUrl}
                  onChange={(event) => setFormState((current) => ({ ...current, githubUrl: event.target.value }))}
                  placeholder="https://github.com/org/repo"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-200">
                Name
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Optional display name"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">Private repo?</p>
                  <p className="text-xs text-slate-400">Enable this if the repository is private on GitHub.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormState((current) => ({ ...current, isPrivate: !current.isPrivate }))}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${formState.isPrivate ? 'bg-cyan-400' : 'bg-slate-700'}`}
                  aria-pressed={formState.isPrivate}
                  aria-label="Toggle private repository"
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${formState.isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
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
                  className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Saving...' : 'Add repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}