import config from "./config";
import express from "express";
import cors from "cors";
import mongoose, { mongo } from "mongoose";
const mongoUrl = `mongodb://${config.db.host}:${config.db.port}/${config.db.name}`;

async function start() {
  await mongoose.connect(mongoUrl);
  console.log(`Connected to database at ${mongoUrl}`);

  const app = express();
  app.use(cors());

  app.listen(config.app.port, () => {
    console.log(`Server is running on port ${config.app.port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
