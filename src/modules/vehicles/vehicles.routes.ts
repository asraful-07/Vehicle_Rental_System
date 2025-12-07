import express from "express";
import {
  CreateVehiclesController,
  DeleteVehiclesController,
  GetsVehiclesController,
  GetVehiclesController,
  UpdateVehiclesController,
} from "./vehicles.controller";
import auth from "../../middleware/auth";

const router = express.Router();

router.post("/vehicles", auth("admin"), CreateVehiclesController);
router.get("/vehicles", GetsVehiclesController);
router.get("/vehicles/:vehicleId", GetVehiclesController);
router.put("/vehicles/:vehicleId", auth("admin"), UpdateVehiclesController);
router.delete("/vehicles/:vehicleId", auth("admin"), DeleteVehiclesController);

export default router;
