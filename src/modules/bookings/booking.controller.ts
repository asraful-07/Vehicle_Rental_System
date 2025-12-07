import { Request, Response } from "express";
import {
  autoReturnExpiredBookings,
  BookingVehiclesService,
  GetsBookingsService,
  GetsCustomerBookingsService,
  UpdateBookingService,
} from "./booking.service";

export const BookVeController = async (req: Request, res: Response) => {
  try {
    const customer_id = (req.user as any).id;

    const { vehicle_id, rent_start_date, rent_end_date } = req.body;

    if (!vehicle_id || !rent_start_date || !rent_end_date) {
      return res.status(400).json({
        success: false,
        message: "vehicle_id, rent_start_date and rent_end_date are required",
      });
    }

    const booking = await BookingVehiclesService({
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const GetsBookingsHandler = async (req: Request, res: Response) => {
  try {
    await autoReturnExpiredBookings();

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { role, id } = req.user;

    if (role === "admin") {
      const bookings = await GetsBookingsService();
      return res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings,
      });
    } else if (role === "customer") {
      const bookings = await GetsCustomerBookingsService(id);
      return res.status(200).json({
        success: true,
        message: "Your bookings retrieved successfully",
        data: bookings,
      });
    } else {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const UpdateController = async (req: Request, res: Response) => {
  try {
    const booking_id = Number(req.params.bookingId);
    const user = req.user as any;
    const { status } = req.body;

    if (!booking_id || !status) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and status are required",
      });
    }

    const result = await UpdateBookingService({
      booking_id,
      status,
      user,
    });

    res.status(200).json({
      success: true,
      message:
        status === "cancelled"
          ? "Booking cancelled successfully"
          : "Booking marked as returned. Vehicle is now available",
      data: result,
    });
  } catch (error: any) {
    res.status(403).json({
      success: false,
      message: error.message,
    });
  }
};
