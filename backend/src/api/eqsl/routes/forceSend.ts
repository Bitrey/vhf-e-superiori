import { Request, Response, Router } from "express";
import { param } from "express-validator";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status";
import { logger } from "../../../shared/logger";
import { Errors } from "../../errors";
import { createError, validate } from "../../helpers";
import User, { UserDoc } from "../../auth/models";
import isLoggedIn from "../../middlewares/isLoggedIn";
import JoinRequest from "../../joinRequest/models";
import { Qso } from "../../qso/models";
import previewRoute from "./preview";
import Event from "../../event/models";
import { qrz } from "../../qrz";

const router = Router();

/**
 * @openapi
 * /api/eqsl/forcesend/{id}:
 *  get:
 *    summary: (Forcibly) send an eQSL image, creating it if it doesn't exist
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          format: ObjectId
 *        required: true
 *        description: ObjectId of the QSO
 *    tags:
 *      - eqsl
 *    responses:
 *      '200':
 *        description: Image href of the created eQSL
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      '401':
 *        description: Not authorized to send eQSL
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ResErr'
 *      '500':
 *        description: Server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ResErr'
 */
router.get(
    "/:_id",
    isLoggedIn,
    param("_id").isMongoId(),
    validate,
    async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                throw new Error("No req.user in user change pw");
            }

            const user = await User.findOne({
                _id: (req.user as unknown as UserDoc)._id
            });
            if (!user) {
                throw new Error("User not found in eqsl create");
            }

            const qso = await Qso.findOne({ _id: req.params._id });
            if (!qso) {
                return res
                    .status(BAD_REQUEST)
                    .json(createError(Errors.QSO_NOT_FOUND));
            }

            const event = await Event.findOne({ _id: qso.event });
            if (!event) {
                return res
                    .status(BAD_REQUEST)
                    .json(createError(Errors.EVENT_NOT_FOUND));
            }

            if (!user.isAdmin) {
                const joinRequest = await JoinRequest.findOne({
                    fromUser: (req.user as unknown as UserDoc)._id,
                    forEvent: qso.event,
                    isApproved: true
                });
                if (!joinRequest) {
                    logger.debug("Join request not found");
                    return res
                        .status(401)
                        .json(createError(Errors.NOT_AUTHORIZED_TO_EQSL));
                }
            }

            if (!event.eqslUrl) {
                logger.debug("Event has no eQSL URL");
                return res
                    .status(BAD_REQUEST)
                    .json(createError(Errors.NO_IMAGE_TO_EQSL));
            }

            // if callsign has prefix or suffix, get the longest one
            const _callsigns = qso.callsign.split("/");
            _callsigns.sort((a, b) => b.length - a.length);
            const callsignClean = _callsigns[0];

            const toUser = await User.findOne(
                qso.toStation
                    ? { _id: qso.toStation }
                    : {
                          callsign: callsignClean
                      }
            );

            const email =
                toUser?.email || (await qrz.scrapeEmail(callsignClean));

            if (!email) {
                logger.warn(
                    `Force send QSO, event ${event.name} QSO ${qso._id} no email found`
                );
                return res
                    .status(BAD_REQUEST)
                    .json(createError(Errors.NO_EMAIL_FOUND));
            }

            let edited = false;
            if (!qso.toStation && toUser) {
                qso.toStation = toUser._id;
                edited = true;
            }
            if (!qso.email) {
                qso.email = email;
                edited = true;
            }
            if (edited) {
                await qso.save();
            }

            const href = await qso.sendEqsl(
                event._id.toString(),
                event.eqslUrl
            );
            res.status(200).json({ href });
        } catch (err) {
            logger.error("Error creating eQSL in eQSL force send");
            logger.error(err);
            res.status(INTERNAL_SERVER_ERROR).json(
                createError(Errors.ERROR_CREATING_IMAGE)
            );
        }
    }
);

router.use("/preview", previewRoute);

export default router;