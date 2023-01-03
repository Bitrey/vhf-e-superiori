import { Router, Response } from "express";
import loginRoute from "./login";
import signupRoute from "./signup";
import logoutRoute from "./logout";
import viewRoute from "./view";
import { AuthOptions } from "../shared";
import { logger } from "../../../shared";
const router = Router();

logger.debug("Using auth routes");

export const saveToken = (res: Response, token: string) => {
    res.cookie(AuthOptions.AUTH_COOKIE_NAME, token, {
        signed: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 3
    });
};

router.use("/login", loginRoute);
router.use("/signup", signupRoute);
router.use("/logout", logoutRoute);
router.use("/", viewRoute);

export default router;