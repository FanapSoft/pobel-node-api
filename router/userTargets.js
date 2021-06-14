/**
 * @swagger
 *  components:
 *   schemas:
 *     UserTarget:
 *       type: object
 *       required:
 *         - TargetDefinitionId
 *         - OwnerId
 *       properties:
 *         Id:
 *           type: string
 *           format: uuid
 *           description: Auto generated unique id
 *         TargetDefinitionId:
 *           type: string
 *         OwnerId:
 *           type: string
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
 *
 */
import {asyncWrapper} from "../utils/asyncWrapper.js";
import targetController from "../Controllers/api/UserTargets.js";

export default function (router) {
    //router.get("/api/Targets/GetAll", asyncWrapper(targetController.findAll));
    //router.get("/api/Targets/Get/:id", asyncWrapper(targetController.findOne));

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
     *         description: Returns the created UserTarget
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/UserTarget"
     */
    router.post("/api/Targets/ActivateTarget", asyncWrapper(targetController.activateTarget));
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
     *     requestBody:
     *       content:
     *         application/json:
     *          schema:
     *            $ref: "#/components/schemas/UserTarget"
     *     responses:
     *       200:
     *         description: Returns the created UserTarget
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/UserTarget"
     */
    router.get("/api/Targets/GetCurrentTargetStatus", asyncWrapper(targetController.getCurrentTargetStatus));

    //router.delete("/api/Targets/Delete/:id", asyncWrapper(targetController.delete));
}
