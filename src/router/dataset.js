/**
 * @swagger
 *  components:
 *   schemas:
 *     Dataset:
 *       type: object
 *       required:
 *         - Name
 *         - Description
 *         - Type
 *         - LabelingStatus
 *         - IsActive
 *       properties:
 *         Id:
 *           type: string
 *           format: uuid
 *           description: Auto generated unique id
 *         Name:
 *           type: string
 *           description: Name of dataset
 *         Description:
 *           type: string
 *           description: Short description about the dataset
 *           nullable: true
 *         Type:
 *           type: integer
 *           enum: [0,1,2,3]
 *         IsActive:
 *           type: boolean
 *         FieldName:
 *           type: string
 *         LabelingStatus:
 *           type: integer
 *           enum: [1,2,3,4,5]
 *           description: "1.LABELING_ALLOWED\n\n 2.NO_ITEMS\n\n 3.ITEMS_COMPLETED\n\n 4.LABELING_PAUSED\n\n 5.LABELING_ENDED"
 *         AnswerBudgetCountPerUser:
 *           type: integer
 *         CorrectGoldenAnswerIndex:
 *           type: integer
 *         AnswerReplicationCount:
 *           type: integer
 *         AnswerOptions:
 *           type: "array"
 *           items:
 *             $ref: "#/components/schemas/AnswerOption"
 *         TotalBudget:
 *           type: number
 *           format: decimal
 *         QuestionType:
 *           type: integer
 *           enum: [0,1,2,3]
 *         QuestionSrc:
 *           type: string
 *           nullable: true
 *         QuestionTemplate:
 *           type: string
 *           nullable: true
 *     DatasetsPaged:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Dataset"
 *           nullable: true
 *     AnswerOption:
 *       type: object
 *       properties:
 *         type:
 *           $ref:    "#/components/schemas/AnswerType"
 *         title:
 *           type: string
 *           nullable: true
 *         src:
 *           type: string
 *           nullable: true
 *         index:
 *           type: integer
 *           format: int32
 *         datasetId:
 *           type: integer
 *           format: int32
 *     AnswerType:
 *       type: integer
 *       format: int32
 *       enum: [0,1,2,3]
 *     LabelingStatus:
 *       enum: [0,1,2]
 *       type: integer
 *       format: int32
 *     Label:
 *       type: object
 *       properties:
 *         Id:
 *           type: string
 *           format: uuid
 *         Name:
 *           type: string
 *           nullable: true
 *         DatasetId:
 *           type: number
 *           format: BigInt
 *           nullable: true
 *
 *
 */
import {asyncWrapper} from "../utils/asyncWrapper.js";
import datasetController from "../Controllers/api/Datasets.js";
import {body, check} from 'express-validator';

export default function (router) {
    /**
     * @swagger
     * /api/Datasets/GetAll:
     *   get:
     *     tags:
     *       - Datasets
     *     description: Get a list of datasets
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: Name
     *         description: Dataset Name (Full or partly)
     *         in: query
     *         type: string
     *       - name: Skip
     *         in: query
     *       - name: Limit
     *         in: query
     *     responses:
     *       200:
     *         description: An array of datasets
     *         type: array
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/DatasetsPaged"
     *
     */
    router.get("/api/Datasets/GetAll", asyncWrapper(datasetController.findAll));
    /**
     * @swagger
     * /api/Datasets/Get/{id}:
     *   get:
     *     tags:
     *       - Datasets
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
     *               $ref: "#/components/schemas/Dataset"
     *
     */
    router.get("/api/Datasets/Get/:id", asyncWrapper(datasetController.findOne));
    /**
     * @swagger
     * /api/Datasets/Create:
     *   post:
     *     security:
     *       apiToken: []
     *     tags:
     *       - Datasets
     *     description: Create a dataset
     *     produces:
     *       - application/json
     *
     *     requestBody:
     *      content:
     *       application/json:
     *        schema:
     *          $ref: "#/components/schemas/Dataset"
     *     responses:
     *       200:
     *         description: Returns the created dataset
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/Dataset"
     */
    router.post("/api/Datasets/Create", [
        body('Name').notEmpty(),
        body('Description').notEmpty(),
        body('Type').toInt(),
        body('UMin').toFloat(),
        body('UMax').toFloat(),
        body('T').toFloat(),
        body('IsActive').toBoolean(),
        body('AnswerType').toInt(),
        body('AnswerReplicationCount').toInt(),
        body('AnswerBudgetCountPerUser').toInt(),
        body('LabelingStatus').toInt()
    ], asyncWrapper(datasetController.create));
    /**
     * @swagger
     * /api/Datasets/Update/{id}:
     *   put:
     *     tags:
     *       - Datasets
     *     description: Update a dataset
     *     produces:
     *       - application/json
     *
     *     requestBody:
     *      content:
     *       application/json:
     *        schema:
     *          $ref: "#/components/schemas/Dataset"
     *     responses:
     *       200:
     *         description: Returns the created dataset
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/Dataset"
     *
     */
    router.put("/api/Datasets/Update/:id", [
        body('Name').optional({checkFalsy: true}).notEmpty(),
        body('Description').optional({checkFalsy: true}).notEmpty(),
        body('Type').optional({checkFalsy: true}).toInt(),
        body('UMin').optional({checkFalsy: true}).toFloat(),
        body('UMax').optional({checkFalsy: true}).toFloat(),
        body('T').optional({checkFalsy: true}).toFloat(),
        body('IsActive').optional({checkFalsy: true}).toBoolean(),
        body('AnswerType').optional({checkFalsy: true}).toInt(),
        body('AnswerReplicationCount').optional({checkFalsy: true}).toInt(),
        body('AnswerBudgetCountPerUser').optional({checkFalsy: true}).toInt(),
        body('LabelingStatus').optional({checkFalsy: true}).toInt()
    ], asyncWrapper(datasetController.update));
    /**
     * @swagger
     * /api/Datasets/Delete/{id}:
     *   delete:
     *     tags:
     *       - Datasets
     *     description: Get a dataset
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Returns the deleted dataset
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/Dataset"
     *
     *
     */
    router.delete("/api/Datasets/Delete/:id", asyncWrapper(datasetController.delete));
}
