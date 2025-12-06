import express from "express";
import {
  CreateUserController,
  DeleteUserController,
  GetsUserController,
  GetUserController,
  UpdateUserController,
} from "./users.controller";

const router = express.Router();
// router.put("/users/:id", auth(), adminOrOwner(), UpdateUserController);
router.post("/v1/auth/signup", CreateUserController);
router.get("/v1/users", GetsUserController);
router.get("/v1/users/:userId", GetUserController);
router.put("/v1/users/:userId", UpdateUserController);
router.delete("/v1/users/:userId", DeleteUserController);

export default router;
