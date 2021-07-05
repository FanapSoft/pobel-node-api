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
import answersController from "../controllers/api/Answers.js";
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
    router.get("/api/Answers/GetAll", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 50}).escape(),
        check('UserId').optional({checkFalsy: true}).isLength({max: 50}).escape(),
        check('From').optional({checkFalsy: true}).matches(/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/),
        check('To').optional({checkFalsy: true}).matches(/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/),
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
    router.get("/api/Answers/Stats", [
        check('UserId').notEmpty().isLength({max: 50}).escape(),
        check('DatasetId').notEmpty().isLength({max: 50}).escape(),
    ], asyncWrapper(answersController.stats));
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
        check('QuestionId').notEmpty().isLength({max: 50}).escape(),
        check('Answers.*.Ignored').notEmpty().toBoolean(),
        check('Answers.*.IgnoreReason').isString().isLength({max: 200}).escape(),
        check('Answers.*.DatasetId').isString().notEmpty().isLength({max: 50}).escape(),
        check('Answers.*.DatasetItemId').isString().notEmpty().isLength({max: 50}).escape(),
        check('Answers.*.AnswerIndex').notEmpty().toInt(),
        //check('Answers.*.QuestionObject').isJSON(), //TODO: deprecated
        check('Answers.*.DurationToAnswerInSeconds').notEmpty().toInt(),
        // check('Answers.*.AnswerType').notEmpty().toInt(),
        // check('Answers.*.GoldenType').notEmpty().toInt()
    ], asyncWrapper(answersController.submitBatchAnswer));
}
