import express from "express";
import initDB from "./config/db";
import usersRoutes from "./modules/users/users.routes";
import authRotes from "./modules/auth/auth.routes";
import vehiclesRoutes from "./modules/vehicles/vehicles.routes";
import bookingRoutes from "./modules/bookings/booking.routes";

export const app = express();
app.use(express.json());

//TODO inti db
initDB();

//* routes
app.use("/api", usersRoutes);
app.use("/api", authRotes);
app.use("/api", vehiclesRoutes);
app.use("/api", bookingRoutes);
