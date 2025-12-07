import { Request, Response } from "express";
import { CreateUserService, LoginService } from "./auth.service";

export const CreateUserController = async (req: Request, res: Response) => {
  try {
    const user = await CreateUserService(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const LoginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await LoginService(email, password);

    res.status(200).json({ success: "Login successful", data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
