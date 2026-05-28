import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login(formData);
      const redirectPath = location.state?.from?.pathname || "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message;
      setError(
        message ||
          (err.code === "ERR_NETWORK" || !err.response
            ? "Unable to reach the server. Make sure the backend is running on http://localhost:5000."
            : "Login failed. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="page-card relative overflow-hidden bg-slate-950 p-8 text-white sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.25),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_28%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-10">
            <div>
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
                College Events Portal
              </span>
              <h1 className="mt-6 max-w-lg text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Sign in to manage campus events with role-based access.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Students can browse events. Coordinators and admins can organize and manage them securely.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Student", "View events and details"],
                ["Coordinator", "Create and manage own events"],
                ["Admin", "Manage all events"],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-300">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="page-card p-6 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Welcome back</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Login</h2>
            </div>
            <div className="rounded-2xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">
              Secure session via HTTP-only cookie
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="label-base" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-base"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="label-base" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-base"
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-8 text-sm text-slate-600">
            New here?{" "}
            <Link className="font-semibold text-brand-700 transition hover:text-brand-900" to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
