/**
 * @swagger
 *  components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         TargetEnded:
 *           type: boolean
 *         G:
 *           type: boolean
 *         DatasetItemId:
 *           type: string
 *           format: uuid
 *         AnswerType:
 *           type: string
 *         Options:
 *           type: "array"
 *           items:
 *             $ref: "#/components/schemas/AnswerOption"
 *         QuestionType:
 *           type: integer
 *           enum: [0,1,2,3]
 *         QuestionSubjectFileSrc:
 *           type: string
 *           nullable: true
 *         QuestionFileSrc:
 *           type: string
 *           nullable: true
 *     Questions:
 *       type: array
 *       items:
 *         $ref: "#/components/schemas/Question"
 *       nullable: true
 */
import {asyncWrapper} from "../utils/asyncWrapper.js";
import questionsController from "../Controllers/api/Questions.js";
import {check} from "express-validator";

export default function (router) {
    /**
     * @swagger
     * /api/Questions/GetQuestions:
     *   get:
     *     security:
     *       apiToken: []
     *     tags:
     *       - Questions
     *     description: Return random questions based on provided parameters
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: DatasetId
     *         in: query
     *         schema:
     *           type: string
     *           format: uuid
     *       - name: LabelId
     *         in: query
     *         schema:
     *           type: string
     *           format: uuid
     *       - name: Count
     *         in: query
     *         schema:
     *           type: integer
     *       - name: OnlyOneLabel
     *         in: query
     *         description: if labelId is null and this is true generates questions for a random label
     *         schema:
     *           type: boolean
     *     responses:
     *       200:
     *         description: Return
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/Questions"
     */
    router.get("/api/Questions/GetQuestions", [
        check("DatasetId").not().isEmpty().isLength({max: 50}).trim().escape(),
        check("LabelId").optional({checkFalsy: true}).isLength({max: 50}).trim().escape(),
        check("Count").optional({checkFalsy: true}).toInt().isInt({max: 20})
    ], asyncWrapper(questionsController.getQuestions));
}
