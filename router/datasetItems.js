/**
 * @swagger
 *  components:
 *   schemas:
 *     DatasetItem:
 *       type: object
 *       required:
 *         - Name
 *         - Type
 *         - FileExtension
 *         - FileName
 *         - FilePath
 *         - FileSize
 *         - IsGoldenData
 *         - DatasetId
 *       properties:
 *         Id:
 *           type: string
 *           format: uuid
 *           description: Auto generated unique id
 *         Name:
 *           type: string
 *           description: Name of item
 *         Content:
 *           type: string
 *         Type:
 *           type: integer
 *         FileExtension:
 *           type: string
 *         FileName:
 *           type: string
 *         FilePath:
 *           type: string
 *         FileSize:
 *           type: integer
 *         LabelId:
 *           type: string
 *         FinalLabelId:
 *           type: string
 *         IsGoldenData:
 *           type: boolean
 *         DatasetId:
 *           type: string
 *         AnswersCount:
 *           type: integer
 *     DatasetItemsPaged:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/DatasetItem"
 *           nullable: true
 *
 */
import {asyncWrapper} from "../utils/asyncWrapper.js";
import datasetItemsController from "../Controllers/api/DatasetItems.js";

export default function (router) {
    /**
     * @swagger
     * /api/DatasetItems/GetAll:
     *   get:
     *     tags:
     *       - DatasetItems
     *     description: Get a list of datasetItems
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: LabelName
     *         in: query
     *       - name: DatasetId
     *         in: query
     *       - name: IsGoldenData
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
     *               $ref: "#/components/schemas/DatasetItemsPaged"
     *
     */
    router.get("/api/DatasetItems/GetAll", asyncWrapper(datasetItemsController.findAll));
    /**
     * @swagger
     * /api/DatasetItems/Get/{id}:
     *   get:
     *     tags:
     *       - DatasetItems
     *     description: An object
     *     produces:
     *       - application/json
     *     parameters:
     *     responses:
     *       200:
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/DatasetItem"
     *
     */
    router.get("/api/DatasetItems/Get/:id", asyncWrapper(datasetItemsController.findOne));
    //router.get("/api/DatasetsItems/Get", asyncWrapper(datasetItemsController.findOne));
    //router.post("/api/DatasetsItems/create", asyncWrapper(datasetItemsController.create));
    //router.put("/api/DatasetsItems/Update/:id", asyncWrapper(datasetItemsController.update));
    router.delete("/api/DatasetItems/Delete/:id", asyncWrapper(datasetItemsController.delete));
}
