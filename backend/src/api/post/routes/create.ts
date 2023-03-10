import { Request, Response, Router } from "express";
import { checkSchema } from "express-validator";
import createSchema from "../schemas/createSchema";
import { createError, validate } from "../../helpers";
import { logger } from "../../../shared";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status";
import { S3Client } from "../../aws";
import { Errors } from "../../errors";
import { S3 } from "aws-sdk";
import Post from "../models";

const router = Router();

const s3 = new S3Client();

/**
 * @openapi
 * /post:
 *  post:
 *    summary: Creates a new post
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *           type: object
 *           required:
 *             - description
 *             - band
 *             - brand
 *             - metersFromSea
 *             - boomLengthCm
 *             - numberOfElements
 *             - numberOfAntennas
 *             - cable
 *             - filesPath
 *           properties:
 *             description:
 *               type: string
 *               minLength: 1
 *               description: Description of the event
 *             band:
 *               type: string
 *               enum: [144, 432, 1200]
 *               description: Frequency band of the antenna
 *             brand:
 *               type: string
 *               minLength: 0
 *               maxLength: 30
 *               description: Brand of the antenna
 *             isSelfBuilt:
 *               type: boolean
 *               description: Whether this antenna was self built
 *             metersFromSea:
 *               type: number
 *               maximum: 10000
 *               description: Height from sea level (in meters)
 *             boomLengthCm:
 *               type: number
 *               minimum: 0
 *               maximum: 100000
 *               description: Length of the boom (in centimeters)
 *             numberOfElements:
 *               type: integer
 *               minimum: 1
 *               maximum: 300
 *               description: Number of elements of this antenna
 *             numberOfAntennas:
 *               type: integer
 *               minimum: 0
 *               maximum: 100
 *               description: Number of coupled antennas (0 if none)
 *             cable:
 *               type: string
 *               minLength: 0
 *               maxLength: 100
 *               description: Brand, type, length... of the cable used for this antenna
 *             filesPath:
 *               type: array
 *               items:
 *                 type: string
 *               description: Paths of the files uploaded by the user
 *    tags:
 *      - post
 *    responses:
 *      '200':
 *        description: Post created successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      '400':
 *        description: Data validation failed
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ResErr'
 *      '401':
 *        description: Not logged in
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
router.post(
    "/",
    checkSchema(createSchema),
    validate,
    async (req: Request, res: Response) => {
        // DEBUG TO IMPLEMENT!!
        try {
            const {
                description,
                band,
                brand,
                metersFromSea,
                boomLengthCm,
                numberOfElements,
                numberOfAntennas,
                cable,
                filesPath
            } = req.body;

            logger.debug("Checking files");

            const metas: AWS.S3.HeadObjectOutput[] = [];
            for (const p of filesPath) {
                try {
                    const meta = await s3.getFileMeta({ filePath: p });
                    metas.push(meta);
                } catch (err) {
                    if ((err as Error).name === "NotFound") {
                        logger.debug("File not found");
                        return res
                            .status(BAD_REQUEST)
                            .json(createError(Errors.FILE_NOT_FOUND));
                    }
                    logger.error("Error while getting file meta");
                    return res
                        .status(INTERNAL_SERVER_ERROR)
                        .json(createError());
                }
            }

            const pictures: S3.HeadObjectOutput[] = [];
            const videos: S3.HeadObjectOutput[] = [];
            for (const m of metas) {
                if (m.ContentType?.includes("image")) {
                    pictures.push(m);
                } else if (m.ContentType?.includes("video")) {
                    videos.push(m);
                } else {
                    logger.error("Error while reading meta of file");
                    // DEBUG delete all other files
                    return res
                        .status(INTERNAL_SERVER_ERROR)
                        .json(createError());
                }
            }

            if (pictures.length > 10) {
                return res
                    .status(BAD_REQUEST)
                    .json(createError(Errors.INVALID_PICS_NUM));
            } else if (videos.length > 2) {
                return res
                    .status(BAD_REQUEST)
                    .json(createError(Errors.INVALID_VIDS_NUM));
            }

            logger.debug("Creating post with following params");
            logger.debug({
                description,
                band,
                brand,
                metersFromSea,
                boomLengthCm,
                numberOfElements,
                numberOfAntennas,
                cable,
                pictures,
                videos
            });
            const post = new Post({
                description,
                band,
                brand,
                metersFromSea,
                boomLengthCm,
                numberOfElements,
                numberOfAntennas,
                cable,
                pictures,
                videos
            });
            try {
                await post.validate();
            } catch (err) {
                logger.error("Error while validating post");
                logger.error(err);
                return res
                    .status(BAD_REQUEST)
                    .json(createError(Errors.INVALID_POST));
            }

            await post.save();

            res.json(post.toObject());
        } catch (err) {
            logger.error("Error while creating post");
            logger.error(err);
            res.status(INTERNAL_SERVER_ERROR).json(createError());
        }
    }
);

export default router;
