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
 *           type: number
 *           format: BigInt
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
    router.post("/api/TargetDefinitions/create", asyncWrapper(targetController.create));
    /**
     * @swagger
     * /api/TargetDefinitions/Update/{id}:
     *   put:
     *     tags:
     *       - TargetDefinition
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
    router.put("/api/TargetDefinitions/Update/:id", asyncWrapper(targetController.update));
    /**
     * @swagger
     * /api/TargetDefinitions/Delete/{id}:
     *   delete:
     *     tags:
     *       - TargetDefinition
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
    router.delete("/api/TargetDefinitions/Delete/:id", asyncWrapper(targetController.delete));
}
