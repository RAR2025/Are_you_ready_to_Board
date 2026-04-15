import { Link } from 'react-router-dom'

const dashboardCards = [
  {
    title: 'Repositories',
    count: '12',
    countLabel: 'Active repositories',
    actionLabel: 'Add',
    to: 'repositories',
    tone: 'from-cyan-400/20 to-sky-500/10',
  },
  {
    title: 'Tech Stack',
    count: '8',
    countLabel: 'Approved tools',
    actionLabel: 'Manage',
    to: 'tech-stack',
    tone: 'from-violet-400/20 to-fuchsia-500/10',
  },
  {
    title: 'Documents',
    count: '24',
    countLabel: 'Knowledge docs',
    actionLabel: 'Upload',
    to: 'documents',
    tone: 'from-emerald-400/20 to-teal-500/10',
  },
  {
    title: 'HR Managers',
    count: '4',
    countLabel: 'Assigned managers',
    actionLabel: 'Manage',
    to: 'hr-managers',
    tone: 'from-amber-400/20 to-orange-500/10',
  },
] as const

export default function OrgDashboardPage() {
  return (
    <section className="grid min-h-[calc(100vh-9rem)] grid-rows-[auto_auto_1fr] gap-4 lg:min-h-[calc(100vh-8.5rem)] lg:gap-5">
      <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/70">Dashboard</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Build and manage the organization foundation</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
              Keep your repositories, stack, documents, and HR operations in one place without leaving the control center.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
            <p className="text-slate-400">Workspace scope</p>
            <p className="mt-1 font-medium text-white">Single-page org shell</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 lg:gap-5">
        {dashboardCards.map((card) => (
          <article
            key={card.title}
            className={`group flex min-h-[11.5rem] flex-col rounded-[1.75rem] border border-white/10 bg-gradient-to-br ${card.tone} p-5 shadow-xl shadow-black/15 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20`}
          >
            <p className="text-xs uppercase tracking-[0.35em] text-slate-300/70">{card.title}</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold text-white">{card.count}</p>
                <p className="mt-2 text-sm text-slate-200/90">{card.countLabel}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl border border-white/15 bg-slate-950/30" />
            </div>

            <div className="mt-auto pt-5">
              <Link
                to={card.to}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-slate-950/35 px-4 py-2.5 text-sm font-semibold text-white transition group-hover:border-white/20 group-hover:bg-slate-950/50"
              >
                {card.actionLabel}
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-5">
        <article className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Why this layout</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Everything you need stays above the fold</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            The dashboard is intentionally compact: the primary cards are the first thing you see, and the detail pages stay within the same org feature.
          </p>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Navigation</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
              <span>Repositories</span>
              <span className="text-cyan-300">/org/repositories</span>
            </li>
            <li className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
              <span>Tech Stack</span>
              <span className="text-violet-300">/org/tech-stack</span>
            </li>
            <li className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
              <span>Documents</span>
              <span className="text-emerald-300">/org/documents</span>
            </li>
            <li className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
              <span>HR Managers</span>
              <span className="text-amber-300">/org/hr-managers</span>
            </li>
          </ul>
        </article>
      </div>
    </section>
  )
}