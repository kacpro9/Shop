import "dotenv/config";
import config from "./config";
import express from "express";
import cors from "cors";
import mongoose, { mongo } from "mongoose";

//ROUTES
import authRouter from "./app/routes/Auth.routes";
import userRoutes from "./app/routes/User.routes";
import adminUserRoutes from "./app/routes/AdminUser.routes";
import partRoutes from "./app/routes/Part.routes";
import orderRoutes from "./app/routes/Orders.routes";

const mongoUrl = `mongodb://${config.db.host}:${config.db.port}/${config.db.name}`;

async function start() {
  await mongoose.connect(mongoUrl);
  console.log(`Connected to database at ${mongoUrl}`);

  const app = express();

  app.use(express.json());

  app.use(cors());

  //test is server is running
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  //ROUTES
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRoutes);
  app.use("/api/admin/users", adminUserRoutes);

  app.use("/api/parts", partRoutes);
  app.use("/api/orders", orderRoutes);

  app.listen(config.app.port, () => {
    console.log(`Server is running on port ${config.app.port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
