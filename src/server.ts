import path from "path";
import { app } from "./app";
import fs from "fs";

const port = parseInt(process.env.PORT || "8001");

// Start the server
const start = async () => {
  try {
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`Server running on port: ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
