const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    try {
      await Promise.all([
        require('./src/models/certificate.model').syncIndexes(),
        require('./src/models/leaderboard.model').syncIndexes(),
        require('./src/models/result.model').syncIndexes(),
      ]);
    } catch (indexError) {
      console.warn('Index sync skipped or failed:', indexError.message);
    }

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // initialize realtime socket and scheduled jobs
    try {
      const { initSocket } = require("./src/socket/socket");
      initSocket(server);
    } catch (err) {
      console.warn("Socket initialization failed:", err.message);
    }

    try {
      const { startReminders } = require("./src/jobs/reminder.job");
      startReminders();
    } catch (err) {
      console.warn("Reminder job failed to start:", err.message);
    }

    server.on("error", async (error) => {
      if (error.code !== "EADDRINUSE") {
        console.error("Server failed to start:", error.message);
        process.exit(1);
      }

      try {
        const response = await fetch(`http://127.0.0.1:${PORT}/api/health`);
        if (response.ok) {
          console.log(`Server is already running on port ${PORT}`);
          process.exit(0);
        }
      } catch (healthError) {
        console.error(`Port ${PORT} is already in use and no running backend responded on /api/health.`);
        process.exit(1);
      }

      console.error(`Port ${PORT} is already in use.`);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
