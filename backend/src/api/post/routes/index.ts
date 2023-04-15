import { Router } from "express";
import isLoggedIn from "../../middlewares/isLoggedIn";
import isVerified from "../../middlewares/isVerified";

import allRoute from "./all";
import approveRoute from "./approve";
import getRoute from "./get";
import createRoute from "./create";
import deleteRoute from "./delete";
import uploadFilesRoute from "./upload";

const router = Router();

router.use("/", allRoute);
router.use("/approve", approveRoute);
router.use("/", getRoute);
router.use("/", isLoggedIn, isVerified, createRoute);
router.use("/", isLoggedIn, isVerified, deleteRoute);
router.use("/upload", isLoggedIn, isVerified, uploadFilesRoute);

export default router;