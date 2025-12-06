import { Request, Response } from "express";
import {
  CreateUserService,
  DeleteUserService,
  GetsUserService,
  GetUserService,
  UpdateUserService,
} from "./users.service";

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

export const GetsUserController = async (req: Request, res: Response) => {
  try {
    const user = await GetsUserService();

    if (!user || user.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user.rows,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const GetUserController = async (req: Request, res: Response) => {
  try {
    const user = await GetUserService(req.params.userId as string);

    if (!user || user.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const UpdateUserController = async (req: Request, res: Response) => {
  try {
    const user = await UpdateUserService(req.body, req.params.userId as string);

    if (!user || user.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const DeleteUserController = async (req: Request, res: Response) => {
  try {
    const user = await DeleteUserService(req.params.userId as string);

    if (!user || user.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
