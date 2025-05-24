import express from "express";
import { neon } from "@neondatabase/serverless";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const drivers = await sql`SELECT * FROM drivers`;
    res.json({ data: drivers });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
