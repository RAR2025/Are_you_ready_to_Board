import Antigravity from "../component/Antigravity";

function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Antigravity particleShape="box" particleSize={1.8} color="#5ca3ff" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 pointer-events-none">
        <h1 className="hero-title">
          Turn new hires into productive developers
        </h1>

        <p className="hero-subtitle mt-4 max-w-xl">
          A company-aware AI agent that guides onboarding step-by-step —
          without bothering your team.
        </p>

        {/* Enable interaction ONLY here */}
        <div className="mt-8 flex gap-4 pointer-events-auto">
          <button className="btn-primary">Get Started</button>
          <button className="btn-secondary">View Demo</button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;