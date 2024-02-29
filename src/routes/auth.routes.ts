import { Router } from "express";
import { userLogin, userSignup } from "../controllers/auth.controller";

const router: Router = Router();

router.post("/signup", userSignup);
router.post("/login", userLogin);

export default router;
