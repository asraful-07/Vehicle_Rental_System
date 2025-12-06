import { pool } from "../../config/db";

export const BookingVehiclesService = async (payload: Record<string, any>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  // 1. Check if vehicle exists and get daily price
  const vehicleResult = await pool.query(
    `SELECT * FROM vehicles WHERE id = $1`,
    [vehicle_id]
  );

  if (vehicleResult.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const vehicle = vehicleResult.rows[0];

  if (vehicle.availability_status === "booked") {
    throw new Error("Vehicle is already booked");
  }

  const dailyPrice = vehicle.daily_rent_price;

  // 2. Calculate number of days
  const startDate = new Date(rent_start_date);
  const endDate = new Date(rent_end_date);

  if (endDate < startDate) {
    throw new Error("End date must be after start date");
  }

  const timeDifference = endDate.getTime() - startDate.getTime();
  const number_of_days = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  // 3. Calculate total price
  const total_price = dailyPrice * number_of_days;

  const status = "active";

  // 4. Insert booking
  const bookingResult = await pool.query(
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

  // 5. Update vehicle status if booking is active
  if (bookingResult.rows.length > 0 && status === "active") {
    await pool.query(
      `UPDATE vehicles
       SET availability_status = 'booked'
       WHERE id = $1`,
      [vehicle_id]
    );
  }

  const booking = bookingResult.rows[0];

  // 6. Add vehicle info to response
  const vehicleInfo = {
    vehicle_name: vehicle.vehicle_name,
    daily_rent_price: vehicle.daily_rent_price,
  };

  return {
    ...booking,
    vehicle: vehicleInfo,
  };
};

// Service for all bookings (Admin)
export const GetsBookingsService = async () => {
  const result = await pool.query(`
    SELECT b.*, 
           json_build_object(
             'name', u.name,
             'email', u.email
           ) AS customer,
           json_build_object(
             'vehicle_name', v.vehicle_name,
             'registration_number', v.registration_number
           ) AS vehicle
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN vehicles v ON b.vehicle_id = v.id
    ORDER BY b.rent_start_date DESC
  `);
  return result.rows;
};

//! Service for customer's bookings
export const GetsCustomerBookingsService = async (customer_id: number) => {
  const result = await pool.query(
    `
    SELECT b.*,
           json_build_object(
             'vehicle_name', v.vehicle_name,
             'registration_number', v.registration_number,
             'type', v.type
           ) AS vehicle
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.customer_id = $1
    ORDER BY b.rent_start_date DESC
  `,
    [customer_id]
  );
  return result.rows;
};

// Optional: Update booking (example)
const UpdateBookingService = async (payload: Record<string, any>) => {
  const { booking_id, rent_start_date, rent_end_date, status } = payload;

  // Recalculate total_price if dates changed
  let total_price: number | undefined = undefined;
  if (rent_start_date && rent_end_date) {
    const startDate = new Date(rent_start_date);
    const endDate = new Date(rent_end_date);
    const timeDifference = endDate.getTime() - startDate.getTime();
    const number_of_days = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    // Get daily price of vehicle
    const booking = await pool.query(
      `SELECT vehicle_id FROM bookings WHERE id = $1`,
      [booking_id]
    );
    if (booking.rows.length === 0) throw new Error("Booking not found");

    const vehicle = await pool.query(
      `SELECT daily_rent_price FROM vehicles WHERE id = $1`,
      [booking.rows[0].vehicle_id]
    );
    total_price = vehicle.rows[0].daily_rent_price * number_of_days;
  }

  const result = await pool.query(
    `UPDATE bookings
     SET rent_start_date = COALESCE($1, rent_start_date),
         rent_end_date = COALESCE($2, rent_end_date),
         total_price = COALESCE($3, total_price),
         status = COALESCE($4, status),
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [rent_start_date, rent_end_date, total_price, status, booking_id]
  );

  // If status updated, also update vehicle availability
  if (status) {
    const booking = result.rows[0];
    const vehicleStatus = status === "active" ? "booked" : "available";
    await pool.query(
      `UPDATE vehicles SET availability_status = $1 WHERE id = $2`,
      [vehicleStatus, booking.vehicle_id]
    );
  }

  return result.rows[0];
};
