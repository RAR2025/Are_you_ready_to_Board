import Antigravity from "../component/Antigravity";
import iconRoleSystemDesigner from "../assets/icon-role-system-designer.png";
import iconRoleDeveloper from "../assets/icon-role-developer.png";
import iconRoleHrManager from "../assets/icon-role-hr-manager.png";

const steps = [
  {
    id: "01",
    title: "Company Setup",
    description:
      "System Designer creates the org, uploads docs, system design, and tools. Generates a unique OrgID for the company.",
  },
  {
    id: "02",
    title: "Developer Joins",
    description:
      "New hire registers with OrgID, selects role, tech stack, and experience level. AI builds their custom path.",
  },
  {
    id: "03",
    title: "AI Guides Them",
    description:
      "Chat-based agent answers questions, tracks the checklist, and emails HR when onboarding is complete.",
  },
];

const roles = [
  {
    title: "System Designer",
    icon: iconRoleSystemDesigner,
    description: "Set up your company's knowledge base and onboarding structure.",
    points: [
      "Create org and generate OrgID",
      "Upload company docs and PDFs",
      "Define system architecture",
      "Manage all team members",
    ],
    cta: "Create Organization",
  },
  {
    title: "Developer",
    icon: iconRoleDeveloper,
    description: "Chat with an AI that knows your company inside out.",
    points: [
      "Personalized onboarding path",
      "Ask about any tool or process",
      "Track checklist in real-time",
      "Backend / Frontend / DevOps",
    ],
    cta: "Start Onboarding",
  },
  {
    title: "HR Manager",
    icon: iconRoleHrManager,
    description: "Monitor onboarding progress across your entire team.",
    points: [
      "View all developer statuses",
      "Auto-receive completion emails",
      "Track pending vs completed",
      "Confidence scores per hire",
    ],
    cta: "View Dashboard",
  },
];

const features = [
  {
    title: "AI Chat Agent",
    description: "Answers only from your company's docs. No hallucination, ever.",
  },
  {
    title: "Smart Checklist",
    description: "Dynamic tasks based on role, stack, and experience level.",
  },
  {
    title: "Personalized Paths",
    description: "Differs by role and stack for practical onboarding.",
  },
  {
    title: "Auto HR Email",
    description: "Structured completion email with confidence score sent on finish.",
  },
  {
    title: "Knowledge Base",
    description: "Pre-loaded with Notion, Jira, Slack, GitHub, and AWS docs.",
  },
  {
    title: "Org-level Security",
    description: "JWT auth, bcrypt, and org-scoped access. Each company isolated.",
  },
];

function HomeLanding() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <div className="fixed inset-0 z-0 h-screen w-full">
        <Antigravity
          particleShape="box"
          particleSize={1.8}
          color="#5ca3ff"
          autoAnimate
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-1 h-screen w-full opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(92,163,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(92,163,255,0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 border-b border-white/10">
        <header className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 md:px-10">
          <h2 className="text-xl font-semibold tracking-wide text-[#9b7bff]">OnboardAI</h2>
          <nav className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
            <a href="#how" className="hover:text-white transition">How it works</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#roles" className="hover:text-white transition">Roles</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <button className="btn-secondary py-2">Login</button>
            <button className="btn-primary py-2">Get Started</button>
          </div>
        </header>
      </div>

      <main className="relative z-10 pb-20">
        <section className="mx-auto max-w-6xl px-6 pt-16 text-center md:px-10 md:pt-24">
          <div className="mx-auto w-fit rounded-full border border-[#5ca3ff]/40 bg-[#5ca3ff]/10 px-4 py-2 text-sm text-[#9b7bff] backdrop-blur-md">
            AI-Powered Developer Onboarding
          </div>

          <h1 className="hero-title mt-8 text-balance">Turn new hires into productive developers</h1>

          <p className="hero-subtitle mx-auto mt-6 max-w-2xl">
            A company-aware AI agent that guides onboarding step-by-step without
            bothering your team.
          </p>

          
        </section>

        <section id="how" className="mx-auto max-w-6xl px-6 pt-24 md:px-10 md:pt-32">
          <p className="text-center text-sm uppercase tracking-[0.2em] text-[#5ca3ff]">How it works</p>
          <h2 className="mt-4 text-center text-4xl font-bold text-white">Three steps to full productivity</h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.id} className="rounded-2xl border border-white/10 bg-white/3 p-6 backdrop-blur-md">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-[#5ca3ff]/50 bg-[#5ca3ff]/10 text-sm font-semibold text-[#9b7bff]">
                  {step.id}
                </div>
                <h3 className="text-2xl font-semibold text-white">{step.title}</h3>
                <p className="hero-subtitle mt-4 text-base leading-relaxed">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="roles" className="mx-auto max-w-6xl px-6 pt-24 md:px-10 md:pt-32">
          <p className="text-center text-sm uppercase tracking-[0.2em] text-[#5ca3ff]">Built for everyone</p>
          <h2 className="mt-4 text-center text-4xl font-bold text-white">Pick your role</h2>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {roles.map((role, index) => (
              <article key={role.title} className="rounded-3xl border border-white/10 bg-white/4 p-7 backdrop-blur-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#5ca3ff]/35 bg-[#5ca3ff]/10 p-2">
                  <img
                    src={role.icon}
                    alt={role.title}
                    className="h-7 w-7 object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-white">{role.title}</h3>
                <p className="hero-subtitle mt-3 text-base">{role.description}</p>

                <ul className="mt-6 space-y-2 text-sm text-gray-300">
                  {role.points.map((point) => (
                        <li key={point} className="leading-relaxed">- {point}</li>
                  ))}
                </ul>

                <button
                  className={`mt-8 font-medium transition ${
                    index === 2 ? "text-yellow-400 hover:text-yellow-300" : "text-[#5ca3ff] hover:text-[#9b7bff]"
                  }`}
                >
                      {role.cta} {"->"}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 pt-24 md:px-10 md:pt-32">
          <p className="text-center text-sm uppercase tracking-[0.2em] text-[#5ca3ff]">Features</p>
          <h2 className="mt-4 text-center text-4xl font-bold text-white">Everything your team needs</h2>

          <div className="mt-14 grid overflow-hidden rounded-3xl border border-white/10 bg-white/3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="border-b border-r border-white/10 p-6 sm:min-h-48">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#5ca3ff]/35 bg-[#5ca3ff]/10">
                  <div className="h-5 w-5 rounded border border-[#9b7bff]/70" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="hero-subtitle mt-3 text-base">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-24 md:px-10 md:pt-32">
          <div className="rounded-3xl border border-white/15 bg-white/4 px-6 py-16 text-center backdrop-blur-xl md:px-10">
            <h2 className="text-4xl font-bold text-white">Ready to onboard smarter?</h2>
            <p className="hero-subtitle mx-auto mt-4 max-w-xl text-base">
              Set up your company in under 10 minutes. No credit card needed.
            </p>
            <button className="btn-primary mt-8">Create Your Organization</button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mt-24 border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-gray-400 md:flex-row md:px-10">
          <p className="text-lg font-semibold text-[#9b7bff]">OnboardAI</p>
          <p>Built for developers, by developers.</p>
              <p>(c) 2026 OnboardAI</p>
        </div>
      </footer>
    </div>
  );
}

export default HomeLanding;
