import { Errors } from "../api/errors";
import { logger } from "./logger";

const requiredEnvs = [
    "NODE_ENV",
    "PORT",
    "JWT_SECRET",
    "COOKIE_SECRET",
    "MONGODB_URI",
    "QRZ_USERNAME",
    "QRZ_PASSWORD",
    "RECAPTCHA_SECRET",
    "MAIL_SERVER",
    "MAIL_USERNAME",
    "MAIL_PASSWORD",
    "SEND_EMAIL_FROM",
    "TOT_ADMIN_EMAILS"
] as const;
export type Env = typeof requiredEnvs[number];

for (const e of requiredEnvs) {
    logger.debug("Checking env " + e);
    if (!(e in process.env)) {
        logger.error(Errors.MISSING_ENV + ": " + e);
        process.exit(1);
    }
}

type Envs = {
    [env in Env]: string;
};

export const envs: Envs = process.env as never;
