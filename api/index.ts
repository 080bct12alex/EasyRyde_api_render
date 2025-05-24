import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import driversRoutes from "../routes/drivers";
import usersRoutes from "../routes/users";
import ridesRoutes from "../routes/rides";
import stripeRoutes from "../routes/stripe";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/driver", driversRoutes);
app.use("/api/user", usersRoutes);
app.use("/api/ride", ridesRoutes);
app.use("/api/stripe", stripeRoutes);

app.get("/", (_req, res) => {
  res.send("EasyRyde backend is running.");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
