import {asyncWrapper} from "../utils/asyncWrapper.js";
import answersController from "../Controllers/api/Answers.js";
import {check, validationResult} from 'express-validator';

export default function (router) {
    router.get("/api/Answers/GetAll", asyncWrapper(answersController.findAll));
    router.get("/api/Answers/Stats", asyncWrapper(answersController.stats));
    router.post("/api/Answers/SubmitBatchAnswer", [
        check('answers.*.Ignored').notEmpty().toBoolean(),
        check('answers.*.IgnoreReason').isString(),
        check('answers.*.DatasetId').isString().notEmpty(),
        check('answers.*.DatasetItemId').isString().notEmpty(),
        check('answers.*.AnswerIndex').notEmpty().toInt(),
        check('answers.*.QuestionObject').isString().isJSON(),
        check('answers.*.DurationToAnswerInSeconds').notEmpty().toInt(),

    ], asyncWrapper(answersController.submitBatchAnswer));

    router.get("/api/Answers/Stats", asyncWrapper(answersController.stats));
    //router.post("/api/Datasets/create", asyncWrapper(datasetController.create));
    //router.put("/api/Datasets/Update/:id", asyncWrapper(datasetController.update));
    //router.delete("/api/Datasets/Delete/:id", asyncWrapper(datasetController.delete));
}
