import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { loginHandler, meHandler, registerHandler } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), asyncHandler(registerHandler));
authRouter.post("/login", validateBody(loginSchema), asyncHandler(loginHandler));
authRouter.get("/me", authenticate, asyncHandler(meHandler));
