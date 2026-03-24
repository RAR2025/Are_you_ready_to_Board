// src/pages/SystemDesignerAuth.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function fakeOrgId(companyName) {
  const clean =
    (companyName || "ORG")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 4) || "ORG";
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORG-${clean}-${rand}`;
}

export default function SystemDesignerAuth() {
  const [mode, setMode] = useState("register"); // register | login
  const [done, setDone] = useState(false);
  const [orgID, setOrgID] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    industry: "",
  });

  const title = useMemo(
    () =>
      mode === "register"
        ? "System Designer Register"
        : "System Designer Login",
    [mode],
  );

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();

    if (mode === "register") {
      // Replace with API call:
      // const res = await fetch("/api/auth/system-designer/register", { method: "POST", ... })
      // const data = await res.json()
      // setOrgID(data.orgID)
      const generated = fakeOrgId(form.companyName);
      setOrgID(generated);
      setDone(true);
      return;
    }

    // Replace with API login:
    // await fetch("/api/auth/system-designer/login", ...)
    alert("Logged in (mock)");
  };

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/5 p-6 text-white backdrop-blur-md">
          <h1 className="text-2xl font-bold">Registration successful</h1>
          <p className="mt-2 text-white/85">Your organization ID:</p>

          <div className="mt-4 flex gap-2">
            <input
              readOnly
              value={orgID}
              className="w-full rounded-md border border-white/70 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/25"
            />
            <button
              onClick={() => navigator.clipboard.writeText(orgID)}
              className="rounded-md border border-white/70 bg-white/10 px-3 py-2 text-white hover:bg-white/20"
            >
              Copy
            </button>
          </div>

          <p className="mt-3 text-sm text-white/75">
            Share this OrgID with Developers and HR so they can register.
          </p>

          <Link
            to="/"
            className="mt-5 inline-block rounded-md border border-white/70 px-4 py-2 text-white hover:bg-white/10"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/5 p-6 text-white backdrop-blur-md">
        <h1 className="text-2xl font-bold">{title}</h1>

        <p className="mt-1 text-sm text-white/80">
          {mode === "register" ? "Already have account?" : "New here?"}{" "}
          <button
            onClick={() =>
              setMode((m) => (m === "register" ? "login" : "register"))
            }
            className="text-white underline underline-offset-2 hover:opacity-80"
          >
            {mode === "register" ? "Login" : "Register"}
          </button>
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          {mode === "register" && (
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={onChange}
              className="w-full rounded-md border border-white/70 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/25"
              required
            />
          )}

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

          {mode === "register" && (
            <>
              <input
                name="companyName"
                placeholder="Company Name"
                value={form.companyName}
                onChange={onChange}
                className="w-full rounded-md border border-white/70 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/25"
                required
              />

              <select
                name="industry"
                value={form.industry}
                onChange={onChange}
                className="w-full rounded-md border border-white/70 bg-white/10 px-3 py-2 text-white focus:border-white focus:outline-none focus:ring-2 focus:ring-white/25"
                required
              >
                <option value="">Industry</option>
                <option>Technology</option>
                <option>Finance</option>
                <option>Healthcare</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </>
          )}

          <button className="w-full rounded-md border border-white/70 bg-white/10 px-4 py-2 font-medium text-white hover:bg-white/20">
            {mode === "register" ? "Create account" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
