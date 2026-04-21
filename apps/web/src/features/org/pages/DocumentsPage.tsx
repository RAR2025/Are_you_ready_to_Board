import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import DocumentManager from '../components/DocumentManager'
import { useOrgStore } from '../store/orgStore'

export default function DocumentsPage() {
  const loadDocuments = useOrgStore((state) => state.loadDocuments)

  useEffect(() => {
    void loadDocuments()
  }, [loadDocuments])

  return (
    <section className="grid min-h-[calc(100vh-9rem)] gap-4 lg:min-h-[calc(100vh-8.5rem)] lg:gap-5">
      <div>
        <Link
          to="/org"
          className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:text-white"
        >
          Back to dashboard
        </Link>
      </div>
      <DocumentManager />
    </section>
  )
}