import { Request, Response, NextFunction } from "express";

export const adminOrOwner = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // JWT থেকে আসবে
    const userId = req.params.id; // যাকে update করা হচ্ছে

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Admin হলে সব পারবে
    if (user.role === "admin") {
      return next();
    }

    // ✅ Customer হলে শুধু নিজেরটা
    if (user.role === "customer" && user.userId === userId) {
      return next();
    }

    // ❌ অন্য সবকিছু blocked
    return res.status(403).json({ message: "Forbidden" });
  };
};
