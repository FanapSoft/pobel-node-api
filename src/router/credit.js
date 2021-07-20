/**
 * @swagger
 *  components:
 *   schemas:
 *     Credit:
 *       type: object
 *       required:
 *       properties:
 *         credit:
 *           type: integer
 */
import {asyncWrapper} from "../utils/asyncWrapper.js";
import creditController from "../controllers/api/Credits.js";
import {check, validationResult} from 'express-validator';

export default function (router) {
    /**
     * @swagger
     * /api/Credit/GetCredit:
     *   get:
     *     tags:
     *       - Credit
     *     description:
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
     *               $ref: "#/components/schemas/Credit"
     *
     */
    router.get("/api/Credit/GetCredit", [
        check("DatasetId").not().isEmpty().isLength({max: 50}).trim().escape(),
        check("UserId").not().isEmpty().isLength({max: 50}).trim().escape(),
    ], asyncWrapper(creditController.getCredit));
    /**
     * @swagger
     * /api/Credit/CollectCredit:
     *   post:
     *     tags:
     *       - Credit
     *     description: Send dataset credit to POBEL profile
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: UserId
     *         in: params
     *       - name: DatasetId
     *         in: params
     *     responses:
     *       200:
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/Credit"
     *
     */
    router.post("/api/Credit/CollectCredit", [
        check("DatasetId").notEmpty().isUUID(),
        check("UserId").notEmpty().isUUID(),
    ], asyncWrapper(creditController.collectCredit));
}
