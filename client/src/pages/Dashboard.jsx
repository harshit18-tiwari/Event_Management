import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import eventService from "../services/eventService";
import registrationService from "../services/registrationService";
import authService from "../services/authService";

const roleChipStyles = {
  Student: "bg-emerald-100 text-emerald-700",
  Coordinator: "bg-amber-100 text-amber-700",
  Admin: "bg-rose-100 text-rose-700",
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      setStatsLoading(true);
      try {
        if (user.role === "Student") {
          const response = await registrationService.getMyEvents();
          const registrations = response.data.registrations || [];
          const now = new Date();
          const upcoming = registrations.filter((registration) => new Date(registration.event?.date) >= now).length;

          setStats([
            ["Total Registered Events", registrations.length],
            ["Upcoming Events", upcoming],
            ["Past Events", Math.max(registrations.length - upcoming, 0)],
          ]);
        } else if (user.role === "Coordinator") {
          const response = await eventService.getAllEvents();
          const ownEvents = (response.data.events || []).filter((event) => event.createdBy?._id === user._id);

          const participantResponses = await Promise.all(
            ownEvents.map((event) => registrationService.getEventParticipants(event._id).catch(() => null))
          );

          const totalParticipants = participantResponses.reduce((sum, responseItem) => {
            if (!responseItem) return sum;
            return sum + (responseItem.data.stats?.totalRegistrations || 0);
          }, 0);

          setStats([
            ["Total Events Created", ownEvents.length],
            ["Total Participants", totalParticipants],
            ["Managed Categories", new Set(ownEvents.map((event) => event.category)).size],
          ]);
        } else {
          const [eventsResponse, usersResponse, registrationsResponse] = await Promise.all([
            eventService.getAllEvents(),
            authService.getAuthStats(),
            registrationService.getRegistrationStats(),
          ]);

          setStats([
            ["Total Events", (eventsResponse.data.events || []).length],
            ["Total Users", usersResponse.data.totalUsers || 0],
            ["Total Registrations", registrationsResponse.data.totalRegistrations || 0],
          ]);
        }
      } catch (error) {
        setStats([]);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="page-card overflow-hidden bg-slate-950 text-white">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">College Event Management</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Welcome, {user?.name}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                Your dashboard gives you quick access to events, your profile, and the actions available to your role.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/events" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                  View Events
                </Link>
                {(user?.role === "Admin" || user?.role === "Coordinator") && (
                  <Link to="/events/create" className="btn-primary bg-emerald-500 hover:bg-emerald-600">
                    Create Event
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-secondary border-white/10 bg-transparent text-white hover:bg-white/10"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                ["Role", user?.role],
                ["Department", user?.department || "Not set"],
                ["Year", user?.year || "Not set"],
                ["Email", user?.email],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">{label}</div>
                  <div className="mt-2 text-sm font-medium text-white">{value || "-"}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="page-card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Profile</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Your account summary</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${roleChipStyles[user?.role] || "bg-slate-100 text-slate-700"}`}>
                {user?.role}
              </span>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-sm text-slate-500">Name</dt>
                <dd className="mt-1 font-semibold text-slate-900">{user?.name || "-"}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-sm text-slate-500">Email</dt>
                <dd className="mt-1 font-semibold text-slate-900 break-all">{user?.email || "-"}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-sm text-slate-500">Department</dt>
                <dd className="mt-1 font-semibold text-slate-900">{user?.department || "-"}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-sm text-slate-500">Year</dt>
                <dd className="mt-1 font-semibold text-slate-900">{user?.year || "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="page-card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Quick Access</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Jump into event pages</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link to="/events" className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
                <div className="text-sm font-semibold text-slate-500">Browse</div>
                <div className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-brand-700">All Events</div>
                <div className="mt-2 text-sm text-slate-600">Search, sort, and open event details.</div>
              </Link>
              {user?.role === "Student" && (
                <Link to="/my-events" className="group rounded-3xl border border-brand-200 bg-brand-50 p-5 transition hover:-translate-y-0.5 hover:bg-brand-100 hover:shadow-lg">
                  <div className="text-sm font-semibold text-brand-700">Student</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-brand-700">My Events</div>
                  <div className="mt-2 text-sm text-slate-600">View your registrations and cancel before start time.</div>
                </Link>
              )}
              {(user?.role === "Admin" || user?.role === "Coordinator") && (
                <Link to="/events/create" className="group rounded-3xl border border-emerald-200 bg-emerald-50 p-5 transition hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-lg">
                  <div className="text-sm font-semibold text-emerald-700">Manage</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-emerald-700">Create Event</div>
                  <div className="mt-2 text-sm text-slate-600">Start a new event with the creation form.</div>
                </Link>
              )}
              {(user?.role === "Admin" || user?.role === "Coordinator") && (
                <Link to="/events" className="group rounded-3xl border border-sky-200 bg-sky-50 p-5 transition hover:-translate-y-0.5 hover:bg-sky-100 hover:shadow-lg">
                  <div className="text-sm font-semibold text-sky-700">Participants</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-sky-700">Manage Registrations</div>
                  <div className="mt-2 text-sm text-slate-600">Open an event to review participants and registrations.</div>
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {(statsLoading ? [["Loading stats...", ""]] : stats).map(([label, value]) => (
            <div key={label} className="page-card p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">{value ?? 0}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
