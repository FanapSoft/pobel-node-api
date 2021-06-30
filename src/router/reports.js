/**
 * @swagger
 *  components:
 *   schemas:
 *     AnswersCountsTrend:
 *       type: object
 *       properties:
 *         day:
 *           type: string
 *           format: date
 *         count:
 *           type: integer
 *     AnswersCountsTrendOutput:
 *       type: array
 *       items:
 *         $ref: "#/components/schemas/AnswersCountsTrend"
 *       nullable: true
 *     Scoreboard:
 *       type: object
 *       properties:
 *         UserId:
 *           type: string
 *           format: uuid
 *         Name:
 *           type: string
 *         Surname:
 *           type: string
 *         Count:
 *           type: integer
 *     ScoreboardOutput:
 *       type: array
 *       items:
 *         $ref: "#/components/schemas/Scoreboard"
 *       nullable: true

 */
import {asyncWrapper} from "../utils/asyncWrapper.js";
import reportsController from "../controllers/api/Reports.js";
import {check} from "express-validator";

export default function (router) {
    /**
     * @swagger
     * /api/Reports/AnswersCountsTrend:
     *   get:
     *     tags:
     *       - Reports
     *     description: Get a list of answers
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: DatasetId
     *         in: query
     *       - name: UserId
     *         in: query
     *       - name: From
     *         in: query
     *       - name: To
     *         in: query
     *     responses:
     *       200:
     *         description: An array of datasetItems
     *         type: array
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/AnswersCountsTrendOutput"
     *
     */
    router.get("/api/Reports/AnswersCountsTrend", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 80}),
        check('UserId').optional({checkFalsy: true}).isLength({max: 80}),
        check('From').optional({checkFalsy: true}).matches(/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/),
        check('To').optional({checkFalsy: true}).matches(/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/)
    ], asyncWrapper(reportsController.answersCountTrend));
    /**
     * @swagger
     * /api/Reports/Scoreboard:
     *   get:
     *     tags:
     *       - Reports
     *     description: Get a list of answers
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: DatasetId
     *         in: query
     *       - name: UserId
     *         in: query
     *       - name: From
     *         in: query
     *       - name: Skip
     *         in: query
     *       - name: Limit
     *         in: query
     *     responses:
     *       200:
     *         description: An array of datasetItems
     *         type: array
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/ScoreboardOutput"
     */
    router.get("/api/Reports/Scoreboard", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 80}).escape(),
        check('From').optional({checkFalsy: true}).matches(/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/),
        check('Limit').optional({checkFalsy: true}).isInt({max: 50}),
        check('Skip').optional({checkFalsy: true}).isInt(),
    ], asyncWrapper(reportsController.scoreboard));
}
