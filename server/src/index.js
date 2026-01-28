import dotenv from "dotenv";

dotenv.config();

// start the server (server.js runs the listener)
import "./server.js";

process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("SIGINT", () => {
  // eslint-disable-next-line no-console
  console.log("SIGINT received, exiting");
  process.exit(0);
});
