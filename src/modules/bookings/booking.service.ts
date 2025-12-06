import { pool } from "../../config/db";

export const BookingVehiclesService = async (payload: Record<string, any>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  // 1. Get vehicle price
  const vehicleResult = await pool.query(
    `SELECT daily_rent_price FROM vehicles WHERE id = $1`,
    [vehicle_id]
  );

  if (vehicleResult.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const dailyPrice = vehicleResult.rows[0].daily_rent_price;

  // 2. Calculate days
  const startDate = new Date(rent_start_date);
  const endDate = new Date(rent_end_date);

  const timeDifference = endDate.getTime() - startDate.getTime();
  const number_of_days = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  // 3. Calculate total price
  const total_price = dailyPrice * number_of_days;

  const status = "active";

  // 4. Insert booking
  const result = await pool.query(
    `INSERT INTO bookings 
     (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      total_price,
      status,
    ]
  );

  return {
    ...result.rows[0],
  };
};

const GetsBookService = async () => {
  const result = await pool.query(`SELECT * FROM `);
};

const UpdateBookVehiclesService = async (payload: Record<string, unknown>) => {
  const { rent_start_date, rent_end_date, total_price, status } = payload;
};
