import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import eventService from "../services/eventService";
import registrationService from "../services/registrationService";
import authService from "../services/authService";
import attendanceService from "../services/attendanceService";
import certificateService from "../services/certificateService";

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
          const attendanceResponse = await attendanceService.getMyAttendance();
          const certificateResponse = await certificateService.getMyCertificates();
          const totalPresent = attendanceResponse.data.totalPresent || 0;
          const attendanceRate = registrations.length === 0 ? 0 : Number(((totalPresent / registrations.length) * 100).toFixed(2));

          setStats([
            ["Total Registered Events", registrations.length],
            ["Events Attended", totalPresent],
            ["Attendance Rate", `${attendanceRate}%`],
            ["Upcoming Events", upcoming],
            ["Certificates Earned", certificateResponse.data.totalCertificates || 0],
          ]);
        } else if (user.role === "Coordinator") {
          const response = await eventService.getAllEvents();
          const ownEvents = (response.data.events || []).filter((event) => event.createdBy?._id === user._id);

          const participantResponses = await Promise.all(
            ownEvents.map((event) => attendanceService.getAttendanceReport(event._id).catch(() => null))
          );
          const certificateResponses = await Promise.all(
            ownEvents.map((event) => certificateService.getEventCertificates(event._id).catch(() => null))
          );

          const totalParticipants = participantResponses.reduce((sum, responseItem) => {
            if (!responseItem) return sum;
            return sum + (responseItem.data.totalRegistered || 0);
          }, 0);

          const totalPresent = participantResponses.reduce((sum, responseItem) => {
            if (!responseItem) return sum;
            return sum + (responseItem.data.totalPresent || 0);
          }, 0);

          const attendanceRate = totalParticipants === 0 ? 0 : Number(((totalPresent / totalParticipants) * 100).toFixed(2));
          const certificatesIssued = certificateResponses.reduce((sum, responseItem) => {
            if (!responseItem) return sum;
            return sum + (responseItem.data.totalCertificates || 0);
          }, 0);

          setStats([
            ["Total Events Created", ownEvents.length],
            ["Total Participants", totalParticipants],
            ["Attendance Rate", `${attendanceRate}%`],
            ["Certificates Issued", certificatesIssued],
          ]);
        } else {
          const [eventsResponse, usersResponse, registrationsResponse, certificatesResponse] = await Promise.all([
            eventService.getAllEvents(),
            authService.getAuthStats(),
            attendanceService.getAllAttendance(),
            certificateService.getAllCertificates(),
          ]);

          setStats([
            ["Total Events", (eventsResponse.data.events || []).length],
            ["Total Users", usersResponse.data.totalUsers || 0],
            ["Total Attendance", registrationsResponse.data.totalPresent || 0],
            ["Attendance Rate", `${registrationsResponse.data.attendanceRate || 0}%`],
            ["Total Certificates", certificatesResponse.data.totalCertificates || 0],
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
                {user?.role === "Student" && (
                  <Link to="/attendance/qr" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                    My QR Code
                  </Link>
                )}
                {user?.role === "Student" && (
                  <Link to="/certificates" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                    My Certificates
                  </Link>
                )}
                {(user?.role === "Admin" || user?.role === "Coordinator") && (
                  <Link to="/attendance/scanner" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                    Attendance Scanner
                  </Link>
                )}
                {(user?.role === "Admin" || user?.role === "Coordinator") && (
                  <Link to="/certificates/generate" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/15">
                    Generate Certificates
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
              {user?.role === "Student" && (
                <Link to="/attendance/history" className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
                  <div className="text-sm font-semibold text-slate-500">Attendance</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-slate-700">History</div>
                  <div className="mt-2 text-sm text-slate-600">Review attended events and check-in history.</div>
                </Link>
              )}
              {user?.role === "Student" && (
                <Link to="/certificates" className="group rounded-3xl border border-amber-200 bg-amber-50 p-5 transition hover:-translate-y-0.5 hover:bg-amber-100 hover:shadow-lg">
                  <div className="text-sm font-semibold text-amber-700">Certificates</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-amber-700">My Certificates</div>
                  <div className="mt-2 text-sm text-slate-600">View earned certificates and download PDF copies.</div>
                </Link>
              )}
              {user?.role === "Student" && (
                <Link to="/attendance/qr" className="group rounded-3xl border border-cyan-200 bg-cyan-50 p-5 transition hover:-translate-y-0.5 hover:bg-cyan-100 hover:shadow-lg">
                  <div className="text-sm font-semibold text-cyan-700">Attendance</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-cyan-700">My QR Code</div>
                  <div className="mt-2 text-sm text-slate-600">Open your registration QR codes for event check-in.</div>
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
                <Link to="/attendance/scanner" className="group rounded-3xl border border-sky-200 bg-sky-50 p-5 transition hover:-translate-y-0.5 hover:bg-sky-100 hover:shadow-lg">
                  <div className="text-sm font-semibold text-sky-700">Attendance</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-sky-700">Scanner</div>
                  <div className="mt-2 text-sm text-slate-600">Open the camera scanner to mark attendance.</div>
                </Link>
              )}
              {(user?.role === "Admin" || user?.role === "Coordinator") && (
                <Link to="/certificates/generate" className="group rounded-3xl border border-amber-200 bg-amber-50 p-5 transition hover:-translate-y-0.5 hover:bg-amber-100 hover:shadow-lg">
                  <div className="text-sm font-semibold text-amber-700">Certificates</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-amber-700">Generate</div>
                  <div className="mt-2 text-sm text-slate-600">Issue certificates for event attendees and manage templates.</div>
                </Link>
              )}
              {user?.role === "Admin" && (
                <Link to="/attendance/report" className="group rounded-3xl border border-rose-200 bg-rose-50 p-5 transition hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-lg">
                  <div className="text-sm font-semibold text-rose-700">Attendance</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-rose-700">Reports</div>
                  <div className="mt-2 text-sm text-slate-600">View attendance statistics and check-in records.</div>
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
