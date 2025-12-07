import { pool } from "../../config/db";

export const BookingVehiclesService = async (payload: Record<string, any>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

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

  const startDate = new Date(rent_start_date);
  const endDate = new Date(rent_end_date);

  if (endDate < startDate) {
    throw new Error("End date must be after start date");
  }

  const timeDifference = endDate.getTime() - startDate.getTime();
  const number_of_days = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  const total_price = dailyPrice * number_of_days;

  const status = "active";

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

  if (bookingResult.rows.length > 0 && status === "active") {
    await pool.query(
      `UPDATE vehicles
       SET availability_status = 'booked'
       WHERE id = $1`,
      [vehicle_id]
    );
  }

  const booking = bookingResult.rows[0];

  const vehicleInfo = {
    vehicle_name: vehicle.vehicle_name,
    daily_rent_price: vehicle.daily_rent_price,
  };

  return {
    ...booking,
    vehicle: vehicleInfo,
  };
};

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

export const UpdateBookingService = async (payload: Record<string, any>) => {
  const { booking_id, status, user } = payload;

  const bookingResult = await pool.query(
    `SELECT * FROM bookings WHERE id = $1`,
    [booking_id]
  );

  if (bookingResult.rows.length === 0) {
    throw new Error("Booking not found");
  }

  const booking = bookingResult.rows[0];

  if (user.role === "customer") {
    if (booking.customer_id !== user.id) {
      throw new Error("You can only update your own booking");
    }

    if (status !== "cancelled") {
      throw new Error("Customer can only cancel booking");
    }
  }

  if (user.role === "admin") {
    if (status !== "returned") {
      throw new Error("Admin can only mark as returned");
    }
  }

  const updatedBooking = await pool.query(
    `UPDATE bookings
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, booking_id]
  );

  let vehicleData = null;

  if (status === "cancelled" || status === "returned") {
    const vehicleRes = await pool.query(
      `UPDATE vehicles
       SET availability_status = 'available'
       WHERE id = $1
       RETURNING availability_status`,
      [booking.vehicle_id]
    );

    vehicleData = {
      availability_status: vehicleRes.rows[0].availability_status,
    };
  }

  if (status === "returned") {
    return {
      ...updatedBooking.rows[0],
      vehicle: vehicleData,
    };
  }

  return updatedBooking.rows[0];
};

export const autoReturnExpiredBookings = async () => {
  const expiredBookings = await pool.query(`
    SELECT * FROM bookings
    WHERE status = 'active'
    AND rent_end_date < NOW()
  `);

  for (const booking of expiredBookings.rows) {
    await pool.query(
      `
      UPDATE bookings
      SET status = 'returned', updated_at = NOW()
      WHERE id = $1
    `,
      [booking.id]
    );

    await pool.query(
      `
      UPDATE vehicles
      SET availability_status = 'available'
      WHERE id = $1
    `,
      [booking.vehicle_id]
    );
  }
};
