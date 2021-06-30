/**
 * @swagger
 *  components:
 *   schemas:
 *     TargetDefinition:
 *       type: object
 *       required:
 *         - UMin
 *         - UMax
 *         - T
 *         - Type
 *       properties:
 *         Id:
 *           type: string
 *           format: uuid
 *           description: Auto generated unique id
 *         Type:
 *           type: integer
 *         AnswerCount:
 *           type: integer
 *         GoldenCount:
 *           type: integer
 *         DatasetId:
 *           type: number
 *           format: BigInt
 *         T:
 *           type: number
 *           format: float
 *         UMin:
 *           type: number
 *           format: float
 *         UMax:
 *           type: number
 *           format: float
 *         BonusTrue:
 *           type: number
 *           format: float
 *         BonusFalse:
 *           type: number
 *           format: float
 *         BonusSkip:
 *           type: number
 *           format: float
 *         BonusReport:
 *           type: number
 *           format: float
 *     TargetDefinitionsPaged:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/TargetDefinition"
 *
 */
import {asyncWrapper} from "../utils/asyncWrapper.js";
import targetController from "../Controllers/api/TargetDefinitions.js";
import {body, check} from "express-validator";

export default function (router) {
    /**
     * @swagger
     * /api/TargetDefinitions/GetAll:
     *   get:
     *     tags:
     *       - TargetDefinition
     *     description: Get a list of defined targets
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: DatasetId
     *         in: query
     *       - name: Skip
     *         in: query
     *       - name: Limit
     *         in: query
     *     responses:
     *       200:
     *         description: An array of targets
     *         type: array
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/TargetDefinitionsPaged"
     *
     */
    router.get("/api/TargetDefinitions/GetAll", asyncWrapper(targetController.findAll));
    /**
     * @swagger
     * /api/TargetDefinitions/Get/{id}:
     *   get:
     *     tags:
     *       - TargetDefinition
     *     description: Get a dataset
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: An object
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/TargetDefinition"
     */
    router.get("/api/TargetDefinitions/Get/:id", asyncWrapper(targetController.findOne));
    /**
     * @swagger
     * /api/TargetDefinitions/Create:
     *   post:
     *     tags:
     *       - TargetDefinition
     *     description: Create a dataset
     *     produces:
     *       - application/json
     *
     *     requestBody:
     *      content:
     *       application/json:
     *        schema:
     *          $ref: "#/components/schemas/TargetDefinition"
     *     responses:
     *       200:
     *         description: Returns the created TargetDefinition
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/TargetDefinition"
     */
    router.post("/api/TargetDefinitions/create", [
        check('UMin').notEmpty().toFloat(),
        check('UMax').notEmpty().toFloat(),
        check('T').notEmpty().toFloat(),
        check('Type').notEmpty().toInt(),
        check('BonusFalsePositive').notEmpty().toFloat(),
        check('BonusTruePositive').notEmpty().toFloat(),
        check('BonusFalseNegative').notEmpty().toFloat(),
        check('BonusTrueNegative').notEmpty().toFloat(),
        check('AnswerCount').notEmpty().toInt(),
        check('GoldenCount').notEmpty().toInt(),
    ], asyncWrapper(targetController.create));
    /**
     * @swagger
     * /api/TargetDefinitions/Update/{id}:
     *   put:
     *     tags:
     *       - TargetDefinition
     *     description: Update a TargetDefinition
     *     produces:
     *       - application/json
     *
     *     requestBody:
     *      content:
     *       application/json:
     *        schema:
     *          $ref: "#/components/schemas/TargetDefinition"
     *     responses:
     *       200:
     *         description: Returns the updated TargetDefinition
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/TargetDefinition"
     *
     */
    router.put("/api/TargetDefinitions/Update/:id", [
        body('UMin').optional({ checkFalsy: true }).toFloat(),
        body('UMax').optional({ checkFalsy: true }).toFloat(),
        body('T').optional({ checkFalsy: true }).toFloat(),
        body('Type').optional({ checkFalsy: true }).toInt(),
        check('BonusFalsePositive').optional({ checkFalsy: true }).toFloat(),
        check('BonusTruePositive').optional({ checkFalsy: true }).toFloat(),
        check('BonusFalseNegative').optional({ checkFalsy: true }).toFloat(),
        check('BonusTrueNegative').optional({ checkFalsy: true }).toFloat(),
        body('AnswerCount').optional({ checkFalsy: true }).toInt(),
        body('GoldenCount').optional({ checkFalsy: true }).toInt(),
    ], asyncWrapper(targetController.update));
    /**
     * @swagger
     * /api/TargetDefinitions/Delete/{id}:
     *   delete:
     *     tags:
     *       - TargetDefinition
     *     description: delete a TargetDefinition
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Returns the deleted TargetDefinition
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/TargetDefinition"
     *
     *
     */
    router.delete("/api/TargetDefinitions/Delete/:id", asyncWrapper(targetController.delete));
}
