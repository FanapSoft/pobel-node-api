import {asyncWrapper} from "../utils/asyncWrapper.js";
import {body, check, validationResult} from 'express-validator';
import scriptsController from "../controllers/api/Scripts";

export default function (router) {
    /**
     * @swagger
     * /api/Scripts/ExtractSentimentData:
     *   get:
     *     tags:
     *       - Scripts
     *     description: "Imports data from a given xlsx into the database, How to use: put a file named data.csv in static/sentimentData/data.xlsx then call this Api as an admin"
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: result
     */
    router.get("/api/Scripts/ExtractSentimentData", asyncWrapper(scriptsController.extractSentimentData));
    /**
     * @swagger
     * /api/Scripts/ImportSentimentGoldens:
     *   get:
     *     tags:
     *       - Scripts
     *     description: "Fetches and sets correct answer for golden items of sentiment data"
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: result
     */
    router.get("/api/Scripts/ImportSentimentGoldens", asyncWrapper(scriptsController.importSentimentGoldens));    /**
     * @swagger
     * /api/Scripts/ImportCelebritiesGoldens:
     *   get:
     *     tags:
     *       - Scripts
     *     description: "Fetches and sets correct answer for golden items of celebrities data"
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: result
     */
    router.get("/api/Scripts/ImportCelebritiesGoldens", asyncWrapper(scriptsController.importCelebritiesGoldens));
    /**
     * @swagger
     * /api/Scripts/RemoveCelebritiesGoldens:
     *   get:
     *     tags:
     *       - Scripts
     *     description: "Removes IsGoldenData from all items in celebrities dataset"
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: result
     */
    router.get("/api/Scripts/RemoveCelebritiesGoldens", asyncWrapper(scriptsController.removeCelebritiesGoldens));
}
