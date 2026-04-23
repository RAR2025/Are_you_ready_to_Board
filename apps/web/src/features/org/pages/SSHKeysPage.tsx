import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SSHKeyManager from '../SSHKeyManager'
import { useOrgStore } from '../store/orgStore'

type LocationState = {
  highlightEmptyState?: boolean
}

export default function SSHKeysPage() {
  const location = useLocation()
  const loadSSHKeys = useOrgStore((state) => state.loadSSHKeys)

  useEffect(() => {
    void loadSSHKeys()
  }, [loadSSHKeys])

  const shouldHighlight = Boolean((location.state as LocationState | null)?.highlightEmptyState)

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

      <SSHKeyManager highlightEmptyState={shouldHighlight} />
    </section>
  )
}
