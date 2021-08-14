/**
 * @swagger
 *  components:
 *   schemas:
 *     AnswerPack:
 *       type: object
 *       required:
 *         - Title
 *       properties:
 *         Id:
 *           type: string
 *           format: uuid
 *           description: Auto generated unique id
 *         Title:
 *           type: string
 *     AnswerPacksPaged:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/AnswerPack"
 *           nullable: true
 */
import {asyncWrapper} from "../utils/asyncWrapper.js";
import {body, check, validationResult} from 'express-validator';
import answerPacksController from "../controllers/api/AnswerPacks";

export default function (router) {
    /**
     * @swagger
     * /api/AnswerPacks/GetAll:
     *   get:
     *     tags:
     *       - AnswerPacks
     *     description: Get a list of answerPacks
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: An array of answerPacks
     *         type: array
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/AnswerPacksPaged"
     *
     */
    router.get("/api/AnswerPacks/GetAll", asyncWrapper(answerPacksController.findAll));
}
