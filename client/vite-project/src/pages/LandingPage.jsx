// src/pages/LandingPage.jsx
import { Link } from "react-router-dom";

const roles = [
  {
    title: "System Designer",
    desc: "Create company onboarding system and receive an OrgID.",
    to: "/auth/system-designer",
  },
  {
    title: "Developer",
    desc: "Join with OrgID, choose role type, experience, and tech stack.",
    to: "/auth/member",
  },
  {
    title: "HR",
    desc: "Join with OrgID and manage hiring/onboarding process.",
    to: "/auth/member",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/5 backdrop-blur-md text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold tracking-wide">AreYouReadyToBoard</h1>
          <div className="flex gap-2">
            <Link
              to="/auth/member"
              className="rounded-md border border-white/70 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              to="/auth/system-designer"
              className="rounded-md border border-white/70 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/5 p-8 md:p-12 backdrop-blur-md">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent2/20 blur-3xl" />
          <div className="relative animate-floatUp">
            <p className="mb-3 inline-block rounded-full border border-white/70 bg-white/10 px-3 py-1 text-xs text-white">
              Smart onboarding platform
            </p>
            <h2 className="text-4xl font-extrabold leading-tight md:text-6xl">
              Onboard smarter.
              <br />
              Ship faster.
            </h2>
            <p className="mt-4 max-w-2xl text-white/85">
              Build role-based onboarding with OrgID access for teams and scale your workflow.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h3 className="mb-5 text-2xl font-semibold">Choose your role</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((r) => (
              <div
                key={r.title}
                className="rounded-xl border border-white/70 bg-white/5 p-5 text-white transition hover:-translate-y-1 hover:bg-white/10"
              >
                <h4 className="text-lg font-semibold">{r.title}</h4>
                <p className="mt-2 text-sm text-white/80">{r.desc}</p>
                <Link
                  to={r.to}
                  className="mt-4 inline-block rounded-md border border-white/70 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
                >
                  Continue
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h3 className="mb-5 text-2xl font-semibold">How it works</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { step: "01", title: "Register", desc: "System Designer creates org profile." },
              { step: "02", title: "Share OrgID", desc: "Generated OrgID is shared with team." },
              { step: "03", title: "Join & Start", desc: "Developer/HR join and start onboarding." },
            ].map((s) => (
              <div key={s.step} className="rounded-xl border border-white/70 bg-white/5 p-5 text-white">
                <p className="text-white">{s.step}</p>
                <h4 className="mt-1 text-lg font-semibold">{s.title}</h4>
                <p className="mt-1 text-sm text-white/80">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}