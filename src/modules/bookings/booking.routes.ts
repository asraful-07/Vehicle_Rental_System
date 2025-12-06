import express from "express";
import { BookVeController, GetsBookingsHandler } from "./booking.controller";
import auth from "../../middleware/auth";

const router = express.Router();

router.post("/v1/bookings", auth("customer", "admin"), BookVeController);
router.get("/v1/bookings", auth("customer", "admin"), GetsBookingsHandler);

export default router;
