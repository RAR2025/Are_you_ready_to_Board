// src/pages/MemberAuth.jsx
import { useState } from "react";

export default function MemberAuth() {
  const [mode, setMode] = useState("register"); // register | login
  const [step, setStep] = useState(1); // register steps
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    orgID: "",
    role: "",
    roleType: "",
    experience: "",
    techStack: "",
  });

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const goNext = () => {
    if (step === 1) return setStep(2);
    if (step === 2 && form.role === "Developer") return setStep(3);
    submitRegister();
  };

  const submitRegister = async () => {
    // Replace with API:
    // await fetch("/api/auth/member/register", { method: "POST", ... })
    alert("Registered (mock)");
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    // Replace with API:
    // await fetch("/api/auth/member/login", ...)
    alert("Logged in (mock)");
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/5 p-6 text-white backdrop-blur-md">
        <h1 className="text-2xl font-bold">
          {mode === "register"
            ? "Developer / HR Register"
            : "Developer / HR Login"}
        </h1>

        <p className="mt-1 text-sm text-white/80">
          {mode === "register" ? "Already have account?" : "Need an account?"}{" "}
          <button
            onClick={() => {
              setMode((m) => (m === "register" ? "login" : "register"));
              setStep(1);
            }}
            className="text-white underline underline-offset-2 hover:opacity-80"
          >
            {mode === "register" ? "Login" : "Register"}
          </button>
        </p>

        {mode === "login" ? (
          <form className="mt-5 space-y-3" onSubmit={submitLogin}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={onChange}
              className="w-full rounded-md border border-white/70 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/25"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={onChange}
              className="w-full rounded-md border border-white/70 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/25"
              required
            />
            <button className="w-full rounded-md border border-white/70 bg-white/10 px-4 py-2 text-white hover:bg-white/20">
              Login
            </button>
          </form>
        ) : (
          <div className="mt-5 space-y-3">
            {step === 1 && (
              <>
                <input
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={onChange}
                  className="w-full rounded-md border border-white/70 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/25"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={onChange}
                  className="w-full rounded-md border border-white/70 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/25"
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={onChange}
                  className="w-full rounded-md border border-white/70 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/25"
                />
                <input
                  name="orgID"
                  placeholder="OrgID (e.g. ORG-ACME-8X2K)"
                  value={form.orgID}
                  onChange={onChange}
                  className="w-full rounded-md border border-white/70 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/25"
                />
              </>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <p className="text-sm text-white/80">Select role</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Developer", "HR"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, role: r }))}
                      className={[
                        "rounded-md border px-4 py-2 text-white",
                        form.role === r
                          ? "border-white/90 bg-white/20"
                          : "border-white/70 bg-white/5 hover:bg-white/10",
                      ].join(" ")}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <>
                <select
                  name="roleType"
                  value={form.roleType}
                  onChange={onChange}
                  className="w-full rounded-md border border-white/70 bg-white/10 px-3 py-2 text-white focus:border-white focus:outline-none focus:ring-2 focus:ring-white/25"
                >
                  <option value="">Role Type</option>
                  <option>Backend</option>
                  <option>Frontend</option>
                  <option>DevOps</option>
                </select>

                <select
                  name="experience"
                  value={form.experience}
                  onChange={onChange}
                  className="w-full rounded-md border border-white/70 bg-white/10 px-3 py-2 text-white focus:border-white focus:outline-none focus:ring-2 focus:ring-white/25"
                >
                  <option value="">Experience</option>
                  <option>Intern</option>
                  <option>Junior</option>
                  <option>Senior</option>
                </select>

                <input
                  name="techStack"
                  placeholder="Tech stack (React, Node, AWS)"
                  value={form.techStack}
                  onChange={onChange}
                  className="w-full rounded-md border border-white/70 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/25"
                />
              </>
            )}

            <div className="flex gap-2 pt-1">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="w-1/2 rounded-md border border-white/70 bg-white/5 px-4 py-2 text-white hover:bg-white/10"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={goNext}
                className="rounded-md border border-white/70 bg-white/10 px-4 py-2 text-white hover:bg-white/20"
              >
                {step === 3 || (step === 2 && form.role === "HR")
                  ? "Register"
                  : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
