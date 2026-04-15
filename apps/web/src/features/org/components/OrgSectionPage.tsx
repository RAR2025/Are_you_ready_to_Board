import { Link } from 'react-router-dom'

interface OrgSectionPageProps {
  eyebrow: string
  title: string
  description: string
  statusLabel: string
  statusValue: string
  backLabel?: string
  backTo?: string
}

export default function OrgSectionPage({
  eyebrow,
  title,
  description,
  statusLabel,
  statusValue,
  backLabel = 'Back to dashboard',
  backTo = '/org',
}: OrgSectionPageProps) {
  return (
    <section className="grid min-h-[calc(100vh-9rem)] place-items-stretch lg:min-h-[calc(100vh-8.5rem)]">
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr] lg:gap-5">
        <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/70">{eyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={backTo}
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              {backLabel}
            </Link>
          </div>
        </article>

        <aside className="rounded-[2rem] border border-white/10 bg-slate-900/75 p-6 backdrop-blur-xl sm:p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Current snapshot</p>
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">{statusLabel}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{statusValue}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This section is wired as a dedicated route and is ready for future data entry and list management.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}