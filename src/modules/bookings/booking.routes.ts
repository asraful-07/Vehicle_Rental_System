import express from "express";
import {
  BookVeController,
  GetsBookingsHandler,
  UpdateController,
} from "./booking.controller";
import auth from "../../middleware/auth";

const router = express.Router();

router.post("/bookings", auth("admin", "customer"), BookVeController);
router.get("/bookings", auth("admin", "customer"), GetsBookingsHandler);
router.put("/bookings/:bookingId", auth("admin", "customer"), UpdateController);

export default router;
