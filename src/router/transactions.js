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
 *         DebitAmount:
 *           type: number
 *           format: double
 *         CreditAmount:
 *           type: number
 *           format: double
 *         Reason:
 *           type: string
 *         ReasonDescription:
 *           type: string
 *         ReferenceDatasetId:
 *           type: string
 *           format: uuid
 *         OwnerId:
 *           type: string
 *           format: uuid
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
import {body, check, validationResult} from 'express-validator';
import transactionsController from "../controllers/api/Transactions.js";

export default function (router) {
    /**
     * @swagger
     * /api/Transactions/GetAll:
     *   get:
     *     tags:
     *       - Transactions
     *     description: Get a list of transactions
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
    router.get("/api/Transactions/GetAll", [
        check('ReferenceDatasetid').optional({checkFalsy: true}).isLength({max: 50}).escape(),
        check('OwnerId').optional({checkFalsy: true}).isLength({max: 50}).escape(),
        check('Skip').optional({checkFalsy: true}).isNumeric().toInt(),
        check('Limit').optional({checkFalsy: true}).isNumeric().toInt(),
        check('DebitMin').optional({checkFalsy: true}).isNumeric().toInt(),
        check('DebitMax').optional({checkFalsy: true}).isNumeric().toInt(),
        check('CreditMin').optional({checkFalsy: true}).isNumeric().toInt(),
        check('CreditMax').optional({checkFalsy: true}).isNumeric().toInt(),
    ], asyncWrapper(transactionsController.findAll));
    /**
     * @swagger
     * /api/Datasets/Get/{id}:
     *   get:
     *     tags:
     *       - Transactions
     *     description: Get a transaction
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: An object
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/Transaction"
     *
     */
    router.get("/api/Transactions/Get/:id", asyncWrapper(transactionsController.findOne));
    /**
     * @swagger
     * /api/Datasets/GetBalance:
     *   get:
     *     tags:
     *       - Transactions
     *     description: Get a transaction
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: UserId
     *         in: query
     *         type: string
     *         format: uuid
     *         description: Only for admin
     *     responses:
     *       200:
     *         description: An object
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 CreditAmount:
     *                   type: number
     *                   format: float
     *                 DebitAmount:
     *                   type: number
     *                   format: float
     */
    router.get("/api/Transactions/GetBalance", [
        check('UserId').optional({checkFalsy: true}).isUUID(4)
    ],asyncWrapper(transactionsController.getBalance));


}
