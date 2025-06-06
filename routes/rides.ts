import express from "express";
import { neon } from "@neondatabase/serverless";

const router = express.Router();

// Create ride
router.post("/create", async (req, res) => {
  const {
    origin_address,
    destination_address,
    origin_latitude,
    origin_longitude,
    destination_latitude,
    destination_longitude,
    ride_time,
    fare_price,
    payment_status,
    driver_id,
    user_id,
  } = req.body;

  if (
    !origin_address || !destination_address || !origin_latitude ||
    !origin_longitude || !destination_latitude || !destination_longitude ||
    !ride_time || !fare_price || !payment_status || !driver_id || !user_id
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const response = await sql`
      INSERT INTO rides (
        origin_address, destination_address,
        origin_latitude, origin_longitude,
        destination_latitude, destination_longitude,
        ride_time, fare_price, payment_status,
        driver_id, user_id
      ) VALUES (
        ${origin_address}, ${destination_address},
        ${origin_latitude}, ${origin_longitude},
        ${destination_latitude}, ${destination_longitude},
        ${ride_time}, ${fare_price}, ${payment_status},
        ${driver_id}, ${user_id}
      ) RETURNING *
    `;
    res.status(201).json({ data: response[0] });
  } catch (error) {
    console.error("Error inserting ride:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get rides by user ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "Missing user ID" });

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const response = await sql`
      SELECT
        rides.ride_id, rides.origin_address, rides.destination_address,
        rides.origin_latitude, rides.origin_longitude,
        rides.destination_latitude, rides.destination_longitude,
        rides.ride_time, rides.fare_price, rides.payment_status,
        rides.created_at,
        json_build_object(
          'driver_id', drivers.id,
          'first_name', drivers.first_name,
          'last_name', drivers.last_name,
          'profile_image_url', drivers.profile_image_url,
          'car_image_url', drivers.car_image_url,
          'car_seats', drivers.car_seats,
          'rating', drivers.rating
        ) AS driver
      FROM rides
      INNER JOIN drivers ON rides.driver_id = drivers.id
      WHERE rides.user_id = ${id}
      ORDER BY rides.created_at DESC;
    `;
    res.json({ data: response });
  } catch (error) {
    console.error("Error fetching rides:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
