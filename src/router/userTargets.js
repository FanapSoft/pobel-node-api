/**
 * @swagger
 *  components:
 *   schemas:
 *     UserTarget:
 *       type: object
 *       required:
 *         - TargetDefinitionId
 *         - DatasetId
 *         - OwnerId
 *       properties:
 *         Id:
 *           type: string
 *           format: uuid
 *           description: Auto generated unique id
 *         TargetDefinitionId:
 *           type: string
 *           format: uuid
 *         TargetDefinition:
 *           type: object
 *           $ref: "#/components/schemas/TargetDefinition"
 *         DatasetId:
 *           type: string
 *           format: uuid
 *         OwnerId:
 *           type: string
 *           format: uuid
 *     UserTargetsPaged:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/UserTarget"
 *           nullable: true
 *     TargetStatusOutput:
 *       type: object
 *       properties:
 *         targetEnded:
 *           type: boolean
 *         noTarget:
 *           type: boolean
 */
import {asyncWrapper} from "../utils/asyncWrapper.js";
import targetController from "../controllers/api/UserTargets.js";
import {check} from "express-validator";

export default function (router) {
    /**
     * @swagger
     * /api/Targets/GetCurrentTargetStatus:
     *   get:
     *     security:
     *       apiToken: []
     *     tags:
     *       - UserTargets
     *     description: check user current target
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: DatasetId
     *         in: query
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *       - name: UserId
     *         in: query
     *         description: defaults to current loggedIn user id
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       200:
     *         description: Returns user target status
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/TargetStatusOutput"
     */
    router.get("/api/Targets/GetCurrentTargetStatus", [
        check('DatasetId').notEmpty().isString().isLength({max: 80}).escape(),
        check('UserId').isString().isLength({max: 80}).escape()
    ], asyncWrapper(targetController.getCurrentTargetStatus));
    /**
     * @swagger
     * /api/Targets/GetCurrentTarget:
     *   get:
     *     security:
     *       apiToken: []
     *     tags:
     *       - UserTargets
     *     description: check user current target
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: DatasetId
     *         in: query
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *       - name: UserId
     *         in: query
     *         description: defaults to current loggedIn user id
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       200:
     *         description: Returns user target status
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/UserTarget"
     */
    router.get("/api/Targets/GetCurrentTarget", [
        check('DatasetId').notEmpty().isString().isLength({max: 80}).escape(),
        check('UserId').notEmpty().isString().isLength({max: 80}).escape()
    ], asyncWrapper(targetController.getCurrentTarget));

    /**
     * @swagger
     * /api/Targets/ActivateTarget:
     *   post:
     *     security:
     *       apiToken: []
     *     tags:
     *       - UserTargets
     *     description: Activate target for a user
     *     produces:
     *       - application/json
     *     requestBody:
     *       content:
     *         application/json:
     *          schema:
     *            $ref: "#/components/schemas/UserTarget"
     *     responses:
     *       200:
     *         description: Return activation result
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               content:
     *
     */
    router.post("/api/Targets/ActivateTarget", [
        check('TargetDefinitionId').notEmpty().isString().isLength({max: 80}).escape(),
        check('OwnerId').optional({checkFalsy: true}).isString().isLength({max: 80}).escape()
    ], asyncWrapper(targetController.activateTarget));


}
