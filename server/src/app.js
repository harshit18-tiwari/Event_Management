const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");
const registrationRoutes = require("./routes/registration.routes");
const attendanceRoutes = require("./routes/attendance.routes");

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

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
