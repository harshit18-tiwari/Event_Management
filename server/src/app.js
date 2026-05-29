const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");
const registrationRoutes = require("./routes/registration.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const certificateRoutes = require("./routes/certificate.routes");
const notificationRoutes = require("./routes/notification.routes");
const announcementRoutes = require("./routes/announcement.routes");
const teamRoutes = require("./routes/team.routes");
const invitationRoutes = require("./routes/invitation.routes");
const teamRegistrationRoutes = require("./routes/teamRegistration.routes");
const judgeRoutes = require("./routes/judge.routes");
const criteriaRoutes = require("./routes/criteria.routes");
const evaluationRoutes = require("./routes/evaluation.routes");

const app = express();

const isAllowedDevOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
  return localhostPattern.test(origin);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV !== "production" && isAllowedDevOrigin(origin)) {
        return callback(null, true);
      }

      const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
      if (!origin || origin === allowedOrigin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/team-registrations", teamRegistrationRoutes);
app.use("/api/judges", judgeRoutes);
app.use("/api/criteria", criteriaRoutes);
app.use("/api/evaluations", evaluationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
