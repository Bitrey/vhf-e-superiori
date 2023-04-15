import { Request, Response, Router } from "express";
import { logger } from "../../../shared";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NO_CONTENT } from "http-status";
import fileUpload from "express-fileupload";
import { Errors } from "../../errors";
import { createError } from "../../helpers";
import { UserDoc } from "../../auth/models";
import { s3Client } from "../../aws";
import { compressVideos } from "../../videoCompressor/compressorInterface";
import { basename } from "path";

const router = Router();

/**
 * @openapi
 * /post/upload:
 *  post:
 *    summary: Upload files
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              content:
 *                type: string
 *                format: binary
 *                description: Pictures or videos of the post
 *            required:
 *              - content
 *    tags:
 *      - post
 *    responses:
 *      '200':
 *        description: Files uploaded successfully
 *      '204':
 *        description: No file specified
 *      '400':
 *        description: File MIME type not allowed
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ResErr'
 *      '401':
 *        description: Not logged in or not verified
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
    // body("pictures").isArray(),
    // validate,
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new Error("No req.user in post file upload");
        } else if (!req.files) {
            logger.info("No files to upload");
            return res.sendStatus(NO_CONTENT);
        }

        const _file = req.files.content;
        const fileArr: fileUpload.UploadedFile[] = Array.isArray(_file)
            ? _file
            : [_file];

        logger.info("Uploading files");
        logger.info(fileArr);

        const pathsArr: string[] = [];

        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "video/quicktime",
            "video/x-msvideo",
            "video/x-ms-wmv"
        ];

        // Check files MIME type and size (max 50MB)
        logger.debug("Checking files MIME type and size");
        for (const f of fileArr) {
            logger.debug(`Checking file ${f.name} MIME type`);
            if (!allowedMimeTypes.includes(f.mimetype)) {
                logger.debug("File MIME type not allowed for file " + f.name);
                return res
                    .status(BAD_REQUEST)
                    .json(createError(Errors.INVALID_FILE_MIME_TYPE));
            } else if (f.size > 300 * 1024 * 1024) {
                logger.debug("File size too big for file " + f.name);
                return res
                    .status(BAD_REQUEST)
                    .json(createError(Errors.FILE_SIZE_TOO_LARGE));
            }
        }

        // DEBUG COMPRESS FILES!!
        // logger.warn("Compress files not implemented");

        // Compress videos
        const vidsToCompress = fileArr.filter(f =>
            f.mimetype.includes("video")
        );
        const rest = fileArr.filter(f => !f.mimetype.includes("video"));

        if (rest.length > 5) {
            return res
                .status(BAD_REQUEST)
                .json(createError(Errors.TOO_MANY_PICTURES));
        } else if (vidsToCompress.length > 2) {
            return res
                .status(BAD_REQUEST)
                .json(createError(Errors.TOO_MANY_VIDEOS));
        }

        let compressedVidsPaths: string[];
        try {
            compressedVidsPaths = await compressVideos(
                vidsToCompress.map(f => f.tempFilePath)
            );
        } catch (err) {
            logger.error("Error compressing videos");
            logger.error(err);
            return res.status(INTERNAL_SERVER_ERROR).json(createError());
        }

        const filesToUpload: {
            name: string;
            tempFilePath: string;
            mimetype: string;
        }[] = [
            ...rest,
            ...compressedVidsPaths.map(p => ({
                name: basename(p),
                tempFilePath: p,
                mimetype: "video/mp4"
            }))
        ];

        logger.info("Uploading files to S3");
        for (const f of filesToUpload) {
            logger.info("Uploading file: " + f.name);
            try {
                const path = await s3Client.uploadFile({
                    fileName: s3Client.generateFileName({
                        userId: (req.user as unknown as UserDoc)._id,
                        mimeType: f.mimetype
                    }),
                    filePath: f.tempFilePath,
                    mimeType: f.mimetype,
                    folder: f.mimetype.includes("image") ? "pics" : "vids"
                });
                pathsArr.push(path);
                logger.info("File uploaded: " + f.name);
            } catch (err) {
                logger.error("Error uploading file: " + f.name);
                logger.error(err);
                for (const uploadFile of pathsArr) {
                    logger.info("Deleting file: " + uploadFile);
                    await s3Client.deleteFile({ filePath: uploadFile });
                    logger.info("Deleted file: " + uploadFile);
                }
                return res.status(INTERNAL_SERVER_ERROR).json(createError());
            }
        }

        logger.info("Uploaded files: " + pathsArr.join(", "));
        return res.json(pathsArr);
    }
);

export default router;