import { Router } from "express";

import authRoutes from "../auth/routes";
import eventRoutes from "../event/routes";
import joinRequestRoutes from "../joinRequest/routes";
import qrzRoutes from "../qrz/routes";
import counterRoutes from "../counter/routes";

import errorHandler from "../middlewares/errorHandler";
import populateUser from "../middlewares/populateUser";

import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { logger, LoggerStream } from "../../shared/logger";
import { envs } from "../../shared/envs";
import path from "path";
import fs from "fs";
import process from "process";

const router = Router();

router.use(morgan("dev", { stream: new LoggerStream() }));

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.use(cookieParser(envs.COOKIE_SECRET));

router.use(populateUser);

const tempFileDir = path.join(process.cwd(), envs.TEMP_DIR_RELATIVE);
logger.debug("Temp file dir is " + tempFileDir);

if (!fs.existsSync(tempFileDir)) {
    logger.debug("Creating temp file dir");
    try {
        fs.mkdirSync(tempFileDir);
    } catch (err) {
        logger.error("Error while creating temp file dir");
        logger.error(err);
        process.exit(1);
    }
}
// max size is 50MB
router.use(
    fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
        abortOnLimit: true,
        useTempFiles: true,
        safeFileNames: true,
        preserveExtension: true,
        tempFileDir
    })
);

router.use("/auth", authRoutes);
router.use("/event", eventRoutes);
router.use("/joinrequest", joinRequestRoutes);
router.use("/qrz", qrzRoutes);
router.use("/counter", counterRoutes);

router.use(errorHandler);

export default router;
