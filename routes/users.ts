import express from "express";
import { neon } from "@neondatabase/serverless";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, clerkId } = req.body;

  if (!name || !email || !clerkId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      INSERT INTO users (name, email, clerk_id)
      VALUES (${name}, ${email}, ${clerkId})
    `;
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
