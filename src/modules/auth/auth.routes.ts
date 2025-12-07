import express from "express";
import { CreateUserController, LoginController } from "./auth.controller";

const router = express.Router();

router.post("/auth/signup", CreateUserController);
router.post("/auth/signin", LoginController);

export default router;
