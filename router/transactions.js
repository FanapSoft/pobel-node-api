/**
 * @swagger
 *  components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *       properties:
 *         Id:
 *           type: string
 *           format: uuid
 *           description: Auto generated unique id
 *         CreatedAt:
 *           type: datetime
 *         UpdatedAt:
 *           type: string
 *         OwnerId:
 *           type: boolean
 *         DebitAmount:
 *           type: string
 *         CreditAmount:
 *           type: string
 *         Reason:
 *           type: string
 *         ReasonDescription:
 *           type: string
 *         ReferenceDatasetId:
 *           type: string
 *     TransactionsPaged:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Transaction"
 *           nullable: true
 */
import {asyncWrapper} from "../utils/asyncWrapper.js";
import answersController from "../Controllers/api/Answers.js";
import {body, check, validationResult} from 'express-validator';

export default function (router) {
    /**
     * @swagger
     * /api/Answers/GetAll:
     *   get:
     *     tags:
     *       - Answers
     *     description: Get a list of answers
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: ReferenceDatasetId
     *         in: query
     *       - name: OwnerId
     *         in: query
     *       - name: CreditMin
     *         in: query
     *       - name: CreditMax
     *         in: query
     *       - name: DebitMin
     *         in: query
     *       - name: DebitMax
     *         in: query
     *       - name: Skip
     *         in: query
     *       - name: Limit
     *         in: query
     *     responses:
     *       200:
     *         description: An array of answers
     *         type: array
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/TransactionsPaged"
     *
     */
    router.get("/api/Answers/GetAll", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 50}).escape(),
        check('OwnerId').optional({checkFalsy: true}).isLength({max: 50}).escape(),
        check('Skip').optional({checkFalsy: true}).isNumeric().toInt(),
        check('Limit').optional({checkFalsy: true}).isNumeric().toInt(),
    ], asyncWrapper(answersController.findAll));
    /**
     * @swagger
     * /api/Answers/Stats:
     *   get:
     *     tags:
     *       - Answers
     *     description: Get a list of answers
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: UserId
     *         in: query
     *       - name: DatasetId
     *         in: query
     *     responses:
     *       200:
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/AnswersStats"
     *
     */
    router.get("/api/Answers/Stats", asyncWrapper(answersController.stats));
    /**
     * @swagger
     * /api/Answers/SubmitBatchAnswer:
     *   post:
     *     tags:
     *       - Answers
     *     description: Submit a list of answers
     *     produces:
     *       - application/json
     *           consumes
     *             - application/json
     *     parameters:
     *       - in: body
     *         schema:
     *           $ref: "#/components/schemas/SubmitBatchAnswerInput"
     *     responses:
     *       200:
     *         description: Array of inserted answers
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     format: uuid
     */
    router.post("/api/Answers/SubmitBatchAnswer", [
        check('answers.*.Ignored').notEmpty().toBoolean(),
        check('answers.*.IgnoreReason').isString().isLength({max: 200}).escape(),
        check('answers.*.DatasetId').isString().notEmpty().isLength({max: 50}).escape(),
        check('answers.*.DatasetItemId').isString().notEmpty().isLength({max: 50}).escape(),
        check('answers.*.AnswerIndex').notEmpty().toInt(),
        check('answers.*.QuestionObject').isString().isJSON(),
        check('answers.*.DurationToAnswerInSeconds').notEmpty().toInt(),
        check('answers.*.AnswerType').notEmpty().toInt(),
        check('answers.*.GoldenType').notEmpty().toInt()
    ], asyncWrapper(answersController.submitBatchAnswer));
}
