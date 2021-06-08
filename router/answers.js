import {asyncWrapper} from "../utils/asyncWrapper.js";
import answersController from "../Controllers/api/Answers.js";


export default function (router) {
    router.get("/api/Answers/GetAll", asyncWrapper(answersController.findAll));
    router.get("/api/Answers/SubmitBatchAnswer", asyncWrapper(answersController.submitBatchAnswer));
    router.get("/api/Answers/Stats", asyncWrapper(answersController.stats));

    //router.get("/api/Datasets/Get/:id", asyncWrapper(datasetController.findOne));
    //router.post("/api/Datasets/create", asyncWrapper(datasetController.create));
    //router.put("/api/Datasets/Update/:id", asyncWrapper(datasetController.update));
    //router.delete("/api/Datasets/Delete/:id", asyncWrapper(datasetController.delete));
}
