import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roles = ["Student", "Coordinator", "Admin"];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
    department: "",
    year: "",
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
      await register(formData);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="page-card hidden overflow-hidden bg-slate-950 p-8 text-white lg:block lg:p-10">
          <div className="relative h-full rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(15,23,42,1))] p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Secure Access</p>
            <h3 className="mt-4 max-w-lg text-4xl font-semibold leading-tight">
              Build your campus event identity with a clean, role-aware onboarding flow.
            </h3>
            <ul className="mt-8 space-y-4 text-sm text-slate-300">
              <li>Student: Join events and track participation.</li>
              <li>Coordinator: Manage events you own.</li>
              <li>Admin: Full visibility across the platform.</li>
            </ul>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white">Fast registration</div>
                <div className="mt-1 text-xs leading-5 text-slate-300">Simple fields and secure cookie login.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white">Role-based access</div>
                <div className="mt-1 text-xs leading-5 text-slate-300">Different experiences for different users.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-card p-6 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Get started</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Create account</h2>
            </div>
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              Registration takes less than a minute
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="sm:col-span-2">
              <label className="label-base" htmlFor="name">
                Full Name
              </label>
              <input id="name" name="name" required value={formData.name} onChange={handleChange} className="input-base" placeholder="Harshit" />
            </div>

            <div className="sm:col-span-2">
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
                placeholder="harshit@gmail.com"
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
                minLength={6}
                required
                value={formData.password}
                onChange={handleChange}
                className="input-base"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="label-base" htmlFor="role">
                Role
              </label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className="input-base">
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-base" htmlFor="department">
                Department
              </label>
              <input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input-base"
                placeholder="CSE"
              />
            </div>

            <div>
              <label className="label-base" htmlFor="year">
                Year
              </label>
              <input id="year" name="year" value={formData.year} onChange={handleChange} className="input-base" placeholder="3" />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary sm:col-span-2 w-full">
              {isSubmitting ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-8 text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="font-semibold text-brand-700 transition hover:text-brand-900" to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
