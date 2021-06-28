/**
 * @swagger
 *  components:
 *   schemas:
 *     Answer:
 *       type: object
 *       required:
 *         - UserId
 *         - Ignored
 *         - Answer
 *         - DatasetId
 *         - DatasetItemId
 *         - DurationToAnswerInSeconds
 *       properties:
 *         Id:
 *           type: string
 *           format: uuid
 *           description: Auto generated unique id
 *         CreatedAt:
 *           type: datetime
 *         UserId:
 *           type: string
 *         Ignored:
 *           type: boolean
 *         IgnoreReason:
 *           type: string
 *         Answer:
 *           type: int
 *         AnswerType:
 *           type: integer
 *           enum: [0,1,2,3]
 *           description:   "0.GOLDEN\n\n  1.NORMAL\n\n  2.SKIP\n\n  3.REPORT"
 *         GoldenType:
 *           type: integer
 *           enum: [0,1,2]
 *           description: "0.Is not golden\n\n 1.Positive golden\n\n 2.Negative golden"
 *         QuestionObject:
 *           type: string
 *         DatasetId:
 *           type: string
 *         DatasetItemId:
 *           type: string
 *         DeterminedLabelId:
 *           type: string
 *         DurationToAnswerInSeconds:
 *           type: int
 *         CreditCalculated:
 *           type: boolean
 *     AnswersPaged:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Answer"
 *           nullable: true
 *     AnswersStats:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *     SubmitAnswerInput:
 *       type: object
 *       properties:
 *         Ignored:
 *           type: boolean
 *         IgnoreReason:
 *           type: string
 *           nullable: true
 *         DatasetId:
 *           type: string
 *           required: true
 *         DatasetItemId:
 *           type: string
 *           required: true
 *         AnswerIndex:
 *           type: integer
 *           required: true
 *         QuestionObject:
 *           type: string
 *         DurationToAnswerInSeconds:
 *           type: string
 *         AnswerType:
 *           type: integer
 *           enum: [0,1,2,3]
 *           description:   "0.GOLDEN\n\n  1.NORMAL\n\n  2.SKIP\n\n  3.REPORT"
 *         GoldenType:
 *           type: integer
 *           enum: [0,1,2]
 *           description:  "0.ISNOTGOLDEN\n\n 1.POSITIVE\n\n 2.NEGATIVE"
 *     SubmitBatchAnswerInput:
 *       type: object
 *       properties:
 *         Answers:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/SubmitAnswerInput"
 */
import {asyncWrapper} from "../utils/asyncWrapper.js";
import answersController from "../Controllers/api/Answers.js";
import {check, validationResult} from 'express-validator';

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
     *       - name: IncludeQuestion
     *         in: query
     *       - name: DatasetId
     *         in: query
     *       - name: UserId
     *         in: query
     *       - name: From
     *         in: query
     *       - name: To
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
     *               $ref: "#/components/schemas/AnswersPaged"
     *
     */
    router.get("/api/Answers/GetAll", asyncWrapper(answersController.findAll));
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
        check('answers.*.IgnoreReason').isString(),
        check('answers.*.DatasetId').isString().notEmpty(),
        check('answers.*.DatasetItemId').isString().notEmpty(),
        check('answers.*.AnswerIndex').notEmpty().toInt(),
        check('answers.*.QuestionObject').isString().isJSON(),
        check('answers.*.DurationToAnswerInSeconds').notEmpty().toInt(),
        check('answers.*.AnswerType').notEmpty().toInt(),
        check('answers.*.GoldenType').notEmpty().toInt()
    ], asyncWrapper(answersController.submitBatchAnswer));
}
