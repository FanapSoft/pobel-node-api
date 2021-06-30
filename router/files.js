
import {asyncWrapper} from "../utils/asyncWrapper.js";
import filesController from "../Controllers/api/Files.js";
import {body, check, validationResult} from 'express-validator';

export default function (router) {
    /**
     * @swagger
     * /api/File/Dataset/Item/{id}:
     *   get:
     *     tags:
     *       - Files
     *     description: Get one datasetItem image
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: params
     *     responses:
     *       200:
     *         type: object
     *         description: produces small image with 150px width and auto height
     *
     */
    router.get("/api/File/Dataset/Item/:id", [
        check('id').notEmpty().isLength({max:50}).escape()
    ], asyncWrapper(filesController.streamDatasetImages));
    /**
     * @swagger
     * /api/File/Dataset/Item/{id}/original:
     *   get:
     *     tags:
     *       - Files
     *     description: Get one datasetItem image
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: params
     *     responses:
     *       200:
     *         type: object
     *         description: Streams the related image
     *
     */
    router.get("/api/File/Dataset/Item/:id/original", [
        check('id').notEmpty().isLength({max:50}).escape()
    ], asyncWrapper(filesController.streamDatasetImagesOriginal));
}
