import { useMemo, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react'
import { useOrgStore } from '../store/orgStore'

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const allowedExtensions = ['.pdf', '.docx']

function isAcceptedFile(file: File) {
  const lowerName = file.name.toLowerCase()
  const hasAllowedExtension = allowedExtensions.some((extension) => lowerName.endsWith(extension))

  return hasAllowedExtension || allowedMimeTypes.includes(file.type)
}

export default function DocumentManager() {
  const documents = useOrgStore((state) => state.documents)
  const uploadDocument = useOrgStore((state) => state.uploadDocument)
  const deleteDocument = useOrgStore((state) => state.deleteDocument)
  const error = useOrgStore((state) => state.error)

  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingIds, setDeletingIds] = useState<number[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const countLabel = useMemo(() => `${documents.length} available`, [documents.length])

  async function uploadSelectedFile(file: File) {
    if (!isAcceptedFile(file)) {
      setSuccessMessage(null)
      return
    }

    setUploading(true)

    try {
      await uploadDocument({ file })
      setSuccessMessage('Document uploaded')
    } finally {
      setUploading(false)
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)

    const file = event.dataTransfer.files?.[0]

    if (!file) {
      return
    }

    void uploadSelectedFile(file)
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    void uploadSelectedFile(file)
    event.target.value = ''
  }

  async function handleDeleteDocument(id: number) {
    setDeletingIds((current) => [...current, id])

    try {
      await deleteDocument(id)
      setSuccessMessage('Document removed')
    } finally {
      setDeletingIds((current) => current.filter((currentId) => currentId !== id))
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:gap-5">
      <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
        <p className="text-xs uppercase tracking-[0.45em] text-emerald-300/70">Documents</p>
        <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Upload onboarding documents</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
          Drag and drop PDF or DOCX files. Uploaded files are stored in Firebase Storage and indexed in your org records.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          className={`mt-6 cursor-pointer rounded-3xl border border-dashed px-6 py-10 text-center transition ${dragging ? 'border-emerald-300 bg-emerald-400/10' : 'border-white/15 bg-slate-950/25 hover:border-emerald-300/60'}`}
        >
          <p className="text-sm font-semibold text-white">Drop PDF or DOCX here</p>
          <p className="mt-2 text-sm text-slate-300">or click to pick a file</p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">Max 10MB per file</p>
          {uploading ? <p className="mt-4 text-sm text-emerald-200">Uploading...</p> : null}
        </div>

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
          <p className="text-sm text-slate-400">Knowledge documents</p>
          <p className="mt-2 text-3xl font-semibold text-white">{countLabel}</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">Each uploaded file updates the dashboard card count instantly.</p>
        </div>

        <div className="mt-5 space-y-3">
          {documents.length === 0 ? (
            <p className="text-sm text-slate-300">No documents uploaded yet.</p>
          ) : documents.map((document) => {
            const deleting = deletingIds.includes(document.id)

            return (
              <div key={document.id} className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
                <p className="text-sm font-semibold text-white">{document.original_name}</p>
                <p className="mt-1 text-xs text-slate-300">{document.file_type}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <a
                    href={document.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-200 underline decoration-emerald-300/40 underline-offset-4"
                  >
                    Open file
                  </a>
                  <button
                    type="button"
                    onClick={() => void handleDeleteDocument(document.id)}
                    disabled={deleting}
                    className="rounded-full border border-rose-300/30 bg-rose-400/15 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </aside>
    </div>
  )
}
