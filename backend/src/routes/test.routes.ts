// routes/test.route.ts
import { Router, Request } from "express";
import { authenticate } from "../middleware/auth.middleware";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const router = Router();

router.get("/protected", authenticate, (req, res) => {
  res.json({
    message: "You accessed a protected route",
    user: req.user,
  });
});

export default router;